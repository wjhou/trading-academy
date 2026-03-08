# 第8.1课：交易中的机器学习

## 学习目标

在本课结束时，您将能够：
- 将机器学习技术应用于交易
- 构建价格走势预测模型
- 为金融数据实现特征工程
- 避免交易中常见的机器学习陷阱
- 正确评估机器学习模型性能

## 简介

机器学习为金融市场中的模式识别和预测提供了强大的工具。然而，将机器学习应用于交易需要仔细考虑数据特征、过拟合风险和现实评估。本课涵盖机器学习在交易中的实际应用。

## 特征工程

### 基于价格的特征

```python
import pandas as pd
import numpy as np
from typing import List, Dict
from sklearn.preprocessing import StandardScaler

class FeatureEngineer:
    """
    从价格数据创建机器学习模型的特征。
    """

    def __init__(self):
        self.scaler = StandardScaler()

    def create_price_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        创建基于价格的特征。

        参数：
        -----------
        data : pd.DataFrame
            OHLCV数据

        返回：
        --------
        pd.DataFrame : 特征
        """
        features = pd.DataFrame(index=data.index)

        # 收益率
        features['return_1d'] = data['Close'].pct_change(1)
        features['return_5d'] = data['Close'].pct_change(5)
        features['return_20d'] = data['Close'].pct_change(20)

        # 波动率
        features['volatility_5d'] = data['Close'].pct_change().rolling(5).std()
        features['volatility_20d'] = data['Close'].pct_change().rolling(20).std()

        # 价格比率
        features['high_low_ratio'] = data['High'] / data['Low']
        features['close_open_ratio'] = data['Close'] / data['Open']

        # 移动平均线
        features['ma_5'] = data['Close'].rolling(5).mean()
        features['ma_20'] = data['Close'].rolling(20).mean()
        features['ma_50'] = data['Close'].rolling(50).mean()

        # 均线比率
        features['price_to_ma5'] = data['Close'] / features['ma_5']
        features['price_to_ma20'] = data['Close'] / features['ma_20']
        features['ma5_to_ma20'] = features['ma_5'] / features['ma_20']

        # 成交量特征
        features['volume_ratio'] = data['Volume'] / data['Volume'].rolling(20).mean()

        return features

    def create_technical_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        创建技术指标特征。

        参数：
        -----------
        data : pd.DataFrame
            OHLCV数据

        返回：
        --------
        pd.DataFrame : 特征
        """
        features = pd.DataFrame(index=data.index)

        # RSI
        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / loss
        features['rsi'] = 100 - (100 / (1 + rs))

        # MACD
        exp1 = data['Close'].ewm(span=12).mean()
        exp2 = data['Close'].ewm(span=26).mean()
        features['macd'] = exp1 - exp2
        features['macd_signal'] = features['macd'].ewm(span=9).mean()
        features['macd_diff'] = features['macd'] - features['macd_signal']

        # 布林带
        ma20 = data['Close'].rolling(20).mean()
        std20 = data['Close'].rolling(20).std()
        features['bb_upper'] = ma20 + (std20 * 2)
        features['bb_lower'] = ma20 - (std20 * 2)
        features['bb_position'] = (data['Close'] - features['bb_lower']) / (features['bb_upper'] - features['bb_lower'])

        return features

    def create_lag_features(self, data: pd.DataFrame, lags: List[int] = [1, 2, 3, 5]) -> pd.DataFrame:
        """
        创建滞后特征。

        参数：
        -----------
        data : pd.DataFrame
            特征数据
        lags : List[int]
            滞后期数

        返回：
        --------
        pd.DataFrame : 滞后特征
        """
        lagged = pd.DataFrame(index=data.index)

        for col in data.columns:
            for lag in lags:
                lagged[f'{col}_lag{lag}'] = data[col].shift(lag)

        return lagged

    def create_target(self, data: pd.DataFrame, horizon: int = 1, threshold: float = 0.0) -> pd.Series:
        """
        创建分类目标变量。

        参数：
        -----------
        data : pd.DataFrame
            价格数据
        horizon : int
            预测时间范围
        threshold : float
            分类阈值

        返回：
        --------
        pd.Series : 目标（1表示上涨，0表示下跌）
        """
        future_return = data['Close'].pct_change(horizon).shift(-horizon)
        target = (future_return > threshold).astype(int)

        return target
```

## 交易的机器学习模型

### 随机森林分类器

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

class MLTradingModel:
    """
    用于交易预测的机器学习模型。
    """

    def __init__(self, model_type: str = 'random_forest'):
        """
        初始化机器学习模型。

        参数：
        -----------
        model_type : str
            模型类型
        """
        if model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=20,
                random_state=42
            )
        else:
            raise ValueError(f"未知的模型类型：{model_type}")

        self.feature_importance = None

    def train(self, X_train: pd.DataFrame, y_train: pd.Series):
        """
        训练模型。

        参数：
        -----------
        X_train : pd.DataFrame
            训练特征
        y_train : pd.Series
            训练目标
        """
        # 移除NaN值
        mask = ~(X_train.isna().any(axis=1) | y_train.isna())
        X_clean = X_train[mask]
        y_clean = y_train[mask]

        print(f"在{len(X_clean)}个样本上训练...")

        # 训练模型
        self.model.fit(X_clean, y_clean)

        # 存储特征重要性
        self.feature_importance = pd.Series(
            self.model.feature_importances_,
            index=X_train.columns
        ).sort_values(ascending=False)

        print("训练完成")

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        进行预测。

        参数：
        -----------
        X : pd.DataFrame
            特征

        返回：
        --------
        np.ndarray : 预测结果
        """
        return self.model.predict(X)

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """
        预测概率。

        参数：
        -----------
        X : pd.DataFrame
            特征

        返回：
        --------
        np.ndarray : 预测概率
        """
        return self.model.predict_proba(X)

    def evaluate(self, X_test: pd.DataFrame, y_test: pd.Series) -> Dict:
        """
        评估模型性能。

        参数：
        -----------
        X_test : pd.DataFrame
            测试特征
        y_test : pd.Series
            测试目标

        返回：
        --------
        Dict : 评估指标
        """
        # 移除NaN值
        mask = ~(X_test.isna().any(axis=1) | y_test.isna())
        X_clean = X_test[mask]
        y_clean = y_test[mask]

        # 预测
        y_pred = self.predict(X_clean)

        # 指标
        metrics = {
            'accuracy': accuracy_score(y_clean, y_pred),
            'precision': precision_score(y_clean, y_pred),
            'recall': recall_score(y_clean, y_pred),
            'f1': f1_score(y_clean, y_pred)
        }

        return metrics

    def get_top_features(self, n: int = 10) -> pd.Series:
        """
        获取前N个最重要的特征。

        参数：
        -----------
        n : int
            特征数量

        返回：
        --------
        pd.Series : 顶级特征
        """
        if self.feature_importance is None:
            return None

        return self.feature_importance.head(n)
```

## 机器学习的前向验证

```python
class MLWalkForward:
    """
    机器学习模型的前向验证。
    """

    def __init__(self, model: MLTradingModel, feature_engineer: FeatureEngineer):
        """
        初始化前向验证器。

        参数：
        -----------
        model : MLTradingModel
            机器学习模型
        feature_engineer : FeatureEngineer
            特征工程器
        """
        self.model = model
        self.feature_engineer = feature_engineer

    def run(self, data: pd.DataFrame, train_size: int = 252, test_size: int = 63) -> List[Dict]:
        """
        运行前向验证。

        参数：
        -----------
        data : pd.DataFrame
            价格数据
        train_size : int
            训练窗口大小
        test_size : int
            测试窗口大小

        返回：
        --------
        List[Dict] : 每个周期的结果
        """
        results = []
        start_idx = train_size

        while start_idx + test_size <= len(data):
            # 分割数据
            train_data = data.iloc[start_idx - train_size:start_idx]
            test_data = data.iloc[start_idx:start_idx + test_size]

            # 创建特征
            train_features = self.feature_engineer.create_price_features(train_data)
            train_features = pd.concat([
                train_features,
                self.feature_engineer.create_technical_features(train_data)
            ], axis=1)

            test_features = self.feature_engineer.create_price_features(test_data)
            test_features = pd.concat([
                test_features,
                self.feature_engineer.create_technical_features(test_data)
            ], axis=1)

            # 创建目标
            train_target = self.feature_engineer.create_target(train_data)
            test_target = self.feature_engineer.create_target(test_data)

            # 训练模型
            self.model.train(train_features, train_target)

            # 评估
            metrics = self.model.evaluate(test_features, test_target)

            results.append({
                'train_start': train_data.index[0],
                'train_end': train_data.index[-1],
                'test_start': test_data.index[0],
                'test_end': test_data.index[-1],
                'metrics': metrics
            })

            print(f"周期{len(results)}：准确率={metrics['accuracy']:.3f}，F1={metrics['f1']:.3f}")

            # 向前移动
            start_idx += test_size

        return results
```

## 避免过拟合

### 关键原则

1. **使用时间序列分割**：永远不要打乱数据
2. **前向验证**：仅在未来数据上测试
3. **特征选择**：限制特征数量
4. **正则化**：使用L1/L2惩罚
5. **早停**：当验证性能下降时停止训练
6. **集成方法**：组合多个模型

### 实现

```python
class OverfittingPrevention:
    """
    防止过拟合的技术。
    """

    @staticmethod
    def time_series_split(data: pd.DataFrame, n_splits: int = 5):
        """
        创建时间序列分割。

        参数：
        -----------
        data : pd.DataFrame
            要分割的数据
        n_splits : int
            分割数量

        生成：
        -------
        Tuple : (训练索引，测试索引)
        """
        tscv = TimeSeriesSplit(n_splits=n_splits)

        for train_idx, test_idx in tscv.split(data):
            yield train_idx, test_idx

    @staticmethod
    def feature_selection(X: pd.DataFrame, y: pd.Series, n_features: int = 20) -> List[str]:
        """
        使用互信息选择顶级特征。

        参数：
        -----------
        X : pd.DataFrame
            特征
        y : pd.Series
            目标
        n_features : int
            要选择的特征数量

        返回：
        --------
        List[str] : 选定的特征名称
        """
        from sklearn.feature_selection import mutual_info_classif

        # 移除NaN
        mask = ~(X.isna().any(axis=1) | y.isna())
        X_clean = X[mask]
        y_clean = y[mask]

        # 计算互信息
        mi_scores = mutual_info_classif(X_clean, y_clean)

        # 选择顶级特征
        feature_scores = pd.Series(mi_scores, index=X.columns)
        top_features = feature_scores.nlargest(n_features).index.tolist()

        return top_features
```

## 使用机器学习预测进行交易

```python
class MLTradingStrategy:
    """
    使用机器学习预测的交易策略。
    """

    def __init__(self, model: MLTradingModel, threshold: float = 0.6):
        """
        初始化策略。

        参数：
        -----------
        model : MLTradingModel
            训练好的机器学习模型
        threshold : float
            交易的概率阈值
        """
        self.model = model
        self.threshold = threshold

    def generate_signals(self, features: pd.DataFrame) -> pd.Series:
        """
        生成交易信号。

        参数：
        -----------
        features : pd.DataFrame
            当前特征

        返回：
        --------
        pd.Series : 交易信号（1=买入，0=持有，-1=卖出）
        """
        # 获取预测
        proba = self.model.predict_proba(features)

        # 提取正类的概率
        prob_up = proba[:, 1]

        # 生成信号
        signals = pd.Series(0, index=features.index)
        signals[prob_up > self.threshold] = 1  # 买入
        signals[prob_up < (1 - self.threshold)] = -1  # 卖出

        return signals
```

## 最佳实践

1. **数据质量**：干净、调整后、无幸存者偏差的数据
2. **特征工程**：领域知识 + 创造力
3. **正确验证**：前向验证，永不前瞻
4. **现实评估**：包括交易成本
5. **定期重新训练**：市场变化，定期重新训练
6. **集成方法**：组合多个模型
7. **监控性能**：跟踪实时与训练性能
8. **从简单开始**：从简单模型开始，逐步增加复杂性

## 常见陷阱

1. **前瞻偏差**：使用未来信息
2. **数据窥探**：测试太多模型
3. **过拟合**：模型过于复杂
4. **忽略成本**：不切实际的交易成本
5. **制度变化**：市场变化时模型失效
6. **数据不足**：训练样本不够
7. **特征泄漏**：目标信息在特征中

## 练习

### 练习1：特征工程

创建一个综合特征集，包括：
- 基于价格的特征
- 技术指标
- 成交量特征
- 滞后特征

在SPY 2015-2023上测试。

### 练习2：模型训练

训练随机森林模型来预测：
- 次日方向
- 5日远期收益
- 2%波动的概率

比较性能。

### 练习3：前向验证

实现前向验证：
- 1年训练窗口
- 3个月测试窗口
- 每月重新训练

分析性能下降。

### 练习4：交易策略

构建完整的机器学习交易策略：
- 特征工程
- 模型训练
- 信号生成
- 包含成本的回测

与简单技术策略比较。

## 总结

交易的机器学习需要：

- **特征工程**：创建预测性特征
- **正确验证**：前向验证，时间序列感知
- **防止过拟合**：正则化，特征选择
- **现实评估**：包括所有成本
- **持续监控**：跟踪性能

机器学习可以增强交易，但：
- 不是魔法解决方案
- 需要领域知识
- 需要仔细验证
- 必须持续监控

## 下一步

在下一课中，我们将探索使用LLM进行情绪分析，将新闻和社交媒体纳入交易决策。
