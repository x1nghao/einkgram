// Einkgram — flicker / flash diagnostic
//
// What this proves:
//   1. The page paints with what background-color / theme class at frame 0?
//   2. When does React actually mount (first chat list visible)?
//   3. Does the user see a black background flash before white appears?
//
// Green zone: this is a diagnostic tool, not a runtime dependency.

import WebSocket from 'ws';
import { writeFileSync } from 'node:fs';

const URL = process.argv[2] || 'https://einkgram.pages.dev/';
const FPS = 30;
const FRAME_INTERVAL_MS = 1000 / FPS;
const TOTAL_FRAMES = 90; // ~3 seconds

// Get the websocket URL for a new tab
const tabsRes = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
const tab = await tabsRes.json();
const wsUrl = tab.webSocketDebuggerUrl;

const ws = new WebSocket(wsUrl);
let id = 0;
const pending = new Map();

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});

function send(method, params = {}) {
  return new Promise((resolve) => {
    const reqId = ++id;
    pending.set(reqId, resolve);
    ws.send(JSON.stringify({ id: reqId, method, params }));
  });
}

await new Promise((r) => ws.once('open', r));
console.log('CDP ready');

// Navigate
await send('Page.enable');
await send('Runtime.enable');
await send('DOM.enable');

console.log(`Loading ${URL}...`);

// Start capturing background-color samples as we navigate
const samples = [];
let stopSampling = false;
const sampleLoop = (async () => {
  while (!stopSampling) {
    try {
      const result = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          bg: getComputedStyle(document.body).backgroundColor,
          htmlClass: document.documentElement.className,
          theme: document.documentElement.classList.contains('theme-dark') ? 'dark'
               : document.documentElement.classList.contains('theme-light') ? 'light' : 'none',
          eink: document.documentElement.classList.contains('eink-mode') ? 'on' : 'off',
          time: performance.now().toFixed(0),
        })`,
        returnByValue: true,
      });
      if (result.result?.result?.value) {
        samples.push(JSON.parse(result.result.result.value));
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 16));
  }
})();

await send('Page.navigate', { url: URL });

// Sample for TOTAL_FRAMES
await new Promise((r) => setTimeout(r, TOTAL_FRAMES * FRAME_INTERVAL_MS));
stopSampling = true;
await sampleLoop;

// Take a screenshot to confirm the final state
const screenshot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync('/tmp/einkgram-flicker-end.png', Buffer.from(screenshot.result.data, 'base64'));

// Analyze: which samples show black background? report transitions
const lines = ['frame_idx,time_ms,html_class,theme,eink,body_bg'];
samples.forEach((s, i) => {
  lines.push(`${i},${s.time},${JSON.stringify(s.htmlClass)},${s.theme},${s.eink},${s.bg}`);
});
writeFileSync('/tmp/einkgram-flicker.csv', lines.join('\n'));

// Find first non-white paint
const firstWhiteIdx = samples.findIndex((s) => s.bg === 'rgb(255, 255, 255)');
const firstBlackIdx = samples.findIndex((s) => s.bg === 'rgb(0, 0, 0)');
const firstEinkIdx = samples.findIndex((s) => s.eink === 'on');
const firstThemeLight = samples.findIndex((s) => s.theme === 'light');

console.log('\n=== FLICKER DIAGNOSIS ===');
console.log(`Total samples: ${samples.length}`);
console.log(`First sample:  ${JSON.stringify(samples[0])}`);
console.log(`First white bg sample: ${firstWhiteIdx >= 0 ? `#${firstWhiteIdx} at t=${samples[firstWhiteIdx]?.time}ms` : 'NEVER'}`);
console.log(`First black bg sample: ${firstBlackIdx >= 0 ? `#${firstBlackIdx} at t=${samples[firstBlackIdx]?.time}ms` : 'NEVER'}`);
console.log(`First eink=on:          ${firstEinkIdx >= 0 ? `#${firstEinkIdx} at t=${samples[firstEinkIdx]?.time}ms` : 'NEVER'}`);
console.log(`First theme=light:      ${firstThemeLight >= 0 ? `#${firstThemeLight} at t=${samples[firstThemeLight]?.time}ms` : 'NEVER'}`);
console.log(`Last sample:  ${JSON.stringify(samples.at(-1))}`);
console.log('\nCSV: /tmp/einkgram-flicker.csv');
console.log('Screenshot: /tmp/einkgram-flicker-end.png');

ws.close();
process.exit(0);
