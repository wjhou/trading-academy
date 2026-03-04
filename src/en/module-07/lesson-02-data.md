# Lesson 7.2: Data Management

## Learning Objectives

By the end of this lesson, you will be able to:
- Design efficient data storage systems for trading
- Handle real-time and historical data effectively
- Clean and validate market data
- Manage corporate actions and data adjustments
- Implement data backup and recovery strategies

## Introduction

Data is the foundation of any trading system. Poor data quality leads to bad decisions, while efficient data management enables fast, reliable trading. This lesson covers the essential aspects of managing market data for automated trading systems.

## Data Storage Architecture

### 1. Time-Series Database

Optimized for time-stamped data:

```python
import pandas as pd
import sqlite3
from datetime import datetime
from typing import List, Dict, Optional
import numpy as np

class TimeSeriesDB:
    """
    Time-series database for market data.
    """

    def __init__(self, db_path: str):
        """
        Initialize database.

        Parameters:
        -----------
        db_path : str
            Path to SQLite database
        """
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self._create_tables()

    def _create_tables(self):
        """Create database tables."""
        cursor = self.conn.cursor()

        # OHLCV data table
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

        # Create index for faster queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_symbol_timestamp
            ON ohlcv (symbol, timestamp)
        """)

        # Tick data table
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
        Insert OHLCV data.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        data : pd.DataFrame
            OHLCV data with datetime index
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
        print(f"Inserted {len(records)} bars for {symbol}")

    def get_ohlcv(self,
                  symbol: str,
                  start_date: Optional[datetime] = None,
                  end_date: Optional[datetime] = None) -> pd.DataFrame:
        """
        Retrieve OHLCV data.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        start_date : datetime, optional
            Start date
        end_date : datetime, optional
            End date

        Returns:
        --------
        pd.DataFrame : OHLCV data
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

        # Convert timestamp to datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s')
        df.set_index('timestamp', inplace=True)

        return df[['open', 'high', 'low', 'close', 'volume']]

    def insert_tick(self, symbol: str, timestamp: datetime,
                   price: float, volume: int,
                   bid: Optional[float] = None,
                   ask: Optional[float] = None):
        """
        Insert tick data.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        timestamp : datetime
            Tick timestamp
        price : float
            Trade price
        volume : int
            Trade volume
        bid : float, optional
            Bid price
        ask : float, optional
            Ask price
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO ticks (symbol, timestamp, price, volume, bid, ask)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (symbol, int(timestamp.timestamp()), price, volume, bid, ask))

        self.conn.commit()

    def get_latest_bar(self, symbol: str) -> Optional[pd.Series]:
        """
        Get the latest bar for a symbol.

        Parameters:
        -----------
        symbol : str
            Stock symbol

        Returns:
        --------
        pd.Series : Latest bar or None
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
        """Close database connection."""
        self.conn.close()
```

### 2. In-Memory Cache

Fast access to recent data:

```python
from collections import deque
from threading import Lock

class DataCache:
    """
    In-memory cache for recent market data.
    """

    def __init__(self, max_bars: int = 1000):
        """
        Initialize cache.

        Parameters:
        -----------
        max_bars : int
            Maximum bars to keep in memory
        """
        self.max_bars = max_bars
        self.cache: Dict[str, deque] = {}
        self.lock = Lock()

    def add_bar(self, symbol: str, bar: Dict):
        """
        Add a bar to cache.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        bar : Dict
            Bar data
        """
        with self.lock:
            if symbol not in self.cache:
                self.cache[symbol] = deque(maxlen=self.max_bars)

            self.cache[symbol].append(bar)

    def get_bars(self, symbol: str, n: int = None) -> List[Dict]:
        """
        Get recent bars from cache.

        Parameters:
        -----------
        symbol : str
            Stock symbol
        n : int, optional
            Number of bars to retrieve

        Returns:
        --------
        List[Dict] : Recent bars
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
        Get latest bar from cache.

        Parameters:
        -----------
        symbol : str
            Stock symbol

        Returns:
        --------
        Dict : Latest bar or None
        """
        with self.lock:
            if symbol not in self.cache or len(self.cache[symbol]) == 0:
                return None

            return self.cache[symbol][-1]

    def clear(self, symbol: str = None):
        """
        Clear cache.

        Parameters:
        -----------
        symbol : str, optional
            Symbol to clear (if None, clear all)
        """
        with self.lock:
            if symbol:
                if symbol in self.cache:
                    self.cache[symbol].clear()
            else:
                self.cache.clear()
```

## Data Quality Management

### 1. Data Validation

Validate incoming data:

```python
class DataValidator:
    """
    Validates market data quality.
    """

    def __init__(self):
        self.validation_errors = []

    def validate_bar(self, bar: Dict) -> bool:
        """
        Validate a single bar.

        Parameters:
        -----------
        bar : Dict
            Bar data

        Returns:
        --------
        bool : True if valid
        """
        errors = []

        # Check required fields
        required_fields = ['timestamp', 'open', 'high', 'low', 'close', 'volume']
        for field in required_fields:
            if field not in bar:
                errors.append(f"Missing field: {field}")

        if errors:
            self.validation_errors.extend(errors)
            return False

        # Check price relationships
        if bar['high'] < bar['low']:
            errors.append(f"High ({bar['high']}) < Low ({bar['low']})")

        if bar['high'] < bar['open'] or bar['high'] < bar['close']:
            errors.append(f"High ({bar['high']}) < Open/Close")

        if bar['low'] > bar['open'] or bar['low'] > bar['close']:
            errors.append(f"Low ({bar['low']}) > Open/Close")

        # Check for negative values
        if any(bar[field] < 0 for field in ['open', 'high', 'low', 'close']):
            errors.append("Negative price detected")

        if bar['volume'] < 0:
            errors.append("Negative volume detected")

        # Check for zero prices
        if any(bar[field] == 0 for field in ['open', 'high', 'low', 'close']):
            errors.append("Zero price detected")

        if errors:
            self.validation_errors.extend(errors)
            return False

        return True

    def validate_series(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Validate a series of bars and remove invalid ones.

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV data

        Returns:
        --------
        pd.DataFrame : Cleaned data
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
            print(f"Removed {len(data) - len(valid_indices)} invalid bars")

        return data.loc[valid_indices]

    def detect_outliers(self, data: pd.DataFrame,
                       column: str = 'Close',
                       threshold: float = 3.0) -> pd.DataFrame:
        """
        Detect outliers using z-score method.

        Parameters:
        -----------
        data : pd.DataFrame
            Price data
        column : str
            Column to check
        threshold : float
            Z-score threshold

        Returns:
        --------
        pd.DataFrame : Data with outliers marked
        """
        returns = data[column].pct_change()
        z_scores = np.abs((returns - returns.mean()) / returns.std())

        data['is_outlier'] = z_scores > threshold

        num_outliers = data['is_outlier'].sum()
        if num_outliers > 0:
            print(f"Detected {num_outliers} outliers in {column}")

        return data
```

### 2. Data Cleaning

Clean and normalize data:

```python
class DataCleaner:
    """
    Cleans and normalizes market data.
    """

    def fill_missing_bars(self, data: pd.DataFrame,
                         freq: str = '1D') -> pd.DataFrame:
        """
        Fill missing bars with forward fill.

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV data
        freq : str
            Frequency (e.g., '1D' for daily)

        Returns:
        --------
        pd.DataFrame : Data with filled gaps
        """
        # Create complete date range
        full_range = pd.date_range(
            start=data.index.min(),
            end=data.index.max(),
            freq=freq
        )

        # Reindex and forward fill
        data = data.reindex(full_range)
        data = data.fillna(method='ffill')

        # For volume, use 0 instead of forward fill
        if 'Volume' in data.columns:
            data['Volume'] = data['Volume'].fillna(0)

        return data

    def remove_duplicates(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Remove duplicate timestamps.

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV data

        Returns:
        --------
        pd.DataFrame : Data without duplicates
        """
        duplicates = data.index.duplicated(keep='first')
        num_duplicates = duplicates.sum()

        if num_duplicates > 0:
            print(f"Removing {num_duplicates} duplicate bars")
            data = data[~duplicates]

        return data

    def adjust_for_splits(self, data: pd.DataFrame,
                         split_date: datetime,
                         split_ratio: float) -> pd.DataFrame:
        """
        Adjust prices for stock splits.

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV data
        split_date : datetime
            Split date
        split_ratio : float
            Split ratio (e.g., 2.0 for 2-for-1 split)

        Returns:
        --------
        pd.DataFrame : Adjusted data
        """
        # Adjust prices before split date
        mask = data.index < split_date

        data.loc[mask, 'Open'] /= split_ratio
        data.loc[mask, 'High'] /= split_ratio
        data.loc[mask, 'Low'] /= split_ratio
        data.loc[mask, 'Close'] /= split_ratio
        data.loc[mask, 'Volume'] *= split_ratio

        print(f"Adjusted for {split_ratio}:1 split on {split_date.date()}")

        return data

    def adjust_for_dividends(self, data: pd.DataFrame,
                            ex_date: datetime,
                            dividend: float) -> pd.DataFrame:
        """
        Adjust prices for dividends.

        Parameters:
        -----------
        data : pd.DataFrame
            OHLCV data
        ex_date : datetime
            Ex-dividend date
        dividend : float
            Dividend amount

        Returns:
        --------
        pd.DataFrame : Adjusted data
        """
        # Get close price on day before ex-date
        pre_ex_close = data.loc[data.index < ex_date, 'Close'].iloc[-1]

        # Calculate adjustment factor
        adjustment_factor = (pre_ex_close - dividend) / pre_ex_close

        # Adjust prices before ex-date
        mask = data.index < ex_date

        data.loc[mask, 'Open'] *= adjustment_factor
        data.loc[mask, 'High'] *= adjustment_factor
        data.loc[mask, 'Low'] *= adjustment_factor
        data.loc[mask, 'Close'] *= adjustment_factor

        print(f"Adjusted for ${dividend} dividend on {ex_date.date()}")

        return data
```

## Real-Time Data Management

### Data Feed Manager

Coordinate multiple data sources:

```python
class DataFeedManager:
    """
    Manages multiple data feeds and ensures data consistency.
    """

    def __init__(self, db: TimeSeriesDB, cache: DataCache):
        """
        Initialize manager.

        Parameters:
        -----------
        db : TimeSeriesDB
            Database for persistent storage
        cache : DataCache
            In-memory cache
        """
        self.db = db
        self.cache = cache
        self.validator = DataValidator()
        self.cleaner = DataCleaner()

        self.feeds = []
        self.subscribers = []

    def add_feed(self, feed):
        """Add a data feed."""
        feed.subscribe(self.on_data)
        self.feeds.append(feed)

    def subscribe(self, callback):
        """Subscribe to processed data."""
        self.subscribers.append(callback)

    def on_data(self, raw_data: Dict):
        """
        Process incoming data.

        Parameters:
        -----------
        raw_data : Dict
            Raw data from feed
        """
        try:
            # Validate data
            if not self.validator.validate_bar(raw_data):
                print(f"Invalid data: {self.validator.validation_errors}")
                return

            # Add to cache
            symbol = raw_data.get('symbol', 'UNKNOWN')
            self.cache.add_bar(symbol, raw_data)

            # Persist to database (async in production)
            self._persist_data(symbol, raw_data)

            # Notify subscribers
            for callback in self.subscribers:
                try:
                    callback(raw_data)
                except Exception as e:
                    print(f"Error notifying subscriber: {e}")

        except Exception as e:
            print(f"Error processing data: {e}")

    def _persist_data(self, symbol: str, data: Dict):
        """Persist data to database."""
        try:
            # Convert to DataFrame
            df = pd.DataFrame([{
                'Open': data['open'],
                'High': data['high'],
                'Low': data['low'],
                'Close': data['close'],
                'Volume': data['volume']
            }], index=[data['timestamp']])

            # Insert to database
            self.db.insert_ohlcv(symbol, df)

        except Exception as e:
            print(f"Error persisting data: {e}")

    def get_historical_data(self, symbol: str,
                           start_date: datetime,
                           end_date: datetime) -> pd.DataFrame:
        """
        Get historical data (from cache or database).

        Parameters:
        -----------
        symbol : str
            Stock symbol
        start_date : datetime
            Start date
        end_date : datetime
            End date

        Returns:
        --------
        pd.DataFrame : Historical data
        """
        # Try cache first for recent data
        cached_bars = self.cache.get_bars(symbol)

        if cached_bars:
            # Check if cache covers requested range
            cache_start = cached_bars[0]['timestamp']
            if cache_start <= start_date:
                # Use cache
                df = pd.DataFrame(cached_bars)
                df.set_index('timestamp', inplace=True)
                return df[(df.index >= start_date) & (df.index <= end_date)]

        # Fall back to database
        return self.db.get_ohlcv(symbol, start_date, end_date)
```

## Data Backup and Recovery

### Backup Strategy

```python
import shutil
import gzip
from pathlib import Path

class DataBackupManager:
    """
    Manages data backups and recovery.
    """

    def __init__(self, db_path: str, backup_dir: str):
        """
        Initialize backup manager.

        Parameters:
        -----------
        db_path : str
            Path to database
        backup_dir : str
            Backup directory
        """
        self.db_path = db_path
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def create_backup(self, compress: bool = True) -> str:
        """
        Create database backup.

        Parameters:
        -----------
        compress : bool
            Whether to compress backup

        Returns:
        --------
        str : Backup file path
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"backup_{timestamp}.db"

        if compress:
            backup_name += ".gz"

        backup_path = self.backup_dir / backup_name

        try:
            if compress:
                # Compress backup
                with open(self.db_path, 'rb') as f_in:
                    with gzip.open(backup_path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
            else:
                # Simple copy
                shutil.copy2(self.db_path, backup_path)

            print(f"Backup created: {backup_path}")
            return str(backup_path)

        except Exception as e:
            print(f"Backup failed: {e}")
            return None

    def restore_backup(self, backup_path: str) -> bool:
        """
        Restore from backup.

        Parameters:
        -----------
        backup_path : str
            Path to backup file

        Returns:
        --------
        bool : True if successful
        """
        try:
            backup_path = Path(backup_path)

            if backup_path.suffix == '.gz':
                # Decompress
                with gzip.open(backup_path, 'rb') as f_in:
                    with open(self.db_path, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
            else:
                # Simple copy
                shutil.copy2(backup_path, self.db_path)

            print(f"Restored from: {backup_path}")
            return True

        except Exception as e:
            print(f"Restore failed: {e}")
            return False

    def cleanup_old_backups(self, keep_days: int = 30):
        """
        Remove old backups.

        Parameters:
        -----------
        keep_days : int
            Number of days to keep backups
        """
        cutoff_date = datetime.now() - pd.Timedelta(days=keep_days)

        for backup_file in self.backup_dir.glob("backup_*.db*"):
            if backup_file.stat().st_mtime < cutoff_date.timestamp():
                backup_file.unlink()
                print(f"Removed old backup: {backup_file}")
```

## Best Practices

1. **Use Appropriate Storage**: Time-series DB for historical, cache for real-time
2. **Validate Everything**: Check all incoming data
3. **Handle Corporate Actions**: Adjust for splits and dividends
4. **Backup Regularly**: Automated daily backups
5. **Monitor Data Quality**: Track validation errors
6. **Optimize Queries**: Use indexes and limit data retrieval
7. **Handle Missing Data**: Forward fill or interpolate appropriately
8. **Version Data**: Track data source and version

## Exercises

### Exercise 1: Database Implementation

Implement a complete time-series database with:
- OHLCV storage
- Tick data storage
- Efficient querying
- Data validation

### Exercise 2: Data Cleaning Pipeline

Create a data cleaning pipeline that:
- Validates incoming data
- Removes outliers
- Fills missing bars
- Adjusts for corporate actions

### Exercise 3: Real-Time Feed

Implement a real-time data feed that:
- Connects to a data provider
- Validates data
- Updates cache and database
- Handles connection failures

### Exercise 4: Backup System

Build an automated backup system that:
- Creates daily backups
- Compresses old backups
- Removes backups older than 30 days
- Tests restore functionality

## Summary

Effective data management requires:

- **Storage**: Time-series database + in-memory cache
- **Validation**: Check all incoming data
- **Cleaning**: Handle missing data and outliers
- **Corporate Actions**: Adjust for splits and dividends
- **Backup**: Regular automated backups
- **Monitoring**: Track data quality metrics

Good data management ensures:
- Fast access to recent data
- Reliable historical data
- Data integrity
- System resilience

## Next Steps

In the next lesson, we'll explore order execution in detail, including order types, execution algorithms, and handling partial fills and rejections.