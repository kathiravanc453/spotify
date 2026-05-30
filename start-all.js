import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Rhythmix Application (Frontend + Sync Backend)...');

// Start Backend Server
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Start Frontend Server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

backend.on('error', (err) => {
  console.error('❌ Failed to start backend server:', err);
});

frontend.on('error', (err) => {
  console.error('❌ Failed to start frontend server:', err);
});

// Handle termination
process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
