# Einkgram ↔ telegram-tt 同步策略

> 创建日期: 2026-06-27
> 适用版本: 0.1+
> 核心原则: **改得越少，同步越顺**

---

## 🎯 为什么这条策略至关重要

telegram-tt 是个**活跃项目**——Alexander Zinchuk 持续更新。每周可能有 5-20 个 commit。如果 Einkgram 改太多原文件，**同步一次可能就要修一天**。

我们要做到：
- **同步成本 < 30 分钟/月**
- **冲突永远只发生在配置层**（vite.config.ts、package.json）
- **核心代码区永远 0 冲突**

---

## 🚦 红黄绿三区制度

| 区域 | 含义 | 改的代价 | 同步策略 |
|---|---|---|---|
| 🟢 **绿色区**（我们自己的） | `src/eink/**`、`public/icons/**`、`public/fonts/**` | 0 | 不影响同步 |
| 🟡 **黄色区**（尽量别动） | `vite.config.ts`、`main.tsx`、`index.html`、`package.json` | 低 | 加在文件末尾 / 加在 imports 后 |
| 🔴 **红色区**（绝不改动） | `src/lib/**`、`src/components/**`、`src/stores/**`、`src/api/**` | 高 | **完全不碰** |

**如果某个改动需要动红色区**——先停下，问自己：
1. 能不能用 CSS 覆盖实现？
2. 能不能 hook 进现有生命周期？
3. 能不能放在 eink/ 目录 + 在 main.tsx 注入？

99% 的情况下答案是"能"。

---

## 📋 具体的"别动"清单

### src/lib/ 🚫

```bash
# 这些目录永远不要改：
src/lib/mtproto/        # MTProto 实现
src/lib/gramjs/         # GramJS MTProto 库
src/lib/api-manager/    # API 调用管理
src/lib/cache/          # 缓存层
src/lib/storages/       # 持久化
```

**理由**：这是协议层，telegram-tt 的作者会频繁更新，我们一旦改了就跟不上了。

### src/components/ 🚫

```bash
# 几乎所有组件不要改：
src/components/chat/    # 聊天 UI
src/components/middle/  # 中间栏
src/components/left/    # 左侧栏
src/components/modals/  # 模态框
src/components/common/  # 通用组件
src/components/auth/    # 登录页
```

**理由**：telegram-tt 的 UI 在不断进化（Material You、新版 Stories 等）。**改 UI = 落后于 upstream**。

**例外**（实在要改时）：
- 在 `src/eink/overrides/` 写**包装组件**
- 包装组件里 import 原组件，套个 div 加 className
- 在 `App.tsx` 替换使用

```tsx
// 示例：src/eink/overrides/ChatList.tsx
import { ChatList as OriginalChatList } from '../../components/left/ChatList';

export function ChatList() {
  return (
    <div className="eink-chat-list">
      <OriginalChatList />
    </div>
  );
}
```

这样 upstream 改 ChatList，我们**0 改动**就跟上了。

### src/stores/ 🚫

```bash
src/stores/             # MobX 状态
```

**例外**：
- 在 `src/eink/stores/` 加我们自己的 store
- 我们的 store 不 import 上游 store
- 通过 `react-mobx-hooks` 订阅（如必要）

---

## 🔄 同步工作流（每月 1 次）

### 准备

```bash
cd ~/Documents/einkgram/src

# 配置 remotes（一次性）
git remote remove origin  # 移除 Ajaxy
git remote add origin https://github.com/X1NGHAO/telegram-tt.git
git remote add upstream https://github.com/Ajaxy/telegram-tt.git

# 确认
git remote -v
```

### 拉取更新

```bash
# 1. 拉 upstream 最新代码（不 merge）
git fetch upstream

# 2. 看 upstream 改了什么
git log upstream/master --oneline -20
git log upstream/master --stat -10  # 看具体改了哪些文件

# 3. 如果冲突可能多，用 rebase；否则 merge
git checkout master
git rebase upstream/master
# 或
git merge upstream/master
```

### 冲突处理

#### 绿色区（src/eink/）冲突
- 不可能冲突，**因为 upstream 没有 src/eink/**

#### 黄色区（main.tsx、vite.config.ts、package.json）冲突
- **预期内的**，我们改了
- 解决方法：**保留两边的改动**
  - 我们的 import 加在原 imports 后
  - 我们的 PWA plugin 加在原 plugins 数组里

```typescript
// vite.config.ts 冲突解决示例
// === upstream 新增的内容 ===
import { someNewFeature } from '@telegram/...';
// === 我们的内容（保留） ===
import { VitePWA } from 'vite-plugin-pwa';
// === 合并 plugins 数组 ===
plugins: [
  // upstream 原 plugins
  react(),
  someNewFeature(),
  // 我们的
  VitePWA({ /* ... */ }),
]
```

#### 红色区冲突
- **不会发生**，因为我们没改

### 验证

```bash
# 1. 类型检查
npm run check:ts

# 2. Lint
npm run check

# 3. 跑起来
npm run dev

# 4. 登录测试
# 5. 看看我们 eink 主题还在
```

### 提交

```bash
git add -A
git commit -m "Sync with telegram-tt upstream $(date +%Y-%m-%d)

Upstream commits:
$(git log upstream/master --oneline -20 | head -10)

Einkgram changes preserved:
- src/eink/** (CSS overrides, hooks, utils)
- vite.config.ts (PWA plugin)
- main.tsx (eink initialization)"
git push origin master
```

---

## 🆘 复杂冲突的处理

### 如果 upstream 改了我们 eink/ 目录外的文件

**情况 A：upstream 改了 vite.config.ts**
- 我们没改：直接 `git checkout --theirs vite.config.ts`
- 重新手加我们的 PWA plugin（一行）

**情况 B：upstream 改了 main.tsx**
- 重新手加我们的 `import './eink/styles/overrides.css'`
- 重新手加我们的 `useEinkMode()`

**情况 C：upstream 改了 package.json**
- 合并 dependencies（两边的都要保留）
- 重新 `npm install`

### 如果 upstream 改了我们 hook 进的组件

**情况：upstream 改 ChatList，删了某个 ref**
- 我们的 `useKeyboardNav.ts` 引用了那个 ref
- 解决方法：把 ref 改成 DOM 查询（更稳）

```typescript
// 脆弱：依赖内部 ref
messageListRef.current?.scrollToNextMessage();

// 稳：直接操作 DOM
document.querySelector('.MessageList')?.scrollBy({ top: 100, behavior: 'auto' });
```

### 如果 upstream 改了我们 eink/ 目录

**这不应该发生**——upstream 不知道 src/eink/ 存在

但万一发生：
- 检查 upstream 是不是合并了我们的 PR
- 如果是：接受，删除我们的
- 如果不是：保持我们的

---

## 🛡️ 防御性编程建议

### 1. 用 hook 注入，不 import 组件

**坏的**：
```typescript
import { ChatList } from './components/left/ChatList';
export const WrappedChatList = (props) => <ChatList {...props} />;
```
（如果 upstream 改 ChatList，我们 import 路径可能变）

**好的**：
```typescript
// 不 import，运行时查询
export function attachEinkClass() {
  document.querySelectorAll('.ChatList').forEach(el => {
    el.classList.add('eink-chat-list');
  });
}
```

### 2. CSS 覆盖用 `:where()` 避免 specificity 战争

**坏的**：
```css
.ChatList .item { color: black; }  /* specificity 0,2,0 */
```

**好的**：
```css
:where(.eink-mode) .ChatList .item { color: black; }
```

### 3. 环境检测放 hook 不放组件

**好的**：
```typescript
// src/eink/hooks/useEinkMode.ts
export function useEinkMode() {
  useEffect(() => {
    if (isEinkDevice()) {
      document.body.classList.add('eink-mode');
    }
  }, []);
}

// main.tsx 调用一次
useEinkMode();
```

---

## 📊 同步频率建议

| 阶段 | 频率 | 备注 |
|---|---|---|
| **v0.1 内测期** | 每月 1 次 | 没必要追太紧 |
| **v1.0 稳定后** | 每月 1-2 次 | upstream 修复 bug 时优先同步 |
| **upstream 重大发布** | 立刻同步 | 比如他们改架构 |
| **upstream 紧急修复** | 立刻同步 | 安全/登录/协议 |

---

## 📌 自动化建议（可选）

写一个 pre-rebase 检查脚本：

```bash
# scripts/pre-sync-check.sh
#!/bin/bash

echo "=== 检查红色区是否被改 ==="
git diff master..upstream/master --name-only | while read file; do
  case "$file" in
    src/lib/*|src/components/*|src/stores/*|src/api/*)
      echo "🔴 警告：upstream 改了 $file"
      ;;
  esac
done

echo "=== 检查我们的修改 ==="
git diff upstream/master..master --name-only | while read file; do
  case "$file" in
    src/eink/*|public/*) echo "🟢 我们改的（不受影响）：$file";;
    *) echo "🟡 检查：$file";;
  esac
done
```

---

## 🎓 经验教训（写给自己的）

1. **telegram-tt 的原作者很勤奋**——不要试图超过他，做差异化
2. **CSS 永远比 JS 兼容性好**——优先 CSS-only 方案
3. **包装比覆盖好**——多写一个组件而不是改原组件
4. **测试要快速**——`npm run dev` 跑通 = 同步成功
5. **eink/ 目录就是我们的护城河**——所有创新都放这

---

## 📚 参考资料

- telegram-tt 上游: https://github.com/Ajaxy/telegram-tt
- 同步策略灵感: [How to maintain a long-lived fork](https://blog.jayway.com/2015/03/26/how-to-maintain-a-long-lived-fork/)

---

**最后更新**: 2026-06-27 02:22 CST
