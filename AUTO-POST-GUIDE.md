# 🤖 Full Automation Guide - Photo to Ship

## Your Dream Workflow is Ready!

```
📸 Take Picture → 🤖 AI Does Everything → 📦 You Ship
```

That's it! No manual listing, no typing descriptions, no pricing decisions.

---

## How It Works

### The Complete Flow

1. **📸 You Take Photos** (on your phone)
   - Photos sync to your computer via iCloud/Google Photos
   - Can be 1-2 photos or more (up to 12)

2. **🤖 AI Analyzes Automatically**
   - Detects the photos
   - Uses Claude's Extended Thinking to analyze
   - Determines era, condition, flaws
   - Creates compelling title & description
   - Suggests optimal pricing

3. **📤 Auto-Posts to eBay**
   - Creates listing immediately
   - Uploads photos
   - Sets price
   - Adds shipping details
   - Goes live instantly

4. **💰 Item Sells**
   - eBay handles the transaction
   - Money goes to your account

5. **🔔 You Get Notified**
   - System checks for sold items every 5 minutes
   - Creates `TO-SHIP.json` file with shipping details
   - Shows notification

6. **📦 You Ship**
   - Check the TO-SHIP list
   - Pack and ship the item
   - Done!

---

## Quick Start

### Option 1: Web Interface (Recommended for Starting)

1. **Start the app:**
   ```bash
   ./Launch\ Vintage\ Lister.command
   ```

2. **Upload photos in browser** (http://localhost:3000)

3. **Toggle options:**
   - ✅ Extended Thinking (better analysis)
   - ✅ Auto-Post to eBay (immediate listing!)

4. **Click "Analyze Items"**

5. **Done!** Item is live on eBay

### Option 2: Full Auto Mode (Watch Folder)

**This is the ULTIMATE automation** - completely hands-free!

1. **Set up your watch folder** (one-time setup):
   - iPhone: Enable iCloud Photos sync
   - Android: Enable Google Photos Desktop Uploader
   - Note the sync folder path

2. **Update `.env`:**
   ```bash
   WATCH_FOLDER=/Users/yourname/Pictures/sync-folder
   EBAY_APP_ID=your_app_id
   EBAY_AUTH_TOKEN=your_token
   ```

3. **Start auto mode:**
   ```bash
   npm run auto
   ```

4. **Take photos on phone → Everything else is automatic!**

---

## Setup Requirements

### 1. Anthropic API Key (Required)

Get from: https://console.anthropic.com

Add to `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

### 2. eBay Developer Account (For Auto-Posting)

**Step-by-step:**

1. **Go to:** https://developer.ebay.com/
2. **Sign up** for a developer account
3. **Create an application**:
   - Go to "My Account" → "Application Keys"
   - Create a new keyset
   - Choose "Production" (or "Sandbox" for testing)

4. **Get your credentials:**
   ```
   App ID (Client ID)
   Cert ID (Client Secret)
   Dev ID
   ```

5. **Generate User Token:**
   - Go to "User Tokens"
   - Generate OAuth token
   - Copy the token

6. **Add to `.env`:**
   ```bash
   EBAY_APP_ID=YourAppID-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   EBAY_CERT_ID=xxxx-xxxx-xxxx-xxxx
   EBAY_DEV_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   EBAY_AUTH_TOKEN=v^1.1#i^1#...long token...

   EBAY_SANDBOX=false  # true for testing, false for real listings
   PAYPAL_EMAIL=your_paypal@email.com
   SHIP_FROM_ZIP=90210
   ```

### 3. Photo Sync Folder (For Auto Mode)

**iPhone (iCloud Photos):**
```bash
# macOS: System Settings → Apple ID → iCloud → Photos
# Enable iCloud Photos
# Photos sync to: ~/Pictures/Photos Library.photoslibrary
# Or use iCloud Drive folder: ~/Library/Mobile Documents/com~apple~CloudDocs/

WATCH_FOLDER=/Users/yourname/Library/Mobile\ Documents/com~apple~CloudDocs/VintageLister
```

**Android (Google Photos):**
```bash
# Install Google Drive Desktop
# Enable photo sync
# Photos sync to: ~/Google Drive/Photos

WATCH_FOLDER=/Users/yourname/Google\ Drive/Photos
```

---

## Usage Modes

### Mode 1: Web Interface (Manual Upload)

**Best for:** Starting out, selective items

```bash
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
# Or just: ./Launch\ Vintage\ Lister.command
```

- Upload photos manually
- Review before posting
- Toggle auto-post on/off per item

### Mode 2: CLI (Batch Process)

**Best for:** Processing many items at once

```bash
npm run analyze -- photo1.jpg photo2.jpg photo3.jpg
```

- Analyzes and creates drafts
- Review drafts folder
- Post manually

### Mode 3: Full Auto (Watch Folder)

**Best for:** Complete automation, regular sellers

```bash
npm run auto
# Or: npm run auto -- --folder /path/to/photos
```

- Monitors folder continuously
- Auto-analyzes new photos
- Auto-posts to eBay
- Checks for sales
- Notifies when items sell

---

## Configuration Options

### `.env` File - Complete Example

```bash
# Required - AI Analysis
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
CLAUDE_MODEL=claude-sonnet-4-20250514

# Required for Auto-Post - eBay
EBAY_APP_ID=YourAppID-xxxx
EBAY_CERT_ID=xxxxx
EBAY_DEV_ID=xxxxx
EBAY_AUTH_TOKEN=v^1.1#xxxxx

# eBay Settings
EBAY_SANDBOX=false
PAYPAL_EMAIL=your@email.com
SHIP_FROM_ZIP=90210

# Watch Folder (for auto mode)
WATCH_FOLDER=/Users/yourname/Pictures/sync

# Server Port
PORT=3001
```

---

## Checking for Sold Items

When running in auto mode, the system:

1. **Checks eBay every 5 minutes** for sold items
2. **Creates `TO-SHIP.json`** with shipping details:
   ```json
   [
     {
       "item": "Vintage 1960s Dress",
       "price": 45.00,
       "date": "2025-01-20",
       "orderId": "EBAY123456"
     }
   ]
   ```
3. **Shows console notification**:
   ```
   🎉 1 item(s) sold! Time to ship:

   📦 SHIP THIS:
      Item: Vintage 1960s Dress
      Sold for: $45.00
      Sold on: 1/20/2025
      Order ID: EBAY123456
   ```

4. **Ship the item** - Check eBay for shipping label and address

---

## Tips for Best Results

### Photo Tips

- **Multiple angles**: Front, back, labels, details
- **Good lighting**: Natural light is best
- **Show flaws**: Close-ups of any damage
- **Include size tags**: If clothing
- **Plain background**: Helps AI focus on item

### Pricing Strategy

- Let AI suggest pricing (it uses extended thinking)
- AI considers: era, condition, rarity, market demand
- You can adjust in the draft if needed

### Categories

AI will auto-select the best eBay category based on:
- Item type (clothing, jewelry, decor, etc.)
- Era (1920s, 1960s, etc.)
- Style and condition

---

## Troubleshooting

### "Auto-post failed"

**Check:**
1. eBay credentials are correct in `.env`
2. OAuth token is not expired (regenerate if needed)
3. `EBAY_SANDBOX` matches your credentials (prod vs sandbox)

### "Photos not detected"

**Check:**
1. `WATCH_FOLDER` path is correct
2. Folder exists and is accessible
3. Photos are in supported formats (JPG, PNG, HEIC, WebP)

### "Analysis failed"

**Check:**
1. `ANTHROPIC_API_KEY` is valid
2. You have API credits
3. Images are not corrupt

---

## Workflow Examples

### Example 1: Single Item (Quick Sale)

```bash
# 1. Take 2 photos on phone
# 2. Wait for sync (usually <30 seconds)
# 3. Auto mode detects photos
# 4. AI analyzes (20-30 seconds)
# 5. Posts to eBay automatically
# 6. Item is live!

Total time: ~1 minute from photo to live listing
```

### Example 2: Estate Sale Haul (50 items)

```bash
# 1. Take photos of all items
# 2. Start auto mode: npm run auto
# 3. Walk away - it processes everything
# 4. Come back to 50 live eBay listings
# 5. Check TO-SHIP.json for sales

Total time: ~30 minutes of AI work, 0 minutes of your work
```

### Example 3: Thrift Store Find (Unsure of Value)

```bash
# 1. Use web interface for careful review
# 2. Upload photos
# 3. Run analysis
# 4. Review AI's assessment
# 5. Decide: auto-post or adjust pricing
# 6. Post when ready
```

---

## Advanced: Custom Workflows

### Only Auto-Analyze (No Posting)

```bash
npm run auto -- --no-auto-post
```

- Analyzes photos
- Saves drafts
- You review and post manually

### Disable Sale Notifications

```bash
npm run auto -- --no-notifications
```

- Still auto-posts
- Doesn't check for sales
- Manual sale checking

---

## File Structure

When running, you'll see these folders:

```
vintage-lister/
├── processed-photos/     # Auto-archived after processing
├── drafts/              # Saved drafts (if not auto-posting)
├── active-listings/     # Currently listed items
├── uploads/             # Web uploads
└── TO-SHIP.json        # Items that sold (CHECK THIS!)
```

---

## The Complete Automation

Once set up, your workflow is literally:

1. **📸 See something vintage at thrift store**
2. **📱 Take 1-2 photos**
3. **☕ Get coffee**
4. **✅ Item is live on eBay when you get back**
5. **🔔 Get notification when it sells**
6. **📦 Ship it**
7. **💰 Money in account**

**That's it!** The AI handles everything in between.

---

## Next Steps

1. **Test in sandbox first:**
   ```bash
   EBAY_SANDBOX=true
   ```

2. **Run a few manual listings** to verify
3. **Enable auto mode** for hands-free operation
4. **Scale up** your vintage business!

---

Need help? Check:
- [QUICKSTART-FULLSTACK.md](QUICKSTART-FULLSTACK.md)
- [SETUP-INSTRUCTIONS.md](SETUP-INSTRUCTIONS.md)
- [FULLSTACK-SETUP.md](FULLSTACK-SETUP.md)

**Happy automated selling!** 🚀💰
