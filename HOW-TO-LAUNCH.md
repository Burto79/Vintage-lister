# How to Launch Vintage Lister

You now have **THREE easy ways** to launch Vintage Lister:

## 🎯 Option 1: Double-Click Launch (EASIEST!)

### Method A: .command File

Simply **double-click** this file:
```
Launch Vintage Lister.command
```

This will:
- ✅ Open in a Terminal window
- ✅ Check and install dependencies
- ✅ Start both backend and frontend
- ✅ Automatically open your browser
- ✅ Show you the status

**To Stop**: Press `Ctrl+C` in the Terminal window, or just close the Terminal window.

---

### Method B: macOS App Bundle

**Double-click** this application:
```
Vintage Lister.app
```

This works like any Mac app - just double-click the icon!

**First Time Setup**:
If macOS says "cannot be opened because it is from an unidentified developer":
1. Right-click (or Control+click) on `Vintage Lister.app`
2. Select "Open"
3. Click "Open" in the security dialog
4. You only need to do this once!

---

## 🖥️ Option 2: Terminal Commands

If you prefer the terminal:

### Quick Start
```bash
./start-fullstack.sh
```

### Manual Start
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

---

## 📋 What Happens When You Launch?

1. **Dependencies Check** - Installs if needed (first time only)
2. **Backend Starts** - Express server on port 3001
3. **Frontend Starts** - React app on port 3000
4. **Browser Opens** - Automatically opens http://localhost:3000
5. **Ready to Use** - Upload vintage item photos!

---

## 🌐 Access URLs

Once running, you can access:

- **Main App**: http://localhost:3000
- **API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## 🛑 How to Stop

### If using .command file or .app:
- Press `Ctrl+C` in the Terminal window
- Or close the Terminal window

### If using manual terminal commands:
- Press `Ctrl+C` in each terminal window

---

## 🎨 Making a Desktop Shortcut

### For the .command file:
1. Right-click `Launch Vintage Lister.command`
2. Select "Make Alias"
3. Drag the alias to your Desktop or Applications folder

### For the .app bundle:
1. Drag `Vintage Lister.app` to your Applications folder
2. Or create an alias and put it on your Desktop

---

## 🔧 Troubleshooting

### "Port already in use"
The launcher will automatically clean up old processes. If it still fails:
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### "Permission denied"
Make sure the files are executable:
```bash
chmod +x "Launch Vintage Lister.command"
chmod +x "Vintage Lister.app/Contents/MacOS/Vintage Lister"
```

### "Cannot open .app" (macOS security)
1. Right-click on `Vintage Lister.app`
2. Click "Open"
3. Confirm you want to open it

### Dependencies won't install
Make sure you have Node.js installed:
```bash
node --version
npm --version
```

If not, install from: https://nodejs.org

---

## 🎯 Recommended Approach

**For everyday use**: Double-click `Launch Vintage Lister.command`
- Simple, reliable, shows status in Terminal
- Easy to see what's happening
- Easy to stop with Ctrl+C

**For a "real app" feel**: Use `Vintage Lister.app`
- Looks like a regular Mac application
- Can add to Dock or Applications folder
- Can assign custom icon

---

## 📁 File Locations

```
vintage-lister/
├── Launch Vintage Lister.command  ← Double-click this!
├── Vintage Lister.app/            ← Or this!
├── start-fullstack.sh             ← Terminal script
└── ... (rest of project files)
```

---

## 🚀 Quick Reference

| What You Want | What to Do |
|---------------|------------|
| Easiest launch | Double-click `Launch Vintage Lister.command` |
| App-like experience | Double-click `Vintage Lister.app` |
| Terminal control | Run `./start-fullstack.sh` |
| Backend only | Run `npm run dev:backend` |
| Frontend only | Run `npm run dev:frontend` |

---

## ✨ First Time Using?

1. Double-click `Launch Vintage Lister.command`
2. Wait for dependencies to install (happens once)
3. Browser opens automatically to http://localhost:3000
4. Upload some vintage item photos
5. Click "Analyze Items"
6. See the AI magic happen!

---

## 📞 Need Help?

- Check [SETUP-INSTRUCTIONS.md](SETUP-INSTRUCTIONS.md) for detailed setup
- Check [QUICKSTART-FULLSTACK.md](QUICKSTART-FULLSTACK.md) for quick tips
- Check [FULLSTACK-SETUP.md](FULLSTACK-SETUP.md) for architecture details

---

**Enjoy your AI-powered vintage listing tool!** 🎨✨
