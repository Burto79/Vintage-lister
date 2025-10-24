# Vintage Lister - Complete Setup Instructions

## What You Have Now

Your Vintage Lister project now includes:

1. **Backend API Server** (Express.js)
   - REST API for image upload and analysis
   - Claude AI integration for vintage item analysis
   - eBay listing creation
   - File upload handling with Multer

2. **Frontend Web Application** (React + Vite)
   - Modern, responsive UI
   - Drag-and-drop image upload
   - Real-time analysis results display
   - Beautiful gradient design

3. **Original CLI Tool** (Still works!)
   - Command-line interface for batch processing
   - Watch mode for folder monitoring

## Installation & Setup

### Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run install:frontend
```

### Step 2: Verify Environment Configuration

Make sure your `.env` file contains:

```bash
ANTHROPIC_API_KEY=your_api_key_here
PORT=3001
```

### Step 3: Start the Application

**Easiest way - Use the start script:**

```bash
./start-fullstack.sh
```

This will:
- Check for dependencies
- Install if needed
- Start both backend and frontend
- Keep both running until you press Ctrl+C

**Manual way - Separate terminals:**

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

### Step 4: Open the Application

Once started, open your browser to:
- **http://localhost:3000** - Web UI
- **http://localhost:3001/api/health** - Backend health check

## Usage Guide

### Using the Web Interface

1. **Upload Images**
   - Click the upload box or drag and drop images
   - Select 1-10 images of your vintage item
   - Preview images before uploading

2. **Configure Analysis**
   - Toggle "Extended Thinking" for more detailed analysis
   - Extended thinking takes longer but provides better results

3. **Analyze**
   - Click "Analyze Items" button
   - Wait for Claude to process (10-30 seconds with extended thinking)

4. **Review Results**
   - Title and description automatically generated
   - Era, condition, and category identified
   - Suggested pricing with reasoning
   - Keywords for SEO
   - Any flaws detected
   - Full reasoning from Claude (if extended thinking enabled)

5. **Export**
   - Post to eBay (if configured)
   - Copy listing details
   - Save as draft

### Using the CLI (Original Functionality)

**Analyze specific images:**
```bash
npm run analyze -- path/to/image1.jpg path/to/image2.jpg
```

**Watch a folder for new images:**
```bash
npm run dev watch --folder /path/to/your/photos
```

## File Structure

```
vintage-lister/
├── src/                           # Backend source
│   ├── server.ts                 # Express API server ⭐ NEW
│   ├── analyzer.ts               # Claude AI analyzer
│   ├── ebay.ts                   # eBay integration
│   ├── cli.ts                    # CLI interface
│   ├── watcher.ts                # File watcher
│   └── types.ts                  # TypeScript types
│
├── frontend/                      # Frontend application ⭐ NEW
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.tsx   # Upload component
│   │   │   └── AnalysisResults.tsx # Results display
│   │   ├── App.tsx               # Main app
│   │   ├── App.css               # Styles
│   │   └── main.tsx              # Entry point
│   ├── index.html
│   ├── vite.config.ts            # Vite configuration
│   └── package.json              # Frontend dependencies
│
├── uploads/                       # Uploaded images (auto-created)
├── dist/                         # Compiled backend
├── .env                          # Environment variables
├── package.json                  # Backend dependencies
├── tsconfig.json                 # TypeScript config
├── start-fullstack.sh            # Quick start script ⭐ NEW
└── FULLSTACK-SETUP.md            # Detailed guide ⭐ NEW
```

## API Endpoints

### POST `/api/analyze`
Upload and analyze images.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `images`: File[] (1-10 images)
  - `extendedThinking`: boolean (optional)

**Response:**
```json
{
  "success": true,
  "item": {
    "id": "...",
    "imagePaths": [...],
    "analysis": {
      "title": "...",
      "description": "...",
      "era": "...",
      "condition": "...",
      "category": "...",
      "suggestedPrice": {
        "recommended": 45,
        "low": 35,
        "high": 55,
        "reasoning": "..."
      },
      "keywords": [...],
      "flaws": [...],
      "reasoning": "..."
    }
  }
}
```

### GET `/api/config`
Check configuration status.

**Response:**
```json
{
  "anthropicConfigured": true,
  "ebayConfigured": false,
  "model": "claude-sonnet-4-20250514"
}
```

### POST `/api/ebay/create`
Create eBay listing (requires eBay credentials).

## Available Scripts

| Script | Description |
|--------|-------------|
| `./start-fullstack.sh` | Start both backend and frontend |
| `npm run dev:backend` | Start backend dev server |
| `npm run dev:frontend` | Start frontend dev server |
| `npm run build:all` | Build both for production |
| `npm run start:backend` | Start production backend |
| `npm run analyze` | CLI: Analyze images |
| `npm run install:frontend` | Install frontend deps |

## Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **AI**: Anthropic Claude SDK
- **File Upload**: Multer
- **Image Processing**: Sharp
- **Environment**: dotenv

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **HTTP Client**: Axios
- **Styling**: CSS3 with CSS Variables

## Features

### Current Features
- Image upload (drag-and-drop)
- Claude AI analysis with extended thinking
- Pricing suggestions with reasoning
- Era and condition detection
- Keyword generation
- Flaw detection
- Real-time results display
- Responsive design
- CLI interface (backward compatible)

### Planned Features
- eBay posting from UI
- User authentication
- Listing history
- Image editing
- Batch processing
- Multiple marketplace support
- Analytics dashboard

## Troubleshooting

### "Port 3001 already in use"
Kill the process using that port or change the PORT in `.env`:
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

### "Cannot find module 'express'"
Install backend dependencies:
```bash
npm install
```

### Frontend shows network error
1. Make sure backend is running on port 3001
2. Check browser console for errors
3. Verify `.env` has `ANTHROPIC_API_KEY`

### Images not uploading
1. Check file size (max 10MB per image)
2. Verify file type (JPG, PNG, GIF, WebP only)
3. Check browser console for errors

### Extended thinking is slow
This is expected - extended thinking provides deeper analysis but takes 10-30 seconds. Disable it for faster results.

## Getting Help

- Check the [FULLSTACK-SETUP.md](FULLSTACK-SETUP.md) for detailed documentation
- Review the original [README.md](README.md) for CLI usage
- Check logs in the terminal where servers are running

## Next Steps

1. **Try it out**: Upload some vintage item photos
2. **Configure eBay**: Add eBay credentials to `.env` for posting
3. **Customize**: Modify the frontend styling in `frontend/src/App.css`
4. **Extend**: Add new features or integrations

Enjoy your AI-powered vintage listing tool!
