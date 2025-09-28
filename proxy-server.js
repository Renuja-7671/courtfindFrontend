import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

const proxy = createProxyMiddleware({
  target: 'http://localhost:5173',
  changeOrigin: true,
  ws: true,
  logLevel: 'info'
});

app.use('/', proxy);

const PORT = 80;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log(`Forwarding requests to http://localhost:5173`);
});