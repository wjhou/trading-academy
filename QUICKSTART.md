# Trading Academy - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: View the Book

You have two options:

**Option A: Read Online (Easiest)**
```bash
# Just open the markdown files directly
cd trading-academy/book
# Start with introduction.md
```

**Option B: Build with mdBook (Recommended)**
```bash
# Install mdBook (one-time setup)
# On macOS:
brew install mdbook

# On Linux:
cargo install mdbook

# On Windows:
# Download from https://github.com/rust-lang/mdBook/releases

# Serve the book locally
cd trading-academy
mdbook serve --open
# Opens in your browser at http://localhost:3000
```

### Step 2: Set Up Your Trading Environment

```bash
# Navigate to stock-agent-system
cd /Users/houwenjun/Desktop/Projects/stock-agent-system

# Activate environment
source .venv/bin/activate

# Verify it works
stock-agent strategies
```

### Step 3: Start Learning!

```bash
# Go back to trading-academy
cd /Users/houwenjun/Desktop/Projects/trading-academy

# Read the first lesson
cat book/module-01/lesson-01-what-is-trading.md

# Or if using mdBook, navigate in the browser
```

### Step 4: Track Your Progress

```bash
# View your progress
python track_progress.py

# Mark lesson as complete
python track_progress.py lesson module-01 1

# Mark exercise as complete
python track_progress.py exercise module-01 1
```

## 📖 Learning Path

### Week 1-2: Trading Fundamentals
- Read Module 1 lessons (5 lessons)
- Complete Module 1 exercises
- Do the first paper trade project

### Week 3-4: Technical Analysis
- Read Module 2 lessons (5 lessons)
- Practice chart reading
- Analyze real stocks

### Week 5-6: Technical Indicators
- Read Module 3 lessons (5 lessons)
- Implement indicators in stock-agent-system
- Build indicator-based strategies

### Continue through all 8 modules...

## 💡 Tips for Success

1. **Don't rush** - Take time to understand each concept
2. **Practice daily** - Even 30 minutes is valuable
3. **Do the exercises** - Reading isn't enough, you must practice
4. **Use real data** - Always test with actual market data
5. **Keep a journal** - Document what you learn
6. **Paper trade first** - Never risk real money until profitable in simulation

## 🆘 Troubleshooting

### mdBook not found
```bash
# Install Rust first
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Then install mdBook
cargo install mdbook
```

### stock-agent-system not working
```bash
cd /Users/houwenjun/Desktop/Projects/stock-agent-system
source .venv/bin/activate
pip install -e .
```

### Can't find lessons
```bash
# Lessons are in two places:
# 1. book/module-XX/ (for mdBook)
# 2. lessons/module-XX/ (original format)
# They're the same content!
```

## 📚 What's Next?

After completing this quick start:

1. Read the full [Introduction](book/introduction.md)
2. Start [Module 1, Lesson 1](book/module-01/lesson-01-what-is-trading.md)
3. Join the community discussions
4. Share your progress!

## 🎯 Your First Goal

**Complete Module 1 (Trading Fundamentals) in 2 weeks**

This will give you:
- Understanding of how trading works
- Knowledge of order types
- Ability to read charts
- First paper trading experience

---

**Ready?** Start reading: [Introduction](book/introduction.md) → [Lesson 1.1](book/module-01/lesson-01-what-is-trading.md)

Good luck on your trading journey! 🚀
