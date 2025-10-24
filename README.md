# Vintage Lister 🎨

AI-powered vintage item listing tool using Claude's Extended Thinking and Vision capabilities.

## Features

- **📸 Smart Image Analysis** - Uses Claude's vision to analyze vintage items
- **🧠 Extended Thinking** - Deep reasoning about era, condition, pricing, and market demand
- **🤖 Auto-Generate Listings** - Creates optimized titles, descriptions, and pricing
- **👁️ Watch Mode** - Monitors folders for new photos from your phone
- **📱 Phone Integration** - Auto-sync via iCloud Photos or Google Photos
- **💰 Price Suggestions** - AI-powered pricing based on condition and market
- **🏷️ Multi-Platform Ready** - Start with eBay, expand to Depop, Poshmark, etc.

## Setup

### 1. Install Dependencies

```bash
cd vintage-lister
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add:

```bash
# Required: Get from console.anthropic.com
ANTHROPIC_API_KEY=your_key_here

# Optional: eBay API credentials from developer.ebay.com
EBAY_APP_ID=your_app_id
EBAY_CERT_ID=your_cert_id
EBAY_DEV_ID=your_dev_id
EBAY_USER_TOKEN=your_token

# Watch folder (where phone syncs photos)
# iPhone: /Users/yourusername/Library/Mobile Documents/com~apple~CloudDocs/Photos
# Android: /Users/yourusername/GoogleDrive/Photos
WATCH_FOLDER=/path/to/your/photo/sync/folder
```

### 3. Set Up Phone Sync

#### iPhone (iCloud Photos):
1. Enable iCloud Photos on your iPhone
2. On Mac: System Settings → Apple ID → iCloud → Photos → Enable
3. Set `WATCH_FOLDER` to your iCloud Photos folder

#### Android (Google Photos):
1. Install Google Drive app
2. Enable photo sync
3. Set `WATCH_FOLDER` to your Google Drive Photos folder

## Usage

### Analyze Single Item

```bash
npm run analyze -- image1.jpg image2.jpg image3.jpg
```

This will:
- Analyze your vintage item using Claude's vision
- Use extended thinking for deep analysis (era, condition, pricing)
- Generate SEO-optimized title and description
- Suggest pricing with reasoning
- Create a draft eBay listing (if credentials configured)

### Watch Mode (Auto-Process New Photos)

```bash
npm run dev watch --folder /path/to/photos
```

This will:
- Monitor folder for new images
- Auto-analyze when photos appear
- Batch multiple photos together (2 second debounce)
- Display results in terminal

### Auto-Post Mode

```bash
npm run dev watch --folder /path/to/photos --auto-post
```

Automatically creates listings when new photos are detected.

## Example Output

```
📊 ANALYSIS RESULTS

Title: Vintage 1960s Mod Dress A-Line Mini Retro Floral Print
Era: 1960s
Condition: Very Good
Category: Women's Vintage Clothing

Suggested Price:
  💰 $45
  Range: $35 - $55
  Based on 1960s mod style popularity and good condition

Keywords:
  vintage, 1960s, mod, mini dress, retro, floral

🧠 Extended Thinking Summary:
  Analyzing the construction details, I can see this is likely
  authentic 1960s based on the metal zipper, fabric weave, and
  construction methods. The mod style was highly popular 1965-1969...
```

## How It Works

1. **Image Capture** - Take photos with your phone (syncs via cloud)
2. **Auto-Detection** - Watcher detects new images in sync folder
3. **AI Analysis** - Claude analyzes using vision + extended thinking:
   - Identifies era, style, materials
   - Assesses condition and flaws
   - Researches comparable items
   - Suggests optimal pricing
4. **Listing Generation** - Creates platform-optimized listings
5. **Review & Post** - You review and post (or use auto-post)

## Extended Thinking

When enabled (default), Claude uses deep reasoning to:
- Authenticate vintage items by construction details
- Compare against historical fashion/design trends
- Analyze market demand and pricing strategies
- Identify unique selling points
- Suggest best keywords for discoverability

## eBay Integration

To enable full eBay posting:

1. Create developer account at [developer.ebay.com](https://developer.ebay.com)
2. Create an app to get credentials
3. Generate User Token
4. Add credentials to `.env`

## Roadmap

- [ ] Full eBay API integration (currently creates drafts)
- [ ] Depop integration
- [ ] Poshmark integration
- [ ] Mercari integration
- [ ] Batch processing UI
- [ ] Price history tracking
- [ ] Sold listings research
- [ ] Image background removal
- [ ] Auto-cropping and enhancement
- [ ] MCP server for tool integration

## Tips

- Take multiple angles (front, back, labels, flaws)
- Include closeups of unique details
- Good lighting improves AI analysis
- Extended thinking provides better pricing
- Review descriptions before posting

## License

MIT
