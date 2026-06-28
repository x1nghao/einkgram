// Probe: what is the actual dark-theme background in real Einkgram?
// Connects to the existing tab.
import WebSocket from 'ws';

const tabsRes = await fetch('http://127.0.0.1:9222/json', { method: 'PUT' }).catch(() => null);
// Fallback to GET list
const list = await (await fetch('http://127.0.0.1:9222/json')).json();
const tab = list.find((t) => t.url.includes('1235') && t.type === 'page');
if (!tab) { console.error('no tab'); process.exit(1); }
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.on('message', (d) => {
  const m = JSON.parse(d.toString());
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise((r) => {
  const i = ++id; pending.set(i, r);
  ws.send(JSON.stringify({ id: i, method, params }));
});
await new Promise((r) => ws.once('open', r));
await send('Runtime.enable');

// Force dark mode and inspect computed backgrounds
const result = await send('Runtime.evaluate', {
  expression: `
    // Force dark theme on <html> (simulate prefers-color-scheme: dark)
    document.documentElement.classList.add('theme-dark');
    document.documentElement.classList.remove('theme-light');

    // Sample every visible element, return background-color + tag + first class
    const samples = [];
    const all = document.body.querySelectorAll('*');
    for (const el of all) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const fi = cs.color;
      if (bg === 'rgba(0, 0, 0, 0)' && fi === 'rgb(0, 0, 0)') continue;
      samples.push({
        tag: el.tagName,
        id: el.id,
        cls: (el.className && el.className.toString && el.className.toString().slice(0, 60)) || '',
        bg, fi,
        w: Math.round(r.width), h: Math.round(r.height),
      });
    }
    JSON.stringify({
      bodyBg: getComputedStyle(document.body).backgroundColor,
      htmlBg: getComputedStyle(document.documentElement).backgroundColor,
      middleCol: document.querySelector('#MiddleColumn') ? getComputedStyle(document.querySelector('#MiddleColumn')).backgroundColor : 'no',
      leftCol: document.querySelector('.LeftColumn') ? getComputedStyle(document.querySelector('.LeftColumn')).backgroundColor : 'no',
      samples: samples.slice(0, 50),
    });
  `,
  returnByValue: true,
});

const data = JSON.parse(result.result.result.value);
console.log('body bg:', data.bodyBg);
console.log('html bg:', data.htmlBg);
console.log('MiddleColumn bg:', data.middleCol);
console.log('LeftColumn bg:', data.leftCol);
console.log('\nDark elements (top 50):');
for (const s of data.samples) {
  if (s.bg.includes('0, 0, 0') || s.bg.includes('30, 30') || s.bg.includes('40, 40') || s.bg.includes('50, 50') || s.bg.includes('60, 60')) {
    console.log(`  ${s.tag}#${s.id}.${s.cls.slice(0,30)}  ${s.w}x${s.h}  bg=${s.bg}  fg=${s.fi}`);
  }
}
ws.close();
