# Lesson 8.2: Sentiment Analysis with LLMs

## Learning Objectives

By the end of this lesson, you will be able to:
- Extract sentiment from news and social media
- Use LLMs for financial text analysis
- Integrate sentiment signals into trading strategies
- Build a news-based trading system
- Evaluate sentiment signal quality

## Introduction

Sentiment analysis uses natural language processing to gauge market sentiment from news, social media, and other text sources. Modern LLMs provide powerful tools for understanding financial text and extracting actionable signals.

## News Data Collection

```python
import requests
from datetime import datetime, timedelta
from typing import List, Dict
import pandas as pd

class NewsCollector:
    """
    Collects financial news from various sources.
    """

    def __init__(self, api_key: str = None):
        """
        Initialize news collector.

        Parameters:
        -----------
        api_key : str, optional
            API key for news service
        """
        self.api_key = api_key

    def get_news(self, symbol: str, days: int = 7) -> List[Dict]:
        """
        Get recent news for a symbol.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        days : int
            Number of days to look back

        Returns:
        --------
        List[Dict] : News articles
        """
        # Placeholder - implement with actual news API
        # Examples: NewsAPI, Alpha Vantage, Finnhub

        articles = []

        # Example structure
        article = {
            'title': 'Company announces strong earnings',
            'description': 'Q4 earnings beat expectations...',
            'source': 'Reuters',
            'published_at': datetime.now(),
            'url': 'https://example.com/article',
            'symbol': symbol
        }

        articles.append(article)

        return articles

    def get_social_sentiment(self, symbol: str) -> Dict:
        """
        Get social media sentiment.

        Parameters:
        -----------
        symbol : str
            Stock symbol

        Returns:
        --------
        Dict : Sentiment metrics
        """
        # Placeholder - implement with Twitter API, Reddit API, etc.

        return {
            'symbol': symbol,
            'mentions': 1000,
            'positive_ratio': 0.65,
            'negative_ratio': 0.20,
            'neutral_ratio': 0.15,
            'sentiment_score': 0.45  # -1 to 1
        }
```

## Sentiment Analysis with LLMs

```python
class LLMSentimentAnalyzer:
    """
    Analyzes sentiment using LLMs.
    """

    def __init__(self, model: str = "gpt-3.5-turbo"):
        """
        Initialize sentiment analyzer.

        Parameters:
        -----------
        model : str
            LLM model to use
        """
        self.model = model

    def analyze_text(self, text: str, symbol: str = None) -> Dict:
        """
        Analyze sentiment of text.

        Parameters:
        -----------
        text : str
            Text to analyze
        symbol : str, optional
            Related stock symbol

        Returns:
        --------
        Dict : Sentiment analysis
        """
        # Construct prompt
        prompt = f"""Analyze the sentiment of this financial news for trading purposes.

Text: {text}
{f'Symbol: {symbol}' if symbol else ''}

Provide:
1. Overall sentiment (positive/negative/neutral)
2. Sentiment score (-1 to 1)
3. Key topics mentioned
4. Potential market impact (bullish/bearish/neutral)
5. Confidence level (0-1)

Format as JSON."""

        # Call LLM (placeholder - implement with actual API)
        # Example: OpenAI API, Anthropic API, etc.

        # Simulated response
        response = {
            'sentiment': 'positive',
            'score': 0.7,
            'topics': ['earnings', 'revenue growth', 'guidance'],
            'market_impact': 'bullish',
            'confidence': 0.85,
            'reasoning': 'Strong earnings beat with positive guidance'
        }

        return response

    def analyze_batch(self, articles: List[Dict]) -> pd.DataFrame:
        """
        Analyze sentiment for multiple articles.

        Parameters:
        -----------
        articles : List[Dict]
            News articles

        Returns:
        --------
        pd.DataFrame : Sentiment analysis results
        """
        results = []

        for article in articles:
            text = f"{article['title']}. {article.get('description', '')}"

            sentiment = self.analyze_text(
                text,
                article.get('symbol')
            )

            results.append({
                'timestamp': article['published_at'],
                'symbol': article.get('symbol'),
                'title': article['title'],
                'sentiment': sentiment['sentiment'],
                'score': sentiment['score'],
                'confidence': sentiment['confidence'],
                'market_impact': sentiment['market_impact']
            })

        return pd.DataFrame(results)

    def aggregate_sentiment(self, sentiments: pd.DataFrame,
                          window_hours: int = 24) -> Dict:
        """
        Aggregate sentiment over time window.

        Parameters:
        -----------
        sentiments : pd.DataFrame
            Sentiment data
        window_hours : int
            Time window in hours

        Returns:
        --------
        Dict : Aggregated sentiment
        """
        cutoff = datetime.now() - timedelta(hours=window_hours)
        recent = sentiments[sentiments['timestamp'] >= cutoff]

        if len(recent) == 0:
            return {'score': 0, 'count': 0}

        # Weighted average by confidence
        weighted_score = (recent['score'] * recent['confidence']).sum() / recent['confidence'].sum()

        # Count by sentiment type
        sentiment_counts = recent['sentiment'].value_counts().to_dict()

        return {
            'score': weighted_score,
            'count': len(recent),
            'positive': sentiment_counts.get('positive', 0),
            'negative': sentiment_counts.get('negative', 0),
            'neutral': sentiment_counts.get('neutral', 0),
            'avg_confidence': recent['confidence'].mean()
        }
```

## Sentiment-Based Trading Strategy

```python
class SentimentTradingStrategy:
    """
    Trading strategy based on sentiment analysis.
    """

    def __init__(self,
                 sentiment_threshold: float = 0.3,
                 min_articles: int = 3,
                 min_confidence: float = 0.7):
        """
        Initialize strategy.

        Parameters:
        -----------
        sentiment_threshold : float
            Minimum sentiment score for signal
        min_articles : int
            Minimum number of articles required
        min_confidence : float
            Minimum average confidence
        """
        self.sentiment_threshold = sentiment_threshold
        self.min_articles = min_articles
        self.min_confidence = min_confidence

    def generate_signal(self, sentiment_data: Dict,
                       price_data: pd.DataFrame) -> str:
        """
        Generate trading signal from sentiment.

        Parameters:
        -----------
        sentiment_data : Dict
            Aggregated sentiment
        price_data : pd.DataFrame
            Recent price data

        Returns:
        --------
        str : Signal (buy/sell/hold)
        """
        # Check minimum requirements
        if sentiment_data['count'] < self.min_articles:
            return 'hold'

        if sentiment_data['avg_confidence'] < self.min_confidence:
            return 'hold'

        score = sentiment_data['score']

        # Generate signal
        if score > self.sentiment_threshold:
            # Positive sentiment - check if not already overbought
            rsi = self._calculate_rsi(price_data)
            if rsi < 70:
                return 'buy'

        elif score < -self.sentiment_threshold:
            # Negative sentiment - check if not already oversold
            rsi = self._calculate_rsi(price_data)
            if rsi > 30:
                return 'sell'

        return 'hold'

    def _calculate_rsi(self, data: pd.DataFrame, period: int = 14) -> float:
        """Calculate RSI."""
        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.iloc[-1]
```

## Combining Sentiment with Technical Analysis

```python
class HybridStrategy:
    """
    Combines sentiment and technical analysis.
    """

    def __init__(self):
        self.sentiment_weight = 0.4
        self.technical_weight = 0.6

    def generate_signal(self,
                       sentiment_score: float,
                       technical_score: float) -> Dict:
        """
        Generate combined signal.

        Parameters:
        -----------
        sentiment_score : float
            Sentiment score (-1 to 1)
        technical_score : float
            Technical score (-1 to 1)

        Returns:
        --------
        Dict : Combined signal
        """
        # Weighted combination
        combined_score = (
            sentiment_score * self.sentiment_weight +
            technical_score * self.technical_weight
        )

        # Determine signal
        if combined_score > 0.3:
            signal = 'buy'
            strength = min(combined_score, 1.0)
        elif combined_score < -0.3:
            signal = 'sell'
            strength = min(abs(combined_score), 1.0)
        else:
            signal = 'hold'
            strength = 0

        return {
            'signal': signal,
            'strength': strength,
            'sentiment_score': sentiment_score,
            'technical_score': technical_score,
            'combined_score': combined_score
        }
```

## Sentiment Signal Evaluation

```python
class SentimentEvaluator:
    """
    Evaluates quality of sentiment signals.
    """

    def evaluate_predictive_power(self,
                                  sentiments: pd.DataFrame,
                                  returns: pd.Series,
                                  horizon: int = 1) -> Dict:
        """
        Evaluate predictive power of sentiment.

        Parameters:
        -----------
        sentiments : pd.DataFrame
            Sentiment data with timestamps
        returns : pd.Series
            Price returns
        horizon : int
            Prediction horizon in days

        Returns:
        --------
        Dict : Evaluation metrics
        """
        # Align sentiment with future returns
        aligned_data = []

        for idx, row in sentiments.iterrows():
            timestamp = row['timestamp']

            # Get future return
            future_date = timestamp + timedelta(days=horizon)

            if future_date in returns.index:
                future_return = returns[future_date]

                aligned_data.append({
                    'sentiment_score': row['score'],
                    'future_return': future_return,
                    'correct_direction': (
                        (row['score'] > 0 and future_return > 0) or
                        (row['score'] < 0 and future_return < 0)
                    )
                })

        if not aligned_data:
            return {}

        df = pd.DataFrame(aligned_data)

        # Calculate metrics
        accuracy = df['correct_direction'].mean()

        # Correlation
        correlation = df['sentiment_score'].corr(df['future_return'])

        # Information coefficient
        ic = df.groupby(df.index // 20).apply(
            lambda x: x['sentiment_score'].corr(x['future_return'])
        ).mean()

        return {
            'accuracy': accuracy,
            'correlation': correlation,
            'information_coefficient': ic,
            'sample_size': len(df)
        }
```

## Best Practices

1. **Multiple Sources**: Don't rely on single news source
2. **Quality Over Quantity**: Filter low-quality content
3. **Timeliness**: Process news quickly
4. **Context Matters**: Consider broader market context
5. **Combine Signals**: Use with technical analysis
6. **Validate Continuously**: Monitor signal quality
7. **Handle Noise**: Filter out irrelevant news

## Exercises

### Exercise 1: News Collector

Build a news collector that:
- Fetches news from multiple sources
- Filters by relevance
- Deduplicates articles
- Stores in database

### Exercise 2: Sentiment Analysis

Implement sentiment analysis using:
- Pre-trained models (FinBERT)
- LLM API (GPT-4, Claude)
- Compare results

### Exercise 3: Trading Strategy

Create a sentiment-based strategy:
- Collect news for S&P 500 stocks
- Analyze sentiment
- Generate signals
- Backtest performance

### Exercise 4: Signal Evaluation

Evaluate sentiment signals:
- Predictive power
- Lead time
- Optimal thresholds
- Combination with technicals

## Summary

Sentiment analysis for trading requires:

- **Data Collection**: Multiple news sources
- **Analysis**: LLMs for understanding
- **Signal Generation**: Convert sentiment to trades
- **Validation**: Measure predictive power
- **Integration**: Combine with other signals

Sentiment can provide edge but:
- Requires fast processing
- Quality varies significantly
- Must be validated continuously
- Works best combined with other signals

## Next Steps

In the next lesson, we'll explore multi-asset strategies that trade across different asset classes and markets.