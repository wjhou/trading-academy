# 第7.2课：数据管理

## 学习目标

在本课结束时，您将能够：
- 为交易设计高效的数据存储系统
- 有效处理实时和历史数据
- 清洗和验证市场数据
- 管理公司行为和数据调整
- 实施数据备份和恢复策略

## 简介

数据是任何交易系统的基础。数据质量差会导致错误决策，而高效的数据管理则能实现快速、可靠的交易。本课涵盖自动化交易系统管理市场数据的基本方面。

## 数据存储架构

### 1. 时间序列数据库

针对时间戳数据进行优化：

```python
import pandas as pd
import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
import numpy as np

class TimeSeriesDB:
    """
    市场数据的时间序列数据库。
    """

    def __init__(self, db_path: str):
        """
        初始化数据库。

        Parameters:
        -----------
        db_path : str
            SQLite数据库路径
        """
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self._create_tables()

    def _create_tables(self):
        """创建数据库表。"""
        cursor = self.conn.cursor()

        # OHLCV数据表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ohlcv (
                symbol TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                open REAL NOT NULL,
                high REAL NOT NULL,
                low REAL NOT NULL,
                close REAL NOT NULL,
                volume INTEGER NOT NULL,
                PRIMARY KEY (symbol, timestamp)
            )
        """)

        # 创建索引以加快查询速度
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_symbol_timestamp
            ON ohlcv (symbol, timestamp)
        """)

        # Tick数据表
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ticks (
                symbol TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                price REAL NOT NULL,
                volume INTEGER NOT NULL,
                bid REAL,
                ask REAL
            )
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_ticks_symbol_timestamp
            ON ticks (symbol, timestamp)
        """)

        self.conn.commit()

    def insert_ohlcv(self, symbol: str, data: pd.DataFrame):
        """
        插入OHLCV数据。

        Parameters:
        -----------
        symbol : str
            股票代码
        data : pd.DataFrame
            带有datetime索引的OHLCV数据
        """
        records = []
        for timestamp, row in data.iterrows():
            records.append((
                symbol,
                int(timestamp.timestamp()),
                float(row['Open']),
                float(row['High']),
                float(row['Low']),
                float(row['Close']),
                int(row['Volume'])
            ))

        cursor = self.conn.cursor()
        cursor.executemany("""
            INSERT OR REPLACE INTO ohlcv
            (symbol, timestamp, open, high, low, close, volume)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, records)

        self.conn.commit()
        print(f"为{symbol}插入了{len(records)}条K线数据")

    def get_ohlcv(self,
                  symbol: str,
                  start_date: Optional[datetime] = None,
                  end_date: Optional[datetime] = None) -> pd.DataFrame:
        """
        检索OHLCV数据。

        Parameters:
        -----------
        symbol : str
            股票代码
        start_date : datetime, optional
            开始日期
        end_date : datetime, optional
            结束日期

        Returns:
        --------
        pd.DataFrame : OHLCV数据
        """
        query = "SELECT * FROM ohlcv WHERE symbol = ?"
        params = [symbol]

        if start_date:
            query += " AND timestamp >= ?"
            params.append(int(start_date.timestamp()))

        if end_date:
            query += " AND timestamp <= ?"
            params.append(int(end_date.timestamp()))

        query += " ORDER BY timestamp"

        df = pd.read_sql_query(query, self.conn, params=params)

        if len(df) == 0:
            return pd.DataFrame()

        # 将时间戳转换为datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
        df.set_index('timestamp', inplace=True)

        return df[['open', 'high', 'low', 'close', 'volume']]

    def insert_tick(self, symbol: str, timestamp: datetime,
                   price: float, volume: int,
                   bid: Optional[float] = None,
                   ask: Optional[float] = None):
        """
        插入tick数据。

        Parameters:
        -----------
        symbol : str
            股票代码
        timestamp : datetime
            Tick时间戳
        price : float
            成交价格
        volume : int
            成交量
        bid : float, optional
            买价
        ask : float, optional
            卖价
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO ticks (symbol, timestamp, price, volume, bid, ask)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (symbol, int(timestamp.timestamp()), price, volume, bid, ask))

        self.conn.commit()

    def get_latest_bar(self, symbol: str) -> Optional[pd.Series]:
        """
        获取某个代码的最新K线。

        Parameters:
        -----------
        symbol : str
            股票代码

        Returns:
        --------
        pd.Series : 最新K线或None
        """
        query = """
            SELECT * FROM ohlcv
            WHERE symbol = ?
            ORDER BY timestamp DESC
            LIMIT 1
        """

        df = pd.read_sql_query(query, self.conn, params=[symbol])

        if len(df) == 0:
            return None

        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
        return df.iloc[0]

    def close(self):
        """关闭数据库连接。"""
        self.conn.close()
```

### 2. 内存缓存

快速访问最近的数据：

```python
from collections import deque
from threading import Lock

class DataCache:
    """
    最近市场数据的内存缓存。
    """

    def __init__(self, max_bars: int = 1000):
        """
        初始化缓存。

        Parameters:
        -----------
        max_bars : int
            内存中保留的最大K线数
        """
        self.max_bars = max_bars
        self.cache: Dict[str, deque] = {}
        self.lock = Lock()

    def add_bar(self, symbol: str, bar: Dict):
        """
        向缓存添加K线。

        Parameters:
        -----------
        symbol : str
            股票代码
        bar : Dict
            K线数据
        """
        with self.lock:
            if symbol not in self.cache:
                self.cache[symbol] = deque(maxlen=self.max_bars)

            self.cache[symbol].append(bar)

    def get_bars(self, symbol: str, n: int = None) -> List[Dict]:
        """
        从缓存获取最近的K线。

        Parameters:
        -----------
        symbol : str
            股票代码
        n : int, optional
            要检索的K线数量

        Returns:
        --------
        List[Dict] : 最近的K线
        """
        with self.lock:
            if symbol not in self.cache:
                return []

            bars = list(self.cache[symbol])

            if n is not None:
                bars = bars[-n:]

            return bars

    def get_latest_bar(self, symbol: str) -> Optional[Dict]:
        """
        从缓存获取最新K线。

        Parameters:
        -----------
        symbol : str
            股票代码

        Returns:
        --------
        Dict : 最新K线或None
        """
        with self.lock:
            if symbol not in self.cache or len(self.cache[symbol]) == 0:
                return None

            return self.cache[symbol][-1]

    def clear(self, symbol: str = None):
        """
        清除缓存。

        Parameters:
        -----------
        symbol : str, optional
            要清除的代码（如果为None，清除全部）
        """
        with self.lock:
            if symbol:
                if symbol in self.cache:
                    self.cache[symbol].clear()
            else:
                self.cache.clear()
```

## 数据质量管理

### 1. 数据验证

验证传入的数据：

```python
class DataValidator:
    """
    验证市场数据质量。
    """

    def __init__(self):
        self.validation_errors = []

    def validate_bar(self, bar: Dict) -> bool:
        """
        验证单个K线。

        Parameters:
        -----------
        bar : Dict
            K线数据

        Returns:
        --------
        bool : 如果有效则为True
        """
        errors = []

        # 检查必需字段
        required_fields = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        for field in required_fields:
            if field not in bar:
                errors.append(f"缺少字段: {field}")

        if errors:
            self.validation_errors.extend(errors)
            return False

        # 检查价格关系
        if bar['high'] < bar['low']:
            errors.append(f"最高价 ({bar['high']}) < 最低价 ({bar['low']})")

        if bar['high'] < bar['open'] or bar['high'] < bar['close']:
            errors.append(f"最高价 ({bar['high']}) < 开盘价/收盘价")

        if bar['low'] > bar['open'] or bar['low'] > bar['close']:
            errors.append(f"最低价 ({bar['low']}) > 开盘价/收盘价")

        # 检查负值
        if any(bar[field] < 0 for field in ['open', 'high', 'low', 'close']):
            errors.append("检测到负价格")

        if bar['volume'] < 0:
            errors.append("检测到负成交量")

        # 检查零价格
        if any(bar[field] == 0 for field in ['open', 'high', 'low', 'close']):
            errors.append("检测到零价格")

        if errors:
            self.validation_errors.extend(errors)
            return False

        return True

    def validate_series(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        验证一系列K线并删除无效的。

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV数据

        Returns:
        --------
        pd.DataFrame : 清洗后的数据
        """
        valid_indices = []

        for idx, row in data.iterrows():
            bar = {
                'timestamp': idx,
                'open': row['Open'],
                'high': row['High'],
                'low': row['Low'],
                'close': row['Close'],
                'volume': row['Volume']
            }

            if self.validate_bar(bar):
                valid_indices.append(idx)

        if len(valid_indices) < len(data):
            print(f"删除了{len(data) - len(valid_indices)}条无效K线")

        return data.loc[valid_indices]

    def detect_outliers(self, data: pd.DataFrame,
                       column: str = 'Close',
                       threshold: float = 3.0) -> pd.DataFrame:
        """
        使用z-score方法检测异常值。

        Parameters:
        -----------
        data : pd.DataFrame
            价格数据
        column : str
            要检查的列
        threshold : float
            Z-score阈值

        Returns:
        --------
        pd.DataFrame : 标记了异常值的数据
        """
        returns = data[column].pct_change()
        z_scores = np.abs((returns - returns.mean()) / returns.std())

        data['is_outlier'] = z_scores > threshold

        num_outliers = data['is_outlier'].sum()
        if num_outliers > 0:
            print(f"在{column}中检测到{num_outliers}个异常值")

        return data
```

### 2. 数据清洗

清洗和规范化数据：

```python
class DataCleaner:
    """
    清洗和规范化市场数据。
    """

    def fill_missing_bars(self, data: pd.DataFrame,
                         freq: str = '1D') -> pd.DataFrame:
        """
        用前向填充填补缺失的K线。

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV数据
        freq : str
            频率（例如，'1D'表示日线）

        Returns:
        --------
        pd.DataFrame : 填补了缺口的数据
        """
        # 创建完整的日期范围
        full_range = pd.date_range(
            start=data.index.min(),
            end=data.index.max(),
            freq=freq
        )

        # 重新索引并前向填充
        data = data.reindex(full_range)
        data = data.fillna(method='ffill')

        # 对于成交量，使用0而不是前向填充
        if 'Volume' in data.columns:
            data['Volume'] = data['Volume'].fillna(0)

        return data

    def remove_duplicates(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        删除重复的时间戳。

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV数据

        Returns:
        --------
        pd.DataFrame : 没有重复的数据
        """
        duplicates = data.index.duplicated(keep='first')
        num_duplicates = duplicates.sum()

        if num_duplicates > 0:
            print(f"删除{num_duplicates}条重复K线")
            data = data[~duplicates]

        return data

    def adjust_for_splits(self, data: pd.DataFrame,
                         split_date: datetime,
                         split_ratio: float) -> pd.DataFrame:
        """
        调整股票拆分的价格。

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV数据
        split_date : datetime
            拆分日期
        split_ratio : float
            拆分比例（例如，2.0表示1拆2）

        Returns:
        --------
        pd.DataFrame : 调整后的数据
        """
        # 调整拆分日期之前的价格
        mask = data.index < split_date

        data.loc[mask, 'Open'] /= split_ratio
        data.loc[mask, 'High'] /= split_ratio
        data.loc[mask, 'Low'] /= split_ratio
        data.loc[mask, 'Close'] /= split_ratio
        data.loc[mask, 'Volume'] *= split_ratio

        print(f"已调整{split_date.date()}的{split_ratio}:1拆分")

        return data

    def adjust_for_dividends(self, data: pd.DataFrame,
                            ex_date: datetime,
                            dividend: float) -> pd.DataFrame:
        """
        调整股息的价格。

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV数据
        ex_date : datetime
            除息日
        dividend : float
            股息金额

        Returns:
        --------
        pd.DataFrame : 调整后的数据
        """
        # 获取除息日前一天的收盘价
        pre_ex_close = data.loc[data.index < ex_date, 'Close'].iloc[-1]

        # 计算调整因子
        adjustment_factor = (pre_ex_close - dividend) / pre_ex_close

        # 调整除息日之前的价格
        mask = data.index < ex_date

        data.loc[mask, 'Open'] *= adjustment_factor
        data.loc[mask, 'High'] *= adjustment_factor
        data.loc[mask, 'Low'] *= adjustment_factor
        data.loc[mask, 'Close'] *= adjustment_factor

        print(f"已调整{ex_date.date()}的${dividend}股息")

        return data
```

## 实时数据管理

### 数据源管理器

协调多个数据源：

```python
class DataFeedManager:
    """
    管理多个数据源并确保数据一致性。
    """

    def __init__(self, db: TimeSeriesDB, cache: DataCache):
        """
        初始化管理器。

        Parameters:
        -----------
        db : TimeSeriesDB
            用于持久存储的数据库
        cache : DataCache
            内存缓存
        """
        self.db = db
        self.cache = cache
        self.validator = DataValidator()
        self.cleaner = DataCleaner()

        self.feeds = []
        self.subscribers = []

    def add_feed(self, feed):
        """添加数据源。"""
        feed.subscribe(self.on_data)
        self.feeds.append(feed)

    def subscribe(self, callback):
        """订阅处理后的数据。"""
        self.subscribers.append(callback)

    def on_data(self, raw_data: Dict):
        """
        处理传入的数据。

        Parameters:
        -----------
        raw_data : Dict
            来自数据源的原始数据
        """
        try:
            # 验证数据
            if not self.validator.validate_bar(raw_data):
                print(f"无效数据: {self.validator.validation_errors}")
                return

            # 添加到缓存
            symbol = raw_data.get('symbol', 'UNKNOWN')
            self.cache.add_bar(symbol, raw_data)

            # 持久化到数据库（生产环境中为异步）
            self._persist_data(symbol, raw_data)

            # 通知订阅者
            for callback in self.subscribers:
                try:
                    callback(raw_data)
                except Exception as e:
                    print(f"通知订阅者时出错: {e}")

        except Exception as e:
            print(f"处理数据时出错: {e}")

    def _persist_data(self, symbol: str, data: Dict):
        """将数据持久化到数据库。"""
        try:
            # 转换为DataFrame
            df = pd.DataFrame([{
                'Open': data['open'],
                'High': data['high'],
                'Low': data['low'],
                'Close': data['close'],
                'Volume': data['volume']
            }], index=[data['timestamp']])

            # 插入到数据库
            self.db.insert_ohlcv(symbol, df)

        except Exception as e:
            print(f"持久化数据时出错: {e}")

    def get_historical_data(self, symbol: str,
                           start_date: datetime,
                           end_date: datetime) -> pd.DataFrame:
        """
        获取历史数据（从缓存或数据库）。

        Parameters:
        -----------
        symbol : str
            股票代码
        start_date : datetime
            开始日期
        end_date : datetime
            结束日期

        Returns:
        --------
        pd.DataFrame : 历史数据
        """
        # 首先尝试缓存以获取最近的数据
        cached_bars = self.cache.get_bars(symbol)

        if cached_bars:
            # 检查缓存是否覆盖请求的范围
            cache_start = cached_bars[0]['timestamp']
            if cache_start <= start_date:
                # 使用缓存
                df = pd.DataFrame(cached_bars)
                df.set_index('timestamp', inplace=True)
                return df[(df.index >= start_date) & (df.index <= end_date)]

        # 回退到数据库
        return self.db.get_ohlcv(symbol, start_date, end_date)
```

## 数据备份和恢复

### 备份策略

```python
import shutil
import gzip
from pathlib import Path

class DataBackupManager:
    """
    管理数据备份和恢复。
    """

    def __init__(self, db_path: str, backup_dir: str):
        """
        初始化备份管理器。

        Parameters:
        -----------
        db_path : str
            数据库路径
        backup_dir : str
            备份目录
        """
        self.db_path = db_path
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def create_backup(self, compress: bool = True) -> str:
        """
        创建数据库备份。

        Parameters:
        -----------
        compress : bool
            是否压缩备份

        Returns:
        --------
        str : 备份文件路径
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"backup_{timestamp}.db"

        if compress:
            backup_name += ".gz"

        backup_path = self.backup_dir / backup_name

        try:
            if compress:
                # 压缩备份
                with open(self.db_path, 'rb') as f_in:
                    with gzip.open(backup_path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
            else:
                # 简单复制
                shutil.copy2(self.db_path, backup_path)

            print(f"备份已创建: {backup_path}")
            return str(backup_path)

        except Exception as e:
            print(f"备份失败: {e}")
            return None

    def restore_backup(self, backup_path: str) -> bool:
        """
        从备份恢复。

        Parameters:
        -----------
        backup_path : str
            备份文件路径

        Returns:
        --------
        bool : 如果成功则为True
        """
        try:
            backup_path = Path(backup_path)

            if backup_path.suffix == '.gz':
                # 解压缩
                with gzip.open(backup_path, 'rb') as f_in:
                    with open(self.db_path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
            else:
                # 简单复制
                shutil.copy2(backup_path, self.db_path)

            print(f"已从以下位置恢复: {backup_path}")
            return True

        except Exception as e:
            print(f"恢复失败: {e}")
            return False

    def cleanup_old_backups(self, keep_days: int = 30):
        """
        删除旧备份。

        Parameters:
        -----------
        keep_days : int
            保留备份的天数
        """
        cutoff_date = datetime.now() - pd.Timedelta(days=keep_days)

        for backup_file in self.backup_dir.glob("backup_*.db*"):
            if backup_file.stat().st_mtime < cutoff_date.timestamp():
                backup_file.unlink()
                print(f"已删除旧备份: {backup_file}")
```

## 最佳实践

1. **使用适当的存储**：时间序列数据库用于历史数据，缓存用于实时数据
2. **验证一切**：检查所有传入的数据
3. **处理公司行为**：调整拆分和股息
4. **定期备份**：自动化每日备份
5. **监控数据质量**：跟踪验证错误
6. **优化查询**：使用索引并限制数据检索
7. **处理缺失数据**：适当地前向填充或插值
8. **版本数据**：跟踪数据源和版本

## 练习

### 练习1：数据库实现

实现一个完整的时间序列数据库，包括：
- OHLCV存储
- Tick数据存储
- 高效查询
- 数据验证

### 练习2：数据清洗管道

创建一个数据清洗管道，包括：
- 验证传入数据
- 删除异常值
- 填补缺失的K线
- 调整公司行为

### 练习3：实时数据源

实现一个实时数据源，包括：
- 连接到数据提供商
- 验证数据
- 更新缓存和数据库
- 处理连接失败

### 练习4：备份系统

构建一个自动化备份系统，包括：
- 创建每日备份
- 压缩旧备份
- 删除超过30天的备份
- 测试恢复功能

## 总结

有效的数据管理需要：

- **存储**：时间序列数据库 + 内存缓存
- **验证**：检查所有传入数据
- **清洗**：处理缺失数据和异常值
- **公司行为**：调整拆分和股息
- **备份**：定期自动化备份
- **监控**：跟踪数据质量指标

良好的数据管理确保：
- 快速访问最近的数据
- 可靠的历史数据
- 数据完整性
- 系统弹性

## 下一步

在下一课中，我们将详细探讨订单执行，包括订单类型、执行算法以及处理部分成交和拒单。
