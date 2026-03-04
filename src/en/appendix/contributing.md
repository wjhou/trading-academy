# Contributing to This Book

Thank you for your interest in contributing to Trading Academy! This guide will help you get started.

## Ways to Contribute

### 1. Report Issues

Found a typo, error, or unclear explanation?

- Go to [GitHub Issues](https://github.com/wjhou/trading-academy/issues)
- Click "New Issue"
- Describe the problem clearly
- Include the module and lesson number
- Suggest a fix if possible

### 2. Improve Content

Help make the book better:

- Fix typos and grammar
- Clarify confusing explanations
- Add missing examples
- Improve code comments
- Update outdated information

### 3. Add New Content

Contribute new material:

- Additional exercises
- Real-world examples
- Case studies
- Alternative approaches
- Advanced topics

### 4. Translate

Help make the book accessible:

- Translate lessons to other languages
- Review existing translations
- Maintain translation quality

### 5. Share Feedback

Your experience matters:

- What worked well?
- What was confusing?
- What's missing?
- How can we improve?

## Getting Started

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/trading-academy.git
cd trading-academy

# Add upstream remote
git remote add upstream https://github.com/wjhou/trading-academy.git
```

### Create a Branch

```bash
# Create a new branch for your changes
git checkout -b fix/typo-in-module-3

# Or for new features
git checkout -b feature/add-exercise-module-4
```

### Make Changes

Edit the markdown files in `src/en/` or `src/zh/`:

```bash
# Edit a lesson
code src/en/module-03/lesson-01-momentum.md

# Test your changes locally
mdbook serve
# Open http://localhost:3000
```

### Commit Changes

```bash
# Stage your changes
git add src/en/module-03/lesson-01-momentum.md

# Commit with a clear message
git commit -m "Fix typo in Module 3 Lesson 1 RSI explanation"
```

### Push and Create Pull Request

```bash
# Push to your fork
git push origin fix/typo-in-module-3

# Go to GitHub and create a Pull Request
```

## Contribution Guidelines

### Content Standards

**1. Clarity**
- Write in clear, simple language
- Explain concepts before using them
- Use examples to illustrate points
- Avoid unnecessary jargon

**2. Accuracy**
- Verify all facts and formulas
- Test all code examples
- Cite sources when appropriate
- Update outdated information

**3. Consistency**
- Follow the existing style
- Use consistent terminology
- Match the book's tone
- Follow formatting conventions

**4. Completeness**
- Include all necessary context
- Provide working code examples
- Add exercises when appropriate
- Link to related sections

### Code Standards

**1. Working Code**
```python
# All code must run without errors
# Test before submitting

import pandas as pd
import numpy as np

# Good: Clear, working example
def calculate_rsi(prices, period=14):
    """Calculate RSI indicator."""
    delta = prices.diff()
    gain = delta.where(delta > 0, 0).rolling(period).mean()
    loss = -delta.where(delta < 0, 0).rolling(period).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))
```

**2. Documentation**
```python
# Include docstrings
def my_function(param1, param2):
    """
    Brief description.

    Parameters:
    -----------
    param1 : type
        Description
    param2 : type
        Description

    Returns:
    --------
    type
        Description
    """
    pass
```

**3. Style**
- Follow PEP 8 style guide
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small

### Markdown Formatting

**Headers**
```markdown
# Module Title (H1)
## Section Title (H2)
### Subsection (H3)
```

**Code Blocks**
````markdown
```python
# Python code here
import pandas as pd
```
````

**Lists**
```markdown
- Unordered list item
- Another item

1. Ordered list item
2. Another item
```

**Links**
```markdown
[Link text](./path/to/file.md)
[External link](https://example.com)
```

**Emphasis**
```markdown
*italic* or _italic_
**bold** or __bold__
`inline code`
```

## Review Process

### What Happens After You Submit

1. **Automated Checks**: CI/CD runs tests
2. **Review**: Maintainers review your changes
3. **Feedback**: You may receive comments or requests
4. **Approval**: Once approved, changes are merged
5. **Publication**: Changes appear in the book

### Review Criteria

Your contribution will be evaluated on:

- **Correctness**: Is the information accurate?
- **Clarity**: Is it easy to understand?
- **Completeness**: Does it cover the topic well?
- **Consistency**: Does it match the book's style?
- **Value**: Does it improve the book?

## Types of Contributions

### Quick Fixes (Easy)

Perfect for first-time contributors:

- Fix typos
- Correct grammar
- Fix broken links
- Update outdated information

**Example PR**: "Fix typo in Module 3 Lesson 1"

### Content Improvements (Medium)

Requires understanding of the topic:

- Clarify explanations
- Add examples
- Improve code
- Expand sections

**Example PR**: "Add more examples to RSI indicator explanation"

### New Content (Advanced)

Requires deep knowledge:

- New lessons
- New exercises
- New modules
- Advanced topics

**Example PR**: "Add lesson on pairs trading to Module 8"

## Translation Guidelines

### Starting a Translation

1. Check if translation exists
2. Create language directory: `src/[lang]/`
3. Copy English structure
4. Translate content
5. Maintain formatting

### Translation Standards

- Preserve technical terms when appropriate
- Adapt examples to local context
- Keep code comments in English
- Maintain consistency across lessons

### Example Structure

```
src/
├── en/           # English (original)
├── zh/           # Chinese
├── es/           # Spanish
└── [lang]/       # Your language
```

## Code of Conduct

### Be Respectful

- Treat everyone with respect
- Be constructive in feedback
- Welcome newcomers
- Assume good intentions

### Be Professional

- Stay on topic
- Avoid personal attacks
- Focus on the content
- Be patient with reviewers

### Be Collaborative

- Help others learn
- Share knowledge
- Give credit where due
- Work together

## Getting Help

### Questions?

- **General**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Contributions**: Comment on your PR
- **Chat**: Join our community (if available)

### Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [mdBook Documentation](https://rust-lang.github.io/mdBook/)
- [Git Tutorial](https://git-scm.com/docs/gittutorial)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

## Recognition

### Contributors

All contributors are recognized in:
- CONTRIBUTORS.md file
- Book acknowledgments
- GitHub contributors page

### Significant Contributions

Major contributors may be:
- Listed as co-authors
- Invited to maintainer team
- Featured in announcements

## License

By contributing, you agree that your contributions will be licensed under the same license as the book (MIT License).

## Thank You!

Every contribution, no matter how small, helps make this book better for everyone. Thank you for taking the time to contribute!

---

**Ready to contribute?** Pick an issue labeled "good first issue" or "help wanted" and get started!

**Questions?** Open a discussion on GitHub or comment on an existing issue.

