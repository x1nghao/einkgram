import WebSocket from 'ws';
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
await send('Runtime.enable');

// 检查 inline style 是否应用
const r = await send('Runtime.evaluate', {
  expression: `JSON.stringify({
    inlineClass: document.documentElement.className,
    inlineStyle: document.documentElement.getAttribute('style'),
    computedBg: getComputedStyle(document.documentElement).backgroundColor,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    // 找内联 <style> 标签
    inlineStylesCount: document.head.querySelectorAll('style').length,
    firstStyleContent: document.head.querySelector('style')?.textContent?.slice(0, 200) || 'no style',
  })`,
  returnByValue: true,
});
console.log(r.result.result.value);
ws.close();
