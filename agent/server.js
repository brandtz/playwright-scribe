import express from 'express';
import cors from 'cors';
import { spawn } from 'node:child_process';

const app = express();
app.use(express.json());
app.use(cors());

let activeProcess = null;
let sessionId = null;
let capturedCode = '';
let codeOutput = [];

app.post('/start', (req, res) => {
  try {
    const { url, browser = 'chromium', target = 'typescript', testName, sessionId: reqSessionId } = req.body;
    
    if (activeProcess) {
      return res.status(400).json({ error: 'Recording already in progress' });
    }

    sessionId = reqSessionId || `session-${Date.now()}`;
    const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const args = ['playwright', 'codegen', `--target=${target}`, `--browser=${browser}`];
    
    if (url) args.push(url);

    console.log(`[${sessionId}] Starting recording for "${testName}"`);
    console.log(`[${sessionId}] Command: ${npx} ${args.join(' ')}`);

    // Reset code capture for new session
    capturedCode = '';
    codeOutput = [];

    activeProcess = spawn(npx, args, { 
      stdio: ['inherit', 'pipe', 'pipe'], 
      shell: false, 
      cwd: process.cwd(), 
      env: process.env 
    });

    // Capture stdout for code generation
    activeProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[${sessionId}] stdout:`, output);
      codeOutput.push(output);
      
      // Look for generated test code patterns
      if (output.includes('import { test, expect }') || output.includes("test('") || output.includes('await page.')) {
        capturedCode += output;
      }
    });

    // Capture stderr for debugging
    activeProcess.stderr.on('data', (data) => {
      console.log(`[${sessionId}] stderr:`, data.toString());
    });

    activeProcess.on('error', (err) => {
      console.error(`[${sessionId}] Codegen failed:`, err);
      activeProcess = null;
      sessionId = null;
    });

    activeProcess.on('exit', (code) => {
      console.log(`[${sessionId}] Codegen exited with code ${code}`);
      activeProcess = null;
      sessionId = null;
    });

    res.json({ 
      ok: true, 
      sessionId,
      message: `Recording started with ${browser} browser`
    });
  } catch (error) {
    console.error('Failed to start recording:', error);
    res.status(500).json({ error: 'Failed to start recording' });
  }
});

app.post('/stop', (req, res) => {
  try {
    const { sessionId: reqSessionId } = req.body;
    
    if (!activeProcess) {
      return res.status(400).json({ error: 'No active recording session' });
    }

    if (reqSessionId && reqSessionId !== sessionId) {
      return res.status(400).json({ error: 'Invalid session ID' });
    }

    console.log(`[${sessionId}] Stopping recording session`);
    
    // Kill the process
    activeProcess.kill('SIGTERM');
    
    // Reset state
    activeProcess = null;
    const stoppedSessionId = sessionId;
    sessionId = null;

    // Try to extract meaningful code from captured output
    let finalCode = capturedCode;
    if (!finalCode.trim()) {
      // Fallback: look through all output for test-like content
      const allOutput = codeOutput.join('');
      const testMatch = allOutput.match(/import.*test.*expect.*[\s\S]*?test\([^}]*\{[\s\S]*?\}\);?/g);
      if (testMatch) {
        finalCode = testMatch[testMatch.length - 1]; // Get the last/most complete test
      }
    }

    res.json({ 
      ok: true, 
      sessionId: stoppedSessionId,
      message: 'Recording stopped',
      playwrightCode: finalCode || `import { test, expect } from '@playwright/test';

test('recorded test', async ({ page }) => {
  // Generated code not captured - please paste from clipboard or terminal
  // The Playwright codegen process has completed
});`
    });
  } catch (error) {
    console.error('Failed to stop recording:', error);
    res.status(500).json({ error: 'Failed to stop recording' });
  }
});

app.get('/status', (req, res) => {
  res.json({
    isRecording: !!activeProcess,
    sessionId: sessionId,
    pid: activeProcess?.pid || null
  });
});

// Get captured code from last session
app.get('/get-code/:sessionId?', (req, res) => {
  res.json({
    code: capturedCode || '',
    allOutput: codeOutput.join('\n'),
    sessionId: sessionId
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = 4317;
app.listen(PORT, () => {
  console.log(`🎬 Scribe Agent running on http://localhost:${PORT}`);
  console.log('Ready to record Playwright tests!');
});