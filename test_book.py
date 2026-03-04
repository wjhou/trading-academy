#!/usr/bin/env python3
"""
Test script for Trading Academy book
Extracts and validates Python code from all lessons
"""

import re
import sys
import ast
from pathlib import Path
from typing import List, Tuple

def extract_python_code(markdown_file: Path) -> List[Tuple[int, str]]:
    """Extract Python code blocks from markdown file."""
    with open(markdown_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all Python code blocks
    pattern = r'```python\n(.*?)```'
    matches = re.findall(pattern, content, re.DOTALL)

    code_blocks = []
    for i, code in enumerate(matches, 1):
        code_blocks.append((i, code))

    return code_blocks

def validate_syntax(code: str) -> Tuple[bool, str]:
    """Validate Python syntax."""
    try:
        ast.parse(code)
        return True, "OK"
    except SyntaxError as e:
        return False, f"SyntaxError: {e.msg} at line {e.lineno}"
    except Exception as e:
        return False, f"Error: {str(e)}"

def test_lesson(lesson_file: Path) -> dict:
    """Test a single lesson file."""
    results = {
        'file': str(lesson_file),
        'total_blocks': 0,
        'valid_blocks': 0,
        'invalid_blocks': 0,
        'errors': []
    }

    try:
        code_blocks = extract_python_code(lesson_file)
        results['total_blocks'] = len(code_blocks)

        for block_num, code in code_blocks:
            is_valid, message = validate_syntax(code)

            if is_valid:
                results['valid_blocks'] += 1
            else:
                results['invalid_blocks'] += 1
                results['errors'].append({
                    'block': block_num,
                    'error': message
                })

    except Exception as e:
        results['errors'].append({
            'block': 'N/A',
            'error': f"Failed to process file: {str(e)}"
        })

    return results

def main():
    """Main test function."""
    base_path = Path('/Users/houwenjun/Desktop/Projects/trading-academy/src/en')

    # Find all lesson files
    lesson_files = []
    for module_dir in sorted(base_path.glob('module-*')):
        lesson_files.extend(sorted(module_dir.glob('lesson-*.md')))
        lesson_files.extend(sorted(module_dir.glob('project-*.md')))

    print("=" * 80)
    print("TRADING ACADEMY BOOK - CODE VALIDATION TEST")
    print("=" * 80)
    print()

    total_files = 0
    total_blocks = 0
    total_valid = 0
    total_invalid = 0
    files_with_errors = []

    for lesson_file in lesson_files:
        results = test_lesson(lesson_file)
        total_files += 1
        total_blocks += results['total_blocks']
        total_valid += results['valid_blocks']
        total_invalid += results['invalid_blocks']

        # Print results for this file
        relative_path = lesson_file.relative_to(base_path)
        print(f"Testing: {relative_path}")
        print(f"  Code blocks: {results['total_blocks']}")
        print(f"  Valid: {results['valid_blocks']}")
        print(f"  Invalid: {results['invalid_blocks']}")

        if results['errors']:
            files_with_errors.append(results)
            print(f"  ⚠️  ERRORS FOUND:")
            for error in results['errors']:
                print(f"    Block {error['block']}: {error['error']}")
        else:
            print(f"  ✓ All code blocks valid")

        print()

    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total files tested: {total_files}")
    print(f"Total code blocks: {total_blocks}")
    print(f"Valid blocks: {total_valid}")
    print(f"Invalid blocks: {total_invalid}")
    print(f"Files with errors: {len(files_with_errors)}")
    print()

    if files_with_errors:
        print("FILES WITH ERRORS:")
        for result in files_with_errors:
            print(f"  - {Path(result['file']).name}")
        print()
        return 1
    else:
        print("✓ ALL TESTS PASSED!")
        print()
        return 0

if __name__ == "__main__":
    sys.exit(main())
