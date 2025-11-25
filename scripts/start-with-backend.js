#!/usr/bin/env node
/**
 * Orchestrates starting the backend first, waits until it's healthy, then starts the frontend.
 * Target: Windows 11 + VS Code + Windows Terminal + PowerShell + WSL.
 * Usage: `npm start`
 */

import { spawn } from 'node:child_process';
import http from 'node:http';
import process from 'node:process';
import path from 'node:path';

const BACKEND_PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const BACKEND_HEALTH_URL = `http://localhost:${BACKEND_PORT}/health`;
const ROOT_DIR = process.cwd();

/**
 * Checks backend health endpoint.
 * Inputs: none.
 * Output: Promise<boolean> indicating if backend is healthy.
 */
function checkBackendHealth() {
  return new Promise((resolve) => {
    const req = http.get(BACKEND_HEALTH_URL, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

/**
 * Waits until backend responds healthy or times out.
 * Inputs: `timeoutMs` total timeout, `intervalMs` polling interval.
 * Output: Promise<boolean> true if healthy before timeout.
 */
async function waitForBackendReady(timeoutMs = 60000, intervalMs = 1000) {
  const start = Date.now();
  process.stdout.write(`Waiting for backend at ${BACKEND_HEALTH_URL} `);
  while (Date.now() - start < timeoutMs) {
    const ok = await checkBackendHealth();
    if (ok) {
      process.stdout.write('\nBackend is healthy.\n');
      return true;
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  process.stdout.write('\n');
  return false;
}

/**
 * Starts the backend dev server.
 * Inputs: none.
 * Output: ChildProcess for the backend.
 */
function startBackend() {
  console.log('Starting backend (server) ...');
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: path.join(ROOT_DIR, 'server'),
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, PORT: String(BACKEND_PORT) }
  });
  backend.on('exit', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
  return backend;
}

/**
 * Starts the frontend dev server (Vite).
 * Inputs: none.
 * Output: ChildProcess for the frontend.
 */
function startFrontend() {
  console.log('Starting frontend (vite) ...');
  const frontend = spawn('npm', ['run', 'dev'], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  frontend.on('exit', (code) => {
    console.log(`Frontend process exited with code ${code}`);
  });
  return frontend;
}

/**
 * Main orchestration logic.
 * Inputs: none.
 * Output: Starts backend, waits for health, then starts frontend. Handles Ctrl+C.
 */
async function main() {
  // If backend is already healthy, don't start a duplicate instance
  let backend = null;
  const alreadyHealthy = await checkBackendHealth();
  if (alreadyHealthy) {
    console.log('Backend already running and healthy. Skipping backend start.');
  } else {
    backend = startBackend();
    const healthy = await waitForBackendReady(120000, 1000);
    if (!healthy) {
      console.error('Backend did not become healthy within timeout. Stopping.');
      if (backend) backend.kill('SIGTERM');
      process.exit(1);
      return;
    }
  }

  const frontend = startFrontend();

  function shutdown() {
    console.log('\nShutting down both backend and frontend...');
    try { frontend.kill('SIGTERM'); } catch {}
    try { if (backend) backend.kill('SIGTERM'); } catch {}
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Startup orchestration failed:', err);
  process.exit(1);
});