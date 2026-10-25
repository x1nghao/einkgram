# Telegram 第三方客户端合规清单

> 整理时间: 2026-06-27
> 适用项目: Einkgram
> 信息源: Telegram 官方政策（来自 my.telegram.org 文档、官方 GitHub 仓库 README、telegram-tt 上游）+ 多个活跃第三方客户端的实践

---

## 📜 三层合规要求（按优先级）

### 🟢 第一层：法律 / 协议层（必须遵守）

#### 1. **API 凭证：必须申请 api_id 和 api_hash**

**要求**：
- 访问 https://my.telegram.org
- 用任意 Telegram 账号登录
- 创建应用获取 `api_id`（数字）和 `api_hash`（32 字符串）
- 填入项目根目录的 `.env` 文件

**为什么必须**：
- 没有 api_id/api_hash 客户端无法连接 Telegram 服务器
- 这是"协议层"准入凭证

**代码位置**（telegram-tt）：
```
src/
├── .env.example          ← 模板（没有真凭证）
├── .env                  ← 你的真凭证（git ignored）
└── src/config.ts         ← 读取凭证
```

**注意**：
- 你的 api_id 会被**捆绑到一个**"应用"——其他开发者也会用你的应用名义调用
- 如果滥用，整个应用会被封禁
- **解决办法**：让用户自己填自己的 api_id

---

#### 2. **GPL v3 协议（继承自 telegram-tt）**

**要求**：
- ✅ 保留原作者版权声明
- ✅ 保留 GPL 协议副本
- ✅ 衍生作品**必须也是 GPL v3** 开源
- ✅ 修改的源代码**必须公开**
- ❌ **不能闭源** Einkgram 然后内部使用
- ❌ **不能变成商业专有软件**而不开源

**实际影响**：
- 你 fork 出来的 Einkgram **必须开源**（GitHub Public 即可）
- 所有代码改动需要可被公众访问
- 可以收费（如卖服务、卖云端部署），但代码必须公开

**代码位置**（telegram-tt 已带）：
```
LICENSE                  ← GPL v3 全文
README.md                ← 提到 GPL
```

---

#### 3. **Telegram API 服务条款**

从官方要求和社区实践总结：

| 要求 | 说明 |
|---|---|
| ✅ **可以用 Telegram API 协议** | 协议本身开放 |
| ✅ **可以发布客户端** | 包括商业、修改、添加功能 |
| ⚠️ **不能违反 Telegram ToS** | 客户端用户也必须遵守 |
| ⚠️ **不能用于 spam / 滥用** | 大规模 spam 会被封禁 api_id |
| ⚠️ **不能假冒官方** | 名字/Logo 不能误导用户 |
| ❌ **不能爬取数据** | 违反 ToS |
| ❌ **不能绕过速率限制** | FloodWait 必须遵守 |

---

### 🟡 第二层：品牌 / 标识层（强烈建议遵守）

#### 4. **不能用 "Telegram" 命名应用**

**官方要求**（多个 GitHub 仓库 README 都引用）：
> Please do not use the name Telegram for your app — or make sure that your users understand that it is unofficial.

**实践**：
- ✅ "Einkgram"（我们选的）—— 清晰表明是独立产品
- ❌ "Telegram E-Ink Edition"
- ❌ "Telegram Plus"
- ⚠️ 可以提"for Telegram"或"unofficial Telegram client"

**理由**：
- 用户必须**明确知道**这是第三方
- 法律上避免商标纠纷
- 道德上避免冒充官方

---

#### 5. **不能用官方 Logo**

**要求**：
- ❌ 不能用 Telegram 飞机图标
- ✅ 必须用自己的 Logo
- ✅ 必须用自己配色

**Einkgram 行动**：
- 创建一个简单的 E-Ink 风格 Logo（飞机轮廓 + 墨水屏波纹）
- 黑白两色
- 在 PWA manifest.json、README、网站都使用

---

#### 6. **必须标注 "Unofficial"**

**要求**（最常见的合规要求）：
> Kindly do not use our standard logo (white paper plane in a blue circle) as your app's logo.

**实践**：
- 在 App 内"关于"页面写"Unofficial Telegram client"
- 在 README 第一行写"For Telegram, but not affiliated with or endorsed by Telegram FZ-LLC"
- 在网站 footer 加"Unofficial"标记

---

### 🔵 第三层：技术 / 工程层（最佳实践）

#### 7. **保留上游致谢**

**格式**（推荐放在 README 顶部）：
```markdown
Einkgram is a fork of [telegram-tt](https://github.com/Ajaxy/telegram-tt),
which is licensed under GPL v3.

telegram-tt is an official Telegram client built by Alexander Zinchuk
(Ajaxy) as part of the [Telegram Lightweight Client Contest](https://contest.com/javascript-web-3).

This project is not affiliated with or endorsed by Telegram FZ-LLC.
```

#### 8. **保留原 Copyright 头**

**要求**（GPL 强制）：
- 每个源文件顶部 `// Copyright (C) <year> <author>` 不可删除
- 可以**添加**你自己的版权头在它下面

**示例**：
```typescript
// Copyright (C) Telegram (see LICENSE in the project root)
// Copyright (C) 2026 Einkgram Contributors
// SPDX-License-Identifier: GPL-3.0-or-later

import { ... };
```

#### 9. **修改说明（如果你愿意）**

**可选但推荐**：
- 在 README 写"This project modifies telegram-tt in the following ways..."
- 写一个 `MODIFICATIONS.md` 或 `CHANGES.md` 详细说明改动

---

## ✅ 行动清单（Einkgram v0.1 发布前必做）

### 法律合规
- [ ] 申请自己的 api_id / api_hash（自己用，不公开）
- [ ] 提供"用户自带 api_id"配置入口（推荐）
- [ ] 保留 LICENSE 文件完整
- [ ] 保留所有原 Copyright 头
- [ ] 在 README 加"Unofficial / Not affiliated"声明

### 品牌合规
- [ ] 创建自己的 Logo（不用飞机图标）
- [ ] 名称保持 "Einkgram"（不带 Telegram 字样）
- [ ] 在 App "关于"页面写明 unofficial
- [ ] 网站 footer 加 unofficial 标识

### 工程合规
- [ ] 修改的源文件**添加** Einkgram 版权头（保留上游）
- [ ] 写一个致谢页面（Credits）
- [ ] 在 README 第一段说明 fork 关系
- [ ] 写 CHANGES.md 记录从 telegram-tt 的差异

### Git 策略
- [ ] 第一次 push 时确保 fork 关系清晰
- [ ] 仓库设为 Public（GPL 强制）
- [ ] 保留 Upstream remote（方便同步）
- [ ] commit 信息清晰（"fork from telegram-tt commit xxxxx"）

---

## 🤝 与 telegram-tt upstream 的关系

### 推荐工作流

```
你的开发:
  X1NGHAO/einkgram (你的 fork) ← 用户从这里装

定期同步:
  X1NGHAO/einkgram ← Ajaxy/telegram-tt (upstream)
        ↓
  每周 rebase / merge

贡献回去 (可选):
  X1NGHAO/einkgram → Ajaxy/telegram-tt (PR)
        ↓
  E-Ink 优化可能被合并
```

**建议**：
- 订阅 Ajaxy/telegram-tt 的 GitHub releases
- 每月 rebase 一次（除非大量冲突）
- 协议层（lib/）跟 upstream，UI 层自己管

---

## 📊 风险评估

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| 商标投诉 | 🟢 低 | 改名 | 已经用 "Einkgram" 独立名 |
| api_id 被封 | 🟡 中 | 客户端无法登录 | 让用户自填 api_id |
| GPL 纠纷 | 🟢 极低 | 必须开源 | 我们本来就是开源 |
| Telegram 政策变化 | 🟡 中 | 需要重新合规 | 跟随上游变化 |
| 跟 upstream 大冲突 | 🟡 中 | rebase 工作量 | 协议层优先同步 |
| 假冒官方投诉 | 🟢 低 | 改 UI 措辞 | 已经加 unofficial 标识 |

---

## 📝 关键法律免责声明模板

**README 模板**（Einkgram）：

```markdown
# Einkgram

An unofficial Telegram client optimized for E-Ink devices.

Einkgram is **not** affiliated with, endorsed by, or sponsored by
Telegram FZ-LLC. The Telegram name, logo, and related marks are
trademarks of Telegram FZ-LLC.

Einkgram is a fork of [telegram-tt](https://github.com/Ajaxy/telegram-tt)
by Alexander Zinchuk, which is licensed under GPL v3 and is itself an
official Telegram client available at [web.telegram.org/a](https://web.telegram.org/a).

## License

GPL v3 (see LICENSE)

## Notice on Account Usage

By using this client, you agree to the Telegram Terms of Service.
Misuse of the Telegram API may result in your account being limited.
```

---

## 💡 一个超重要的策略

**用户自带 api_id 是最优方案**：

| 模式 | 优点 | 缺点 |
|---|---|---|
| **共享 api_id**（用你自己的） | 用户开箱即用 | 滥用风险大；一个用户 spam 全员遭殃 |
| **用户自带 api_id** | 完全隔离；专业感 | 用户多一步配置 |
| **混合** | 大部分用户用共享；高级用户自填 | 略复杂 |

**telegram-tt 用的就是"用户自带"**——所以你看到的 `.env.example` 是空的。

**建议 Einkgram 沿用**：
- 默认 .env 留空
- 登录前显示"请输入 api_id 和 api_hash"
- 提供"如何获取"的链接和截图

---

## 🚀 下一步

1. **现在**：你申请自己的 api_id（5 分钟）
   - 访问 https://my.telegram.org
   - 创建应用，名字随便填
   - 把 api_id 和 api_hash 复制到本地 `.env`

2. **代码里**：第一次跑 dev 时，会提示输入 api_id

3. **发布前**：在 README 加"Unofficial"声明

---

## 📚 参考资料

- Telegram API 官方文档: https://core.telegram.org
- Telegram API ToS: https://core.telegram.org/api/terms
- telegram-tt GitHub: https://github.com/Ajaxy/telegram-tt
- Forkgram README 合规声明: 多个项目都引用同一官方要求
- GPL v3 协议: 仓库内 LICENSE 文件

---

**最后更新**: 2026-06-27 02:18 CST
