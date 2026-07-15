# Einkgram 开发路线图

> **项目**: Einkgram — A Telegram client for E-Ink devices
> **基座**: Ajaxy/telegram-tt（Web A，React + TypeScript）
> **License**: GPL v3
> **创建日期**: 2026-06-27

---

## 🎯 项目定义

```
产品名:   Einkgram
副标题:   A Telegram client for E-Ink devices
形态:     PWA（Progressive Web App）
基座:     Ajaxy/telegram-tt（Web A，React + TypeScript）
License:  GPL v3（继承自 telegram-tt）
目标设备: BOOX / Bigme / Supernote / 桌面浏览器
```

## 🚦 核心原则：最小化修改、最大化同步（2026-06-27 补充）

> **除非必要，否则不要完全重写；保持从 telegram-tt 拉取更新的兼容性。**

### 原则详解

| 优先级 | 原则 | 说明 |
|---|---|---|
| 🥇 | **改的代码越少越好** | 每行代码都是 merge 成本 |
| 🥇 | **优先 CSS-only 解决方案** | CSS 改完不会跟 JS 逻辑冲突 |
| 🥇 | **优先覆盖样式，不改组件结构** | telegram-tt 改组件时我们不动 |
| 🥈 | **优先扩展，优先插入** | 用 `+` 而不是 `-` 改代码 |
| 🥈 | **上游的 lib/ 协议层禁止改动** | 跟 upstream 100% 一致 |
| 🥉 | **新增代码放独立目录** | 不污染 telegram-tt 原目录 |

### 决策流程（每次写代码前问自己）

```
1. 能不改代码吗？
   → CSS 覆盖 / 全局样式表 / 用户脚本

2. 能只改样式吗？
   → CSS Variables / module override

3. 能 hook 进现有生命周期吗？
   → 在不改组件源码情况下注入行为

4. 真的必须改源码？
   → 把改动写小、写局部、留注释
```

### 目录规则（强制）

| 目录 | 策略 | 原因 |
|---|---|---|
| `src/lib/**` | 🚫 **禁止改动** | MTProto 协议层，跟 upstream 100% 一致 |
| `src/components/**` | 🟡 极小改动 | 只在必要时改（CSS > JSX） |
| `src/styles/**` | 🟢 **主要战场** | 改这里改不到 upstream |
| `src/hooks/**` | 🟢 新增 OK | 不影响 upstream |
| `src/utils/**` | 🟢 新增 OK | 不影响 upstream |
| `src/stores/**` | 🟡 小心改 | MobX stores 是状态中心 |
| `src/eink/**` | 🟢 **全 Einkgram 自有** | 我们的代码领地 |

### 同步策略

- **每周**：`git fetch upstream && git log upstream/master --oneline`
- **每月**：`git rebase upstream/master`（如果冲突太多则 merge）
- **冲突多发区**：`vite.config.ts`、`src/lib/`、`src/components/`——**这些地方我们尽量不动**

详见 `docs/SYNC_STRATEGY.md`（如果存在）。

## 🏗️ 技术栈

| 层级 | 技术 | 说明 |
|---|---|---|
| 基座 | Ajaxy/telegram-tt | GPL v3 |
| 语言 | TypeScript 5.x | 沿用 |
| 框架 | React 18 | 沿用 |
| 状态管理 | MobX 6 | 沿用 |
| 构建 | Vite 5 | 沿用，telegram-tt 已用 Vite |
| 样式 | CSS Variables + CSS Modules | 主要战场：E-Ink 覆盖样式 |
| UI 层 | 最小改动 + CSS 覆盖 | 优先不改 JSX |
| PWA | vite-plugin-pwa | 新增 |
| 协议层 | src/lib/ | 🚫 禁止改动 |

## 📁 目录结构

```
einkgram/
├── src/
│   ├── lib/                      # 🚫 协议层（绝不改动）
│   │   ├── mtproto/
│   │   ├── gramjs/
│   │   ├── cache/
│   │   ├── api-manager/
│   │   └── ...
│   ├── components/               # 🟡 telegram-tt 原组件（能不改就不改）
│   │   ├── chat/                 # 原样
│   │   ├── settings/             # 原样
│   │   ├── auth/                 # 原样
│   │   └── ...                   # 原样
│   ├── eink/                     # 🟢 Einkgram 自有目录（不受 upstream 同步影响）
│   │   ├── components/           # E-Ink 专用组件
│   │   │   ├── EinkButton.tsx
│   │   │   ├── EinkList.tsx
│   │   │   ├── EinkMessage.tsx
│   │   │   ├── EinkInput.tsx
│   │   │   ├── EinkAvatar.tsx
│   │   │   └── EinkIcon.tsx
│   │   ├── overrides/            # 覆盖 telegram-tt 组件的小型包装
│   │   │   ├── ChatList.tsx      # wrap 原 ChatList
│   │   │   ├── ChatWindow.tsx    # wrap 原 ChatWindow
│   │   │   └── ...
│   │   ├── hooks/                # E-Ink 专属 hooks
│   │   │   ├── useEinkMode.ts
│   │   │   ├── useRefreshStrategy.ts
│   │   │   └── useKeyboardNav.ts
│   │   ├── stores/
│   │   │   └── EinkSettings.ts   # E-Ink 专属设置 store
│   │   ├── styles/               # 🟢 主要战场
│   │   │   ├── tokens.css        # 设计 tokens
│   │   │   ├── eink-theme.css    # 墨水屏主题
│   │   │   ├── overrides.css     # 覆盖 telegram-tt 原 CSS
│   │   │   ├── reset.css
│   │   │   └── typography.css
│   │   ├── utils/                # E-Ink 工具
│   │   │   ├── eink.ts           # 墨水屏检测
│   │   │   ├── grayscale.ts      # 灰度处理
│   │   │   └── performance.ts
│   │   └── index.ts              # 导出入口
│   ├── App.tsx                   # 🟡 仅在 main.tsx 导入 eink 入口
│   └── main.tsx                  # 🟡 在原基础上加 eink 初始化
├── public/
│   ├── manifest.json             # 🟡 改 PWA manifest
│   ├── icons/                    # 🟢 Einkgram 图标
│   └── fonts/                    # 🟢 Einkgram 字体
├── vite.config.ts                # 🟡 改 vite 配置（加 PWA 插件）
├── package.json                  # 🟡 加依赖（vite-plugin-pwa）
└── README.md                     # 🟢 写 Einkgram 自己的
```

## 🎨 设计系统（E-Ink 优化）

### 调色板（4 级灰度）

```css
/* styles/tokens.css */
:root {
  /* 灰度等级 —— 墨水屏能显示的 16 级里只取 4 个 */
  --eink-bg:         #FFFFFF;  /* 纯白（省电）*/
  --eink-surface:    #F0F0F0;  /* 浅灰（卡片背景）*/
  --eink-divider:    #C0C0C0;  /* 中灰（分隔线）*/
  --eink-text-2:     #808080;  /* 中深（次要文字）*/
  --eink-text-1:     #404040;  /* 深灰（主要文字）*/
  --eink-text-0:     #000000;  /* 纯黑（强调）*/
  
  /* 字体 */
  --font-eink: 'LXGW WenKai', '霞鹜文楷', serif;
  --font-eink-mono: 'LXGW WenKai Mono', monospace;
  
  /* 字号（墨水屏略大）*/
  --fs-xs: 14px;
  --fs-sm: 16px;
  --fs-md: 18px;  /* 默认 */
  --fs-lg: 22px;
  --fs-xl: 28px;
  --fs-2xl: 36px;
  
  /* 行高（墨水屏需要更宽）*/
  --lh-tight: 1.4;
  --lh-normal: 1.6;
  --lh-loose: 1.8;
  
  /* 间距 */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 24px;
  --sp-6: 32px;
  
  /* 边框（墨水屏重要）*/
  --border-thin: 1px solid var(--eink-divider);
  --border-thick: 2px solid var(--eink-text-1);
}
```

### 排版规则

```css
/* styles/typography.css */
body {
  font-family: var(--font-eink);
  font-size: var(--fs-md);
  line-height: var(--lh-normal);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

h1 { font-size: var(--fs-2xl); line-height: var(--lh-tight); }
h2 { font-size: var(--fs-xl);  line-height: var(--lh-tight); }
h3 { font-size: var(--fs-lg);  line-height: var(--lh-normal); }
```

## ⚙️ 核心功能模块

### 1. E-Ink 模式开关（默认开启）

```typescript
// stores/EinkSettings.ts
export class EinkSettings {
  @observable enabled = true;
  @observable refreshStrategy: 'smart' | 'always' | 'never' = 'smart';
  @observable grayscale: 'auto' | 'always' | 'never' = 'auto';
  @observable fontFamily = 'LXGW WenKai';
  @observable fontSize = 18;
  @observable contrast: 'normal' | 'high' = 'high';
  @observable reduceAnimations = true;
  @observable keyboardShortcuts = true;
}
```

### 2. 智能刷新策略

```typescript
// hooks/useRefreshStrategy.ts
export function useRefreshStrategy() {
  const settings = useStore(EinkSettings);
  
  useEffect(() => {
    if (settings.refreshStrategy !== 'smart') return;
    
    // 监听用户交互
    let lastInteraction = Date.now();
    const onInteract = () => {
      lastInteraction = Date.now();
      // 局部刷新
      requestRegionRefresh();
    };
    
    // 每 30 秒全刷一次（去残影）
    const fullRefreshInterval = setInterval(() => {
      if (Date.now() - lastInteraction > 5000) {
        requestFullRefresh();
      }
    }, 30000);
    
    return () => clearInterval(fullRefreshInterval);
  }, [settings.refreshStrategy]);
}
```

### 3. 键盘导航（墨水屏刚需）

```typescript
// hooks/useKeyboardNav.ts
export function useKeyboardNav() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // BOOX 翻页键
      if (e.key === 'PageUp') {
        e.preventDefault();
        messageListRef.current?.scrollToPrevMessage();
      }
      if (e.key === 'PageDown') {
        e.preventDefault();
        messageListRef.current?.scrollToNextMessage();
      }
      
      // Alt+数字 = 切换对话
      if (e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        chatListRef.current?.switchToChat(parseInt(e.key) - 1);
      }
      
      // Esc = 返回对话列表
      if (e.key === 'Escape') {
        e.preventDefault();
        navigate('/');
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
```

### 4. 灰度处理

```typescript
// utils/grayscale.ts
export function isLikelyEinkDevice(): boolean {
  // 1. UA 检测
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('boox') || ua.includes('onyx')) return true;
  if (ua.includes('reMarkable')) return true;
  
  // 2. 屏幕特征检测
  if (window.matchMedia('(min-monochrome: 8)').matches) return true;
  
  // 3. CSS 媒体查询（高对比度模式暗示墨水屏）
  if (window.matchMedia('(forced-colors: active)').matches) return true;
  
  return false;
}

export function applyGrayscaleFilter(element: HTMLElement) {
  element.style.filter = 'grayscale(100%) contrast(1.2)';
}
```

### 5. PWA 配置

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Einkgram',
        short_name: 'Einkgram',
        description: 'A Telegram client for E-Ink devices',
        theme_color: '#000000',
        background_color: '#FFFFFF',
        display: 'standalone',
        icons: [
          { src: 'icons/192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            // 缓存已读消息
            urlPattern: /^https:\/\/api\.telegram\.org\/.*messages/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'einkgram-messages',
              expiration: { maxEntries: 1000, maxAgeSeconds: 86400 * 7 },
            },
          },
          {
            // 缓存头像
            urlPattern: /\.(?:png|jpg|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'einkgram-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 * 30 },
            },
          },
        ],
      },
    }),
  ],
});
```

---

## 📅 12 周开发路线图

### Phase 0: 准备（Week 1）

- [ ] Fork Ajaxy/telegram-tt 到自己的 GitHub
- [ ] 配置本地 Vite 跑通 dev server
- [ ] 跑通登录（手机号 + 验证码）
- [ ] 验证基础收发消息功能
- [ ] 在 BOOX 模拟器 / 真机测试基础可用性

**交付物**：能登录的本地图形版本

---

### Phase 1: 视觉重置（Week 2-3）—— **CSS-only**

> **原则：改一个全局 CSS 文件，不到 100 行**

- [ ] 新增 `src/eink/styles/overrides.css`，全选覆盖 telegram-tt 原 CSS
  - 不动 telegram-tt 任何源文件
  - 用更高 CSS specificity 覆盖原样式
- [ ] 定义 design tokens（4 级灰度调色板）— 复制下面到 `tokens.css`
- [ ] 覆盖全局字体为霞鹜文楷
- [ ] 覆盖全局高对比度主题（白底黑字）
- [ ] 覆盖 transition 全设为 `none`（在 overrides.css 用 `* { transition: none !important; }`）
- [ ] 覆盖字号基线（默认 18px，墨水屏更舒适）
- [ ] 覆盖行高（1.6 → 墨水屏更宽）
- [ ] 在 `main.tsx` 加一行 `import './eink/styles/overrides.css'` —— **这是唯一需要改原文件的地方**

**不做的**：
- ❌ 不重写组件
- ❌ 不改 telegram-tt 的 JSX
- ❌ 不改 telegram-tt 的 CSS

**交付物**：纯 CSS 覆盖，看效果

---

### Phase 2: 墨水屏优化（Week 4-5）—— **可选 JS 增强**

> **原则：只加东西，不改 telegram-tt**

- [ ] `src/eink/styles/overrides.css` 加 `* { animation: none !important; }`
- [ ] 新增 `src/eink/utils/eink.ts`（设备检测）—— 纯新增
- [ ] 新增 `src/eink/hooks/useRefreshStrategy.ts`（30 秒全刷去残影）
  - 在 `main.tsx` 调用一次（不嵌入 telegram-tt 组件）
- [ ] 新增 `src/eink/utils/grayscale.ts`（自动灰度检测）
  - 检测到墨水屏设备时，给 `<body>` 加 `class="eink-mode"`
  - CSS 里有 `.eink-mode { filter: grayscale(100%) }`
- [ ] **不动的**：
  - ❌ 不改 telegram-tt 的 react-virtuoso 配置
  - ❌ 不改 memo / useCallback（telegram-tt 已优化过）

**交付物**：墨水屏设备自动进入灰度模式 + 30 秒全刷

---

### Phase 3: 输入重塑（Week 6-7）—— **全键盘 hook**

> **原则：全局键盘监听，不动任何组件**

- [ ] 新增 `src/eink/hooks/useKeyboardNav.ts`（全局键盘导航）
  - PageUp / PageDown 翻消息 — 用 DOM API 触发滚轮事件
  - Alt+1-9 切换对话 — 用 router.push
  - Esc 返回对话列表 — 用 router.push('/')
  - Tab 焦点增强 — CSS `*:focus-visible { outline: 3px solid black !important; }`
- [ ] 在 `main.tsx` 加一行 `useKeyboardNav()` —— **唯一改原文件的地方**
- [ ] 物理按键适配 — `keydown` 事件里多判几个 `keyCode`（BOOX 翻页键、5 向键）

**不做的**：
- ❌ 不改 telegram-tt 的输入框组件
- ❌ 不改 telegram-tt 的长按菜单

**交付物**：纯键盘可操作

---

### Phase 4: PWA 化（Week 8-9）—— **加 plugin**

> **原则：只改配置，不改代码**

- [ ] `vite.config.ts` 加 `VitePWA` 插件
- [ ] 新增 `public/manifest.json`（PWA manifest）
- [ ] 加 `public/icons/192.png` `512.png`（Einkgram 图标）
- [ ] 在 `vite.config.ts` 配 workbox runtimeCaching
- [ ] **唯一改原文件**：vite.config.ts 一处（在 plugins 数组加一行）

**不做的**：
- ❌ 不改 telegram-tt 的 index.html
- ❌ 不动 lib/ 任何代码

**交付物**：可安装的 PWA

---

### Phase 5: 媒体降级（Week 10）—— **CSS + 小 JS**

> **原则：能 CSS 就 CSS，不行才 JS**

- [ ] `src/eink/styles/overrides.css` 加 `img, video { filter: grayscale(100%); }`
- [ ] 新增 `src/eink/utils/emojiFallback.ts`（彩色 emoji → 文字）
  - 只在 telegram-tt 之外的 hook 里调用
  - 不修改 telegram-tt 的 emoji 渲染
- [ ] 动图降级 — CSS `img[src$=".gif"] { display: none; }` 或替换为静态图
- [ ] 视频不自动播放 — CSS `video { autoplay: false; }` 不行就用 JS：
  - 在 `main.tsx` 加全局事件 `document.addEventListener('play', e => e.target.pause())`
  - **这不修改 telegram-tt 任何组件**

**不做的**：
- ❌ 不改 telegram-tt 的图片组件
- ❌ 不改 telegram-tt 的视频组件

**交付物**：媒体在墨水屏可识别

---

### Phase 6: 测试发布（Week 11-12）

- [ ] BOOX Leaf / Note 真机测试
- [ ] Bigme B1041+ 真机测试
- [ ] Supernote A5X 真机测试
- [ ] 性能优化（LCP < 2.5s, FID < 100ms）
- [ ] 内存优化（待机 < 150MB）
- [ ] 文档：README、安装指南、快捷键说明
- [ ] 部署到 Vercel
- [ ] GitHub Release v0.1.0
- [ ] 社区宣传（V2EX、即刻、Reddit r/eink）

**交付物**：可公开访问的 v0.1.0

---

## 🎯 MVP 定义（Week 3 出）

**能用的最小版本**：

- ✅ 登录（手机号 + 验证码）
- ✅ 接收消息（只读）
- ✅ 灰度主题 + 4 级灰度
- ✅ 关闭所有动画
- ✅ 智能全刷（每 30 秒）
- ✅ BOOX 上可安装为 PWA

**不修改 telegram-tt 的文件**（v0.1 严格控制）：
- ❌ 不改 `src/lib/**`（协议层 100% upstream）
- ❌ 不改 `src/components/**`（原组件不动）
- ❌ 不改 `src/stores/**`（原 MobX stores 不动）
- ✅ **只新增** `src/eink/**` 目录
- ✅ **只改** 3 个原文件：`vite.config.ts`、`main.tsx`、`.env.example`

**不做（v0.1）**：

- ❌ 发送消息（Phase 2 后）
- ❌ 媒体（图片/视频）显示（Phase 5）
- ❌ 主题切换（永远 E-Ink）
- ❌ 复杂功能（语音、视频通话等）

### 改动的代码量约束（v0.1）

| 文件 | 改动量 | 说明 |
|---|---|---|
| `vite.config.ts` | +1 行（plugin） | 加 VitePWA |
| `main.tsx` | +3-5 行（import） | import eink 入口 + hook |
| `package.json` | +1 行（dep） | vite-plugin-pwa |
| `src/eink/**` | 新增，不限 | 我们的领地 |
| 其他所有文件 | 0 改动 | — |

## 📊 关键指标

| 指标 | 目标 |
|---|---|
| 首次加载 | < 3s（BOOX Tab Ultra） |
| 登录后切换对话 | < 500ms |
| 收到新消息刷新 | < 1s（局部） |
| PWA 安装大小 | < 5MB |
| BOOX 待机内存 | < 150MB |
| Lighthouse PWA 分数 | > 90 |
| Lighthouse 性能分数 | > 80 |

---

## 🚀 立即可执行（今天）

### 步骤 1: Fork + 克隆（5 分钟）

```bash
# 在 GitHub 网页上先 fork Ajaxy/telegram-tt 到自己账号
# 然后本地克隆
git clone https://github.com/<your-username>/telegram-tt.git einkgram
cd einkgram
git remote add upstream https://github.com/Ajaxy/telegram-tt.git
```

### 步骤 2: 安装依赖 + 跑通（10-30 分钟）

```bash
# pnpm 优先
pnpm install
pnpm dev

# 或 npm
npm install
npm run dev
```

打开 `http://localhost:1234`，用测试账号登录。

### 步骤 3: 第一个 E-Ink 改动（30 分钟）

- 替换 `body` 字体为霞鹜文楷
- 全局加 `filter: grayscale(100%)`
- 把 `transition: all 0.2s` 改成 `transition: none`

刷新看效果。

---

## 📝 风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| telegram-tt upstream 频繁更新 | 合并冲突 | 阶段性 rebase；lib/ 目录优先保持同步 |
| BOOX Chrome 版本差异 | 部分 API 不可用 | feature detection + fallback |
| MTProto 在 Web 环境限制 | 性能 | 沿用 telegram-tt 的 Web Worker 架构 |
| 霞鹜文楷字重过多 | 加载慢 | 子集化（只保留常用字） |
| Service Worker 缓存策略 | 消息延迟 | 短 TTL + 强制更新机制 |

---

## 📚 参考资料

- [telegram-tt GitHub](https://github.com/Ajaxy/telegram-tt)
- [EinkBro 浏览器](https://github.com/plateaukao/einkbro) — 墨水屏浏览器参考
- [BOOX SDK 文档](https://developer.onyx.com/) — 设备私有 API
- [vite-plugin-pwa](https://vite-plugin-pwa.netlify.app/) — PWA 工具
- [霞鹜文楷字体](https://github.com/lxgw/LxgwWenkaiTC) — 开源中文字体

---

**最后更新**: 2026-06-27 02:12 CST
**项目地址**: ~/Documents/einkgram/
