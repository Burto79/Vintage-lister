# Quick Start Guide - Full Stack Version

## TL;DR - Get Running in 60 Seconds

```bash
# 1. Install everything
npm install && npm run install:frontend

# 2. Start the app
./start-fullstack.sh

# 3. Open browser
# http://localhost:3000
```

That's it! Upload images and get AI-powered vintage listings.

---

## What Just Happened?

You now have TWO ways to use Vintage Lister:

### 🌐 Web Interface (NEW!)
- Beautiful UI at http://localhost:3000
- Drag-and-drop image upload
- Real-time AI analysis
- Visual results display

### 💻 Command Line (Original)
```bash
# Analyze specific images
npm run analyze -- photo1.jpg photo2.jpg

# Watch a folder
npm run dev watch --folder /path/to/photos
```

---

## Architecture at a Glance

```
┌─────────────────┐
│   Browser       │  ← You interact here
│   localhost:3000│     (React Frontend)
└────────┬────────┘
         │
         │ HTTP API calls
         ▼
┌─────────────────┐
│   Backend       │
│   localhost:3001│  ← Express.js API
└────────┬────────┘
         │
         │ API calls
         ▼
┌─────────────────┐
│   Claude AI     │  ← Anthropic API
│                 │     (Extended Thinking)
└─────────────────┘
```

---

## Common Commands

| What You Want | Command |
|---------------|---------|
| Start everything | `./start-fullstack.sh` |
| Start backend only | `npm run dev:backend` |
| Start frontend only | `npm run dev:frontend` |
| Use CLI analyzer | `npm run analyze -- image.jpg` |
| Build for production | `npm run build:all` |

---

## File Upload Limits

- **Max files**: 10 images per upload
- **Max size**: 10MB per image
- **Formats**: JPG, PNG, GIF, WebP

---

## Extended Thinking

- ✅ **ON**: Better analysis, takes 10-30 seconds
- ⚡ **OFF**: Faster results, less detailed

Toggle in the web interface before analyzing.

---

## Ports

- **3000** - Frontend (React/Vite)
- **3001** - Backend (Express API)

Change backend port in `.env` if needed:
```bash
PORT=3002
```

---

## Project Structure

```
vintage-lister/
├── src/              ← Backend (Express + Claude)
├── frontend/         ← Frontend (React + Vite)
├── uploads/          ← Uploaded images (auto-created)
├── .env              ← Your API keys
└── start-fullstack.sh ← One-click start
```

---

## API Key Setup

Your `.env` should have:
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

Get your key from: https://console.anthropic.com

---

## Testing It Works

1. Start the app: `./start-fullstack.sh`
2. Open: http://localhost:3000
3. Upload a vintage item photo
4. Click "Analyze Items"
5. See AI-generated listing!

---

## Stopping the App

Press `Ctrl+C` in the terminal where you ran `start-fullstack.sh`

---

## Need More Details?

- [SETUP-INSTRUCTIONS.md](SETUP-INSTRUCTIONS.md) - Complete setup guide
- [FULLSTACK-SETUP.md](FULLSTACK-SETUP.md) - Architecture & API docs
- [README.md](README.md) - Original CLI documentation

---

## Troubleshooting One-Liners

**"Port already in use"**
```bash
lsof -ti:3001 | xargs kill -9
```

**"Dependencies not found"**
```bash
npm install && npm run install:frontend
```

**"Can't connect to backend"**
- Check backend is running
- Check `.env` has `ANTHROPIC_API_KEY`

**"Analysis failing"**
- Verify API key is valid
- Check image size < 10MB
- Try disabling extended thinking

---

## What's Next?

- Add eBay credentials to `.env` for auto-posting
- Customize the UI styling
- Set up watch mode for phone photo sync
- Build additional marketplace integrations

Happy listing! 🎨
