# 第8.2课：使用LLM进行情绪分析

## 学习目标

在本课结束时，您将能够：
- 从新闻和社交媒体中提取情绪
- 使用LLM进行金融文本分析
- 将情绪信号整合到交易策略中
- 构建基于新闻的交易系统
- 评估情绪信号质量

## 简介

情绪分析使用自然语言处理来衡量来自新闻、社交媒体和其他文本来源的市场情绪。现代LLM为理解金融文本和提取可操作信号提供了强大的工具。

## 新闻数据收集

```python
import requests
from datetime import datetime, timedelta
from typing import List, Dict
import pandas as pd

class NewsCollector:
    """
    从各种来源收集金融新闻。
    """

    def __init__(self, api_key: str = None):
        """
        初始化新闻收集器。

        参数：
        -----------
        api_key : str, optional
            新闻服务的API密钥
        """
        self.api_key = api_key

    def get_news(self, symbol: str, days: int = 7) -> List[Dict]:
        """
        获取股票代码的最新新闻。

        参数：
        -----------
        symbol : str
            股票代码
        days : int
            回溯天数

        返回：
        --------
        List[Dict] : 新闻文章
        """
        # 占位符 - 使用实际新闻API实现
        # 示例：NewsAPI、Alpha Vantage、Finnhub

        articles = []

        # 示例结构
        article = {
            'title': '公司宣布强劲盈利',
            'description': '第四季度盈利超预期...',
            'source': 'Reuters',
            'published_at': datetime.now(),
            'url': 'https://example.com/article',
            'symbol': symbol
        }

        articles.append(article)

        return articles

    def get_social_sentiment(self, symbol: str) -> Dict:
        """
        获取社交媒体情绪。

        参数：
        -----------
        symbol : str
            股票代码

        返回：
        --------
        Dict : 情绪指标
        """
        # 占位符 - 使用Twitter API、Reddit API等实现

        return {
            'symbol': symbol,
            'mentions': 1000,
            'positive_ratio': 0.65,
            'negative_ratio': 0.20,
            'neutral_ratio': 0.15,
            'sentiment_score': 0.45  # -1到1
        }
```

## 使用LLM进行情绪分析

```python
class LLMSentimentAnalyzer:
    """
    使用LLM分析情绪。
    """

    def __init__(self, model: str = "gpt-3.5-turbo"):
        """
        初始化情绪分析器。

        参数：
        -----------
        model : str
            要使用的LLM模型
        """
        self.model = model

    def analyze_text(self, text: str, symbol: str = None) -> Dict:
        """
        分析文本的情绪。

        参数：
        -----------
        text : str
            要分析的文本
        symbol : str, optional
            相关股票代码

        返回：
        --------
        Dict : 情绪分析
        """
        # 构建提示
        prompt = f"""分析这条金融新闻的情绪以用于交易目的。

文本：{text}
{f'股票代码：{symbol}' if symbol else ''}

提供：
1. 整体情绪（积极/消极/中性）
2. 情绪分数（-1到1）
3. 提到的关键主题
4. 潜在市场影响（看涨/看跌/中性）
5. 置信水平（0-1）

格式为JSON。"""

        # 调用LLM（占位符 - 使用实际API实现）
        # 示例：OpenAI API、Anthropic API等

        # 模拟响应
        response = {
            'sentiment': 'positive',
            'score': 0.7,
            'topics': ['盈利', '收入增长', '指引'],
            'market_impact': 'bullish',
            'confidence': 0.85,
            'reasoning': '强劲的盈利超预期，指引积极'
        }

        return response

    def analyze_batch(self, articles: List[Dict]) -> pd.DataFrame:
        """
        分析多篇文章的情绪。

        参数：
        -----------
        articles : List[Dict]
            新闻文章

        返回：
        --------
        pd.DataFrame : 情绪分析结果
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
        在时间窗口内聚合情绪。

        参数：
        -----------
        sentiments : pd.DataFrame
            情绪数据
        window_hours : int
            时间窗口（小时）

        返回：
        --------
        Dict : 聚合情绪
        """
        cutoff = datetime.now() - timedelta(hours=window_hours)
        recent = sentiments[sentiments['timestamp'] >= cutoff]

        if len(recent) == 0:
            return {'score': 0, 'count': 0}

        # 按置信度加权平均
        weighted_score = (recent['score'] * recent['confidence']).sum() / recent['confidence'].sum()

        # 按情绪类型计数
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

## 基于情绪的交易策略

```python
class SentimentTradingStrategy:
    """
    基于情绪分析的交易策略。
    """

    def __init__(self,
                 sentiment_threshold: float = 0.3,
                 min_articles: int = 3,
                 min_confidence: float = 0.7):
        """
        初始化策略。

        参数：
        -----------
        sentiment_threshold : float
            信号的最小情绪分数
        min_articles : int
            所需的最少文章数
        min_confidence : float
            最小平均置信度
        """
        self.sentiment_threshold = sentiment_threshold
        self.min_articles = min_articles
        self.min_confidence = min_confidence

    def generate_signal(self, sentiment_data: Dict,
                       price_data: pd.DataFrame) -> str:
        """
        从情绪生成交易信号。

        参数：
        -----------
        sentiment_data : Dict
            聚合情绪
        price_data : pd.DataFrame
            最近的价格数据

        返回：
        --------
        str : 信号（买入/卖出/持有）
        """
        # 检查最低要求
        if sentiment_data['count'] < self.min_articles:
            return 'hold'

        if sentiment_data['avg_confidence'] < self.min_confidence:
            return 'hold'

        score = sentiment_data['score']

        # 生成信号
        if score > self.sentiment_threshold:
            # 积极情绪 - 检查是否已经超买
            rsi = self._calculate_rsi(price_data)
            if rsi < 70:
                return 'buy'

        elif score < -self.sentiment_threshold:
            # 消极情绪 - 检查是否已经超卖
            rsi = self._calculate_rsi(price_data)
            if rsi > 30:
                return 'sell'

        return 'hold'

    def _calculate_rsi(self, data: pd.DataFrame, period: int = 14) -> float:
        """计算RSI。"""
        delta = data['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.iloc[-1]
```

## 结合情绪与技术分析

```python
class HybridStrategy:
    """
    结合情绪和技术分析。
    """

    def __init__(self):
        self.sentiment_weight = 0.4
        self.technical_weight = 0.6

    def generate_signal(self,
                       sentiment_score: float,
                       technical_score: float) -> Dict:
        """
        生成组合信号。

        参数：
        -----------
        sentiment_score : float
            情绪分数（-1到1）
        technical_score : float
            技术分数（-1到1）

        返回：
        --------
        Dict : 组合信号
        """
        # 加权组合
        combined_score = (
            sentiment_score * self.sentiment_weight +
            technical_score * self.technical_weight
        )

        # 确定信号
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

## 情绪信号评估

```python
class SentimentEvaluator:
    """
    评估情绪信号的质量。
    """

    def evaluate_predictive_power(self,
                                  sentiments: pd.DataFrame,
                                  returns: pd.Series,
                                  horizon: int = 1) -> Dict:
        """
        评估情绪的预测能力。

        参数：
        -----------
        sentiments : pd.DataFrame
            带时间戳的情绪数据
        returns : pd.Series
            价格收益
        horizon : int
            预测时间范围（天）

        返回：
        --------
        Dict : 评估指标
        """
        # 将情绪与未来收益对齐
        aligned_data = []

        for idx, row in sentiments.iterrows():
            timestamp = row['timestamp']

            # 获取未来收益
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

        # 计算指标
        accuracy = df['correct_direction'].mean()

        # 相关性
        correlation = df['sentiment_score'].corr(df['future_return'])

        # 信息系数
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

## 最佳实践

1. **多个来源**：不要依赖单一新闻来源
2. **质量优于数量**：过滤低质量内容
3. **及时性**：快速处理新闻
4. **上下文很重要**：考虑更广泛的市场背景
5. **组合信号**：与技术分析结合使用
6. **持续验证**：监控信号质量
7. **处理噪音**：过滤掉不相关的新闻

## 练习

### 练习1：新闻收集器

构建一个新闻收集器：
- 从多个来源获取新闻
- 按相关性过滤
- 去重文章
- 存储在数据库中

### 练习2：情绪分析

使用以下方法实现情绪分析：
- 预训练模型（FinBERT）
- LLM API（GPT-4、Claude）
- 比较结果

### 练习3：交易策略

创建基于情绪的策略：
- 收集标普500股票的新闻
- 分析情绪
- 生成信号
- 回测性能

### 练习4：信号评估

评估情绪信号：
- 预测能力
- 领先时间
- 最优阈值
- 与技术指标的组合

## 总结

交易的情绪分析需要：

- **数据收集**：多个新闻来源
- **分析**：使用LLM进行理解
- **信号生成**：将情绪转换为交易
- **验证**：衡量预测能力
- **整合**：与其他信号结合

情绪可以提供优势，但：
- 需要快速处理
- 质量差异很大
- 必须持续验证
- 与其他信号结合效果最佳

## 下一步

在下一课中，我们将探索跨不同资产类别和市场交易的多资产策略。
