# 第4.6课：策略设计原则 - 构建稳健系统

**模块**：4 - 交易策略
**预计时间**：55分钟
**难度**：高级

## 🎯 学习目标

- 学习稳健策略设计的原则
- 避免常见的策略开发陷阱
- 实现正确的测试方法
- 构建在实盘交易中有效的策略
- 理解完整的策略开发生命周期

## 📖 策略开发生命周期

```
1. 想法生成 → 2. 研究 → 3. 设计 → 4. 回测 →
5. 验证 → 6. 模拟交易 → 7. 实盘交易 → 8. 监控 → 9. 改进
```

## 🎯 核心设计原则

### 1. 简单性

**原则**：简单的策略比复杂的策略更稳健

```python
# 好：简单明了
def simple_ma_crossover(df):
    if df['MA_50'].iloc[-1] > df['MA_200'].iloc[-1]:
        return "BUY"
    return "SELL"

# 坏：过度复杂
def complex_strategy(df):
    if (df['MA_50'].iloc[-1] > df['MA_200'].iloc[-1] and
        df['RSI'].iloc[-1] > 50 and df['RSI'].iloc[-1] < 70 and
        df['MACD'].iloc[-1] > df['MACD_Signal'].iloc[-1] and
        df['Volume'].iloc[-1] > df['Volume'].rolling(20).mean().iloc[-1] * 1.5 and
        df['ADX'].iloc[-1] > 25 and
        df['Stoch_K'].iloc[-1] > df['Stoch_D'].iloc[-1]):
        return "BUY"
    return "SELL"
```

**原因**：更多参数 = 更多过拟合，更难调试，更不稳健

### 2. 经济学原理

**原则**：策略必须有合理的运作逻辑

**好的原理**：
- "买入超卖股票因为均值回归"
- "跟随趋势因为动量持续"
- "买入突破因为新信息驱动趋势"

**坏的原理**：
- "当RSI为37.3时买入因为回测这么说"
- "这个模式在2020年有效"

### 3. 稳健性

**原则**：策略应该在不同情况下都有效：
- 时间周期
- 市场条件
- 交易工具
- 参数值

```python
def test_robustness(strategy, data, param_ranges):
    """
    在参数范围内测试策略
    """
    results = []

    for params in param_ranges:
        result = backtest_strategy(data, strategy, params)
        results.append({
            'params': params,
            'sharpe': result['sharpe'],
            'return': result['return']
        })

    # 检查一致性
    sharpe_values = [r['sharpe'] for r in results]
    sharpe_std = np.std(sharpe_values)

    if sharpe_std < 0.3:  # 低变化
        print("✓ 策略在参数间稳健")
    else:
        print("✗ 策略对参数敏感")

    return results
```

### 4. 风险管理优先

**原则**：在定义回报之前先定义风险

```python
class StrategyWithRisk:
    def __init__(self, max_risk_per_trade=0.02, max_portfolio_risk=0.06):
        self.max_risk_per_trade = max_risk_per_trade
        self.max_portfolio_risk = max_portfolio_risk

    def can_take_trade(self, account_value, current_positions):
        """
        检查是否可以进行另一笔交易
        """
        # 计算当前组合风险
        current_risk = sum(pos['risk'] for pos in current_positions)

        # 检查添加交易是否超过限制
        if current_risk >= account_value * self.max_portfolio_risk:
            return False

        return True

    def calculate_position_size(self, account_value, entry, stop):
        """
        基于风险计算仓位大小
        """
        risk_amount = account_value * self.max_risk_per_trade
        risk_per_share = abs(entry - stop)
        shares = int(risk_amount / risk_per_share)

        return shares
```

## 🔍 避免过拟合

### 1. 样本外测试

```python
def walk_forward_test(data, strategy, train_period=252, test_period=63):
    """
    前向优化
    """
    results = []

    for i in range(train_period, len(data) - test_period, test_period):
        # 在样本内数据上训练
        train_data = data.iloc[i-train_period:i]
        optimal_params = optimize_strategy(train_data, strategy)

        # 在样本外数据上测试
        test_data = data.iloc[i:i+test_period]
        test_result = backtest_strategy(test_data, strategy, optimal_params)

        results.append(test_result)

    return results
```

### 2. 参数稳定性

```python
def test_parameter_stability(data, strategy, param_name, param_range):
    """
    测试策略对参数变化的敏感度
    """
    results = []

    for param_value in param_range:
        params = {param_name: param_value}
        result = backtest_strategy(data, strategy, params)
        results.append((param_value, result['sharpe']))

    # 绘制结果
    import matplotlib.pyplot as plt
    plt.plot([r[0] for r in results], [r[1] for r in results])
    plt.xlabel(param_name)
    plt.ylabel('夏普比率')
    plt.title(f'参数敏感性: {param_name}')
    plt.show()

    return results
```

### 3. 多市场测试

```python
def test_across_markets(strategy, tickers):
    """
    在不同工具上测试策略
    """
    results = {}

    for ticker in tickers:
        df = yf.Ticker(ticker).history(period="5y")
        result = backtest_strategy(df, strategy)
        results[ticker] = result

    # 检查一致性
    sharpe_values = [r['sharpe'] for r in results.values()]
    avg_sharpe = np.mean(sharpe_values)

    print(f"跨市场平均夏普比率: {avg_sharpe:.2f}")

    return results
```

## 📊 策略评估框架

```python
class StrategyEvaluator:
    def __init__(self, strategy):
        self.strategy = strategy

    def evaluate(self, data):
        """
        全面的策略评估
        """
        results = backtest_strategy(data, self.strategy)

        metrics = {
            # 回报
            'total_return': results['total_return'],
            'cagr': results['cagr'],

            # 风险
            'volatility': results['volatility'],
            'max_drawdown': results['max_drawdown'],
            'sharpe_ratio': results['sharpe'],
            'sortino_ratio': results['sortino'],

            # 交易
            'win_rate': results['win_rate'],
            'profit_factor': results['profit_factor'],
            'avg_trade': results['avg_trade'],
            'num_trades': results['num_trades'],

            # 一致性
            'best_month': results['best_month'],
            'worst_month': results['worst_month'],
            'positive_months': results['positive_months_pct']
        }

        return metrics

    def grade_strategy(self, metrics):
        """
        给策略评分A-F
        """
        score = 0

        # 夏普比率（40分）
        if metrics['sharpe_ratio'] > 2.0:
            score += 40
        elif metrics['sharpe_ratio'] > 1.5:
            score += 30
        elif metrics['sharpe_ratio'] > 1.0:
            score += 20
        elif metrics['sharpe_ratio'] > 0.5:
            score += 10

        # 最大回撤（30分）
        if metrics['max_drawdown'] > -10:
            score += 30
        elif metrics['max_drawdown'] > -20:
            score += 20
        elif metrics['max_drawdown'] > -30:
            score += 10

        # 胜率（15分）
        if metrics['win_rate'] > 0.6:
            score += 15
        elif metrics['win_rate'] > 0.5:
            score += 10
        elif metrics['win_rate'] > 0.4:
            score += 5

        # 一致性（15分）
        if metrics['positive_months'] > 0.7:
            score += 15
        elif metrics['positive_months'] > 0.6:
            score += 10
        elif metrics['positive_months'] > 0.5:
            score += 5

        # 分配等级
        if score >= 85:
            return 'A'
        elif score >= 70:
            return 'B'
        elif score >= 55:
            return 'C'
        elif score >= 40:
            return 'D'
        else:
            return 'F'
```

## 🎯 策略检查清单

在部署策略之前，验证：

```python
def strategy_checklist(strategy, data):
    """
    部署前检查清单
    """
    checks = {}

    # 1. 正期望值
    results = backtest_strategy(data, strategy)
    checks['positive_expectancy'] = results['avg_trade'] > 0

    # 2. 足够的交易
    checks['enough_trades'] = results['num_trades'] > 30

    # 3. 可接受的回撤
    checks['acceptable_drawdown'] = results['max_drawdown'] > -30

    # 4. 正夏普比率
    checks['positive_sharpe'] = results['sharpe'] > 0.5

    # 5. 样本外有效
    oos_results = walk_forward_test(data, strategy)
    checks['oos_positive'] = np.mean([r['return'] for r in oos_results]) > 0

    # 6. 参数稳定性
    param_test = test_parameter_stability(data, strategy, 'period', range(10, 50, 5))
    sharpe_std = np.std([r[1] for r in param_test])
    checks['parameter_stable'] = sharpe_std < 0.5

    # 打印结果
    print("\n策略检查清单：")
    print("-" * 40)
    for check, passed in checks.items():
        status = "✓" if passed else "✗"
        print(f"{status} {check}")

    all_passed = all(checks.values())
    print("-" * 40)
    print(f"总体: {'通过' if all_passed else '失败'}")

    return checks
```

## ⚠️ 常见错误

### 1. 数据窥探

**问题**：在同一数据上测试多个策略
**解决方案**：使用单独的验证集

### 2. 幸存者偏差

**问题**：只测试仍然存在的股票
**解决方案**：在回测中包含退市股票

### 3. 前视偏差

**问题**：使用未来信息
**解决方案**：仔细处理数据，移位指标

```python
# 坏：前视偏差
df['Signal'] = df['Close'] > df['Close'].rolling(20).mean()

# 好：正确移位
df['MA'] = df['Close'].rolling(20).mean()
df['Signal'] = df['Close'].shift(1) > df['MA'].shift(1)
```

### 4. 忽略成本

**问题**：不考虑佣金和滑点
**解决方案**：包含实际的交易成本

```python
def apply_transaction_costs(trades, commission=0.001, slippage=0.0005):
    """
    对回测应用实际成本
    """
    for trade in trades:
        # 佣金（0.1%）
        trade['pnl'] -= abs(trade['value']) * commission

        # 滑点（0.05%）
        trade['pnl'] -= abs(trade['value']) * slippage

    return trades
```

## 🎓 检查你的理解

1. 什么使策略稳健？
2. 为什么简单性重要？
3. 什么是过拟合？
4. 如何测试参数稳定性？
5. 什么是前视偏差？

## 💻 练习

```python
# 评估你的策略
evaluator = StrategyEvaluator(your_strategy)
metrics = evaluator.evaluate(data)
grade = evaluator.grade_strategy(metrics)

print(f"策略评分: {grade}")

# 运行检查清单
checks = strategy_checklist(your_strategy, data)
```

## 📝 练习4.6

创建：`exercises/module-04/exercise-4.6-design.md`

1. 从头设计一个策略
2. 记录经济学原理
3. 测试参数间的稳健性
4. 执行前向分析
5. 完成策略检查清单
6. 给你的策略评分

## 📚 资源

- [Pardo: Design, Testing, and Optimization of Trading Systems](https://www.amazon.com/Design-Testing-Optimization-Trading-Systems/dp/0471554464)
- [Aronson: Evidence-Based Technical Analysis](https://www.amazon.com/Evidence-Based-Technical-Analysis-Scientific-Statistical/dp/0470008741)

## ✅ 答案

1. **稳健策略**：在时间周期、市场、参数间有效；有经济学原理；简单设计
2. **简单性重要**：更少参数 = 更少过拟合，更容易理解和调试，更可能在实盘中有效
3. **过拟合**：将策略优化到历史数据以至于在新数据上无效；曲线拟合
4. **参数稳定性**：用一系列参数值测试策略；如果绩效一致，参数就是稳定的
5. **前视偏差**：使用交易时不可用的信息；导致不切实际的回测结果

---

**完成模块4？** ✓ 进入[实践项目：构建你的策略](project-build-strategy.md)
