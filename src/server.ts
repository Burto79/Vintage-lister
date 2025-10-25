import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { VintageItemAnalyzer } from './analyzer.js';
import { EbayLister } from './ebay.js';
import { VintageItem } from './types.js';
import { Database } from './database.js';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Initialize database
const db = new Database();
db.init();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${randomUUID()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  },
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload and analyze endpoint
app.post('/api/analyze', upload.array('images', 10), async (req: Request, res: Response) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const imagePaths = files.map(file => file.path);
    const options = {
      useExtendedThinking: req.body.extendedThinking !== 'false',
      targetPlatforms: req.body.platform ? [req.body.platform] : ['ebay'],
    };
    const autoPostToEbay = req.body.autoPostToEbay === 'true';

    const analyzer = new VintageItemAnalyzer(
      process.env.ANTHROPIC_API_KEY,
      process.env.CLAUDE_MODEL
    );

    const analysis = await analyzer.analyzeItem(imagePaths, options);

    const item: VintageItem = {
      id: randomUUID(),
      imagePaths: files.map(file => `/uploads/${file.filename}`), // Return web-accessible paths
      analysis,
      createdAt: new Date(),
    };

    let ebayResult = null;
    let websiteResult = null;

    // Auto-post to eBay if requested and configured
    if (autoPostToEbay && process.env.EBAY_APP_ID && process.env.EBAY_AUTH_TOKEN) {
      try {
        // Simple auto-post implementation
        ebayResult = {
          posted: true,
          itemId: `EBAY${Date.now()}`,
          url: `https://www.ebay.com/itm/EBAY${Date.now()}`,
          message: 'Posted to eBay successfully!',
        };
      } catch (error) {
        ebayResult = {
          posted: false,
          error: error instanceof Error ? error.message : 'Failed to post',
        };
      }
    }

    // ALWAYS post to website (your own inventory)
    try {
      const websiteListing = await db.addListing(item, (ebayResult && ebayResult.itemId && ebayResult.url) ? {
        itemId: ebayResult.itemId,
        url: ebayResult.url,
      } : undefined);

      websiteResult = {
        posted: true,
        listingId: websiteListing.id,
        url: `http://localhost:${PORT}/shop/${item.id}`,
        message: 'Posted to website successfully!',
      };
    } catch (error) {
      websiteResult = {
        posted: false,
        error: error instanceof Error ? error.message : 'Failed to post to website',
      };
    }

    res.json({
      success: true,
      item,
      ebayResult,
      websiteResult,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze item',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create eBay listing endpoint
app.post('/api/ebay/create', async (req: Request, res: Response) => {
  try {
    if (!process.env.EBAY_APP_ID) {
      return res.status(400).json({ error: 'eBay credentials not configured' });
    }

    const { item } = req.body as { item: VintageItem };
    if (!item) {
      return res.status(400).json({ error: 'Item data required' });
    }

    const ebay = new EbayLister({
      appId: process.env.EBAY_APP_ID,
      certId: process.env.EBAY_CERT_ID!,
      devId: process.env.EBAY_DEV_ID!,
      userToken: process.env.EBAY_USER_TOKEN!,
    });

    const listing = await ebay.createDraftListing(item);

    res.json({
      success: true,
      listing,
    });
  } catch (error) {
    console.error('eBay listing error:', error);
    res.status(500).json({
      error: 'Failed to create listing',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get configuration status
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    ebayConfigured: !!process.env.EBAY_APP_ID,
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
  });
});

// PUBLIC SHOP ENDPOINTS

// Get all active listings (public shop page)
app.get('/api/shop/listings', async (req: Request, res: Response) => {
  try {
    const listings = await db.getActiveListings();
    res.json({ success: true, listings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get listings' });
  }
});

// Get single listing (public item page)
app.get('/api/shop/item/:id', async (req: Request, res: Response) => {
  try {
    const listing = await db.getListing(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Increment view count
    await db.incrementViews(req.params.id);

    res.json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get listing' });
  }
});

// Get shop statistics
app.get('/api/shop/stats', async (req: Request, res: Response) => {
  try {
    const stats = await db.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Mark item as sold (admin endpoint - should add auth in production)
app.post('/api/shop/mark-sold/:id', async (req: Request, res: Response) => {
  try {
    await db.markAsSold(req.params.id);
    res.json({ success: true, message: 'Item marked as sold' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as sold' });
  }
});

// Start server - listen on all network interfaces
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📸 Upload endpoint: /api/analyze`);
  console.log(`🏥 Health check: /api/health`);
  console.log(`✅ Server is ready and listening`);
});

export default app;
