import WebSocket from 'ws';
const list = await (await fetch('http://127.0.0.1:9222/json')).json();
const t = list.find((x) => x.url.includes('1235') && x.type === 'page');
const ws = new WebSocket(t.webSocketDebuggerUrl);
let id = 0;
const p = new Map();
ws.on('message', (d) => {
  const m = JSON.parse(d.toString());
  if (m.id && p.has(m.id)) {
    p.get(m.id)(m);
    p.delete(m.id);
  }
});
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    p.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
await new Promise((r) => ws.once('open', r));
await send('Runtime.enable');
const r = await send('Runtime.evaluate', {
  expression: 'document.documentElement.outerHTML.slice(0, 400)',
  returnByValue: true,
});
console.log(r.result.result.value);
ws.close();
