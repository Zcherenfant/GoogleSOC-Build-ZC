import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

// Health & Status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    aiEngine: hasGeminiKey ? 'gemini-3.8-flash' : 'deterministic-socratic',
    hasGeminiKey,
  });
});

// AI Shift Lead Interactive Guidance & Debrief Endpoint
app.post('/api/shiftlead/chat', async (req: Request, res: Response) => {
  const { phaseId, studentMessage, flaggedIOCs, notes, activeFilter } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(200).json({
      useFallback: true,
      message: 'Operating in local deterministic Socratic engine mode.',
    });
  }

  const systemInstruction = `You are Senior SOC Shift Lead "Alex Mercer" at Cybershield Defense Operations Center.
You are mentoring a junior SOC analyst (the user) investigating "Operation Cobalt Drift", an active multi-stage intrusion on corporate workstation WKSTN-CORP-014 (user: mjenkins) and file server FS-CORP-01.

SCENARIO TRUTH BASE (GROUND TRUTH):
- Phase 1 (Initial Access & Execution): Phishing attachment Q1_Expense_Reconciliation.xlsm opened in EXCEL.EXE (PID 4820), which spawned cmd.exe then obfuscated PowerShell with -ExecutionPolicy Bypass -encodedCommand (T1204.002, T1059.001).
- Phase 2 (Defense Evasion & Dropper Staging): PowerShell decodes and drops updater.exe to C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe (SHA256: a93b2f56784d14b248a31e87498c5d2b7819f860183149e29a9972b22eef8531), which executes and spawns rundll32.exe net_worker.dll (T1027, T1036).
- Phase 3 (C2 Beaconing): updater.exe initiates periodic beaconing to 185.220.101.5 on port 443 (domain: update-telemetry-service.com). Persistence established via registry Run key WindowsUpdateTelemetry.
- Phase 4 (Lateral Movement): Stolen NTLM credentials used for Type 3 network logon (Event 4624) from WKSTN-CORP-014 to FS-CORP-01 (10.0.1.5) over SMB port 445. Malicious service / script dropped at C:\\Shares\\Finance_Confidential\\archive_exfil.zip.

SOC COACHING GUIDELINES:
1. Speak professionally, concisely, like a seasoned Tier-3 lead / incident commander.
2. Socratic Style: NEVER just give the answers away outright. Guide them with sharp questions, pointing them toward specific log sources (e.g. Sysmon Event ID 1 for process creation, Event ID 3 for network, Event ID 11 for file drops, Security 4624 for logons).
3. If they are submitting an analytical debrief to pass the phase gate:
   - Evaluate whether they provided the critical facts: culprit host, parent/child process, command-line evidence, IP/domain, dropped file, or target server.
   - If they have sufficient evidence, explicitly state "[GATE APPROVED]" in your response along with praising their analytical rigor, then summarize key takeaways and invite them to advance to the next phase.
   - If missing key pieces, state "[GATE INCOMPLETE]" and give 1-2 targeted Socratic clues to uncover the missing artifact.
4. Current Phase: Phase ${phaseId}.
5. Student's currently pinned IOCs: ${JSON.stringify(flaggedIOCs || [])}.
6. Student's active investigation notes: "${notes || ''}".
`;

  const promptContent = `User query/debrief regarding Phase ${phaseId}:\n"${studentMessage}"\nActive SIEM filter: "${activeFilter || 'None'}"`;

  // Candidate models to try in case of temporary 503 high-demand or rate limits
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        // Enforce a 7-second timeout per model attempt to prevent hanging during high-demand spikes
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI generation timed out after 7s')), 7000)
        );

        const generatePromise = ai.models.generateContent({
          model,
          contents: promptContent,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

        const reply = response.text || 'Shift Lead connection standby.';
        const gateApproved = reply.includes('[GATE APPROVED]');
        const cleanedReply = reply.replace('[GATE APPROVED]', '').replace('[GATE INCOMPLETE]', '').trim();

        return res.json({
          useFallback: false,
          reply: cleanedReply,
          gateApproved,
          modelUsed: model,
        });
      } catch (err: any) {
        lastError = err;
        const is503 = err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('high demand');
        console.warn(`[ShiftLead] Model ${model} unavailable (${is503 ? '503 High Demand' : err.message}). Trying fallback...`);
        // Short pause before trying next candidate
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // All models returned error/503 -> seamlessly signal frontend to use Socratic rule engine
    console.info('[ShiftLead] All Gemini models temporarily busy; switching smoothly to Socratic rule engine.');
    return res.status(200).json({
      useFallback: true,
      error: lastError?.message || 'High demand spike on AI models',
      message: 'Operating in local deterministic Socratic engine mode.',
    });
  } catch (err: any) {
    console.warn('[ShiftLead] Unexpected exception in chat handler, switching to fallback engine:', err.message);
    return res.status(200).json({
      useFallback: true,
      error: err.message,
      message: 'Failed to reach Gemini API, falling back to deterministic engine.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true' ? undefined : false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`[OpenSOC Studio] Server running on port ${PORT}`);
  });
}

startServer();
