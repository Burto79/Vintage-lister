# Vintage Lister - Full Stack Setup Guide

## Overview

You now have a complete full-stack application with:
- **Backend**: Express.js API server with image upload and Claude AI analysis
- **Frontend**: React + Vite modern web interface
- **CLI**: Original command-line interface (still available)

## Architecture

```
vintage-lister/
├── src/                    # Backend source code
│   ├── server.ts          # Express API server
│   ├── analyzer.ts        # Claude AI analyzer
│   ├── ebay.ts           # eBay integration
│   ├── cli.ts            # CLI interface
│   └── types.ts          # TypeScript types
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.tsx
│   │   │   └── AnalysisResults.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── *.css
│   ├── index.html
│   └── package.json
├── uploads/              # Image upload directory (auto-created)
└── package.json         # Backend dependencies
```

## Quick Start

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Install Frontend Dependencies

```bash
npm run install:frontend
```

### 3. Configure Environment

Make sure your `.env` file has the required API key:

```bash
ANTHROPIC_API_KEY=your_key_here
PORT=3001
```

### 4. Run the Full Stack Application

**Option A: Run backend and frontend separately (recommended for development)**

Terminal 1 - Backend:
```bash
npm run dev:backend
```

Terminal 2 - Frontend:
```bash
npm run dev:frontend
```

**Option B: Build and run production**

```bash
# Build everything
npm run build:all

# Start backend
npm run start:backend

# Frontend is served as static files from backend in production
```

## Accessing the Application

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## API Endpoints

### POST `/api/analyze`
Upload and analyze vintage item images.

**Request**: `multipart/form-data`
- `images`: Image files (up to 10)
- `extendedThinking`: boolean (optional, default: true)

**Response**:
```json
{
  "success": true,
  "item": {
    "id": "uuid",
    "imagePaths": ["/uploads/..."],
    "analysis": {
      "title": "...",
      "description": "...",
      "era": "...",
      "condition": "...",
      "suggestedPrice": {...},
      "keywords": [...],
      ...
    }
  }
}
```

### POST `/api/ebay/create`
Create eBay listing (requires eBay credentials).

**Request**: `application/json`
```json
{
  "item": { /* VintageItem object */ }
}
```

### GET `/api/config`
Get configuration status.

**Response**:
```json
{
  "anthropicConfigured": true,
  "ebayConfigured": false,
  "model": "claude-sonnet-4-20250514"
}
```

## Using the Frontend

1. **Upload Images**: Click or drag-and-drop up to 10 images
2. **Configure**: Toggle extended thinking on/off
3. **Analyze**: Click "Analyze Items" button
4. **Review**: See AI-generated listing details, pricing, and keywords
5. **Post**: Export to eBay or save draft

## Using the CLI (Original Functionality)

The CLI interface is still available:

```bash
# Analyze images via CLI
npm run analyze -- image1.jpg image2.jpg

# Watch folder for new images
npm run dev watch --folder /path/to/photos
```

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:backend` | Run backend in watch mode |
| `npm run dev:frontend` | Run frontend dev server |
| `npm run build:backend` | Build backend TypeScript |
| `npm run build:frontend` | Build frontend for production |
| `npm run build:all` | Build both backend and frontend |
| `npm run start:backend` | Start production backend |
| `npm run analyze` | CLI: Analyze images |
| `npm run install:frontend` | Install frontend dependencies |

## Features

### Backend Features
- Image upload with validation (JPEG, PNG, GIF, WebP)
- File size limit: 10MB per image
- Claude AI integration with extended thinking
- eBay API integration
- CORS enabled for frontend
- Static file serving for uploads

### Frontend Features
- Drag-and-drop image upload
- Image preview with remove option
- Extended thinking toggle
- Real-time analysis results
- Price suggestions with reasoning
- Keyword tags
- Flaw detection display
- Responsive design
- Modern, gradient UI

## Environment Variables

```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...

# Optional - Backend
PORT=3001
CLAUDE_MODEL=claude-sonnet-4-20250514

# Optional - eBay Integration
EBAY_APP_ID=...
EBAY_CERT_ID=...
EBAY_DEV_ID=...
EBAY_USER_TOKEN=...

# Optional - CLI Watch Mode
WATCH_FOLDER=/path/to/photos
```

## Troubleshooting

### Backend won't start
- Check that port 3001 is available
- Verify `ANTHROPIC_API_KEY` is set in `.env`
- Run `npm install` to ensure dependencies are installed

### Frontend won't connect to backend
- Ensure backend is running on port 3001
- Check Vite proxy configuration in `frontend/vite.config.ts`
- Verify CORS is enabled in `src/server.ts`

### Images won't upload
- Check file size (must be < 10MB)
- Verify file type (JPEG, PNG, GIF, WebP only)
- Ensure `uploads/` directory exists (auto-created on first upload)

### Extended thinking is slow
- This is normal - Claude's extended thinking provides deeper analysis
- Consider disabling for faster results with simpler analysis

## Tech Stack

**Backend**
- Node.js + TypeScript
- Express.js
- Multer (file uploads)
- Anthropic Claude SDK
- Sharp (image processing)

**Frontend**
- React 18
- TypeScript
- Vite (build tool)
- Axios (HTTP client)
- CSS3 with CSS Variables

## Next Steps

1. Implement eBay posting from frontend
2. Add user authentication
3. Create listing history/database
4. Add image editing features
5. Implement batch processing
6. Add more marketplace integrations (Depop, Poshmark, etc.)

## License

MIT
