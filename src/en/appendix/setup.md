# Setting Up Your Environment

Complete guide to setting up your trading development environment.

## Prerequisites

Before starting, ensure you have:
- A computer with at least 8GB RAM
- Stable internet connection
- Administrator/sudo access
- Basic command line familiarity

## Step 1: Install Python

### macOS

**Option 1: Using Homebrew (Recommended)**
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python@3.11

# Verify installation
python3 --version
```

**Option 2: Official Installer**
1. Download from [python.org](https://www.python.org/downloads/)
2. Run the installer
3. Check "Add Python to PATH"
4. Complete installation

### Windows

**Option 1: Official Installer (Recommended)**
1. Download from [python.org](https://www.python.org/downloads/)
2. Run installer
3. **Important**: Check "Add Python to PATH"
4. Click "Install Now"
5. Verify in Command Prompt:
```cmd
python --version
```

**Option 2: Microsoft Store**
1. Open Microsoft Store
2. Search for "Python 3.11"
3. Click "Get" to install

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Python
sudo apt install python3.11 python3-pip python3-venv

# Verify installation
python3 --version
```

## Step 2: Set Up Virtual Environment

Virtual environments keep your project dependencies isolated.

### Create Virtual Environment

```bash
# Navigate to your project directory
cd ~/trading-projects

# Create virtual environment
python3 -m venv trading-env

# Activate virtual environment
# On macOS/Linux:
source trading-env/bin/activate

# On Windows:
trading-env\Scripts\activate

# You should see (trading-env) in your prompt
```

### Deactivate When Done

```bash
deactivate
```

## Step 3: Install Required Packages

With your virtual environment activated:

```bash
# Upgrade pip
pip install --upgrade pip

# Install core packages
pip install pandas numpy scipy

# Install data sources
pip install yfinance alpha-vantage

# Install visualization
pip install matplotlib seaborn plotly

# Install machine learning
pip install scikit-learn

# Install trading libraries
pip install ta-lib backtrader

# Install development tools
pip install jupyter notebook ipython

# Install testing tools
pip install pytest

# Or install everything at once
pip install pandas numpy scipy yfinance matplotlib seaborn \
    plotly scikit-learn jupyter pytest
```

### Create requirements.txt

Save your dependencies:

```bash
pip freeze > requirements.txt
```

Install from requirements.txt later:

```bash
pip install -r requirements.txt
```

## Step 4: Install Development Tools

### Visual Studio Code (Recommended)

1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Install for your operating system
3. Install Python extension:
   - Open VS Code
   - Click Extensions (Ctrl+Shift+X)
   - Search "Python"
   - Install Microsoft's Python extension

**Recommended VS Code Extensions:**
- Python (Microsoft)
- Jupyter
- GitLens
- Pylance
- Python Docstring Generator

### Jupyter Notebook

Already installed with our packages. To start:

```bash
# Start Jupyter
jupyter notebook

# Or use JupyterLab (more features)
pip install jupyterlab
jupyter lab
```

### PyCharm (Alternative)

1. Download from [jetbrains.com/pycharm](https://www.jetbrains.com/pycharm/)
2. Choose Community (free) or Professional
3. Install and configure Python interpreter

## Step 5: Set Up Git

### Install Git

**macOS:**
```bash
brew install git
```

**Windows:**
Download from [git-scm.com](https://git-scm.com/)

**Linux:**
```bash
sudo apt install git
```

### Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify
git config --list
```

### Create GitHub Account

1. Go to [github.com](https://github.com)
2. Sign up for free account
3. Set up SSH keys (optional but recommended)

## Step 6: Install TA-Lib (Optional)

TA-Lib provides technical analysis indicators.

### macOS

```bash
brew install ta-lib
pip install TA-Lib
```

### Windows

Download pre-built wheel from [here](https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib)

```cmd
pip install TA_Lib‑0.4.XX‑cpXX‑cpXX‑win_amd64.whl
```

### Linux

```bash
# Install dependencies
sudo apt-get install build-essential wget

# Download and install TA-Lib
wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz
tar -xzf ta-lib-0.4.0-src.tar.gz
cd ta-lib/
./configure --prefix=/usr
make
sudo make install

# Install Python wrapper
pip install TA-Lib
```

## Step 7: Set Up Trading Account

### Paper Trading (Recommended for Learning)

**Alpaca Paper Trading:**
1. Go to [alpaca.markets](https://alpaca.markets)
2. Sign up for free account
3. Get API keys from dashboard
4. Store keys securely (see below)

**TradingView Paper Trading:**
1. Create account at [tradingview.com](https://tradingview.com)
2. Use built-in paper trading
3. No API needed for manual trading

### Live Trading (After Testing)

Only move to live trading after:
- 3+ months successful paper trading
- Consistent profitability
- Proper risk management
- Understanding all risks

## Step 8: Secure Your API Keys

**Never commit API keys to Git!**

### Create .env File

```bash
# Create .env file in project root
touch .env

# Add to .gitignore
echo ".env" >> .gitignore
```

### Store Keys in .env

```
# .env file
ALPACA_API_KEY=your_api_key_here
ALPACA_SECRET_KEY=your_secret_key_here
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

### Load Keys in Python

```python
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Access keys
api_key = os.getenv('ALPACA_API_KEY')
secret_key = os.getenv('ALPACA_SECRET_KEY')
```

Install python-dotenv:
```bash
pip install python-dotenv
```

## Step 9: Test Your Setup

Create a test script to verify everything works:

```python
# test_setup.py
import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt

print("Testing setup...")

# Test data download
print("\n1. Testing yfinance...")
data = yf.download('AAPL', start='2024-01-01', end='2024-02-01', progress=False)
print(f"Downloaded {len(data)} rows of AAPL data")

# Test pandas
print("\n2. Testing pandas...")
print(f"Pandas version: {pd.__version__}")
print(f"Data shape: {data.shape}")

# Test numpy
print("\n3. Testing numpy...")
returns = data['Close'].pct_change()
print(f"Mean return: {returns.mean():.4f}")
print(f"Std dev: {returns.std():.4f}")

# Test matplotlib
print("\n4. Testing matplotlib...")
plt.figure(figsize=(10, 6))
data['Close'].plot()
plt.title('AAPL Close Price')
plt.savefig('test_plot.png')
print("Plot saved as test_plot.png")

print("\n✓ All tests passed! Your environment is ready.")
```

Run the test:
```bash
python test_setup.py
```

## Step 10: Organize Your Project

Create a standard project structure:

```
trading-project/
├── data/               # Downloaded data
├── notebooks/          # Jupyter notebooks
├── src/               # Source code
│   ├── strategies/    # Trading strategies
│   ├── backtesting/   # Backtest code
│   └── utils/         # Utility functions
├── tests/             # Unit tests
├── results/           # Backtest results
├── .env              # API keys (not in git)
├── .gitignore        # Git ignore file
├── requirements.txt   # Dependencies
└── README.md         # Project documentation
```

Create this structure:
```bash
mkdir -p trading-project/{data,notebooks,src/{strategies,backtesting,utils},tests,results}
cd trading-project
touch .env .gitignore requirements.txt README.md
```

## Common Issues and Solutions

### Issue: "pip: command not found"

**Solution:**
```bash
# Try pip3 instead
pip3 install package_name

# Or use python -m pip
python3 -m pip install package_name
```

### Issue: "Permission denied"

**Solution:**
```bash
# Use --user flag
pip install --user package_name

# Or use virtual environment (recommended)
```

### Issue: TA-Lib installation fails

**Solution:**
- Use pre-built wheels (Windows)
- Install build tools first (Linux)
- Use Homebrew (macOS)
- Or skip TA-Lib and use pandas-ta instead:
```bash
pip install pandas-ta
```

### Issue: Jupyter kernel not found

**Solution:**
```bash
# Install ipykernel
pip install ipykernel

# Add kernel
python -m ipykernel install --user --name=trading-env
```

## Next Steps

1. ✓ Environment set up
2. → Complete Python Basics appendix (if needed)
3. → Start Module 1 of the book
4. → Set up paper trading account
5. → Begin building your first strategy

## Maintenance

### Update Packages Regularly

```bash
# Update all packages
pip list --outdated
pip install --upgrade package_name

# Or update everything
pip install --upgrade pip
pip list --outdated | cut -d ' ' -f1 | xargs -n1 pip install -U
```

### Backup Your Environment

```bash
# Export current environment
pip freeze > requirements.txt

# Commit to git
git add requirements.txt
git commit -m "Update dependencies"
```

---

**Congratulations!** Your trading development environment is now ready. You can start learning and building trading strategies.

**Need Help?** Check the FAQ or open an issue on GitHub.

