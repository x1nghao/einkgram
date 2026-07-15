# Einkgram 贡献/开发指南

> 写代码前必读（给自己看，5 分钟）

## 🚦 红黄绿三区

| 区域 | 路径 | 改的代价 | 策略 |
|---|---|---|---|
| 🟢 绿 | `src/eink/**`、`public/icons/**`、`public/fonts/**` | 0 | 改，使劲改 |
| 🟡 黄 | `vite.config.ts`、`main.tsx`、`index.html`、`package.json` | 低 | 加在末尾 / 加在 imports 后 |
| 🔴 红 | `src/lib/**`、`src/components/**`、`src/stores/**`、`src/api/**` | 高 | **不碰** |

## 📋 写代码前自问 4 问

```
1. 能不能不改代码？       →  CSS 覆盖、用户脚本
2. 能不能只改样式？       →  CSS Variables、global overrides
3. 能不能 hook 进现有生命周期？ → 在 main.tsx 注入、eink/ 目录放 hook
4. 真的必须改源码吗？    →  把改动写小、写局部、留注释
```

## ❌ 永远不要做的事

1. 改 `src/lib/`（协议层）
2. 改 `src/components/`（原 UI）
3. 改 `src/stores/`（原 MobX）
4. 改 `src/api/`（API 调用）
5. 删 telegram-tt 原文件
6. 在 `telegram-tt` 原文件顶部删 copyright 头

## ✅ 推荐做的事

1. 所有新代码放 `src/eink/`
2. CSS 覆盖放 `src/eink/styles/overrides.css`
3. 包装组件放 `src/eink/overrides/`，不修改原组件
4. 在 `main.tsx` 加 hook 注入（最多 5 行）
5. 复制时**带原 Copyright**，加自己的 Copyright 在下面

## 📦 同步时（每月 1 次）

```bash
git fetch upstream
git rebase upstream/master
# 冲突通常在 vite.config.ts / main.tsx / package.json
# 保留两边的改动，原文件加在末尾

npm install
npm run check
npm run dev  # 跑通即可
```

详见 `docs/SYNC_STRATEGY.md`。

## 📝 改的代码量限制

**v0.1 MVP 严格控制**：

| 文件 | 允许的改动量 |
|---|---|
| `vite.config.ts` | ≤ 1 行（加 PWA plugin） |
| `main.tsx` | ≤ 5 行（import eink 入口 + hook） |
| `package.json` | ≤ 1 行（加 dep） |
| `index.html` | 0 改动 |
| 其他所有 `src/` 下原文件 | **0 改动** |
| `src/eink/**` | 不限 |

## 🏷️ Commit 信息格式

```
[eink] 简述改动

- 详细 1
- 详细 2

Refs: telegram-tt commit xxxxxx
```

示例：
```
[eink] Add grayscale filter for e-ink devices

- Added src/eink/utils/eink.ts with device detection
- Added src/eink/styles/overrides.css with 4-level grayscale palette
- Imported eink styles in main.tsx (1 line)

Refs: #0 (no upstream change required)
```

## 🔄 跟 upstream 同步

**所有代码改动必须能干净地 rebase**：

```bash
# 自测
git fetch upstream
git rebase upstream/master
# 期望：0 冲突 或 只有黄色区有冲突
```

如果出现红色区冲突 = 说明动了不该动的地方，**回滚**。

## 📚 完整文档

- `docs/ROADMAP.md` —— 12 周开发计划
- `docs/COMPLIANCE.md` —— Telegram 合规清单
- `docs/SYNC_STRATEGY.md` —— 同步策略 SOP
- `docs/CONTRIBUTING.md` —— 本文件
