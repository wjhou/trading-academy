# 课程 1.2：订单类型 - 如何买卖股票

**模块**：1 - 交易基础
**预计时间**：40 分钟
**难度**：初级
**前置课程**：课程 1.1

## 🎯 学习目标

- 理解不同的订单类型以及何时使用每种类型
- 学习市价单 (Market Order) 的工作原理及其风险
- 掌握限价单 (Limit Order) 以控制价格
- 理解止损单 (Stop-Loss Order) 用于风险管理
- 了解订单在 stock-agent-system 中的实现方式

## 📖 什么是订单？

**订单 (Order)** 是向你的经纪商发出的买入或卖出股票的指令。

每个订单都包含：
- **操作 (Action)**：买入 (BUY) 或卖出 (SELL)
- **数量 (Quantity)**：股票数量
- **代码 (Symbol)**：哪只股票（例如 AAPL）
- **订单类型 (Order Type)**：如何执行（市价、限价、止损等）
- **有效期 (Duration)**：订单的有效时长

## 1️⃣ 市价单 (Market Orders)

### 定义

**市价单 (Market Order)** 以最佳可用价格立即执行。

### 工作原理

```
你："以市价买入 100 股 AAPL"
经纪商：找到最佳卖价 → 立即执行
结果：你以当时可用的任何价格拥有了 100 股 AAPL
```

### 优点

✅ **保证成交**（在流动性好的市场中）
✅ **快速** - 毫秒级执行
✅ **简单** - 无需指定价格

### 缺点

❌ **无价格控制** - 可能支付超出预期的价格
❌ **滑点 (Slippage)** - 下单和执行之间价格可能变动
❌ **在波动市场中危险** - 可能得到糟糕的价格

### 示例

```python
# 在 stock-agent-system 中：src/stock_agent/broker/models.py
order = Order(
    symbol="AAPL",
    side=OrderSide.BUY,
    qty=Decimal("100"),
    order_type=OrderType.MARKET,  # 市价单
)
```

### 何时使用

- ✅ 高流动性股票（AAPL、MSFT 等）
- ✅ 需要快速进出场
- ✅ 在常规交易时段
- ❌ 低成交量股票
- ❌ 盘前或盘后交易
- ❌ 波动的市场条件

## 2️⃣ 限价单 (Limit Orders)

### 定义

**限价单 (Limit Order)** 只在你指定的价格或更好的价格执行。

### 工作原理

```
你："以 $150 或更低价格买入 100 股 AAPL"
经纪商：等待 AAPL 价格达到 $150 或更低
结果：要么以 $150 或更好的价格成交，要么完全不成交
```

### 优点

✅ **价格控制** - 你设定最高/最低价格
✅ **无滑点** - 获得你的价格或更好的价格
✅ **适合流动性差的股票** - 避免支付过高价格

### 缺点

❌ **可能不成交** - 如果价格未达到你的限价
❌ **部分成交** - 可能只获得部分股票
❌ **机会成本** - 如果太保守可能错过行情

### 示例

```python
# 买入限价单
order = Order(
    symbol="AAPL",
    side=OrderSide.BUY,
    qty=Decimal("100"),
    order_type=OrderType.LIMIT,
    limit_price=Decimal("150.00"),  # 不会支付超过 $150
)

# 卖出限价单
order = Order(
    symbol="AAPL",
    side=OrderSide.SELL,
    qty=Decimal("100"),
    order_type=OrderType.LIMIT,
    limit_price=Decimal("155.00"),  # 不会以低于 $155 的价格卖出
)
```

### 何时使用

- ✅ 想要特定的进场/出场价格
- ✅ 不急于执行
- ✅ 流动性差或波动大的股票
- ✅ 在交易时段外下单

## 3️⃣ 止损单 (Stop-Loss Orders)

### 定义

**止损单 (Stop-Loss Order)** 当股票达到触发价格时变成市价单。

### 工作原理

```
你以 $150 持有 AAPL
你："如果价格跌至 $145 就卖出"（止损价 $145）
价格跌至 $145 → 订单触发 → 以市价卖出
结果：将你的损失限制在每股约 $5
```

### 优点

✅ **自动风险管理** - 防止重大损失
✅ **无需监控** - 在你睡觉时也能工作
✅ **情绪纪律** - 强制你止损

### 缺点

❌ **可能在临时下跌时触发** - "止损猎杀"
❌ **以市价执行** - 可能得到比触发价更差的价格
❌ **跳空 (Gaps)** - 如果股票跳空下跌，会以更低的价格卖出

### 示例

```python
# 止损单（价格下跌时卖出）
order = Order(
    symbol="AAPL",
    side=OrderSide.SELL,
    qty=Decimal("100"),
    order_type=OrderType.STOP,
    stop_price=Decimal("145.00"),  # 在 $145 触发
)
```

### 何时使用

- ✅ 保护盈利交易的利润
- ✅ 限制亏损交易的损失
- ✅ 无法持续监控市场
- ❌ 波动性很大的股票（可能不必要地触发）

## 4️⃣ 止损限价单 (Stop-Limit Orders)

### 定义

结合止损和限价：在止损价触发，但只在限价或更好的价格成交。

### 工作原理

```
止损价：$145（触发）
限价：$144（最低可接受价格）

价格跌至 $145 → 触发
只有在能获得 $144 或更好的价格时才卖出
```

### 优点

✅ **触发后的价格保护**
✅ **比常规止损单更多控制**

### 缺点

❌ **可能不成交** - 如果价格变动太快
❌ **更复杂** - 需要设置两个价格

## 📊 订单有效期 (Order Duration)

### 时效选项 (Time-in-Force Options)

1. **当日订单 (Day Order)**：在交易日结束时过期
2. **GTC（Good-Till-Canceled，撤销前有效）**：保持活跃直到成交或取消（通常 90 天）
3. **IOC（Immediate-or-Cancel，立即成交或取消）**：立即成交或取消
4. **FOK（Fill-or-Kill，全部成交或取消）**：立即全部成交或取消

### 在 stock-agent-system 中

```python
order = Order(
    symbol="AAPL",
    side=OrderSide.BUY,
    qty=Decimal("100"),
    order_type=OrderType.LIMIT,
    limit_price=Decimal("150.00"),
    time_in_force=TimeInForce.GTC,  # 撤销前有效
)
```

## 🎯 选择正确的订单类型

### 决策树

```
需要立即执行吗？
├─ 是 → 市价单（如果是流动性好的股票）
└─ 否 → 想要特定价格吗？
    ├─ 是 → 限价单
    └─ 否 → 保护仓位吗？
        └─ 是 → 止损单
```

### 实际场景

**场景 1**：你想买入 AAPL，当前价格 $150
- **市价单**：现在以约 $150 买入
- **限价单 $149**：只有在跌至 $149 时才买入
- **止损单 $151**：如果突破 $151 就买入（动量）

**场景 2**：你以 $150 持有 AAPL，现在价格 $160
- **市价单**：现在以约 $160 卖出
- **限价单 $165**：只有在涨至 $165 时才卖出
- **止损单 $155**：如果跌至 $155 就卖出（保护利润）

## 💻 实践：探索 stock-agent-system 订单

让我们看看订单是如何实现的：

```bash
cd /Users/houwenjun/Desktop/Projects/stock-agent-system

# 读取订单模型
cat src/stock_agent/broker/models.py | grep -A 20 "class Order"

# 查看模拟经纪商如何处理订单
cat src/stock_agent/broker/simulated_broker.py | grep -A 30 "async def submit_order"
```

**观察**：
- Order 有哪些字段？
- 模拟经纪商如何执行市价单？
- 限价单会发生什么？

## 📝 练习 1.2：订单类型实践

创建文件：`exercises/module-01/exercise-1.2-orders.md`

对于每个场景，指定订单类型和参数：

1. 你想立即买入 TSLA，不在乎确切价格
2. 你想买入 MSFT，但只有在跌至 $380 时才买
3. 你以 $140 持有 GOOGL，想防止跌破 $135
4. 你想以 $160 或更好的价格卖出 AAPL，愿意等待
5. 你以 $500 持有 NVDA，想在突破 $550 时卖出（获利了结）

**格式**：
```
场景 1：
- 订单类型：市价单
- 操作：买入
- 原因：需要立即执行
```

## 🧪 实践练习：模拟交易

让我们下第一个模拟订单！

```bash
cd /Users/houwenjun/Desktop/Projects/stock-agent-system
source .venv/bin/activate

# 我们将创建一个简单的脚本来下单
python3 << 'EOF'
import asyncio
from decimal import Decimal
from stock_agent.broker.simulated_broker import SimulatedBroker
from stock_agent.broker.models import Order, OrderSide, OrderType

async def main():
    # 创建初始资金为 $10,000 的模拟经纪商
    broker = SimulatedBroker(initial_cash=Decimal("10000"))

    # 设置 AAPL 的当前价格
    broker.set_price("AAPL", Decimal("150.00"))

    # 下市价买入订单
    order = Order(
        symbol="AAPL",
        side=OrderSide.BUY,
        qty=Decimal("10"),
        order_type=OrderType.MARKET,
    )

    filled_order = await broker.submit_order(order)
    print(f"订单已成交：{filled_order}")
    print(f"以 ${filled_order.filled_avg_price} 买入 {filled_order.qty} 股")

    # 检查账户
    account = await broker.get_account()
    print(f"剩余现金：${account.cash}")
    print(f"购买力：${account.buying_power}")

asyncio.run(main())
EOF
```

**预期输出**：
```
订单已成交：...
以 $150.00 买入 10 股
剩余现金：$8500.00
购买力：$8500.00
```

## 🔑 关键要点

1. **市价单** = 速度快，无价格控制
2. **限价单** = 价格控制，可能不成交
3. **止损单** = 风险管理，自动执行
4. **根据以下因素选择**：紧急程度、价格重要性和风险承受能力
5. **对于流动性差的股票或波动市场，始终使用限价单**

## 🚀 下一课

[课程 1.3：阅读股票价格和图表](lesson-03-reading-charts.md)

你将学习：
- 如何阅读蜡烛图 (Candlestick Charts)
- OHLC（开盘价、最高价、最低价、收盘价）的含义
- 如何解读价格走势
- 基本图表形态

---

**完成了吗？** ✓ 标记为完成并继续你的学习之旅！
