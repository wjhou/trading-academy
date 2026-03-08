# 为本书做贡献

感谢您有兴趣为交易学院做贡献！本指南将帮助您入门。

## 贡献方式

### 1. 报告问题

发现了拼写错误、错误或不清楚的解释？

- 访问 [GitHub Issues](https://github.com/wjhou/trading-academy/issues)
- 点击"New Issue"
- 清楚地描述问题
- 包含模块和课程编号
- 如果可能，建议修复方案

### 2. 改进内容

帮助使本书更好：

- 修复拼写错误和语法
- 澄清令人困惑的解释
- 添加缺失的示例
- 改进代码注释
- 更新过时的信息

### 3. 添加新内容

贡献新材料：

- 额外的练习
- 真实世界的示例
- 案例研究
- 替代方法
- 高级主题

### 4. 翻译

帮助使本书更易访问：

- 将课程翻译成其他语言
- 审查现有翻译
- 维护翻译质量

### 5. 分享反馈

您的体验很重要：

- 什么效果好？
- 什么令人困惑？
- 缺少什么？
- 我们如何改进？

## 入门

### Fork 和 Clone

```bash
# 在 GitHub 上 Fork 仓库
# 然后 clone 您的 fork
git clone https://github.com/YOUR_USERNAME/trading-academy.git
cd trading-academy

# 添加 upstream remote
git remote add upstream https://github.com/wjhou/trading-academy.git
```

### 创建分支

```bash
# 为您的更改创建新分支
git checkout -b fix/typo-in-module-3

# 或用于新功能
git checkout -b feature/add-exercise-module-4
```

### 进行更改

编辑 `src/en/` 或 `src/zh/` 中的 markdown 文件：

```bash
# 编辑课程
code src/en/module-03/lesson-01-momentum.md

# 在本地测试您的更改
mdbook serve
# 打开 http://localhost:3000
```

### 提交更改

```bash
# 暂存您的更改
git add src/en/module-03/lesson-01-momentum.md

# 使用清晰的消息提交
git commit -m "Fix typo in Module 3 Lesson 1 RSI explanation"
```

### 推送并创建 Pull Request

```bash
# 推送到您的 fork
git push origin fix/typo-in-module-3

# 访问 GitHub 并创建 Pull Request
```

## 贡献指南

### 内容标准

**1. 清晰度**
- 使用清晰、简单的语言
- 在使用概念之前先解释
- 使用示例来说明要点
- 避免不必要的术语

**2. 准确性**
- 验证所有事实和公式
- 测试所有代码示例
- 适当时引用来源
- 更新过时的信息

**3. 一致性**
- 遵循现有风格
- 使用一致的术语
- 匹配本书的语气
- 遵循格式约定

**4. 完整性**
- 包含所有必要的上下文
- 提供可工作的代码示例
- 适当时添加练习
- 链接到相关章节

### 代码标准

**1. 可工作的代码**
```python
# 所有代码必须无错误运行
# 提交前测试

import pandas as pd
import numpy as np

# 好：清晰、可工作的示例
def calculate_rsi(prices, period=14):
    """计算 RSI 指标。"""
    delta = prices.diff()
    gain = delta.where(delta > 0, 0).rolling(period).mean()
    loss = -delta.where(delta < 0, 0).rolling(period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))
```

**2. 文档**
```python
# 包含文档字符串
def my_function(param1, param2):
    """
    简要描述。

    参数：
    -----------
    param1 : type
        描述
    param2 : type
        描述

    返回：
    --------
    type
        描述
    """
    pass
```

**3. 风格**
- 遵循 PEP 8 风格指南
- 使用有意义的变量名
- 为复杂逻辑添加注释
- 保持函数专注和小巧

### Markdown 格式

**标题**
```markdown
# 模块标题 (H1)
## 章节标题 (H2)
### 小节 (H3)
```

**代码块**
````markdown
```python
# Python 代码在这里
import pandas as pd
```
````

**列表**
```markdown
- 无序列表项
- 另一项

1. 有序列表项
2. 另一项
```

**链接**
```markdown
[链接文本](./path/to/file.md)
[外部链接](https://example.com)
```

**强调**
```markdown
*斜体* 或 _斜体_
**粗体** 或 __粗体__
`内联代码`
```

## 审查流程

### 提交后会发生什么

1. **自动检查**：CI/CD 运行测试
2. **审查**：维护者审查您的更改
3. **反馈**：您可能会收到评论或请求
4. **批准**：一旦批准，更改将被合并
5. **发布**：更改出现在本书中

### 审查标准

您的贡献将根据以下标准进行评估：

- **正确性**：信息是否准确？
- **清晰度**：是否易于理解？
- **完整性**：是否很好地涵盖了主题？
- **一致性**：是否与本书的风格匹配？
- **价值**：是否改进了本书？

## 贡献类型

### 快速修复（简单）

非常适合首次贡献者：

- 修复拼写错误
- 纠正语法
- 修复损坏的链接
- 更新过时的信息

**示例 PR**："修复模块 3 课程 1 中的拼写错误"

### 内容改进（中等）

需要理解主题：

- 澄清解释
- 添加示例
- 改进代码
- 扩展章节

**示例 PR**："为 RSI 指标解释添加更多示例"

### 新内容（高级）

需要深入的知识：

- 新课程
- 新练习
- 新模块
- 高级主题

**示例 PR**："在模块 8 中添加配对交易课程"

## 翻译指南

### 开始翻译

1. 检查翻译是否存在
2. 创建语言目录：`src/[lang]/`
3. 复制英文结构
4. 翻译内容
5. 保持格式

### 翻译标准

- 适当时保留技术术语
- 将示例调整为本地上下文
- 保持代码注释为英文
- 在课程之间保持一致性

### 示例结构

```
src/
├── en/           # 英文（原始）
├── zh/           # 中文
├── es/           # 西班牙文
└── [lang]/       # 您的语言
```

## 行为准则

### 尊重他人

- 尊重每个人
- 在反馈中保持建设性
- 欢迎新人
- 假设善意

### 保持专业

- 保持主题
- 避免人身攻击
- 专注于内容
- 对审查者保持耐心

### 协作

- 帮助他人学习
- 分享知识
- 给予应有的荣誉
- 共同努力

## 获取帮助

### 有问题？

- **一般问题**：开启 GitHub Discussion
- **错误**：开启 GitHub Issue
- **贡献**：在您的 PR 上评论
- **聊天**：加入我们的社区（如果可用）

### 资源

- [Markdown 指南](https://www.markdownguide.org/)
- [mdBook 文档](https://rust-lang.github.io/mdBook/)
- [Git 教程](https://git-scm.com/docs/gittutorial)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## 认可

### 贡献者

所有贡献者都会在以下位置得到认可：
- CONTRIBUTORS.md 文件
- 本书致谢
- GitHub 贡献者页面

### 重大贡献

主要贡献者可能会：
- 被列为共同作者
- 被邀请加入维护者团队
- 在公告中被特别介绍

## 许可证

通过贡献，您同意您的贡献将在与本书相同的许可证（MIT 许可证）下获得许可。

## 谢谢！

每一个贡献，无论多么小，都有助于使本书对每个人都更好。感谢您抽出时间做出贡献！

---

**准备好贡献了吗？** 选择一个标记为"good first issue"或"help wanted"的问题并开始吧！

**有问题？** 在 GitHub 上开启讨论或在现有问题上评论。
