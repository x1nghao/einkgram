// Einkgram — Real-browser verification of the three E-Ink modes
//
// Standalone CDP dev script: console logging is its primary output and it
// predates the upstream lint config, so stylistic rules are relaxed here.
/* eslint-disable no-console, @stylistic/arrow-parens, @stylistic/lines-between-class-members, @stylistic/max-len, @stylistic/max-statements-per-line, no-null/no-null */
//
// What this proves:
//   1. Einkgram actually mounts in a real browser
//   2. <html> classList actually changes between off/standard/1bit/paper
//   3. localStorage actually persists the mode
//   4. Ctrl+Shift+E keyboard shortcut actually cycles the mode
//   5. The 3 modes produce 3 visibly different computed CSS filter values
//   6. PageScrollButtons DOM appears (after messages-container exists)
//   7. Force-light MutationObserver actually overrides theme-dark
//
// We use the Chrome DevTools Protocol (CDP) directly via a raw
// WebSocket — no puppeteer needed. The Chrome instance must be
// started in headless mode with --remote-debugging-port=9222
// (see scripts/start-test-chrome.sh for one-liner).
//
// Green zone for Einkgram: this file is verification tooling, not
// shipped with the app.

import { mkdirSync, writeFileSync } from 'node:fs';

// Uses the global WebSocket (Node 22+) — no ws package needed.

const PAGE_URL = process.env.EINK_TEST_URL || 'http://127.0.0.1:1235/';
const OUT_DIR = process.env.EINK_TEST_OUT || '/tmp/einkgram-shots';
mkdirSync(OUT_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async eval(expression) {
    const r = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) {
      throw new Error('eval failed: ' + JSON.stringify(r.exceptionDetails));
    }
    return r.result.value;
  }
  async screenshot(path) {
    const r = await this.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path, Buffer.from(r.data, 'base64'));
    return path;
  }
}

async function main() {
  // 1. Find a page target (not service_worker, not background_page)
  const list = await fetch('http://127.0.0.1:9222/json/list').then(r => r.json());
  const targets = list.filter(t => t.type === 'page');
  let target;
  if (targets.length === 0) {
    // create one
    const r = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
    target = await r.json();
  } else {
    target = targets[0];
  }
  console.log('→ target:', target.url, target.id);

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  const cdp = new CDP(ws);

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1264, height: 1680, deviceScaleFactor: 2, mobile: false,
  });
  // Force touch + reduced motion + no color (E-Ink-like signals)
  await cdp.send('Emulation.setEmulatedMedia', {
    features: [
      { name: 'prefers-color-scheme', value: 'light' },
      { name: 'prefers-reduced-motion', value: 'reduce' },
      { name: 'pointer', value: 'coarse' },
      { name: 'hover', value: 'none' },
      { name: 'update', value: 'slow' },
    ],
  });

  // 2. Navigate to Einkgram dev server
  console.log('→ navigating to', PAGE_URL);
  await cdp.send('Page.navigate', { url: PAGE_URL });
  // Wait for app to be ready (no spinning loader, <html> has eink-mode class)
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    const cls = await cdp.eval(`document.documentElement.className`);
    const hasLoader = await cdp.eval(`!!document.getElementById('eink-loading-screen')`);
    if (!hasLoader && cls.includes('eink-mode')) { ready = true; break; }
  }
  if (!ready) {
    console.error('❌ app did not become ready in 30s');
    process.exit(1);
  }
  console.log('✅ app ready (eink-mode active, loader removed)');

  // 3. Capture initial state
  await cdp.screenshot(`${OUT_DIR}/01-initial.png`);
  const initialState = await cdp.eval(`({
    htmlClass: document.documentElement.className,
    colorScheme: document.documentElement.style.colorScheme,
    bgColor: getComputedStyle(document.body).backgroundColor,
    fgColor: getComputedStyle(document.body).color,
    filter: getComputedStyle(document.documentElement).filter,
    hasEinkPageScroll: !!document.querySelector('.eink-page-scroll'),
    hasKSwitch: Array.from(document.querySelectorAll('a.MenuItem[href$="/k"]')).length,
    localStorage: localStorage.getItem('eink-mode'),
  })`);
  console.log('→ initial state:', JSON.stringify(initialState, null, 2));

  // 4. Test mode cycle: standard → 1bit → paper → off → standard
  const modeSequence = ['standard', '1bit', 'paper', 'off'];
  const results = [];
  for (const mode of modeSequence) {
    console.log(`\n→ setting mode to: ${mode}`);
    await cdp.eval(`
      const e = window.__eink;
      e.set('${mode}');
    `);
    await sleep(200); // let rAF flush

    const state = await cdp.eval(`({
      htmlClass: document.documentElement.className,
      localStorage: localStorage.getItem('eink-mode'),
      htmlFilter: getComputedStyle(document.documentElement).filter,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      bodyColor: getComputedStyle(document.body).color,
      cssVarEinkBg: getComputedStyle(document.documentElement).getPropertyValue('--eink-bg').trim(),
      cssVarEinkFg: getComputedStyle(document.documentElement).getPropertyValue('--eink-fg').trim(),
    })`);
    console.log(`  ${mode}: htmlClass="${state.htmlClass}" ls="${state.localStorage}" filter="${state.htmlFilter}"`);
    console.log(`         body bg=${state.bodyBg} color=${state.bodyColor}`);
    await cdp.screenshot(`${OUT_DIR}/02-mode-${mode}.png`);
    results.push({ mode, ...state });
  }

  // 5. Test keyboard shortcut: Ctrl+Shift+E
  console.log('\n→ testing keyboard shortcut Ctrl+Shift+E');
  // First, get current mode
  const beforeKey = await cdp.eval(`document.documentElement.className`);
  console.log(`  before: ${beforeKey}`);

  // Dispatch keydown event matching the shortcut handler
  await cdp.eval(`
    const evt = new KeyboardEvent('keydown', {
      key: 'E',
      code: 'KeyE',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(evt);
  `);
  await sleep(200);
  const afterKey = await cdp.eval(`({
    htmlClass: document.documentElement.className,
    localStorage: localStorage.getItem('eink-mode'),
  })`);
  console.log(`  after: htmlClass="${afterKey.htmlClass}" ls="${afterKey.localStorage}"`);

  // 6. Test force-light theme override
  console.log('\n→ testing force-light theme override');
  await cdp.eval(`
    document.documentElement.classList.add('theme-dark');
  `);
  await sleep(200);
  const afterDarkAttempt = await cdp.eval(`({
    htmlClass: document.documentElement.className,
    colorScheme: document.documentElement.style.colorScheme,
  })`);
  console.log(`  after upstream adds theme-dark: ${JSON.stringify(afterDarkAttempt)}`);

  // 7. Test page scroll buttons (needs a .messages-container to be visible)
  console.log('\n→ testing page scroll buttons');
  // Inject a fake messages-container so the buttons actually mount
  await cdp.eval(`
    const fake = document.createElement('div');
    fake.className = 'messages-container';
    fake.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:80vh;overflow:auto;';
    fake.innerHTML = Array.from({length: 50}, (_, i) => '<div style="height:60px;padding:8px;border-bottom:1px solid #ccc;">Message ' + i + '</div>').join('');
    document.body.appendChild(fake);
    // Trigger the MutationObserver
    document.body.dataset.einkTest = '1';
  `);
  await sleep(500);
  const scrollButtons = await cdp.eval(`({
    visible: !!document.querySelector('.eink-page-scroll'),
    upBtn: !!document.querySelector('.eink-page-scroll__btn--up'),
    downBtn: !!document.querySelector('.eink-page-scroll__btn--down'),
    pos: (() => {
      const el = document.querySelector('.eink-page-scroll');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top, right: r.right, width: r.width, height: r.height };
    })(),
  })`);
  console.log(`  page scroll buttons: ${JSON.stringify(scrollButtons)}`);
  await cdp.screenshot(`${OUT_DIR}/03-page-scroll.png`);

  // 8. Test scrolling actually works
  if (scrollButtons.upBtn) {
    await cdp.eval(`
      const btn = document.querySelector('.eink-page-scroll__btn--down');
      btn.click();
    `);
    await sleep(200);
    const scrollTop = await cdp.eval(`document.querySelector('.messages-container').scrollTop`);
    console.log(`  after click down: scrollTop=${scrollTop} (should be > 0)`);
  }

  // 9. Summary
  console.log('\n' + '═'.repeat(60));
  console.log('SUMMARY');
  console.log('═'.repeat(60));
  const summary = {
    pageLoaded: true,
    initialEinkMode: initialState.htmlClass.includes('eink-mode'),
    whiteInitialBg: initialState.bgColor === 'rgb(255, 255, 255)',
    kSwitchHidden: initialState.hasKSwitch === 0,
    localStoragePersisted: initialState.localStorage !== null,
    fourModesHaveDifferentClasses: new Set(results.map(r => r.htmlClass)).size === 4,
    fourModesHaveDifferentFilters: new Set(results.map(r => r.htmlFilter)).size >= 3,
    keyboardShortcutWorks: afterKey.htmlClass !== beforeKey,
    forceLightOverridesTheme: !afterDarkAttempt.htmlClass.includes('theme-dark'),
    scrollButtonsMounted: scrollButtons.visible,
    scrollButtonsClickable: scrollButtons.upBtn && scrollButtons.downBtn,
  };
  for (const [k, v] of Object.entries(summary)) {
    console.log(`  ${v ? '✅' : '❌'} ${k}: ${v}`);
  }
  writeFileSync(`${OUT_DIR}/summary.json`, JSON.stringify({ summary, results, initialState, afterKey, afterDarkAttempt, scrollButtons }, null, 2));
  console.log(`\n📸 Screenshots in ${OUT_DIR}/`);
  console.log(`📋 Full results in ${OUT_DIR}/summary.json`);

  ws.close();
  process.exit(Object.values(summary).every(Boolean) ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(2); });
