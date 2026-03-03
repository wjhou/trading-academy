# Multilingual Setup

This project supports both English and Chinese versions with language switching on GitHub Pages.

## Structure

```
trading-academy/
├── src/
│   ├── en/          # English content
│   └── zh/          # Chinese content
├── theme/           # Custom theme with language switcher
├── book-en.toml     # English book configuration
├── book-zh.toml     # Chinese book configuration
└── index.html       # Landing page for language selection
```

## Building Locally

Build both language versions:

```bash
# Build English version
mdbook build --config-file book-en.toml

# Build Chinese version
mdbook build --config-file book-zh.toml
```

The output will be in:
- `book/en/` - English version
- `book/zh/` - Chinese version

## Language Switcher

The language switcher appears in the top-right corner of each page and allows users to switch between English and Chinese versions while staying on the same page.

## GitHub Pages Deployment

The GitHub Actions workflow automatically:
1. Builds both language versions
2. Copies the landing page
3. Deploys everything to GitHub Pages

Users can:
- Visit the root URL to choose their language
- Use the language switcher on any page to switch languages
- Bookmark specific language versions
