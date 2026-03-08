# 模块6项目：综合回测框架

## 项目概述

在这个项目中，你将构建一个专业级的回测框架，整合模块6的所有概念。该框架将包括正确的数据处理、全面的性能指标、参数优化、前进分析和蒙特卡洛模拟。

目标是创建一个可重用的、稳健的回测系统，你可以用它来自信地评估任何交易策略。

## 项目目标

完成此项目后，你将：
- 从头开始构建完整的回测框架
- 实现无偏差的数据处理和执行建模
- 计算全面的性能指标
- 在不过拟合的情况下优化策略参数
- 使用前进分析验证策略
- 使用蒙特卡洛模拟评估风险
- 创建专业的性能报告和可视化

## 系统架构

回测框架由几个集成组件组成：

1. **DataHandler**：管理历史数据并防止前瞻偏差
2. **Strategy**：实现交易逻辑和信号生成
3. **ExecutionEngine**：模拟现实的订单执行
4. **PortfolioManager**：跟踪仓位和投资组合状态
5. **PerformanceAnalyzer**：计算全面的指标
6. **Optimizer**：找到最优参数
7. **WalkForwardValidator**：验证策略稳健性
8. **MonteCarloSimulator**：评估概率结果
9. **Reporter**：生成报告和可视化

## 实现

### 第1部分：核心回测引擎

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Callable
from dataclasses import dataclass
from datetime import datetime
import yfinance as yf
import matplotlib.pyplot as plt
import seaborn as sns
from abc import ABC, abstractmethod
