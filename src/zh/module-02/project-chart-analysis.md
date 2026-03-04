# 实践项目：图表分析

**模块**：2 - 技术分析基础
**预计时间**：2-3小时
**难度**：初级到中级

## 🎯 项目目标

应用所有模块2概念来分析真实股票：
- 识别K线形态
- 绘制支撑和阻力水平
- 确定趋势方向和强度
- 分析移动平均线
- 评估成交量确认
- 创建完整的交易计划

## 📋 项目概述

你将对3只股票进行全面的技术分析，并为每只股票创建详细的交易计划。

### 交付成果

1. 每只股票的**图表分析报告**
2. 包含入场、出场和风险管理的**交易计划**
3. 自动化分析的**Python分析脚本**
4. 你的发现的**演示**

## 🔍 第1部分：股票选择

### 选择3只股票

从不同类别选择股票：

1. **大型科技股**（例如AAPL、MSFT、GOOGL、NVDA）
2. **金融股**（例如JPM、BAC、GS、V）
3. **消费股**（例如AMZN、WMT、NKE、SBUX）

### 为什么选择不同行业？

- 不同的波动性特征
- 不同的成交量模式
- 练习将分析适应各种股票

## 📊 第2部分：技术分析清单

对于每只股票，完成此分析：

### 1. K线分析

```markdown
## K线形态

### 最近的形态（最近20天）
- [ ] 识别任何单K线形态（十字星、锤子、射击之星等）
- [ ] 识别任何多K线形态（吞没、早晨/晚上之星等）
- [ ] 注意背景（形态之前的趋势）
- [ ] 评估形态可靠性

### 示例格式：
**发现的形态**：看涨吞没
**日期**：2026年3月1日
**背景**：5天下降趋势后
**可靠性**：高（被成交量确认）
**结果**：第二天价格上涨3%
```

### 2. 支撑和阻力

```markdown
## 支撑和阻力水平

### 阻力水平
1. **$XXX.XX** - 原因：之前的高点（日期），测试3次
2. **$XXX.XX** - 原因：整数关口 + 200日MA
3. **$XXX.XX** - 原因：最近的摆动高点

### 支撑水平
1. **$XXX.XX** - 原因：之前的低点（日期），强劲反弹
2. **$XXX.XX** - 原因：50日MA + 趋势线
3. **$XXX.XX** - 原因：成交量分布峰值

### 当前价格位置
- 价格：$XXX.XX
- 最近支撑：$XXX.XX（低X.X%）
- 最近阻力：$XXX.XX（高X.X%）
```

### 3. 趋势分析

```markdown
## 趋势识别

### 主要趋势（日线图）
- **方向**：上升趋势 / 下降趋势 / 横盘
- **强度**：强 / 中等 / 弱
- **证据**：
  - 更高的高点和更高的低点（或相反）
  - 趋势线：[绘制并描述]
  - MA对齐：价格 vs 20/50/200日MA

### 次要趋势（周线图）
- **方向**：[在周线时间框架上进行相同分析]
- **一致性**：日线趋势是否与周线一致？

### 趋势质量
- [ ] 干净的趋势，假信号少
- [ ] 一致的更高高点/低点
- [ ] 成交量确认趋势方向
- [ ] MA正确对齐
```

### 4. 移动平均线分析

```markdown
## 移动平均线

### 当前MA值
- **20日SMA**：$XXX.XX
- **50日SMA**：$XXX.XX
- **200日SMA**：$XXX.XX
- **当前价格**：$XXX.XX

### MA对齐
- 价格位置：在所有MA上方/下方
- MA顺序：[例如，价格 > 20 > 50 > 200 = 强上升趋势]
- 斜率：全部上升 / 全部下降 / 混合

### 最近的交叉
- **黄金交叉**：[如果在过去6个月发生则注明日期]
- **死亡交叉**：[如果在过去6个月发生则注明日期]
- **快速/慢速交叉**：[任何最近的20/50交叉]

### MA作为支撑/阻力
- 价格尊重哪个MA？[例如，从50日反弹]
- 最近的测试：[价格触及MA的日期]
```

### 5. 成交量分析

```markdown
## 成交量分析

### 平均成交量
- **20日平均**：XXX,XXX股
- **今日成交量**：XXX,XXX股
- **比率**：X.Xx（今日 / 平均）

### 成交量模式
- [ ] 上涨日成交量更高（看涨）
- [ ] 下跌日成交量更高（看跌）
- [ ] 成交量下降（背离警告）
- [ ] 成交量飙升（高潮或突破）

### 最近的成交量事件
- **日期**：[最近的高成交量日]
- **成交量**：XXX,XXX（X.Xx倍平均）
- **价格走势**：[价格发生了什么]
- **解释**：[突破 / 高潮 / 等]

### 成交量确认
- 成交量是否确认当前趋势？是 / 否
- 是否有任何背离？[如果存在则描述]
```

## 💻 第3部分：Python分析脚本

创建一个自动化分析的脚本：

```python
import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

class TechnicalAnalyzer:
    def __init__(self, ticker, period="1y"):
        self.ticker = ticker
        self.df = yf.Ticker(ticker).history(period=period)
        self.prepare_data()

    def prepare_data(self):
        """计算所有技术指标"""
        # 移动平均线
        self.df['SMA_20'] = self.df['Close'].rolling(20).mean()
        self.df['SMA_50'] = self.df['Close'].rolling(50).mean()
        self.df['SMA_200'] = self.df['Close'].rolling(200).mean()

        # 成交量
        self.df['Avg_Volume'] = self.df['Volume'].rolling(20).mean()
        self.df['Volume_Ratio'] = self.df['Volume'] / self.df['Avg_Volume']

    def identify_trend(self):
        """识别当前趋势"""
        price = self.df['Close'].iloc[-1]
        sma20 = self.df['SMA_20'].iloc[-1]
        sma50 = self.df['SMA_50'].iloc[-1]
        sma200 = self.df['SMA_200'].iloc[-1]

        if price > sma20 > sma50 > sma200:
            return "STRONG UPTREND"
        elif price > sma20 and price > sma50 and price > sma200:
            return "UPTREND"
        elif price < sma20 < sma50 < sma200:
            return "STRONG DOWNTREND"
        elif price < sma20 and price < sma50 and price < sma200:
            return "DOWNTREND"
        else:
            return "SIDEWAYS"

    def find_support_resistance(self, lookback=60):
        """查找关键支撑和阻力水平"""
        recent_data = self.df.tail(lookback)

        # 查找局部最大值（阻力）
        resistance_levels = []
        for i in range(1, len(recent_data) - 1):
            if (recent_data['High'].iloc[i] > recent_data['High'].iloc[i-1] and
                recent_data['High'].iloc[i] > recent_data['High'].iloc[i+1]):
                resistance_levels.append(recent_data['High'].iloc[i])

        # 查找局部最小值（支撑）
        support_levels = []
        for i in range(1, len(recent_data) - 1):
            if (recent_data['Low'].iloc[i] < recent_data['Low'].iloc[i-1] and
                recent_data['Low'].iloc[i] < recent_data['Low'].iloc[i+1]):
                support_levels.append(recent_data['Low'].iloc[i])

        # 聚类附近的水平
        def cluster(levels, tolerance=0.02):
            if not levels:
                return []
            sorted_levels = sorted(levels)
            clusters = [sorted_levels[0]]
            for level in sorted_levels[1:]:
                if level > clusters[-1] * (1 + tolerance):
                    clusters.append(level)
                else:
                    clusters[-1] = (clusters[-1] + level) / 2
            return clusters

        return {
            'support': cluster(support_levels)[-3:],  # 前3个
            'resistance': cluster(resistance_levels)[-3:]  # 前3个
        }

    def analyze_volume(self):
        """分析最近的成交量模式"""
        current_volume = self.df['Volume'].iloc[-1]
        avg_volume = self.df['Avg_Volume'].iloc[-1]
        ratio = current_volume / avg_volume

        if ratio > 2.0:
            classification = "EXTREMELY HIGH"
        elif ratio > 1.5:
            classification = "HIGH"
        elif ratio > 0.8:
            classification = "NORMAL"
        else:
            classification = "LOW"

        return {
            'current': current_volume,
            'average': avg_volume,
            'ratio': ratio,
            'classification': classification
        }

    def generate_report(self):
        """生成完整的分析报告"""
        current_price = self.df['Close'].iloc[-1]
        trend = self.identify_trend()
        sr_levels = self.find_support_resistance()
        volume_analysis = self.analyze_volume()

        report = f"""
{'='*60}
技术分析报告：{self.ticker}
{'='*60}
日期：{datetime.now().strftime('%Y-%m-%d')}

当前价格：${current_price:.2f}

趋势分析：
- 趋势：{trend}
- 20日SMA：${self.df['SMA_20'].iloc[-1]:.2f}
- 50日SMA：${self.df['SMA_50'].iloc[-1]:.2f}
- 200日SMA：${self.df['SMA_200'].iloc[-1]:.2f}

支撑水平：
"""
        for i, level in enumerate(sr_levels['support'], 1):
            distance = ((current_price - level) / level) * 100
            report += f"  {i}. ${level:.2f}（距当前{distance:+.2f}%）\n"

        report += "\n阻力水平：\n"
        for i, level in enumerate(sr_levels['resistance'], 1):
            distance = ((level - current_price) / current_price) * 100
            report += f"  {i}. ${level:.2f}（距当前{distance:+.2f}%）\n"

        report += f"""
成交量分析：
- 当前成交量：{volume_analysis['current']:,.0f}
- 平均成交量：{volume_analysis['average']:,.0f}
- 比率：{volume_analysis['ratio']:.2f}x
- 分类：{volume_analysis['classification']}

{'='*60}
"""
        return report

    def plot_analysis(self):
        """创建综合图表"""
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(14, 10),
                                        gridspec_kw={'height_ratios': [3, 1]})

        # 价格和MA
        ax1.plot(self.df.index, self.df['Close'], label='价格', linewidth=2)
        ax1.plot(self.df.index, self.df['SMA_20'], label='20日SMA', alpha=0.7)
        ax1.plot(self.df.index, self.df['SMA_50'], label='50日SMA', alpha=0.7)
        ax1.plot(self.df.index, self.df['SMA_200'], label='200日SMA', alpha=0.7)

        # 支撑和阻力
        sr_levels = self.find_support_resistance()
        for level in sr_levels['support']:
            ax1.axhline(y=level, color='green', linestyle='--', alpha=0.5)
        for level in sr_levels['resistance']:
            ax1.axhline(y=level, color='red', linestyle='--', alpha=0.5)

        ax1.set_title(f'{self.ticker} - 技术分析')
        ax1.set_ylabel('价格（$）')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # 成交量
        colors = ['green' if self.df['Close'].iloc[i] > self.df['Open'].iloc[i]
                  else 'red' for i in range(len(self.df))]
        ax2.bar(self.df.index, self.df['Volume'], color=colors, alpha=0.5)
        ax2.plot(self.df.index, self.df['Avg_Volume'], color='blue',
                 label='20日平均', linewidth=2)
        ax2.set_ylabel('成交量')
        ax2.legend()
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        plt.savefig(f'{self.ticker}_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()

# 使用方法
if __name__ == "__main__":
    # 分析你的3只股票
    tickers = ["AAPL", "JPM", "AMZN"]  # 替换为你的选择

    for ticker in tickers:
        print(f"\n正在分析 {ticker}...")
        analyzer = TechnicalAnalyzer(ticker)
        print(analyzer.generate_report())
        analyzer.plot_analysis()
```

## 📝 第4部分：交易计划

为每只股票创建详细的交易计划：

```markdown
# 交易计划：[股票代码]

## 分析摘要
- **趋势**：[上升趋势/下降趋势/横盘]
- **强度**：[强/中等/弱]
- **关键水平**：支撑在$XXX，阻力在$XXX
- **成交量**：[确认/背离]

## 交易设置

### 入场策略
- **类型**：做多 / 做空
- **入场价格**：$XXX.XX
- **入场触发**：[例如，突破$XXX并有成交量]
- **确认**：[例如，收盘在阻力上方，成交量 > 1.5倍平均]

### 风险管理
- **止损**：$XXX.XX
- **止损原因**：[例如，在支撑水平下方]
- **每股风险**：$X.XX
- **仓位大小**：XXX股（基于1-2%账户风险）

### 利润目标
- **目标1**：$XXX.XX（X%收益）- 获利50%
- **目标2**：$XXX.XX（X%收益）- 获利30%
- **目标3**：$XXX.XX（X%收益）- 让20%运行并使用跟踪止损

### 风险回报比
- **风险**：每股$X.XX
- **回报**：每股$X.XX（到目标1）
- **比率**：1:X.X

## 交易管理
- [ ] 入场后立即设置止损
- [ ] 达到目标1后将止损移至盈亏平衡
- [ ] 达到目标2后在最近低点下方跟踪止损
- [ ] 每日审查形态变化

## 替代场景

### 如果价格在入场前下跌
- 等待支撑测试
- 寻找看涨反转形态
- 如果突破支撑则重新评估

### 如果价格跳空高开
- 不要追涨
- 等待回调到入场水平
- 如果必须入场则考虑较小仓位

## 备注
[任何额外的观察或关注点]
```

## 🎯 第5部分：演示

创建摘要演示（幻灯片或文档）：

### 幻灯片1：概述
- 分析的3只股票
- 日期范围
- 关键发现摘要

### 幻灯片2-4：个股分析
对于每只股票：
- 带注释的图表
- 识别的关键形态
- 标记的支撑/阻力水平
- 趋势评估
- 成交量分析

### 幻灯片5-7：交易计划
对于每只股票：
- 入场/出场策略
- 风险管理
- 预期结果

### 幻灯片8：经验教训
- 分析中哪些做得好
- 面临的挑战
- 提高的技能

## ✅ 提交清单

- [ ] 分析了来自不同行业的3只股票
- [ ] 完成每只股票的技术分析（K线、支撑/阻力、趋势、MA、成交量）
- [ ] Python脚本运行无错误
- [ ] 生成并保存图表
- [ ] 完成所有部分的交易计划
- [ ] 计算风险回报比
- [ ] 创建演示
- [ ] 所有文件在项目文件夹中组织好

## 📁 项目结构

```
module-02-project/
├── analysis/
│   ├── AAPL_analysis.md
│   ├── JPM_analysis.md
│   └── AMZN_analysis.md
├── trading_plans/
│   ├── AAPL_plan.md
│   ├── JPM_plan.md
│   └── AMZN_plan.md
├── charts/
│   ├── AAPL_analysis.png
│   ├── JPM_analysis.png
│   └── AMZN_analysis.png
├── scripts/
│   └── technical_analyzer.py
├── presentation/
│   └── module_02_project.pdf
└── README.md
```

## 🎓 评估标准

你的项目将根据以下标准评估：

1. **完整性**（30%）：所有部分都填写完整
2. **准确性**（25%）：正确识别形态和水平
3. **分析质量**（20%）：洞察的深度
4. **代码质量**（15%）：脚本运行良好且组织有序
5. **交易计划**（10%）：现实且深思熟虑

## 🚀 下一步

完成此项目后：

1. **跟踪你的预测**：监控股票2-4周
2. **比较结果**：价格是否如你预测的那样移动？
3. **学习**：什么有效？什么无效？
4. **迭代**：完善你的分析过程

## 💡 成功提示

- **花时间**：质量重于速度
- **保持客观**：不要强行看到不存在的形态
- **使用多个时间框架**：检查周线和日线图
- **记录一切**：写下你的推理
- **保持组织**：保持文件结构良好
- **提出问题**：如果遇到困难，复习课程或研究

## 📚 资源

- 模块2课程（根据需要复习）
- [TradingView](https://www.tradingview.com) 用于图表
- [Yahoo Finance](https://finance.yahoo.com) 用于数据
- [Investopedia](https://www.investopedia.com) 用于概念

---

**准备开始了吗？** 创建你的项目文件夹并从股票选择开始！

**有问题吗？** 复习相关课程或查看资源中的FAQ。

**完成项目了吗？** ✓ 标记模块2完成并继续[模块3：技术指标](../module-03/lesson-01-momentum.md)
