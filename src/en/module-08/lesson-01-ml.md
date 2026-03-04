# Lesson 8.1: Machine Learning for Trading

## Learning Objectives

By the end of this lesson, you will be able to:
- Apply machine learning techniques to trading
- Build predictive models for price movements
- Implement feature engineering for financial data
- Avoid common ML pitfalls in trading
- Evaluate ML model performance properly

## Introduction

Machine learning offers powerful tools for pattern recognition and prediction in financial markets. However, applying ML to trading requires careful consideration of data characteristics, overfitting risks, and realistic evaluation. This lesson covers practical ML applications in trading.

## Feature Engineering

### Price-Based Features

```python
import pandas as pd
import numpy as np
from typing import List, Dict
from sklearn.preprocessing import StandardScaler

class FeatureEngineer:
    """
    Creates features for ML models from price data.
    """

    def __init__(self):
        self.scaler = StandardScaler()

    def create_price_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Create price-based features.

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV data

        Returns:
        --------
        pd.DataFrame : Features
        """
        features = pd.DataFrame(index=data.index)

        # Returns
        features['return_1d'] = data['Close'].pct_change(1)
        features['return_5d'] = data['Close'].pct_change(5)
        features['return_20d'] = data['Close'].pct_change(20)

        # Volatility
        features['volatility_5d'] = data['Close'].pct_change().rolling(5).std()
        features['volatility_20d'] = data['Close'].pct_change().rolling(20).std()

        # Price ratios
        features['high_low_ratio'] = data['High'] / data['Low']
        features['close_open_ratio'] = data['Close'] / data['Open']

        # Moving averages
        features['ma_5'] = data['Close'].rolling(5).mean()
        features['ma_20'] = data['Close'].rolling(20).mean()
        features['ma_50'] = data['Close'].rolling(50).mean()

        # MA ratios
        features['price_to_ma5'] = data['Close'] / features['ma_5']
        features['price_to_ma20'] = data['Close'] / features['ma_20']
        features['ma5_to_ma20'] = features['ma_5'] / features['ma_20']

        # Volume features
        features['volume_ratio'] = data['Volume'] / data['Volume'].rolling(20).mean()

        return features

    def create_technical_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Create technical indicator features.

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV data

        Returns:
        --------
        pd.DataFrame : Features
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

        # Bollinger Bands
        ma20 = data['Close'].rolling(20).mean()
        std20 = data['Close'].rolling(20).std()
        features['bb_upper'] = ma20 + (std20 * 2)
        features['bb_lower'] = ma20 - (std20 * 2)
        features['bb_position'] = (data['Close'] - features['bb_lower']) / (features['bb_upper'] - features['bb_lower'])

        return features

    def create_lag_features(self, data: pd.DataFrame, lags: List[int] = [1, 2, 3, 5]) -> pd.DataFrame:
        """
        Create lagged features.

        Parameters:
        -----------
        data : pd.DataFrame
            Feature data
        lags : List[int]
            Lag periods

        Returns:
        --------
        pd.DataFrame : Lagged features
        """
        lagged = pd.DataFrame(index=data.index)

        for col in data.columns:
            for lag in lags:
                lagged[f'{col}_lag{lag}'] = data[col].shift(lag)

        return lagged

    def create_target(self, data: pd.DataFrame, horizon: int = 1, threshold: float = 0.0) -> pd.Series:
        """
        Create target variable for classification.

        Parameters:
        -----------
        data : pd.DataFrame
            Price data
        horizon : int
            Prediction horizon
        threshold : float
            Classification threshold

        Returns:
        --------
        pd.Series : Target (1 for up, 0 for down)
        """
        future_return = data['Close'].pct_change(horizon).shift(-horizon)
        target = (future_return > threshold).astype(int)

        return target
```

## ML Models for Trading

### Random Forest Classifier

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

class MLTradingModel:
    """
    Machine learning model for trading predictions.
    """

    def __init__(self, model_type: str = 'random_forest'):
        """
        Initialize ML model.

        Parameters:
        -----------
        model_type : str
            Type of model
        """
        if model_type == 'random_forest':
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=20,
                random_state=42
            )
        else:
            raise ValueError(f"Unknown model type: {model_type}")

        self.feature_importance = None

    def train(self, X_train: pd.DataFrame, y_train: pd.Series):
        """
        Train the model.

        Parameters:
        -----------
        X_train : pd.DataFrame
            Training features
        y_train : pd.Series
            Training target
        """
        # Remove NaN values
        mask = ~(X_train.isna().any(axis=1) | y_train.isna())
        X_clean = X_train[mask]
        y_clean = y_train[mask]

        print(f"Training on {len(X_clean)} samples...")

        # Train model
        self.model.fit(X_clean, y_clean)

        # Store feature importance
        self.feature_importance = pd.Series(
            self.model.feature_importances_,
            index=X_train.columns
        ).sort_values(ascending=False)

        print("Training complete")

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """
        Make predictions.

        Parameters:
        -----------
        X : pd.DataFrame
            Features

        Returns:
        --------
        np.ndarray : Predictions
        """
        return self.model.predict(X)

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """
        Predict probabilities.

        Parameters:
        -----------
        X : pd.DataFrame
            Features

        Returns:
        --------
        np.ndarray : Prediction probabilities
        """
        return self.model.predict_proba(X)

    def evaluate(self, X_test: pd.DataFrame, y_test: pd.Series) -> Dict:
        """
        Evaluate model performance.

        Parameters:
        -----------
        X_test : pd.DataFrame
            Test features
        y_test : pd.Series
            Test target

        Returns:
        --------
        Dict : Evaluation metrics
        """
        # Remove NaN values
        mask = ~(X_test.isna().any(axis=1) | y_test.isna())
        X_clean = X_test[mask]
        y_clean = y_test[mask]

        # Predictions
        y_pred = self.predict(X_clean)

        # Metrics
        metrics = {
            'accuracy': accuracy_score(y_clean, y_pred),
            'precision': precision_score(y_clean, y_pred),
            'recall': recall_score(y_clean, y_pred),
            'f1': f1_score(y_clean, y_pred)
        }

        return metrics

    def get_top_features(self, n: int = 10) -> pd.Series:
        """
        Get top N most important features.

        Parameters:
        -----------
        n : int
            Number of features

        Returns:
        --------
        pd.Series : Top features
        """
        if self.feature_importance is None:
            return None

        return self.feature_importance.head(n)
```

## Walk-Forward Validation for ML

```python
class MLWalkForward:
    """
    Walk-forward validation for ML models.
    """

    def __init__(self, model: MLTradingModel, feature_engineer: FeatureEngineer):
        """
        Initialize walk-forward validator.

        Parameters:
        -----------
        model : MLTradingModel
            ML model
        feature_engineer : FeatureEngineer
            Feature engineer
        """
        self.model = model
        self.feature_engineer = feature_engineer

    def run(self, data: pd.DataFrame, train_size: int = 252, test_size: int = 63) -> List[Dict]:
        """
        Run walk-forward validation.

        Parameters:
        -----------
        data : pd.DataFrame
            Price data
        train_size : int
            Training window size
        test_size : int
            Test window size

        Returns:
        --------
        List[Dict] : Results for each period
        """
        results = []
        start_idx = train_size

        while start_idx + test_size <= len(data):
            # Split data
            train_data = data.iloc[start_idx - train_size:start_idx]
            test_data = data.iloc[start_idx:start_idx + test_size]

            # Create features
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

            # Create targets
            train_target = self.feature_engineer.create_target(train_data)
            test_target = self.feature_engineer.create_target(test_data)

            # Train model
            self.model.train(train_features, train_target)

            # Evaluate
            metrics = self.model.evaluate(test_features, test_target)

            results.append({
                'train_start': train_data.index[0],
                'train_end': train_data.index[-1],
                'test_start': test_data.index[0],
                'test_end': test_data.index[-1],
                'metrics': metrics
            })

            print(f"Period {len(results)}: Accuracy={metrics['accuracy']:.3f}, F1={metrics['f1']:.3f}")

            # Move forward
            start_idx += test_size

        return results
```

## Avoiding Overfitting

### Key Principles

1. **Use Time-Series Split**: Never shuffle data
2. **Walk-Forward Validation**: Test on future data only
3. **Feature Selection**: Limit number of features
4. **Regularization**: Use L1/L2 penalties
5. **Early Stopping**: Stop training when validation performance degrades
6. **Ensemble Methods**: Combine multiple models

### Implementation

```python
class OverfittingPrevention:
    """
    Techniques to prevent overfitting.
    """

    @staticmethod
    def time_series_split(data: pd.DataFrame, n_splits: int = 5):
        """
        Create time-series splits.

        Parameters:
        -----------
        data : pd.DataFrame
            Data to split
        n_splits : int
            Number of splits

        Yields:
        -------
        Tuple : (train_indices, test_indices)
        """
        tscv = TimeSeriesSplit(n_splits=n_splits)

        for train_idx, test_idx in tscv.split(data):
            yield train_idx, test_idx

    @staticmethod
    def feature_selection(X: pd.DataFrame, y: pd.Series, n_features: int = 20) -> List[str]:
        """
        Select top features using mutual information.

        Parameters:
        -----------
        X : pd.DataFrame
            Features
        y : pd.Series
            Target
        n_features : int
            Number of features to select

        Returns:
        --------
        List[str] : Selected feature names
        """
        from sklearn.feature_selection import mutual_info_classif

        # Remove NaN
        mask = ~(X.isna().any(axis=1) | y.isna())
        X_clean = X[mask]
        y_clean = y[mask]

        # Calculate mutual information
        mi_scores = mutual_info_classif(X_clean, y_clean)

        # Select top features
        feature_scores = pd.Series(mi_scores, index=X.columns)
        top_features = feature_scores.nlargest(n_features).index.tolist()

        return top_features
```

## Trading with ML Predictions

```python
class MLTradingStrategy:
    """
    Trading strategy using ML predictions.
    """

    def __init__(self, model: MLTradingModel, threshold: float = 0.6):
        """
        Initialize strategy.

        Parameters:
        -----------
        model : MLTradingModel
            Trained ML model
        threshold : float
            Probability threshold for trading
        """
        self.model = model
        self.threshold = threshold

    def generate_signals(self, features: pd.DataFrame) -> pd.Series:
        """
        Generate trading signals.

        Parameters:
        -----------
        features : pd.DataFrame
            Current features

        Returns:
        --------
        pd.Series : Trading signals (1=buy, 0=hold, -1=sell)
        """
        # Get predictions
        proba = self.model.predict_proba(features)

        # Extract probability of positive class
        prob_up = proba[:, 1]

        # Generate signals
        signals = pd.Series(0, index=features.index)
        signals[prob_up > self.threshold] = 1  # Buy
        signals[prob_up < (1 - self.threshold)] = -1  # Sell

        return signals
```

## Best Practices

1. **Data Quality**: Clean, adjusted, survivorship-bias-free data
2. **Feature Engineering**: Domain knowledge + creativity
3. **Proper Validation**: Walk-forward, never look ahead
4. **Realistic Evaluation**: Include transaction costs
5. **Regular Retraining**: Markets change, retrain periodically
6. **Ensemble Methods**: Combine multiple models
7. **Monitor Performance**: Track live vs training performance
8. **Start Simple**: Begin with simple models, add complexity gradually

## Common Pitfalls

1. **Look-Ahead Bias**: Using future information
2. **Data Snooping**: Testing too many models
3. **Overfitting**: Too complex models
4. **Ignoring Costs**: Unrealistic transaction costs
5. **Regime Changes**: Models fail when markets change
6. **Insufficient Data**: Not enough training samples
7. **Feature Leakage**: Target information in features

## Exercises

### Exercise 1: Feature Engineering

Create a comprehensive feature set including:
- Price-based features
- Technical indicators
- Volume features
- Lagged features

Test on SPY 2015-2023.

### Exercise 2: Model Training

Train a Random Forest model to predict:
- Next day direction
- 5-day forward return
- Probability of 2% move

Compare performance.

### Exercise 3: Walk-Forward Validation

Implement walk-forward validation with:
- 1 year training window
- 3 month test window
- Monthly retraining

Analyze performance degradation.

### Exercise 4: Trading Strategy

Build a complete ML trading strategy:
- Feature engineering
- Model training
- Signal generation
- Backtesting with costs

Compare to simple technical strategy.

## Summary

Machine learning for trading requires:

- **Feature Engineering**: Create predictive features
- **Proper Validation**: Walk-forward, time-series aware
- **Overfitting Prevention**: Regularization, feature selection
- **Realistic Evaluation**: Include all costs
- **Continuous Monitoring**: Track performance

ML can enhance trading but:
- Not a magic solution
- Requires domain knowledge
- Needs careful validation
- Must be monitored continuously

## Next Steps

In the next lesson, we'll explore sentiment analysis using LLMs to incorporate news and social media into trading decisions.