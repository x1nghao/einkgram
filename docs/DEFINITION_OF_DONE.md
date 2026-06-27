# Definition of Done

> 完成标准 —— 什么算"做完了"
> 创建日期: 2026-06-27
> 原则: **可验证、有截止、防无止境打磨**

---

## 🎯 怎么用这份文档

每次开新工作时，**先看 DoD 决定优先级**。
每个 Phase 结束前，**逐条勾选 DoD** 决定能否进入下个 Phase。

**不在 DoD 里的事** = 不做（除非 Phase 进入下一阶段并加进 DoD）。

---

## 📦 v0.1（内测）— Week 3 出

**目标**：5 个 BOOX 用户能登录、看消息、确认"能用"。

### 功能 DoD

- [ ] 用户能用自己的 api_id / api_hash 登录
- [ ] 能看到对话列表
- [ ] 能看到消息内容（纯文字）
- [ ] 能发文字消息
- [ ] 灰度主题在浏览器生效（4 级灰度）
- [ ] 关闭所有 CSS 动画（`transition: none !important; animation: none !important;`）
- [ ] 关闭所有 JS 动画

### 质量 DoD

- [ ] 在 BOOX Leaf（Chromium 90+）上能跑
- [ ] 在 Chrome 桌面端能跑
- [ ] 首次加载 < 5s（BOOX 慢网络）
- [ ] 切换对话 < 1s
- [ ] 没有 console 报错
- [ ] 没有 404 资源加载

### 工程 DoD

- [ ] `src/lib/**` 0 改动
- [ ] `src/components/**` 0 改动
- [ ] `src/stores/**` 0 改动
- [ ] 改动行数 ≤ 50 行（非 src/eink/ 内）
- [ ] `npm run check` 通过（TypeScript + ESLint）
- [ ] `npm run dev` 能跑
- [ ] `npm run build:production` 能出包

### 文档 DoD

- [ ] README.md 第一段写明 Unofficial / Fork
- [ ] README.md 有"如何获取 api_id"说明
- [ ] README.md 有"如何本地跑"5 步说明
- [ ] `docs/ROADMAP.md` 标记 v0.1 Phase 完成
- [ ] `docs/COMPLIANCE.md` 检查项全勾

### 发布 DoD

- [ ] 部署到 Vercel（公开 URL）
- [ ] 找 5 个 BOOX 真机用户测试，每人至少使用 1 天
- [ ] 收集 3 条以上反馈意见
- [ ] Bug 列表 0 个 P0（崩溃/无法登录）

---

## 📦 v0.5（公测）— Week 6 出

**目标**：50 个用户在用，反馈集中在"用得起来 + 关键优化生效"。

### 新增功能 DoD

- [ ] 智能刷新策略（30 秒全刷去残影）生效
- [ ] 自动检测墨水屏设备 → 自动开灰度
- [ ] 键盘导航：PageUp/PageDown 翻消息
- [ ] 键盘导航：Alt+1-9 切换对话
- [ ] 键盘导航：Esc 返回对话列表
- [ ] 物理按键支持：BOOX 翻页键、5 向键
- [ ] 字号设置（4 档）
- [ ] 字体设置（霞鹜文楷 / 系统字体）

### 质量 DoD

- [ ] Bigme 真机测试通过
- [ ] Supernote 真机测试通过
- [ ] 待机内存 < 200MB（BOOX）
- [ ] 切换对话 < 500ms
- [ ] 全刷策略可在设置里开关

### 工程 DoD

- [ ] 改动行数 ≤ 100 行（非 src/eink/ 内）
- [ ] 跟 upstream 同步 0 冲突（或只有黄区冲突且能在 30 分钟内解决）
- [ ] `src/eink/` 代码有 README 注释
- [ ] hooks 有简单单元测试

### 文档 DoD

- [ ] 更新 ROADMAP（v0.5 标记）
- [ ] 添加 Einkgram 自己的 CHANGELOG
- [ ] README 加"快捷键"段落

### 发布 DoD

- [ ] GitHub Release v0.5.0
- [ ] V2EX、即刻发一帖
- [ ] 收集 10+ 反馈
- [ ] 0 个 P0、< 3 个 P1 bug

---

## 📦 v1.0（正式版）— Week 12 出

**目标**：公开宣称可用，能在所有目标设备上稳定运行。

### 新增功能 DoD

- [ ] PWA 化：可"添加到主屏幕"
- [ ] PWA 化：离线能看缓存的消息
- [ ] 媒体降级：图片转灰度
- [ ] 媒体降级：视频不自动播放
- [ ] 媒体降级：emoji 转文字回退
- [ ] 媒体降级：动图转静态
- [ ] 通知支持（Web Push）
- [ ] 多账号切换
- [ ] 设置项可导入导出

### 质量 DoD

- [ ] 4 种目标设备（BOOX / Bigme / Supernote / Chrome）全部通过
- [ ] Lighthouse PWA 分数 > 90
- [ ] Lighthouse 性能 > 80
- [ ] 0 个 P0 / 0 个 P1 / < 5 个 P2 bug
- [ ] 7 天无新崩溃报告
- [ ] 内存峰值 < 250MB

### 工程 DoD

- [ ] 跟 upstream 同步 0 冲突
- [ ] CI/CD 跑通（每次 PR 自动 lint + type check + build）
- [ ] 所有 hooks 有单元测试
- [ ] 关键路径有 e2e 测试（Playwright）
- [ ] `src/eink/` 文档完整
- [ ] 没有 console.warn/error

### 文档 DoD

- [ ] README.md 完整（介绍 / 安装 / 使用 / 快捷键 / 常见问题）
- [ ] FAQ.md（至少 10 条）
- [ ] CHANGELOG.md
- [ ] 贡献指南完整
- [ ] 隐私声明（不收集什么数据）

### 发布 DoD

- [ ] GitHub Release v1.0.0
- [ ] Vercel 部署
- [ ] 仓库设为 Public
- [ ] 至少 100 个真实用户
- [ ] Reddit r/eink 帖子
- [ ] Hacker News 帖子（如果有点赞潜力）
- [ ] 0 个 P0 残留 bug

---

## 🚫 DoD 之外的事（v0.1 → v1.0 都不做）

明确不做，**防止范围蔓延**：

- ❌ 视频通话
- ❌ 语音通话
- ❌ Telegram Stories（除非上游同步后意外好做）
- ❌ 主题切换器（永远 E-Ink）
- ❌ 完整 emoji 选择器（用文字回退）
- ❌ 文件管理器集成
- ❌ 多语言 UI（i18n）
- ❌ 完整的 TDLib 替换（沿用 GramJS）
- ❌ 自行实现 MTProto（沿用 upstream）

---

## 🆘 什么时候算"破例"

如果某个 DoD 外的功能**用户强烈需要**，且**工作量 ≤ 1 周**：

1. 在 v0.1 反馈里收集需求
2. 评估工作量
3. 加到下个版本的 DoD 里
4. **不要默默塞进当前版本**

---

## 📊 DoD 完成度追踪

每个版本结束后，回这里勾一遍，**发到 GitHub Discussion**：

```markdown
## v0.1 完成度 (2026-MM-DD)

### 功能 DoD: 7/7 ✅
### 质量 DoD: 5/6 ❌ (首次加载 6.2s 超标)
### 工程 DoD: 7/7 ✅
### 文档 DoD: 5/5 ✅
### 发布 DoD: 4/6 ❌ (只找到 3 个测试用户)

### 决定: 推迟发布到 v0.1.1
```

---

## 🔄 怎么更新 DoD

- 改 DoD = 改产品方向
- 改前先在 v0.X 反馈里找证据
- 改完同步更新 ROADMAP
- **不要在版本发布前 1 周改**

---

**最后更新**: 2026-06-27 13:45 CST
