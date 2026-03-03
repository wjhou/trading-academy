# Trading Academy 📚

**A comprehensive, book-style guide to automated trading from complete beginner to professional level.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Book Status](https://img.shields.io/badge/book-in%20progress-blue)](https://github.com/wjhou/trading-academy)

## 📖 Read the Book

**Online**: [https://wjhou.github.io/trading-academy](https://wjhou.github.io/trading-academy) *(coming soon)*

**Locally**:
```bash
# Install mdBook
cargo install mdbook
# Or on macOS:
brew install mdbook

# Serve the book
cd trading-academy
mdbook serve --open
```

## 🎯 What You'll Learn

This book takes you on a complete journey:

- **Module 1**: Trading Fundamentals - What is trading, how markets work
- **Module 2**: Technical Analysis - Reading charts, identifying patterns
- **Module 3**: Technical Indicators - RSI, MACD, Bollinger Bands, and more
- **Module 4**: Trading Strategies - Build profitable strategies from scratch
- **Module 5**: Risk Management - Protect your capital professionally
- **Module 6**: Backtesting - Test strategies scientifically
- **Module 7**: Automation - Build production trading systems
- **Module 8**: Advanced Topics - ML, sentiment analysis, HFT concepts

**Total**: 47 lessons + 47 exercises + 8 hands-on projects

## 🚀 Quick Start

### For Readers

1. **Clone the repository**
   ```bash
   git clone https://github.com/wjhou/trading-academy.git
   cd trading-academy
   ```

2. **Read online or build locally**
   ```bash
   mdbook serve --open
   ```

3. **Start with the introduction**
   - Read: `book/introduction.md`
   - Or navigate to Module 1, Lesson 1 in the web interface

### For Learners (Hands-On)

1. **Set up stock-agent-system** (required for exercises)
   ```bash
   cd /Users/houwenjun/Desktop/Projects
   git clone https://github.com/wjhou/stock-agent-system.git
   cd stock-agent-system
   pip install -e .
   ```

2. **Track your progress**
   ```bash
   cd trading-academy
   python track_progress.py
   ```

3. **Complete exercises**
   - Each lesson has exercises in `exercises/module-XX/`
   - Solutions available in `solutions/` (try first!)

## 📁 Project Structure

```
trading-academy/
├── book/                      # Book content (mdBook format)
│   ├── SUMMARY.md            # Table of contents
│   ├── introduction.md       # Book introduction
│   ├── module-01/            # Module 1 lessons
│   ├── module-02/            # Module 2 lessons
│   └── ...
├── exercises/                 # Practice exercises
├── solutions/                 # Exercise solutions
├── resources/                 # Glossary, cheat sheets, etc.
├── book.toml                 # mdBook configuration
├── track_progress.py         # Progress tracker
└── README.md                 # This file
```

## 🎓 Learning Path

### Beginner Track (Modules 1-3)
**Goal**: Understand trading basics and technical analysis
**Time**: 6 weeks
**Outcome**: Can read charts, understand indicators, identify patterns

### Intermediate Track (Modules 4-5)
**Goal**: Build and test trading strategies with proper risk management
**Time**: 5 weeks
**Outcome**: Can create profitable strategies and manage risk

### Advanced Track (Modules 6-8)
**Goal**: Build professional automated trading systems
**Time**: 7 weeks
**Outcome**: Can deploy production trading systems

## 💻 Integration with stock-agent-system

This book is designed to work seamlessly with [stock-agent-system](https://github.com/wjhou/stock-agent-system):

- **All examples** use stock-agent-system code
- **Exercises** extend stock-agent-system with new strategies
- **Projects** build on stock-agent-system architecture
- **Real data** via stock-agent-system data providers

## 📊 Features

- ✅ **Progressive learning** - Start from zero, reach professional level
- ✅ **Hands-on exercises** - Practice with real code and data
- ✅ **Interactive examples** - Run code, see results immediately
- ✅ **Visual learning** - Charts, graphs, and diagrams throughout
- ✅ **Progress tracking** - Built-in tracker to monitor your journey
- ✅ **Searchable** - Full-text search across all content
- ✅ **Mobile-friendly** - Read on any device
- ✅ **Open source** - Free forever, community-driven

## 🤝 Contributing

We welcome contributions! Ways to help:

1. **Fix typos or improve explanations**
2. **Add new lessons or exercises**
3. **Create visualizations or diagrams**
4. **Share your trading strategies** (as examples)
5. **Translate to other languages**

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 Building the Book

### Prerequisites

- [mdBook](https://rust-lang.github.io/mdBook/guide/installation.html) installed
- Rust toolchain (for mdBook)

### Build Commands

```bash
# Serve locally with live reload
mdbook serve

# Build static HTML
mdbook build

# Test all code examples
mdbook test

# Clean build artifacts
mdbook clean
```

### Deploy to GitHub Pages

```bash
# Build the book
mdbook build

# The output is in book/ directory
# Deploy to gh-pages branch
git worktree add gh-pages gh-pages
cp -r book/* gh-pages/
cd gh-pages
git add .
git commit -m "Update book"
git push origin gh-pages
```

## ⚠️ Disclaimers

- **Educational Purpose Only**: Not financial advice
- **Risk Warning**: Trading involves substantial risk of loss
- **Paper Trade First**: Practice before risking real money
- **No Guarantees**: Past performance ≠ future results

## 📚 Additional Resources

- [Trading Glossary](book/resources/glossary.md) - 100+ terms explained
- [Recommended Books](book/resources/books.md) - Best books for each topic
- [Useful Tools](book/resources/tools.md) - Trading platforms and tools
- [FAQ](book/resources/faq.md) - Common questions answered

## 📞 Support

- **Questions**: [GitHub Discussions](https://github.com/wjhou/trading-academy/discussions)
- **Bugs**: [GitHub Issues](https://github.com/wjhou/trading-academy/issues)
- **Email**: trading-academy@example.com

## 📄 License

MIT License - Learn freely, trade responsibly.

See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [mdBook](https://rust-lang.github.io/mdBook/)
- Integrates with [stock-agent-system](https://github.com/wjhou/stock-agent-system)
- Inspired by the open-source education community

---

**Ready to start?** → [Read the Introduction](book/introduction.md) or [Jump to Module 1](book/module-01/lesson-01-what-is-trading.md)

**Happy learning, and trade responsibly!** 🚀📈
