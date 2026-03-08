# 第6.4课：参数优化

## 学习目标

完成本课后，你将能够：
- 理解不同的优化方法及其权衡
- 实现网格搜索和随机搜索优化
- 使用遗传算法进行参数优化
- 在优化过程中避免过拟合
- 正确评估优化结果

## 引言

大多数交易策略都有需要调整的参数——移动平均周期、RSI阈值、止损百分比等。参数优化是寻找最佳参数值以最大化策略性能的过程。

然而，优化是一把双刃剑。虽然它可以提高策略性能，但激进的优化往往会导致过拟合，即策略在历史数据上表现良好，但在实盘交易中失败。

本课涵盖优化技术和最佳实践，以找到能够泛化到未见数据的稳健参数。

## 优化方法

### 1. 网格搜索

穷举测试所有参数组合：

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from itertools import product

def grid_search(data: pd.DataFrame,
                strategy_func,
                param_grid: Dict[str, List],
                metric: str = 'sharpe_ratio') -> Dict:
    """
    执行网格搜索优化。

    参数：
    -----------
    data : pd.DataFrame
        历史价格数据
    strategy_func : callable
        要优化的策略函数
    param_grid : Dict[str, List]
        要搜索的参数网格
    metric : str
        要优化的指标

    返回：
    --------
    Dict : 最佳参数和结果
    """
    # 生成所有参数组合
    param_names = list(param_grid.keys())
    param_values = list(param_grid.values())
    combinations = list(product(*param_values))

    print(f"测试 {len(combinations)} 个参数组合...")

    best_score = -np.inf
    best_params = None
    all_results = []

    for combo in combinations:
        # 创建参数字典
        params = dict(zip(param_names, combo))

        # 使用这些参数运行回测
        try:
            result = strategy_func(data, **params)
            score = result.get(metric, -np.inf)

            all_results.append({
                'params': params,
                'score': score,
                'result': result
            })

            if score > best_score:
                best_score = score
                best_params = params

        except Exception as e:
            print(f"参数 {params} 出错: {e}")
            continue

    return {
        'best_params': best_params,
        'best_score': best_score,
        'all_results': all_results
    }


# 使用示例
def example_grid_search():
    """
    演示网格搜索优化。
    """
    import yfinance as yf

    # 下载数据
    data = yf.download('AAPL', start='2020-01-01', end='2023-12-31', progress=False)

    # 定义参数网格
    param_grid = {
        'ma_short': [10, 20, 30],
        'ma_long': [50, 100, 150],
        'rsi_period': [14, 21, 28]
    }

    # 定义策略函数
    def test_strategy(data, ma_short, ma_long, rsi_period):
        # 计算指标
        data['MA_Short'] = data['Close'].rolling(ma_short).mean()
        data['MA_Long'] = data['Close'].rolling(ma_long).mean()

        # 计算RSI
        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(rsi_period).mean()
        rs = gain / loss
        data['RSI'] = 100 - (100 / (1 + rs))

        # 生成信号
        signals = (data['MA_Short'] > data['MA_Long']) & (data['RSI'] < 70)

        # 简单回测
        returns = data['Close'].pct_change()
        strategy_returns = returns * signals.shift(1)

        # 计算夏普比率
        sharpe = np.sqrt(252) * (strategy_returns.mean() / strategy_returns.std())

        return {'sharpe_ratio': sharpe, 'returns': strategy_returns}

    # 运行网格搜索
    results = grid_search(data, test_strategy, param_grid)

    print(f"\n最佳参数: {results['best_params']}")
    print(f"最佳夏普比率: {results['best_score']:.2f}")
```

**优点：**
- 穷举搜索
- 在网格内找到全局最优
- 实现简单

**缺点：**
- 计算成本高
- 不适合多参数扩展
- 仅限于离散参数值

### 2. 随机搜索

随机采样参数组合：

```python
def random_search(data: pd.DataFrame,
                 strategy_func,
                 param_distributions: Dict,
                 n_iterations: int = 100,
                 metric: str = 'sharpe_ratio') -> Dict:
    """
    执行随机搜索优化。

    参数：
    -----------
    data : pd.DataFrame
        历史价格数据
    strategy_func : callable
        策略函数
    param_distributions : Dict
        要采样的参数分布
    n_iterations : int
        随机样本数量
    metric : str
        要优化的指标

    返回：
    --------
    Dict : 最佳参数和结果
    """
    print(f"测试 {n_iterations} 个随机参数组合...")

    best_score = -np.inf
    best_params = None
    all_results = []

    for i in range(n_iterations):
        # 采样随机参数
        params = {}
        for param_name, distribution in param_distributions.items():
            if distribution['type'] == 'int':
                params[param_name] = np.random.randint(
                    distribution['low'], distribution['high']
                )
            elif distribution['type'] == 'float':
                params[param_name] = np.random.uniform(
                    distribution['low'], distribution['high']
                )
            elif distribution['type'] == 'choice':
                params[param_name] = np.random.choice(distribution['values'])

        # 运行回测
        try:
            result = strategy_func(data, **params)
            score = result.get(metric, -np.inf)

            all_results.append({
                'params': params,
                'score': score,
                'result': result
            })

            if score > best_score:
                best_score = score
                best_params = params

        except Exception as e:
            continue

    return {
        'best_params': best_params,
        'best_score': best_score,
        'all_results': all_results
    }


# 使用示例
def example_random_search():
    """
    演示随机搜索优化。
    """
    import yfinance as yf

    data = yf.download('AAPL', start='2020-01-01', end='2023-12-31', progress=False)

    # 定义参数分布
    param_distributions = {
        'ma_short': {'type': 'int', 'low': 5, 'high': 50},
        'ma_long': {'type': 'int', 'low': 50, 'high': 200},
        'rsi_period': {'type': 'int', 'low': 10, 'high': 30},
        'rsi_threshold': {'type': 'float', 'low': 60.0, 'high': 80.0}
    }

    def test_strategy(data, ma_short, ma_long, rsi_period, rsi_threshold):
        # 策略实现
        data['MA_Short'] = data['Close'].rolling(ma_short).mean()
        data['MA_Long'] = data['Close'].rolling(ma_long).mean()

        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(rsi_period).mean()
        rs = gain / loss
        data['RSI'] = 100 - (100 / (1 + rs))

        signals = (data['MA_Short'] > data['MA_Long']) & (data['RSI'] < rsi_threshold)
        returns = data['Close'].pct_change()
        strategy_returns = returns * signals.shift(1)

        sharpe = np.sqrt(252) * (strategy_returns.mean() / strategy_returns.std())

        return {'sharpe_ratio': sharpe}

    # 运行随机搜索
    results = random_search(data, test_strategy, param_distributions, n_iterations=200)

    print(f"\n最佳参数: {results['best_params']}")
    print(f"最佳夏普比率: {results['best_score']:.2f}")
```

**优点：**
- 比网格搜索更高效
- 可以处理连续参数
- 通常能快速找到好的解决方案

**缺点：**
- 可能错过最优解
- 不保证找到全局最优
- 结果在运行之间有所不同

### 3. 遗传算法

受自然选择启发的进化优化：

```python
class GeneticOptimizer:
    """
    用于参数优化的遗传算法。
    """

    def __init__(self,
                 param_bounds: Dict[str, Tuple[float, float]],
                 population_size: int = 50,
                 generations: int = 100,
                 mutation_rate: float = 0.1,
                 crossover_rate: float = 0.7):
        """
        初始化遗传优化器。

        参数：
        -----------
        param_bounds : Dict[str, Tuple[float, float]]
            参数边界（最小值，最大值）
        population_size : int
            种群大小
        generations : int
            代数
        mutation_rate : float
            变异概率
        crossover_rate : float
            交叉概率
        """
        self.param_bounds = param_bounds
        self.param_names = list(param_bounds.keys())
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate

    def initialize_population(self) -> np.ndarray:
        """创建初始随机种群。"""
        population = []

        for _ in range(self.population_size):
            individual = []
            for param_name in self.param_names:
                low, high = self.param_bounds[param_name]
                value = np.random.uniform(low, high)
                individual.append(value)
            population.append(individual)

        return np.array(population)

    def evaluate_fitness(self,
                        population: np.ndarray,
                        data: pd.DataFrame,
                        strategy_func) -> np.ndarray:
        """评估每个个体的适应度。"""
        fitness_scores = []

        for individual in population:
            # 转换为参数字典
            params = dict(zip(self.param_names, individual))

            try:
                result = strategy_func(data, **params)
                fitness = result.get('sharpe_ratio', -np.inf)
            except:
                fitness = -np.inf

            fitness_scores.append(fitness)

        return np.array(fitness_scores)

    def select_parents(self,
                      population: np.ndarray,
                      fitness: np.ndarray,
                      n_parents: int) -> np.ndarray:
        """使用锦标赛选择法选择父代。"""
        parents = []

        for _ in range(n_parents):
            # 锦标赛选择
            tournament_size = 5
            tournament_idx = np.random.choice(len(population), tournament_size)
            tournament_fitness = fitness[tournament_idx]
            winner_idx = tournament_idx[np.argmax(tournament_fitness)]
            parents.append(population[winner_idx])

        return np.array(parents)

    def crossover(self, parent1: np.ndarray, parent2: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """在两个父代之间执行交叉。"""
        if np.random.random() < self.crossover_rate:
            # 单点交叉
            crossover_point = np.random.randint(1, len(parent1))
            child1 = np.concatenate([parent1[:crossover_point], parent2[crossover_point:]])
            child2 = np.concatenate([parent2[:crossover_point], parent1[crossover_point:]])
        else:
            child1, child2 = parent1.copy(), parent2.copy()

        return child1, child2

    def mutate(self, individual: np.ndarray) -> np.ndarray:
        """变异一个个体。"""
        for i, param_name in enumerate(self.param_names):
            if np.random.random() < self.mutation_rate:
                low, high = self.param_bounds[param_name]
                individual[i] = np.random.uniform(low, high)

        return individual

    def optimize(self, data: pd.DataFrame, strategy_func) -> Dict:
        """
        运行遗传算法优化。

        参数：
        -----------
        data : pd.DataFrame
            历史数据
        strategy_func : callable
            策略函数

        返回：
        --------
        Dict : 最佳参数和适应度历史
        """
        # 初始化种群
        population = self.initialize_population()

        best_fitness_history = []
        avg_fitness_history = []

        print(f"运行遗传算法 {self.generations} 代...")

        for generation in range(self.generations):
            # 评估适应度
            fitness = self.evaluate_fitness(population, data, strategy_func)

            # 跟踪最佳和平均适应度
            best_fitness = np.max(fitness)
            avg_fitness = np.mean(fitness)
            best_fitness_history.append(best_fitness)
            avg_fitness_history.append(avg_fitness)

            if generation % 10 == 0:
                print(f"第 {generation} 代: 最佳={best_fitness:.3f}, 平均={avg_fitness:.3f}")

            # 选择父代
            n_parents = self.population_size // 2
            parents = self.select_parents(population, fitness, n_parents)

            # 创建下一代
            next_generation = []

            # 精英主义：保留最佳个体
            best_idx = np.argmax(fitness)
            next_generation.append(population[best_idx])

            # 创建后代
            while len(next_generation) < self.population_size:
                # 选择两个父代
                parent1, parent2 = parents[np.random.choice(len(parents), 2, replace=False)]

                # 交叉
                child1, child2 = self.crossover(parent1, parent2)

                # 变异
                child1 = self.mutate(child1)
                child2 = self.mutate(child2)

                next_generation.extend([child1, child2])

            population = np.array(next_generation[:self.population_size])

        # 最终评估
        final_fitness = self.evaluate_fitness(population, data, strategy_func)
        best_idx = np.argmax(final_fitness)
        best_individual = population[best_idx]
        best_params = dict(zip(self.param_names, best_individual))

        return {
            'best_params': best_params,
            'best_fitness': final_fitness[best_idx],
            'fitness_history': {
                'best': best_fitness_history,
                'avg': avg_fitness_history
            }
        }


# 使用示例
def example_genetic_optimization():
    """
    演示遗传算法优化。
    """
    import yfinance as yf
    import matplotlib.pyplot as plt

    data = yf.download('AAPL', start='2020-01-01', end='2023-12-31', progress=False)

    # 定义参数边界
    param_bounds = {
        'ma_short': (5, 50),
        'ma_long': (50, 200),
        'rsi_period': (10, 30)
    }

    def test_strategy(data, ma_short, ma_long, rsi_period):
        # 确保ma_short < ma_long
        if ma_short >= ma_long:
            return {'sharpe_ratio': -np.inf}

        data = data.copy()
        data['MA_Short'] = data['Close'].rolling(int(ma_short)).mean()
        data['MA_Long'] = data['Close'].rolling(int(ma_long)).mean()

        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(int(rsi_period)).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(int(rsi_period)).mean()
        rs = gain / loss
        data['RSI'] = 100 - (100 / (1 + rs))

        signals = (data['MA_Short'] > data['MA_Long']) & (data['RSI'] < 70)
        returns = data['Close'].pct_change()
        strategy_returns = returns * signals.shift(1)

        if strategy_returns.std() == 0:
            return {'sharpe_ratio': -np.inf}

        sharpe = np.sqrt(252) * (strategy_returns.mean() / strategy_returns.std())

        return {'sharpe_ratio': sharpe}

    # 运行遗传优化
    optimizer = GeneticOptimizer(
        param_bounds=param_bounds,
        population_size=50,
        generations=50,
        mutation_rate=0.1,
        crossover_rate=0.7
    )

    results = optimizer.optimize(data, test_strategy)

    print(f"\n最佳参数: {results['best_params']}")
    print(f"最佳适应度: {results['best_fitness']:.3f}")

    # 绘制适应度演化
    plt.figure(figsize=(10, 6))
    plt.plot(results['fitness_history']['best'], label='最佳适应度', linewidth=2)
    plt.plot(results['fitness_history']['avg'], label='平均适应度', linewidth=2)
    plt.xlabel('代数')
    plt.ylabel('适应度（夏普比率）')
    plt.title('遗传算法优化进度')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.show()
```

**优点：**
- 可以处理复杂的参数空间
- 同时探索多个区域
- 适合非凸优化

**缺点：**
- 计算成本高
- 需要调整许多超参数
- 不保证全局最优

## 避免优化中的过拟合

### 1. 使用样本外测试

```python
def optimize_with_oos(data: pd.DataFrame,
                     strategy_func,
                     param_grid: Dict,
                     train_ratio: float = 0.7) -> Dict:
    """
    使用样本外验证进行优化。

    参数：
    -----------
    data : pd.DataFrame
        历史数据
    strategy_func : callable
        策略函数
    param_grid : Dict
        参数网格
    train_ratio : float
        训练数据的比例

    返回：
    --------
    Dict : IS和OOS性能结果
    """
    # 分割数据
    split_idx = int(len(data) * train_ratio)
    train_data = data.iloc[:split_idx]
    test_data = data.iloc[split_idx:]

    # 在训练数据上优化
    train_results = grid_search(train_data, strategy_func, param_grid)
    best_params = train_results['best_params']

    # 在样本外数据上测试
    oos_result = strategy_func(test_data, **best_params)

    return {
        'best_params': best_params,
        'in_sample_score': train_results['best_score'],
        'out_of_sample_score': oos_result.get('sharpe_ratio', 0),
        'degradation': train_results['best_score'] - oos_result.get('sharpe_ratio', 0)
    }
```

### 2. 惩罚复杂度

```python
def fitness_with_complexity_penalty(result: Dict,
                                   num_params: int,
                                   penalty_factor: float = 0.1) -> float:
    """
    计算带复杂度惩罚的适应度。

    参数：
    -----------
    result : Dict
        策略结果
    num_params : int
        参数数量
    penalty_factor : float
        每个参数的惩罚

    返回：
    --------
    float : 调整后的适应度
    """
    base_fitness = result.get('sharpe_ratio', 0)
    penalty = num_params * penalty_factor
    adjusted_fitness = base_fitness - penalty

    return adjusted_fitness
```

### 3. 使用稳健指标

```python
def calculate_robust_fitness(result: Dict) -> float:
    """
    计算结合多个指标的稳健适应度。

    参数：
    -----------
    result : Dict
        包含多个指标的策略结果

    返回：
    --------
    float : 稳健适应度分数
    """
    # 结合多个指标
    sharpe = result.get('sharpe_ratio', 0)
    calmar = result.get('calmar_ratio', 0)
    win_rate = result.get('win_rate', 0)

    # 加权组合
    fitness = (0.4 * sharpe +
              0.4 * calmar +
              0.2 * (win_rate - 0.5) * 10)  # 标准化胜率

    return fitness
```

### 4. 参数稳定性分析

```python
def analyze_parameter_stability(data: pd.DataFrame,
                               strategy_func,
                               best_params: Dict,
                               perturbation: float = 0.1) -> Dict:
    """
    分析性能对参数变化的敏感度。

    参数：
    -----------
    data : pd.DataFrame
        历史数据
    strategy_func : callable
        策略函数
    best_params : Dict
        找到的最佳参数
    perturbation : float
        扰动参数的百分比

    返回：
    --------
    Dict : 稳定性分析结果
    """
    base_result = strategy_func(data, **best_params)
    base_score = base_result.get('sharpe_ratio', 0)

    stability_scores = {}

    for param_name, param_value in best_params.items():
        # 测试增加值
        perturbed_params = best_params.copy()
        perturbed_params[param_name] = param_value * (1 + perturbation)

        try:
            result = strategy_func(data, **perturbed_params)
            score_change = abs(result.get('sharpe_ratio', 0) - base_score)
            stability_scores[param_name] = score_change
        except:
            stability_scores[param_name] = np.inf

    return {
        'base_score': base_score,
        'stability_scores': stability_scores,
        'avg_sensitivity': np.mean(list(stability_scores.values()))
    }
```

## 最佳实践

1. **限制参数空间**：参数越少 = 过拟合越少
2. **使用领域知识**：设置合理的参数边界
3. **始终使用OOS测试**：永远不要只信任样本内结果
4. **测试稳定性**：确保小的参数变化不会大幅影响性能
5. **多个指标**：优化稳健性能，而不仅仅是收益
6. **记录一切**：保留所有优化尝试的记录
7. **保守行事**：预期实盘性能会比优化后的回测差

## 练习

### 练习1：网格搜索

为移动平均交叉策略实现网格搜索：
- 短期MA：10, 20, 30, 40, 50
- 长期MA：50, 100, 150, 200

在AAPL 2020-2023上找到最佳组合。

### 练习2：随机搜索比较

比较网格搜索与随机搜索：
- 使用相同的参数空间
- 随机搜索100次迭代
- 比较最佳结果和计算时间

### 练习3：遗传算法

为3参数策略实现遗传算法优化。绘制代际适应度演化图。

### 练习4：过拟合检测

在2020-2022数据上优化策略，在2023数据上测试。计算性能退化。策略是否过拟合？

## 总结

参数优化是必要的但也是危险的。关键要点：

- **网格搜索**：穷举但昂贵
- **随机搜索**：对大参数空间高效
- **遗传算法**：适合复杂优化
- **避免过拟合**：使用OOS测试、限制参数、测试稳定性
- **保持怀疑**：优化结果通常在实盘交易中不成立

始终在样本外数据上验证优化参数，并预期实盘交易中的性能退化。

## 下一步

在下一课中，我们将探索前进分析，这是一种稳健的优化方法，可以持续验证策略在未见数据上的性能。
