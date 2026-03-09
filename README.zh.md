# 交易学院 📚

**从零基础到专业水平的自动化交易综合指南**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Book Status](https://img.shields.io/badge/book-in%20progress-blue)](https://github.com/wjhou/trading-academy)

[English](README.md) | 简体中文

## 📖 阅读本书

**在线阅读**:
- 英文版：[https://wjhou.github.io/trading-academy](https://wjhou.github.io/trading-academy)
- 中文版：[https://wjhou.github.io/trading-academy/zh](https://wjhou.github.io/trading-academy/zh)

**本地阅读**:
```bash
# 安装 mdBook
cargo install mdbook
# 或在 macOS 上：
brew install mdbook

# 启动中文版
cd trading-academy
MDBOOK_BOOK__SRC=src/zh MDBOOK_BUILD__BUILD_DIR=book/zh mdbook serve --open

# 启动英文版
mdbook serve --open
```

## 🎯 你将学到什么

本书将带你完成完整的学习旅程：

- **模块1**: 交易基础 - 什么是交易，市场如何运作
- **模块2**: 技术分析基础 - 阅读图表，识别形态
- **模块3**: 技术指标 - RSI、MACD、布林带等
- **模块4**: 交易策略 - 从零开始构建盈利策略
- **模块5**: 风险管理 - 专业地保护你的资本
- **模块6**: 回测与优化 - 科学地测试策略
- **模块7**: 自动化交易 - 构建生产级交易系统
- **模块8**: 高级主题 - 机器学习、情绪分析、高频交易概念

**总计**: 47课 + 47个练习 + 8个实战项目

## 🚀 快速开始

### 阅读者

1. **克隆仓库**
   ```bash
   git clone https://github.com/wjhou/trading-academy.git
   cd trading-academy
   ```

2. **在线阅读或本地构建**
   ```bash
   # 中文版
   MDBOOK_BOOK__SRC=src/zh MDBOOK_BUILD__BUILD_DIR=book/zh mdbook serve --open

   # 英文版
   mdbook serve --open
   ```

3. **从简介开始**
   - 阅读：`src/zh/introduction.md`
   - 或在网页界面导航到模块1，第1课

### 学习者（实践操作）

1. **设置 stock-agent-system**（练习所需）
   ```bash
   cd /Users/houwenjun/Desktop/Projects
   git clone https://github.com/wjhou/stock-agent-system.git
   cd stock-agent-system
   pip install -e .
   ```

2. **跟踪你的进度**
   ```bash
   cd trading-academy
   python track_progress.py
   ```

3. **完成练习**
   - 每课在 `exercises/module-XX/` 中都有练习
   - 解答在 `solutions/` 中（先自己尝试！）

## 📁 项目结构

```
trading-academy/
├── src/
│   ├── en/                    # 英文内容
│   │   ├── SUMMARY.md        # 目录
│   │   ├── introduction.md   # 简介
│   │   ├── module-01/        # 模块1课程
│   │   └── ...
│   └── zh/                    # 中文内容
│       ├── SUMMARY.md        # 目录
│       ├── introduction.md   # 简介
│       ├── module-01/        # 模块1课程
│       └── ...
├── book/                      # 构建输出
│   ├── en/                   # 英文版本
│   └── zh/                   # 中文版本
├── exercises/                 # 练习题
├── solutions/                 # 练习解答
├── resources/                 # 术语表、速查表等
├── book.toml                 # mdBook 配置（英文）
├── book-zh.toml              # mdBook 配置（中文）
├── track_progress.py         # 进度跟踪器
├── README.md                 # 英文说明
└── README.zh.md              # 中文说明（本文件）
```

## 🎓 学习路径

### 初级路径（模块1-3）
**目标**: 理解交易基础和技术分析
**时间**: 6周
**成果**: 能够阅读图表、理解指标、识别形态

### 中级路径（模块4-5）
**目标**: 构建和测试交易策略，进行适当的风险管理
**时间**: 5周
**成果**: 能够创建盈利策略并管理风险

### 高级路径（模块6-8）
**目标**: 构建专业的自动化交易系统
**时间**: 7周
**成果**: 能够部署生产级交易系统

## 💻 与 stock-agent-system 集成

本书设计为与 [stock-agent-system](https://github.com/wjhou/stock-agent-system) 无缝协作：

- **所有示例** 使用 stock-agent-system 代码
- **练习** 通过新策略扩展 stock-agent-system
- **项目** 基于 stock-agent-system 架构构建
- **真实数据** 通过 stock-agent-system 数据提供者获取

## 📊 特性

- ✅ **渐进式学习** - 从零开始，达到专业水平
- ✅ **实践练习** - 使用真实代码和数据练习
- ✅ **交互式示例** - 运行代码，立即查看结果
- ✅ **可视化学习** - 全书配有图表、图形和示意图
- ✅ **进度跟踪** - 内置跟踪器监控你的学习旅程
- ✅ **可搜索** - 全文搜索所有内容
- ✅ **移动友好** - 在任何设备上阅读
- ✅ **开源** - 永久免费，社区驱动
- ✅ **双语支持** - 英文和简体中文版本

## 🤝 贡献

我们欢迎贡献！你可以通过以下方式帮助：

1. **修正错别字或改进解释**
2. **添加新课程或练习**
3. **创建可视化或图表**
4. **分享你的交易策略**（作为示例）
5. **翻译到其他语言**

查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

## 📝 构建本书

### 前置要求

- 安装 [mdBook](https://rust-lang.github.io/mdBook/guide/installation.html)
- Rust 工具链（用于 mdBook）

### 构建命令

```bash
# 本地服务，实时重载（英文版）
mdbook serve

# 本地服务，实时重载（中文版）
MDBOOK_BOOK__SRC=src/zh MDBOOK_BUILD__BUILD_DIR=book/zh mdbook serve

# 构建静态 HTML（英文版）
mdbook build

# 构建静态 HTML（中文版）
MDBOOK_BOOK__SRC=src/zh MDBOOK_BUILD__BUILD_DIR=book/zh mdbook build

# 测试所有代码示例
mdbook test

# 清理构建产物
mdbook clean
```

### 部署到 GitHub Pages

```bash
# 构建英文和中文版本
mdbook build
MDBOOK_BOOK__SRC=src/zh MDBOOK_BUILD__BUILD_DIR=book/zh mdbook build

# 输出在 book/ 目录
# 部署到 gh-pages 分支
git worktree add gh-pages gh-pages
cp -r book/* gh-pages/
cd gh-pages
git add .
git commit -m "Update book"
git push origin gh-pages
```

## ⚠️ 免责声明

- **仅供教育目的**: 不构成财务建议
- **风险警告**: 交易涉及重大损失风险
- **先模拟交易**: 在冒真金白银风险之前先练习
- **无保证**: 过去的表现 ≠ 未来的结果

## 📚 额外资源

- [交易术语表](src/zh/resources/glossary.md) - 100+术语解释
- [推荐书籍](src/zh/resources/books.md) - 每个主题的最佳书籍
- [实用工具](src/zh/resources/tools.md) - 交易平台和工具
- [常见问题](src/zh/resources/faq.md) - 常见问题解答

## 📞 支持

- **问题**: [GitHub Discussions](https://github.com/wjhou/trading-academy/discussions)
- **Bug**: [GitHub Issues](https://github.com/wjhou/trading-academy/issues)
- **邮箱**: trading-academy@example.com

## 📄 许可证

MIT 许可证 - 自由学习，负责任地交易。

详见 [LICENSE](LICENSE)。

## 🙏 致谢

- **内容创作**: 所有教育内容、课程、练习和资源均在 Anthropic 的 [Claude Code](https://claude.ai/code)（Claude Opus 4.5/4.6）协助下创建
- **中文翻译**: 使用 Claude Opus 4.6 完成完整翻译
- 使用 [mdBook](https://rust-lang.github.io/mdBook/) 构建
- 与 [stock-agent-system](https://github.com/wjhou/stock-agent-system) 集成
- 受开源教育社区启发

---

**准备开始了吗？** → [阅读简介](https://wjhou.github.io/trading-academy/zh) 或 [跳转到模块1](https://wjhou.github.io/trading-academy/zh/module-01/lesson-01-what-is-trading.html)

**祝学习愉快，负责任地交易！** 🚀📈
