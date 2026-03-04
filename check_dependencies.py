#!/usr/bin/env python3
"""
Dependency check for Trading Academy book
Verifies all required Python packages are available
"""

import sys

def check_dependencies():
    """Check if all required packages are installed."""
    required_packages = {
        'pandas': 'pandas',
        'numpy': 'numpy',
        'yfinance': 'yfinance',
        'matplotlib': 'matplotlib.pyplot',
        'scipy': 'scipy.stats',
        'sklearn': 'sklearn.ensemble',
        'seaborn': 'seaborn',
    }

    print("=" * 80)
    print("TRADING ACADEMY - DEPENDENCY CHECK")
    print("=" * 80)
    print()

    missing = []
    installed = []

    for package_name, import_name in required_packages.items():
        try:
            __import__(import_name)
            installed.append(package_name)
            print(f"✓ {package_name:20s} - Installed")
        except ImportError:
            missing.append(package_name)
            print(f"✗ {package_name:20s} - Missing")

    print()
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Installed: {len(installed)}/{len(required_packages)}")
    print(f"Missing: {len(missing)}/{len(required_packages)}")
    print()

    if missing:
        print("To install missing packages, run:")
        print(f"  pip install {' '.join(missing)}")
        print()
        return 1
    else:
        print("✓ All required packages are installed!")
        print()
        return 0

if __name__ == "__main__":
    sys.exit(check_dependencies())
