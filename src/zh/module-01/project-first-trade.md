# 模块一项目：你的第一笔模拟交易

**项目目标**：使用 stock-agent-system 执行你的第一笔模拟交易

**预计时间**：1-2 小时
**难度**：初级
**前置条件**：完成模块一的所有课程

## 🎯 项目目标

完成本项目后，你将能够：
- 设置和配置 stock-agent-system 进行模拟交易
- 研究并选择一只股票进行交易
- 制定包含入场、出场和止损的交易计划
- 使用系统执行交易
- 监控并平仓
- 分析交易结果

## 📋 项目步骤

### 步骤 1：设置模拟交易环境

```bash
cd /Users/houwenjun/Desktop/Projects/stock-agent-system
source .venv/bin/activate

# 验证安装
stock-agent --help
stock-agent strategies
```

### 步骤 2：研究并选择一只股票

从默认观察列表中选择一只股票：
- AAPL (Apple)
- MSFT (Microsoft)
- GOOGL (Google)
- AMZN (Amazon)
- TSLA (Tesla)

**研究问题**（记录你的答案）：
1. 这家公司做什么？
2. 当前价格是多少？
3. 平均日交易量是多少？
4. 它处于上升趋势还是下降趋势？
5. 你为什么想交易它？

### 步骤 3：制定交易计划

创建一个交易计划：

```
股票：___________
入场价格：$___________
持仓规模：___________ 股
止损价：$___________ (入场价下方 5%)
止盈价：$___________ (入场价上方 10%)
风险：$___________ (入场价 - 止损价) × 股数
收益：$___________ (止盈价 - 入场价) × 股数
风险收益比：___________
```

**示例**：
```
股票：AAPL
入场价格：$150.00
持仓规模：10 股
止损价：$142.50 (下方 5%)
止盈价：$165.00 (上方 10%)
风险：$75 ($7.50 × 10 股)
收益：$150 ($15.00 × 10 股)
风险收益比：1:2 (很好！)
```

### 步骤 4：执行交易

创建一个脚本来执行你的交易：

```python
# 保存为：my_first_trade.py
import asyncio
from decimal import Decimal
from datetime import datetime
from stock_agent.broker.simulated_broker import SimulatedBroker
from stock_agent.broker.models import Order, OrderSide, OrderType

async def my_first_trade():
    # 初始化经纪商，初始资金 $10,000
    broker = SimulatedBroker(initial_cash=Decimal("10000"))

    # 设置当前价格（使用研究中的真实价格）
    symbol = "AAPL"
    entry_price = Decimal("150.00")  # 改为真实价格
    broker.set_price(symbol, entry_price)

    print(f"\n{'='*60}")
    print(f"我的第一笔模拟交易 - {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'='*60}\n")

    # 检查账户
    account = await broker.get_account()
    print(f"起始现金：${account.cash:,.2f}")
    print(f"购买力：${account.buying_power:,.2f}\n")

    # 下买单
    print(f"为 {symbol} 下买单...")
    buy_order = Order(
        symbol=symbol,
        side=OrderSide.BUY,
        qty=Decimal("10"),  # 改为你的持仓规模
        order_type=OrderType.MARKET,
    )

    filled_order = await broker.submit_order(buy_order)
    print(f"✓ 订单已成交！")
    print(f"  买入：{filled_order.qty} 股")
    print(f"  价格：${filled_order.filled_avg_price}")
    print(f"  总计：${float(filled_order.qty) * float(filled_order.filled_avg_price):,.2f}\n")

    # 检查持仓
    positions = await broker.get_positions()
    if positions:
        pos = positions[0]
        print(f"当前持仓：")
        print(f"  股票代码：{pos.symbol}")
        print(f"  数量：{pos.qty}")
        print(f"  平均价格：${pos.avg_entry_price}")
        print(f"  当前价格：${pos.current_price}")
        print(f"  市值：${pos.market_value:,.2f}")
        print(f"  未实现盈亏：${pos.unrealized_pl:,.2f}\n")

    # 交易后检查账户
    account = await broker.get_account()
    print(f"交易后：")
    print(f"  现金：${account.cash:,.2f}")
    print(f"  投资组合价值：${account.portfolio_value:,.2f}")

    print(f"\n{'='*60}")
    print("交易执行成功！")
    print(f"{'='*60}\n")

    # 计算止损和止盈
    stop_loss = float(entry_price) * 0.95  # 下方 5%
    take_profit = float(entry_price) * 1.10  # 上方 10%

    print(f"交易计划：")
    print(f"  入场：${entry_price}")
    print(f"  止损：${stop_loss:.2f}")
    print(f"  止盈：${take_profit:.2f}")
    print(f"  风险：${(float(entry_price) - stop_loss) * 10:.2f}")
    print(f"  收益：${(take_profit - float(entry_price)) * 10:.2f}")

if __name__ == "__main__":
    asyncio.run(my_first_trade())
```

运行它：
```bash
python my_first_trade.py
```

### 步骤 5：监控持仓

在真实场景中，你需要：
1. 定期检查价格
2. 如有需要调整止损（移动止损）
3. 观察出场信号
4. 当触及止损或止盈时平仓

对于本项目，模拟价格变化：

```python
# 在交易后添加到你的脚本中
print("\n--- 模拟价格波动 ---\n")

# 场景 1：价格上涨 5%
new_price = float(entry_price) * 1.05
broker.set_price(symbol, Decimal(str(new_price)))

positions = await broker.get_positions()
if positions:
    pos = positions[0]
    print(f"价格变动至：${new_price:.2f}")
    print(f"未实现盈亏：${pos.unrealized_pl:,.2f}")
    print(f"回报率：{(pos.unrealized_pl / (float(entry_price) * 10)) * 100:.2f}%")
```

### 步骤 6：平仓

```python
# 添加到你的脚本中
print("\n--- 平仓 ---\n")

sell_order = Order(
    symbol=symbol,
    side=OrderSide.SELL,
    qty=Decimal("10"),
    order_type=OrderType.MARKET,
)

filled_sell = await broker.submit_order(sell_order)
print(f"✓ 持仓已平仓！")
print(f"  卖出：{filled_sell.qty} 股")
print(f"  价格：${filled_sell.filled_avg_price}")
print(f"  总计：${float(filled_sell.qty) * float(filled_sell.filled_avg_price):,.2f}")

# 最终账户状态
account = await broker.get_account()
profit = float(account.cash) - 10000
print(f"\n最终结果：")
print(f"  起始现金：$10,000.00")
print(f"  结束现金：${account.cash:,.2f}")
print(f"  盈亏：${profit:,.2f}")
print(f"  回报率：{(profit / 10000) * 100:.2f}%")
```

### 步骤 7：记录你的交易

创建：`exercises/module-01/my-first-trade-report.md`

```markdown
# 我的第一笔模拟交易报告

## 交易详情
- 日期：YYYY-MM-DD
- 股票：SYMBOL
- 入场价格：$XXX.XX
- 出场价格：$XXX.XX
- 持仓规模：XX 股
- 持续时间：X 小时/天

## 交易计划
- 入场原因：我为什么入场
- 止损：$XXX.XX
- 止盈：$XXX.XX
- 风险收益比：X:X

## 结果
- 盈亏：$XXX.XX
- 回报率：XX.XX%
- 做得好的地方：
- 可以改进的地方：

## 经验教训
1. 教训 1
2. 教训 2
3. 教训 3
```

## ✅ 项目检查清单

- [ ] 设置模拟交易环境
- [ ] 研究并选择了一只股票
- [ ] 创建了交易计划
- [ ] 执行了买单
- [ ] 监控了持仓
- [ ] 平仓
- [ ] 记录了交易
- [ ] 分析了结果和经验教训

## 🎓 评估标准

当你能对以下所有问题回答"是"时，你的项目就完成了：

1. 你是否执行了完整的交易（买入和卖出）？
2. 你在入场前是否有计划？
3. 你是否计算了风险和收益？
4. 你是否记录了交易？
5. 你是否从这次经历中学到了东西？

## 🚀 下一步

完成本项目后：

1. **尝试不同的场景**：如果价格下跌会怎样？如果你使用限价单会怎样？
2. **实验持仓规模**：交易 5 股 vs 20 股
3. **测试止损**：模拟触及你的止损
4. **进入模块二**：学习技术分析以改进你的入场点

## 💡 提示

- **从小开始**：10 股对于学习来说很好
- **遵循你的计划**：不要在交易中途改变止损
- **记录一切**：通过写下来你会学到更多
- **不要担心盈利**：专注于过程，而不是结果
- **先模拟交易**：在持续盈利之前，永远不要使用真钱

---

**完成了吗？** ✓ 标记为完成：`python track_progress.py exercise module-01 project`

**恭喜你完成了第一笔交易！** 🎉

现在你已经准备好进入[模块二：技术分析](../module-02/lesson-01-candlesticks.md)
