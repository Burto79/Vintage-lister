# Setup Complete! 🎉

Everything is installed and ready to go. Here's what was set up:

## ✅ Installed

- ✅ Node.js v22.20.0 (via nvm)
- ✅ All npm dependencies
- ✅ Project structure
- ✅ Configuration files

## 📱 Phone Sync Setup

### Option 1: iPhone (iCloud Photos)

1. **On iPhone:**
   - Settings → Photos → iCloud Photos → ON

2. **On Mac:**
   - System Settings → Apple ID → iCloud → Photos → Enable

3. **Update .env file:**
   ```bash
   WATCH_FOLDER=/Users/alburtalvarado/Library/Mobile Documents/com~apple~CloudDocs
   ```

### Option 2: AirDrop (Quick & Easy)

1. Take photos on iPhone
2. AirDrop them to your Mac
3. They'll land in ~/Downloads
4. Use that folder in watch mode

### Option 3: Google Photos (Android or cross-platform)

1. Install Google Drive
2. Enable photo backup
3. Point WATCH_FOLDER to Google Drive Photos folder

### Option 4: Manual (Easiest to start)

Just drop images into: `/Users/alburtalvarado/vintage-lister/incoming-photos/`

## 🚀 Quick Start

### Step 1: Get Your API Key

1. Go to: https://console.anthropic.com/
2. Create account / Sign in
3. Go to API Keys
4. Create a new key
5. Copy it

### Step 2: Add API Key

Edit `.env` file and replace:
```
ANTHROPIC_API_KEY=your_api_key_here
```

With your actual key:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### Step 3: Run It!

**Easy mode** - Use the helper script:
```bash
./start.sh
```

**Or run commands directly:**

```bash
# Analyze specific images
npm run analyze -- /path/to/image1.jpg /path/to/image2.jpg

# Watch folder for new images
npm run dev watch --folder ./incoming-photos

# Watch with auto-post to eBay (need eBay API keys)
npm run dev watch --folder ./incoming-photos --auto-post
```

## 📸 Taking Good Photos

For best AI analysis results:

1. **Multiple Angles** - Front, back, sides, bottom
2. **Labels & Tags** - Close-ups of any labels, maker marks
3. **Details** - Unique features, patterns, textures
4. **Flaws** - Any damage, stains, wear
5. **Good Lighting** - Natural light works best
6. **Clean Background** - Solid color preferred

## 🧠 Extended Thinking

By default, Claude uses "extended thinking" to deeply analyze:
- Era and authenticity markers
- Material quality and construction
- Market demand and pricing strategy
- Optimal keywords for SEO
- Condition assessment

This takes a bit longer but gives much better results!

## 💰 eBay Integration (Optional)

To enable posting to eBay:

1. Go to: https://developer.ebay.com/
2. Create a developer account
3. Register an application
4. Get credentials: App ID, Cert ID, Dev ID
5. Generate User Token
6. Add to `.env` file

## 📂 Folder Structure

```
vintage-lister/
├── incoming-photos/    ← Watch this folder (or set your own)
├── test-images/        ← Put test photos here
├── processed/          ← Processed items (future feature)
├── src/                ← Source code
├── .env                ← Your configuration
└── start.sh            ← Easy launcher
```

## 💡 Tips

1. **Start Simple** - Test with 1-2 images first
2. **Review Output** - Always review AI descriptions before posting
3. **Batch Processing** - Drop multiple items at once
4. **Save Drafts** - Review and edit before posting live
5. **Price Research** - Check eBay sold listings to verify AI pricing

## 🆘 Troubleshooting

**"Command not found: npm"**
- Open a new terminal window (nvm was just installed)

**"ANTHROPIC_API_KEY not found"**
- Edit `.env` and add your API key from console.anthropic.com

**"Watch folder not found"**
- Create the folder: `mkdir -p incoming-photos`
- Or update WATCH_FOLDER in `.env`

**Images not detected**
- Make sure images are .jpg, .png, .heic, or .webp
- Wait 2 seconds after copying (debounce delay)

## 🎯 Next Steps

1. Add your Anthropic API key to `.env`
2. Take photos of a vintage item
3. Run `./start.sh` and choose option 1 or 2
4. Review the AI-generated listing
5. Post to eBay (manually or via API)

## 🔮 Coming Soon

- Depop integration
- Poshmark integration
- Background removal
- Price history tracking
- Batch UI
- MCP server tools

---

**Ready?** Run `./start.sh` to begin! 🚀
