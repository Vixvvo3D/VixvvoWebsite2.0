# Vixvvo Website 2.0

## 🆕 Creating New Pages - Quick Start

**We have a complete template system! Create fully-functional pages in 5-10 minutes.**

### 3 Simple Steps:
```bash
# 1. Copy template
cp tools/COMPLETE_PAGE_TEMPLATE.html pages/my-page.html

# 2. Customize (change title, header, content)

# 3. Add to navbar in components/navbar.html
```

**✨ Your page automatically includes:**
- ✅ Working navbar • ✅ Login/Logout • ✅ Settings dropdown
- ✅ Currency selector • ✅ User auth display • ✅ Notifications
- ✅ Mobile responsive • ✅ All button handlers • ✅ Firebase integration

### 📚 Documentation:
- **Start Here:** [`QUICK_START_NEW_PAGE.md`](QUICK_START_NEW_PAGE.md) ⭐
- **Full Guide:** [`docs/guides/COMPLETE_NEW_PAGE_GUIDE.md`](docs/guides/COMPLETE_NEW_PAGE_GUIDE.md)
- **Checklist:** [`docs/guides/NEW_PAGE_CHECKLIST.md`](docs/guides/NEW_PAGE_CHECKLIST.md)
- **Template:** [`tools/COMPLETE_PAGE_TEMPLATE.html`](tools/COMPLETE_PAGE_TEMPLATE.html)

---

## Project Structure

```
📦 Website Vixvvo 2.0
├── 📁 components/          # Reusable UI components
├── 📁 css/                 # Stylesheets
├── 📁 docs/                # 📚 All documentation (organized)
│   ├── setup/             # Setup and configuration guides
│   ├── features/          # Feature implementation docs
│   ├── fixes/             # Bug fixes and patches
│   ├── guides/            # User guides and references
│   └── archive/           # Historical documentation
├── 📁 functions/           # Firebase Cloud Functions
├── 📁 images/              # Image assets
├── 📁 js/                  # JavaScript files
├── 📁 pages/               # HTML pages
├── 📁 scripts/             # Deployment and utility scripts
├── 📁 styles/              # Additional stylesheets
├── 📁 tools/               # Development tools and templates
├── 📄 index.html           # Main entry point
├── 📄 firebase.json        # Firebase configuration
└── 📄 database.rules.json  # Database security rules
```

## Documentation

**All documentation has been organized into the `docs/` directory.**

For detailed documentation navigation, see [`docs/README.md`](docs/README.md)

### Quick Links
- 🚀 [Quick Setup Guide](docs/setup/QUICK_SETUP.md)
- 📋 [Setup Checklist](docs/setup/SETUP_CHECKLIST.md)
- 📖 [All Guides](docs/guides/)
- 🔧 [Bug Fixes](docs/fixes/)

## Development

### Scripts
Located in `/scripts/`:
- `deploy.sh` - Deploy the application
- `deploy-database-rules.sh` - Deploy database rules
- `setup-email-verification.sh` - Setup email verification

### Tools
Located in `/tools/`:
- Database cleanup utilities
- Page templates
- Implementation examples

## Getting Started

1. Check the [Quick Setup Guide](docs/setup/QUICK_SETUP.md)
2. Review the [Setup Checklist](docs/setup/SETUP_CHECKLIST.md)
3. Explore feature documentation in `docs/features/`

## Need Help?

- Browse the [Guides](docs/guides/) directory
- Check [Fixes](docs/fixes/) for known issues
- Review [Features](docs/features/) for implementation details
