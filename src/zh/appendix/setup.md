# 设置您的开发环境

完整指南：设置您的交易开发环境。

## 前置条件

开始之前，请确保您具备：
- 至少 8GB 内存的计算机
- 稳定的互联网连接
- 管理员/sudo 访问权限
- 基本的命令行使用经验

## 步骤 1：安装 Python

### macOS

**选项 1：使用 Homebrew（推荐）**
```bash
# 如果尚未安装 Homebrew，请先安装
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Python
brew install python@3.11

# 验证安装
python3 --version
```

**选项 2：官方安装程序**
1. 从 [python.org](https://www.python.org/downloads/) 下载
2. 运行安装程序
3. 勾选"Add Python to PATH"
4. 完成安装

### Windows

**选项 1：官方安装程序（推荐）**
1. 从 [python.org](https://www.python.org/downloads/) 下载
2. 运行安装程序
3. **重要**：勾选"Add Python to PATH"
4. 点击"Install Now"
5. 在命令提示符中验证：
```cmd
python --version
```

**选项 2：Microsoft Store**
1. 打开 Microsoft Store
2. 搜索"Python 3.11"
3. 点击"获取"进行安装

### Linux (Ubuntu/Debian)

```bash
# 更新软件包列表
sudo apt update

# 安装 Python
sudo apt install python3.11 python3-pip python3-venv

# 验证安装
python3 --version
```

## 步骤 2：设置虚拟环境

虚拟环境可以保持您的项目依赖项隔离。

### 创建虚拟环境

```bash
# 导航到您的项目目录
cd ~/trading-projects

# 创建虚拟环境
python3 -m venv trading-env

# 激活虚拟环境
# 在 macOS/Linux 上：
source trading-env/bin/activate

# 在 Windows 上：
trading-env\Scripts\activate

# 您应该在提示符中看到 (trading-env)
```

### 完成后停用

```bash
deactivate
```

## 步骤 3：安装所需软件包

激活虚拟环境后：

```bash
# 升级 pip
pip install --upgrade pip

# 安装核心软件包
pip install pandas numpy scipy

# 安装数据源
pip install yfinance alpha-vantage

# 安装可视化工具
pip install matplotlib seaborn plotly

# 安装机器学习库
pip install scikit-learn

# 安装交易库
pip install ta-lib backtrader

# 安装开发工具
pip install jupyter notebook ipython

# 安装测试工具
pip install pytest

# 或一次性安装所有内容
pip install pandas numpy scipy yfinance matplotlib seaborn \
    plotly scikit-learn jupyter pytest
```

### 创建 requirements.txt

保存您的依赖项：

```bash
pip freeze > requirements.txt
```

稍后从 requirements.txt 安装：

```bash
pip install -r requirements.txt
```

## 步骤 4：安装开发工具

### Visual Studio Code（推荐）

1. 从 [code.visualstudio.com](https://code.visualstudio.com/) 下载
2. 为您的操作系统安装
3. 安装 Python 扩展：
   - 打开 VS Code
   - 点击扩展（Ctrl+Shift+X）
   - 搜索"Python"
   - 安装 Microsoft 的 Python 扩展

**推荐的 VS Code 扩展：**
- Python (Microsoft)
- Jupyter
- GitLens
- Pylance
- Python Docstring Generator

### Jupyter Notebook

已随我们的软件包一起安装。启动方法：

```bash
# 启动 Jupyter
jupyter notebook

# 或使用 JupyterLab（更多功能）
pip install jupyterlab
jupyter lab
```

### PyCharm（替代方案）

1. 从 [jetbrains.com/pycharm](https://www.jetbrains.com/pycharm/) 下载
2. 选择 Community（免费）或 Professional
3. 安装并配置 Python 解释器

## 步骤 5：设置 Git

### 安装 Git

**macOS：**
```bash
brew install git
```

**Windows：**
从 [git-scm.com](https://git-scm.com/) 下载

**Linux：**
```bash
sudo apt install git
```

### 配置 Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 验证
git config --list
```

### 创建 GitHub 账户

1. 访问 [github.com](https://github.com)
2. 注册免费账户
3. 设置 SSH 密钥（可选但推荐）

## 步骤 6：安装 TA-Lib（可选）

TA-Lib 提供技术分析指标。

### macOS

```bash
brew install ta-lib
pip install TA-Lib
```

### Windows

从[这里](https://www.lfd.uci.edu/~gohlke/pythonlibs/#ta-lib)下载预构建的 wheel

```cmd
pip install TA_Lib‑0.4.XX‑cpXX‑cpXX‑win_amd64.whl
```

### Linux

```bash
# 安装依赖项
sudo apt-get install build-essential wget

# 下载并安装 TA-Lib
wget http://prdownloads.sourceforge.net/ta-lib/ta-lib-0.4.0-src.tar.gz
tar -xzf ta-lib-0.4.0-src.tar.gz
cd ta-lib/
./configure --prefix=/usr
make
sudo make install

# 安装 Python 包装器
pip install TA-Lib
```

## 步骤 7：设置交易账户

### 模拟交易（推荐用于学习）

**Alpaca 模拟交易：**
1. 访问 [alpaca.markets](https://alpaca.markets)
2. 注册免费账户
3. 从仪表板获取 API 密钥
4. 安全存储密钥（见下文）

**TradingView 模拟交易：**
1. 在 [tradingview.com](https://tradingview.com) 创建账户
2. 使用内置的模拟交易
3. 手动交易无需 API

### 实盘交易（测试后）

只有在以下情况后才转向实盘交易：
- 3 个月以上成功的模拟交易
- 持续盈利
- 适当的风险管理
- 理解所有风险

## 步骤 8：保护您的 API 密钥

**切勿将 API 密钥提交到 Git！**

### 创建 .env 文件

```bash
# 在项目根目录创建 .env 文件
touch .env

# 添加到 .gitignore
echo ".env" >> .gitignore
```

### 在 .env 中存储密钥

```
# .env 文件
ALPACA_API_KEY=your_api_key_here
ALPACA_SECRET_KEY=your_secret_key_here
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

### 在 Python 中加载密钥

```python
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 访问密钥
api_key = os.getenv('ALPACA_API_KEY')
secret_key = os.getenv('ALPACA_SECRET_KEY')
```

安装 python-dotenv：
```bash
pip install python-dotenv
```

## 步骤 9：测试您的设置

创建一个测试脚本来验证一切正常：

```python
# test_setup.py
import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt

print("测试设置...")

# 测试数据下载
print("\n1. 测试 yfinance...")
data = yf.download('AAPL', start='2024-01-01', end='2024-02-01', progress=False)
print(f"已下载 {len(data)} 行 AAPL 数据")

# 测试 pandas
print("\n2. 测试 pandas...")
print(f"Pandas 版本: {pd.__version__}")
print(f"数据形状: {data.shape}")

# 测试 numpy
print("\n3. 测试 numpy...")
returns = data['Close'].pct_change()
print(f"平均收益率: {returns.mean():.4f}")
print(f"标准差: {returns.std():.4f}")

# 测试 matplotlib
print("\n4. 测试 matplotlib...")
plt.figure(figsize=(10, 6))
data['Close'].plot()
plt.title('AAPL 收盘价')
plt.savefig('test_plot.png')
print("图表已保存为 test_plot.png")

print("\n✓ 所有测试通过！您的环境已准备就绪。")
```

运行测试：
```bash
python test_setup.py
```

## 步骤 10：组织您的项目

创建标准的项目结构：

```
trading-project/
├── data/               # 下载的数据
├── notebooks/          # Jupyter notebooks
├── src/               # 源代码
│   ├── strategies/    # 交易策略
│   ├── backtesting/   # 回测代码
│   └── utils/         # 实用函数
├── tests/             # 单元测试
├── results/           # 回测结果
├── .env              # API 密钥（不在 git 中）
├── .gitignore        # Git 忽略文件
├── requirements.txt   # 依赖项
└── README.md         # 项目文档
```

创建此结构：
```bash
mkdir -p trading-project/{data,notebooks,src/{strategies,backtesting,utils},tests,results}
cd trading-project
touch .env .gitignore requirements.txt README.md
```

## 常见问题和解决方案

### 问题："pip: command not found"

**解决方案：**
```bash
# 尝试使用 pip3
pip3 install package_name

# 或使用 python -m pip
python3 -m pip install package_name
```

### 问题："Permission denied"

**解决方案：**
```bash
# 使用 --user 标志
pip install --user package_name

# 或使用虚拟环境（推荐）
```

### 问题：TA-Lib 安装失败

**解决方案：**
- 使用预构建的 wheels（Windows）
- 首先安装构建工具（Linux）
- 使用 Homebrew（macOS）
- 或跳过 TA-Lib 并使用 pandas-ta：
```bash
pip install pandas-ta
```

### 问题：找不到 Jupyter kernel

**解决方案：**
```bash
# 安装 ipykernel
pip install ipykernel

# 添加 kernel
python -m ipykernel install --user --name=trading-env
```

## 下一步

1. ✓ 环境设置完成
2. → 完成 Python 基础附录（如需要）
3. → 开始本书的模块 1
4. → 设置模拟交易账户
5. → 开始构建您的第一个策略

## 维护

### 定期更新软件包

```bash
# 更新所有软件包
pip list --outdated
pip install --upgrade package_name

# 或更新所有内容
pip install --upgrade pip
pip list --outdated | cut -d ' ' -f1 | xargs -n1 pip install -U
```

### 备份您的环境

```bash
# 导出当前环境
pip freeze > requirements.txt

# 提交到 git
git add requirements.txt
git commit -m "Update dependencies"
```

---

**恭喜！** 您的交易开发环境现已准备就绪。您可以开始学习和构建交易策略了。

**需要帮助？** 查看 FAQ 或在 GitHub 上提出问题。
