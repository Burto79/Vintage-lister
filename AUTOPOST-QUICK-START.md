# 🤖 Auto-Post Quick Start

## Two Ways to Auto-Post:

### Method 1: Web Interface (Test First!)
### Method 2: Full Auto Mode (Watch Folder)

---

## 🎯 Method 1: Web Interface Auto-Post

**This is the easiest way to test!**

### Step 1: Get API Key

1. Go to: **https://console.anthropic.com**
2. Sign up / Log in
3. Click "API Keys" → "Create Key"
4. Copy the key (starts with `sk-ant-...`)

### Step 2: Add API Key to .env

Edit `/Users/alburtalvarado/vintage-lister/.env`:

```bash
# Change this line:
ANTHROPIC_API_KEY=your_api_key_here

# To this (with YOUR real key):
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Start Backend (if not running)

```bash
cd /Users/alburtalvarado/vintage-lister
npm run dev:backend
```

### Step 4: Start Frontend

In a NEW terminal tab:

```bash
cd /Users/alburtalvarado/vintage-lister
npm run dev:frontend
```

### Step 5: Upload & Auto-Post!

1. Go to **http://localhost:3000**
2. Drag 1-2 photos of a vintage item
3. Check these boxes:
   - ✅ Use Extended Thinking
   - ✅ Auto-Post to eBay (if you want eBay too)
4. Click **"Analyze Items"**
5. Wait 30-40 seconds
6. **BOOM!** Item is now on your website!

### Step 6: See Your Item

Go to **http://localhost:3001/** and scroll to "collection" - your item is there!

---

## 🚀 Method 2: Full Auto Mode

**This watches a folder and auto-posts anything you put in it!**

### Setup (One Time):

1. Make sure your API key is in `.env` (see above)

2. Choose a watch folder:
   ```bash
   # Already set in .env:
   WATCH_FOLDER=/Users/alburtalvarado/vintage-lister/incoming-photos
   ```

### Run Auto Mode:

```bash
cd /Users/alburtalvarado/vintage-lister
npm run auto
```

You'll see:
```
🤖 Starting Auto-Lister...

📁 Watching folder: /Users/alburtalvarado/vintage-lister/incoming-photos
🚀 Auto-post to eBay: DISABLED (no eBay keys yet)
🌐 Auto-post to Website: ALWAYS ENABLED
🔔 Sale notifications: ENABLED

✅ Auto-Lister is running!

What happens next:
  1. 📸 You take photos → they sync to watched folder
  2. 🧠 AI analyzes photos automatically
  3. 🏷️  AI creates listing with title, description, price
  4. 🌐 Posts to YOUR WEBSITE automatically
  5. 📤 ALSO posts to eBay immediately (if enabled)
  6. 💰 When sold → you get notified to ship
  7. 📦 You ship, done!
```

### Test It:

While auto mode is running, drop an image in the folder:

```bash
# Copy a test image
cp /path/to/your/photo.jpg /Users/alburtalvarado/vintage-lister/incoming-photos/
```

Watch the magic happen in the terminal!

---

## 💰 Do You Want eBay Too?

Right now it ALWAYS posts to your website. To ALSO post to eBay:

### Get eBay API Keys:

1. Go to: **https://developer.ebay.com**
2. Create developer account
3. Create an application
4. Get these keys:
   - App ID (Client ID)
   - Cert ID (Client Secret)
   - Dev ID
   - User Token

### Add to .env:

```bash
EBAY_APP_ID=YourAppID-xxxxx
EBAY_CERT_ID=xxxxx
EBAY_DEV_ID=xxxxx
EBAY_AUTH_TOKEN=v^1.1#xxxxx
```

Then items will post to BOTH platforms!

---

## 🎯 Quick Test Right Now:

### 1. Add Your API Key:

```bash
# Edit .env file
open -e /Users/alburtalvarado/vintage-lister/.env

# Add your real Anthropic key
# Save and close
```

### 2. Start Frontend:

```bash
cd /Users/alburtalvarado/vintage-lister
npm run dev:frontend
```

### 3. Upload Test Photo:

1. Go to http://localhost:3000
2. Upload a photo of any vintage item
3. Check "Use Extended Thinking"
4. Click "Analyze Items"
5. Wait 30-40 seconds

### 4. See Result:

Go to http://localhost:3001/ - your item is in "collection"!

---

## 📋 What Gets Auto-Posted:

When you upload photos, AI creates:

- ✅ SEO-optimized title
- ✅ Compelling description
- ✅ Era identification (1960s, 1970s, etc.)
- ✅ Condition assessment
- ✅ Price suggestion with reasoning
- ✅ Keywords for SEO
- ✅ Flaw detection

All posted to:
- ✅ Your 1979 Supply Co website (ALWAYS)
- ✅ eBay (if keys added)

---

## 💡 Cost:

Using Haiku + Sonnet with Extended Thinking:
- **~$0.11 per item**
- Creates perfect listings for 2 platforms
- Way cheaper than your time!

---

## 🎨 Your Workflow:

### Without Auto-Post:
1. Take photo - 30 sec
2. Transfer to computer - 5 min
3. Research item - 10 min
4. Write listing - 15 min
5. Upload to website - 5 min
6. Upload to eBay - 5 min
**Total: 40 minutes**

### With Auto-Post:
1. Take photo - 30 sec
2. AI does everything - 40 sec
3. Ship when sold - 5 min
**Total: 30 seconds of YOUR time**

---

## ✅ Quick Checklist:

- [ ] Add Anthropic API key to `.env`
- [ ] Start backend: `npm run dev:backend`
- [ ] Start frontend: `npm run dev:frontend`
- [ ] Go to http://localhost:3000
- [ ] Upload photo
- [ ] Check "Use Extended Thinking"
- [ ] Click "Analyze Items"
- [ ] Wait 30-40 seconds
- [ ] Check http://localhost:3001/ for your item!

---

**Start with the web interface first to test, then enable auto mode!**

Need help? The backend logs will show what's happening.
