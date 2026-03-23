import http from 'http';
import app from './app';
import { config } from './config/env';

const server = http.createServer(app);

server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
  
  // Heartbeat anchor to forcefully lock the event loop
  setInterval(() => {}, 1000 * 60 * 60);
});

server.on('error', (e) => {
  console.error('HTTP Server Error:', e);
});

server.on('close', () => {
  console.log('HTTP Server closed!');
});

process.on('exit', (code) => {
  console.log('Process exiting entirely with code:', code);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
