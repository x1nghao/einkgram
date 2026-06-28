import WebSocket from 'ws';
import { writeFileSync } from 'node:fs';

const list = await (await fetch('http://127.0.0.1:9222/json')).json();
const t = list.find((x) => x.url.includes('1235') && x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0;
const p = new Map();
ws.on('message', (d) => {
  const m = JSON.parse(d.toString());
  if (m.id && p.has(m.id)) { p.get(m.id)(m); p.delete(m.id); }
});
const send = (method, params = {}) =>
  new Promise((r) => { const i = ++id; p.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await new Promise((r) => ws.once('open', r));
await send('Page.enable');

// Reload to take a fresh shot
await send('Page.reload', { ignoreCache: true });
await new Promise((r) => setTimeout(r, 2500));
const s = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync('/tmp/einkgram-v0.10-light.png', Buffer.from(s.result.data, 'base64'));
console.log('saved /tmp/einkgram-v0.10-light.png');
ws.close();
