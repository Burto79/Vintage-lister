# 📱 Samsung/Android Photo Sync Setup

Since you have a Samsung phone, here are the best ways to sync photos to your Mac:

## ✅ Option 1: Google Photos (RECOMMENDED - Easiest & Automatic)

### Setup (5 minutes):

1. **On your Samsung phone:**
   - Open Google Photos app (pre-installed on Samsung)
   - Tap your profile icon → "Turn on backup"
   - Choose "High quality" (free unlimited) or "Original quality"
   - It will auto-backup all photos

2. **On your Mac:**
   - Install Google Drive: https://www.google.com/drive/download/
   - Sign in with the same Google account
   - In Google Drive settings:
     - Enable "Google Photos" folder
     - It will create: `/Users/alburtalvarado/Google Drive/My Drive/Google Photos`

3. **Update .env file:**
   ```bash
   WATCH_FOLDER=/Users/alburtalvarado/Google Drive/My Drive/Google Photos
   ```

4. **Done!** Any photo you take on your Samsung will automatically appear on your Mac

---

## ⚡ Option 2: Samsung Smart Switch (Mac App)

### Setup:

1. **Install on Mac:**
   - Download: https://www.samsung.com/us/support/owners/app/smart-switch
   - Install Smart Switch for Mac

2. **Connect phone via USB cable:**
   - Open Smart Switch on Mac
   - Connect Samsung phone with USB cable
   - Select "Backup" → Choose "Photos only"
   - Photos will be saved to: `~/SmartSwitch/`

3. **Use for syncing:**
   ```bash
   WATCH_FOLDER=/Users/alburtalvarado/SmartSwitch
   ```

---

## 🔌 Option 3: Android File Transfer (Manual but Simple)

### Setup:

1. **Install Android File Transfer:**
   - Download: https://www.android.com/filetransfer/
   - Install on your Mac

2. **Connect phone:**
   - Connect Samsung phone via USB
   - Swipe notification → Tap "USB options" → Select "File Transfer"
   - Android File Transfer app opens automatically

3. **Copy photos manually:**
   - Navigate to `DCIM/Camera/`
   - Drag photos to a folder on Mac
   - Use that folder: `~/Downloads/vintage-items`

---

## 📧 Option 4: Email/Messaging (Quick for 1-2 items)

**Fastest for testing:**
- Take photos on Samsung
- Email them to yourself or use Telegram/WhatsApp to send to yourself
- Download on Mac
- Drop into the tool

---

## 🌐 Option 5: Nearby Share (Wireless - Like AirDrop)

### Setup (macOS 13+ required):

Samsung and Mac can now use "Nearby Share":

1. **On Samsung:**
   - Swipe down → Enable "Nearby Share"
   - Open photos, tap Share → Nearby Share

2. **On Mac:**
   - If available, Nearby Share should appear
   - Accept the transfer

Photos land in `~/Downloads`

---

## 🎯 RECOMMENDED WORKFLOW

### For Best Results (Google Photos):

1. **Take photos on Samsung** → Auto-uploads to Google Photos
2. **Opens on Mac** → Photos appear in Google Drive folder
3. **Vintage Lister watches** → Automatically analyzes new photos
4. **Review & post** → Edit if needed, post to eBay

### Simple Command:

```bash
# Watch your Google Photos folder
npm run dev watch --folder "/Users/alburtalvarado/Google Drive/My Drive/Google Photos"
```

---

## 📂 Folder Paths for Samsung/Android

Update your `.env` file with one of these:

```bash
# Google Photos (recommended)
WATCH_FOLDER=/Users/alburtalvarado/Google Drive/My Drive/Google Photos

# Smart Switch
WATCH_FOLDER=/Users/alburtalvarado/SmartSwitch

# Manual folder
WATCH_FOLDER=/Users/alburtalvarado/vintage-lister/incoming-photos

# Downloads (if using email/transfer)
WATCH_FOLDER=/Users/alburtalvarado/Downloads
```

---

## ✨ Quick Start for Samsung Users

**Right now, to test:**

1. Take 2-3 photos of a vintage item with your Samsung
2. Send them to yourself via Gmail or any messaging app
3. Download on Mac
4. Run: `./start.sh`
5. Choose option 1 and drag the photos in

**For automatic sync:**

1. Set up Google Photos (5 minutes)
2. Update WATCH_FOLDER in .env
3. Run: `npm run dev watch`
4. Take photos on Samsung → They auto-process!

---

## 🆘 Troubleshooting

**Photos not syncing?**
- Check Google Photos app → Make sure "Backup" is on
- Check Google Drive on Mac → Make sure it's running
- Check internet connection on both devices

**USB connection not working?**
- Try different USB cable
- Enable "Developer Options" on Samsung
- Check USB connection mode (should be "File Transfer")

**Folder not found?**
- Google Drive might be at: `~/Library/CloudStorage/GoogleDrive-youremail@gmail.com`
- Use: `ls ~/Library/CloudStorage/` to find it

---

## 💡 Tips for Samsung Photos

- **Good lighting** - Samsung cameras are great, use natural light
- **Multiple angles** - Take 3-5 photos per item
- **Close-ups** - Samsung has excellent macro mode
- **Night mode** - If shooting indoors in low light
- **Pro mode** - For best quality vintage shots

---

**Ready?** Set up Google Photos and you're good to go! 🚀
