# Lesson 6.4: Parameter Optimization

## Learning Objectives

By the end of this lesson, you will be able to:
- Understand different optimization methods and their trade-offs
- Implement grid search and random search optimization
- Use genetic algorithms for parameter optimization
- Avoid overfitting during optimization
- Evaluate optimization results properly

## Introduction

Most trading strategies have parameters that need to be tuned—moving average periods, RSI thresholds, stop-loss percentages, etc. Parameter optimization is the process of finding the best parameter values to maximize strategy performance.

However, optimization is a double-edged sword. While it can improve strategy performance, aggressive optimization often leads to overfitting, where the strategy performs well on historical data but fails in live trading.

This lesson covers optimization techniques and best practices to find robust parameters that generalize to unseen data.

## Optimization Methods

### 1. Grid Search

Exhaustively tests all combinations of parameters:

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
    Perform grid search optimization.

    Parameters:
    -----------
    data : pd.DataFrame
        Historical price data
    strategy_func : callable
        Strategy function to optimize
    param_grid : Dict[str, List]
        Parameter grid to search
    metric : str
        Metric to optimize

    Returns:
    --------
    Dict : Best parameters and results
    """
    # Generate all parameter combinations
    param_names = list(param_grid.keys())
    param_values = list(param_grid.values())
    combinations = list(product(*param_values))

    print(f"Testing {len(combinations)} parameter combinations...")

    best_score = -np.inf
    best_params = None
    all_results = []

    for combo in combinations:
        # Create parameter dictionary
        params = dict(zip(param_names, combo))

        # Run backtest with these parameters
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
            print(f"Error with params {params}: {e}")
            continue

    return {
        'best_params': best_params,
        'best_score': best_score,
        'all_results': all_results
    }


# Example usage
def example_grid_search():
    """
    Demonstrate grid search optimization.
    """
    import yfinance as yf

    # Download data
    data = yf.download('AAPL', start='2020-01-01', end='2023-12-31', progress=False)

    # Define parameter grid
    param_grid = {
        'ma_short': [10, 20, 30],
        'ma_long': [50, 100, 150],
        'rsi_period': [14, 21, 28]
    }

    # Define strategy function
    def test_strategy(data, ma_short, ma_long, rsi_period):
        # Calculate indicators
        data['MA_Short'] = data['Close'].rolling(ma_short).mean()
        data['MA_Long'] = data['Close'].rolling(ma_long).mean()

        # Calculate RSI
        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(rsi_period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(rsi_period).mean()
        rs = gain / loss
        data['RSI'] = 100 - (100 / (1 + rs))

        # Generate signals
        signals = (data['MA_Short'] > data['MA_Long']) & (data['RSI'] < 70)

        # Simple backtest
        returns = data['Close'].pct_change()
        strategy_returns = returns * signals.shift(1)

        # Calculate Sharpe ratio
        sharpe = np.sqrt(252) * (strategy_returns.mean() / strategy_returns.std())

        return {'sharpe_ratio': sharpe, 'returns': strategy_returns}

    # Run grid search
    results = grid_search(data, test_strategy, param_grid)

    print(f"\nBest Parameters: {results['best_params']}")
    print(f"Best Sharpe Ratio: {results['best_score']:.2f}")
```

**Advantages:**
- Exhaustive search
- Finds global optimum within grid
- Simple to implement

**Disadvantages:**
- Computationally expensive
- Doesn't scale well with many parameters
- Limited to discrete parameter values

### 2. Random Search

Randomly samples parameter combinations:

```python
def random_search(data: pd.DataFrame,
                 strategy_func,
                 param_distributions: Dict,
                 n_iterations: int = 100,
                 metric: str = 'sharpe_ratio') -> Dict:
    """
    Perform random search optimization.

    Parameters:
    -----------
    data : pd.DataFrame
        Historical price data
    strategy_func : callable
        Strategy function
    param_distributions : Dict
        Parameter distributions to sample from
    n_iterations : int
        Number of random samples
    metric : str
        Metric to optimize

    Returns:
    --------
    Dict : Best parameters and results
    """
    print(f"Testing {n_iterations} random parameter combinations...")

    best_score = -np.inf
    best_params = None
    all_results = []

    for i in range(n_iterations):
        # Sample random parameters
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

        # Run backtest
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


# Example usage
def example_random_search():
    """
    Demonstrate random search optimization.
    """
    import yfinance as yf

    data = yf.download('AAPL', start='2020-01-01', end='2023-12-31', progress=False)

    # Define parameter distributions
    param_distributions = {
        'ma_short': {'type': 'int', 'low': 5, 'high': 50},
        'ma_long': {'type': 'int', 'low': 50, 'high': 200},
        'rsi_period': {'type': 'int', 'low': 10, 'high': 30},
        'rsi_threshold': {'type': 'float', 'low': 60.0, 'high': 80.0}
    }

    def test_strategy(data, ma_short, ma_long, rsi_period, rsi_threshold):
        # Strategy implementation
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

    # Run random search
    results = random_search(data, test_strategy, param_distributions, n_iterations=200)

    print(f"\nBest Parameters: {results['best_params']}")
    print(f"Best Sharpe Ratio: {results['best_score']:.2f}")
```

**Advantages:**
- More efficient than grid search
- Can handle continuous parameters
- Often finds good solutions quickly

**Disadvantages:**
- May miss optimal solution
- No guarantee of finding global optimum
- Results vary between runs

### 3. Genetic Algorithm

Evolutionary optimization inspired by natural selection:

```python
class GeneticOptimizer:
    """
    Genetic algorithm for parameter optimization.
    """

    def __init__(self,
                 param_bounds: Dict[str, Tuple[float, float]],
                 population_size: int = 50,
                 generations: int = 100,
                 mutation_rate: float = 0.1,
                 crossover_rate: float = 0.7):
        """
        Initialize genetic optimizer.

        Parameters:
        -----------
        param_bounds : Dict[str, Tuple[float, float]]
            Parameter bounds (min, max)
        population_size : int
            Size of population
        generations : int
            Number of generations
        mutation_rate : float
            Probability of mutation
        crossover_rate : float
            Probability of crossover
        """
        self.param_bounds = param_bounds
        self.param_names = list(param_bounds.keys())
        self.population_size = population_size
        self.generations = generations
        self.mutation_rate = mutation_rate
        self.crossover_rate = crossover_rate

    def initialize_population(self) -> np.ndarray:
        """Create initial random population."""
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
        """Evaluate fitness of each individual."""
        fitness_scores = []

        for individual in population:
            # Convert to parameter dictionary
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
        """Select parents using tournament selection."""
        parents = []

        for _ in range(n_parents):
            # Tournament selection
            tournament_size = 5
            tournament_idx = np.random.choice(len(population), tournament_size)
            tournament_fitness = fitness[tournament_idx]
            winner_idx = tournament_idx[np.argmax(tournament_fitness)]
            parents.append(population[winner_idx])

        return np.array(parents)

    def crossover(self, parent1: np.ndarray, parent2: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """Perform crossover between two parents."""
        if np.random.random() < self.crossover_rate:
            # Single-point crossover
            crossover_point = np.random.randint(1, len(parent1))
            child1 = np.concatenate([parent1[:crossover_point], parent2[crossover_point:]])
            child2 = np.concatenate([parent2[:crossover_point], parent1[crossover_point:]])
        else:
            child1, child2 = parent1.copy(), parent2.copy()

        return child1, child2

    def mutate(self, individual: np.ndarray) -> np.ndarray:
        """Mutate an individual."""
        for i, param_name in enumerate(self.param_names):
            if np.random.random() < self.mutation_rate:
                low, high = self.param_bounds[param_name]
                individual[i] = np.random.uniform(low, high)

        return individual

    def optimize(self, data: pd.DataFrame, strategy_func) -> Dict:
        """
        Run genetic algorithm optimization.

        Parameters:
        -----------
        data : pd.DataFrame
            Historical data
        strategy_func : callable
            Strategy function

        Returns:
        --------
        Dict : Best parameters and fitness history
        """
        # Initialize population
        population = self.initialize_population()

        best_fitness_history = []
        avg_fitness_history = []

        print(f"Running genetic algorithm for {self.generations} generations...")

        for generation in range(self.generations):
            # Evaluate fitness
            fitness = self.evaluate_fitness(population, data, strategy_func)

            # Track best and average fitness
            best_fitness = np.max(fitness)
            avg_fitness = np.mean(fitness)
            best_fitness_history.append(best_fitness)
            avg_fitness_history.append(avg_fitness)

            if generation % 10 == 0:
                print(f"Generation {generation}: Best={best_fitness:.3f}, Avg={avg_fitness:.3f}")

            # Select parents
            n_parents = self.population_size // 2
            parents = self.select_parents(population, fitness, n_parents)

            # Create next generation
            next_generation = []

            # Elitism: keep best individual
            best_idx = np.argmax(fitness)
            next_generation.append(population[best_idx])

            # Create offspring
            while len(next_generation) < self.population_size:
                # Select two parents
                parent1, parent2 = parents[np.random.choice(len(parents), 2, replace=False)]

                # Crossover
                child1, child2 = self.crossover(parent1, parent2)

                # Mutation
                child1 = self.mutate(child1)
                child2 = self.mutate(child2)

                next_generation.extend([child1, child2])

            population = np.array(next_generation[:self.population_size])

        # Final evaluation
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


# Example usage
def example_genetic_optimization():
    """
    Demonstrate genetic algorithm optimization.
    """
    import yfinance as yf
    import matplotlib.pyplot as plt

    data = yf.download('AAPL', start='2020-01-01', end='2023-12-31', progress=False)

    # Define parameter bounds
    param_bounds = {
        'ma_short': (5, 50),
        'ma_long': (50, 200),
        'rsi_period': (10, 30)
    }

    def test_strategy(data, ma_short, ma_long, rsi_period):
        # Ensure ma_short < ma_long
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

    # Run genetic optimization
    optimizer = GeneticOptimizer(
        param_bounds=param_bounds,
        population_size=50,
        generations=50,
        mutation_rate=0.1,
        crossover_rate=0.7
    )

    results = optimizer.optimize(data, test_strategy)

    print(f"\nBest Parameters: {results['best_params']}")
    print(f"Best Fitness: {results['best_fitness']:.3f}")

    # Plot fitness evolution
    plt.figure(figsize=(10, 6))
    plt.plot(results['fitness_history']['best'], label='Best Fitness', linewidth=2)
    plt.plot(results['fitness_history']['avg'], label='Average Fitness', linewidth=2)
    plt.xlabel('Generation')
    plt.ylabel('Fitness (Sharpe Ratio)')
    plt.title('Genetic Algorithm Optimization Progress')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.show()
```

**Advantages:**
- Can handle complex parameter spaces
- Explores multiple regions simultaneously
- Good for non-convex optimization

**Disadvantages:**
- Computationally expensive
- Many hyperparameters to tune
- No guarantee of global optimum

## Avoiding Overfitting in Optimization

### 1. Use Out-of-Sample Testing

```python
def optimize_with_oos(data: pd.DataFrame,
                     strategy_func,
                     param_grid: Dict,
                     train_ratio: float = 0.7) -> Dict:
    """
    Optimize with out-of-sample validation.

    Parameters:
    -----------
    data : pd.DataFrame
        Historical data
    strategy_func : callable
        Strategy function
    param_grid : Dict
        Parameter grid
    train_ratio : float
        Fraction of data for training

    Returns:
    --------
    Dict : Results with IS and OOS performance
    """
    # Split data
    split_idx = int(len(data) * train_ratio)
    train_data = data.iloc[:split_idx]
    test_data = data.iloc[split_idx:]

    # Optimize on training data
    train_results = grid_search(train_data, strategy_func, param_grid)
    best_params = train_results['best_params']

    # Test on out-of-sample data
    oos_result = strategy_func(test_data, **best_params)

    return {
        'best_params': best_params,
        'in_sample_score': train_results['best_score'],
        'out_of_sample_score': oos_result.get('sharpe_ratio', 0),
        'degradation': train_results['best_score'] - oos_result.get('sharpe_ratio', 0)
    }
```

### 2. Penalize Complexity

```python
def fitness_with_complexity_penalty(result: Dict,
                                   num_params: int,
                                   penalty_factor: float = 0.1) -> float:
    """
    Calculate fitness with complexity penalty.

    Parameters:
    -----------
    result : Dict
        Strategy result
    num_params : int
        Number of parameters
    penalty_factor : float
        Penalty per parameter

    Returns:
    --------
    float : Adjusted fitness
    """
    base_fitness = result.get('sharpe_ratio', 0)
    penalty = num_params * penalty_factor
    adjusted_fitness = base_fitness - penalty

    return adjusted_fitness
```

### 3. Use Robust Metrics

```python
def calculate_robust_fitness(result: Dict) -> float:
    """
    Calculate robust fitness combining multiple metrics.

    Parameters:
    -----------
    result : Dict
        Strategy result with multiple metrics

    Returns:
    --------
    float : Robust fitness score
    """
    # Combine multiple metrics
    sharpe = result.get('sharpe_ratio', 0)
    calmar = result.get('calmar_ratio', 0)
    win_rate = result.get('win_rate', 0)

    # Weighted combination
    fitness = (0.4 * sharpe +
              0.4 * calmar +
              0.2 * (win_rate - 0.5) * 10)  # Normalize win rate

    return fitness
```

### 4. Parameter Stability Analysis

```python
def analyze_parameter_stability(data: pd.DataFrame,
                               strategy_func,
                               best_params: Dict,
                               perturbation: float = 0.1) -> Dict:
    """
    Analyze how sensitive performance is to parameter changes.

    Parameters:
    -----------
    data : pd.DataFrame
        Historical data
    strategy_func : callable
        Strategy function
    best_params : Dict
        Best parameters found
    perturbation : float
        Percentage to perturb parameters

    Returns:
    --------
    Dict : Stability analysis results
    """
    base_result = strategy_func(data, **best_params)
    base_score = base_result.get('sharpe_ratio', 0)

    stability_scores = {}

    for param_name, param_value in best_params.items():
        # Test with increased value
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

## Best Practices

1. **Limit Parameter Space**: Fewer parameters = less overfitting
2. **Use Domain Knowledge**: Set reasonable parameter bounds
3. **Always Use OOS Testing**: Never trust in-sample results alone
4. **Test Stability**: Ensure small parameter changes don't drastically affect performance
5. **Multiple Metrics**: Optimize for robust performance, not just returns
6. **Document Everything**: Keep records of all optimization attempts
7. **Be Conservative**: Expect live performance to be worse than optimized backtest

## Exercises

### Exercise 1: Grid Search

Implement grid search for a moving average crossover strategy with:
- Short MA: 10, 20, 30, 40, 50
- Long MA: 50, 100, 150, 200

Find the best combination on AAPL 2020-2023.

### Exercise 2: Random Search Comparison

Compare grid search vs random search:
- Use same parameter space
- Random search with 100 iterations
- Compare best results and computation time

### Exercise 3: Genetic Algorithm

Implement genetic algorithm optimization for a 3-parameter strategy. Plot fitness evolution over generations.

### Exercise 4: Overfitting Detection

Optimize a strategy on 2020-2022 data, test on 2023 data. Calculate performance degradation. Is the strategy overfit?

## Summary

Parameter optimization is essential but dangerous. Key takeaways:

- **Grid Search**: Exhaustive but expensive
- **Random Search**: Efficient for large parameter spaces
- **Genetic Algorithms**: Good for complex optimization
- **Avoid Overfitting**: Use OOS testing, limit parameters, test stability
- **Be Skeptical**: Optimized results often don't hold in live trading

Always validate optimized parameters on out-of-sample data and expect performance degradation in live trading.

## Next Steps

In the next lesson, we'll explore walk-forward analysis, a robust method for optimization that continuously validates strategy performance on unseen data.