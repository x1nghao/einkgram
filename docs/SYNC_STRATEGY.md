# Einkgram ↔ telegram-tt 同步策略

> 更新日期: 2026-10-25
> 适用版本: v0.20+(扁平化重建之后)
> 核心原则: **改得越少,同步越顺**

## 当前结构(2026-10 重建后)

仓库即标准 telegram-tt 布局,`git merge upstream/master` 直接可用。
fork 的全部定制收敛为:

| 类别 | 内容 | 同步代价 |
|---|---|---|
| 🟢 绿区(纯新增) | `src/eink/**`、`src/styles/eink/**`、`public/einkgram.webmanifest`、`docs/`、`dev/cleanup-dist.sh`、`dev/serve-dist.sh`、`dev/verify-browser.mjs`、`.github/workflows/deploy.yml` | 零冲突 |
| 🟡 黄区(小补丁) | 见下方 8 个文件清单 | 低,冲突手工合并 |
| 🔴 红区 | 协议层/组件层,零改动 | 无 |

## 黄区补丁清单(merge 冲突时按此核对)

1. `src/util/switchTheme.ts` — eink 模式下拒绝切换深色主题的 4 行守卫
2. `src/components/left/settings/SettingsMain.tsx` — 3 个 eink 开关(imports + 3 个 ListItem)
3. `src/styles/index.scss` — `@use "eink/tokens"` + `@use "eink/reset"` 两行
4. `src/styles/_patternBackground.module.scss` — `:global(html.eink-mode)` 隐藏壁纸层
5. `src/components/common/helpers/renderText.tsx` — emoji 固定 64px(配合移除 63MB 的 img-apple-160)
6. `vite.config.ts` — 生产 manifest 换 `einkgram.webmanifest`、生产关 sourcemap、移除 img-apple-160 拷贝
7. `index.html` — html 初始 class、防闪烁脚本、加载屏、`src/eink/init.ts` 入口
8. `package.json` — `build:production` 追加 dist 清理

规则:上游与补丁冲突时,**先取上游,再重放补丁**;补丁应保持最小(每处 ≤ 10 行)。

## 同步工作流(每季度 1 次,安全/协议修复随时)

```bash
git fetch upstream
git log --oneline main..upstream/master   # 评估改动量
git merge upstream/master                  # 标准布局下直接 merge

# 冲突仅会出现在上面 8 个黄区文件,按清单重放。
# 绿区永远不冲突(upstream 没有这些文件)。
# dist/ 上游用 '[Build]' 提交跟踪构建产物:merge 冲突时一律
# `git checkout --theirs dist && git add dist`,然后本地重新
# build:production + cleanup-dist.sh 覆盖即可。
```

同步后验证:

```bash
npm ci                 # 上游可能升级依赖/engines
npm run check:ts && npm run check:css
npm test
npm run build:production && bash dev/cleanup-dist.sh
npm run dev:mocked     # 浏览器冒烟:eink 开关/字重/阅读模式/壁纸抑制
```

## 跳过什么

上游的 UI 重设计浪潮(图标、形状、动画、桌面壳)对墨水屏客户端没有价值,
merge 时如实带入即可——eink 模式靠 CSS 门控压制外观,不需要逐项跟进。
**必须及时同步的**:GramJS/MTProto 传输修复、登录/安全相关、Layer 升级。

## 新增定制时

- 新功能一律放 `src/eink/`(自包含,只 import `lib/teact` 与 DOM)
- 需要改上游文件时,优先 CSS 门控(`:global(html.eink-mode)`)/ hook 注入,
  把对上游文件的改动压到最小
- 每新增一个黄区补丁,同步更新本文件的清单
