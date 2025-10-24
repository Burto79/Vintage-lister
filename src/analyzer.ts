import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { ItemAnalysis, AnalyzeOptions } from './types.js';

export class VintageItemAnalyzer {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model = 'claude-sonnet-4-20250514') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  /**
   * Analyze vintage item images using Claude's vision
   * Note: Extended thinking will be enabled when available in SDK
   */
  async analyzeItem(
    imagePaths: string[],
    options: AnalyzeOptions = {}
  ): Promise<ItemAnalysis> {
    const {
      useExtendedThinking = true,
      targetPlatforms = ['ebay'],
    } = options;

    // Load images as base64
    const imageContents = await Promise.all(
      imagePaths.map(async (imgPath) => {
        const imageData = await fs.readFile(imgPath);
        const base64 = imageData.toString('base64');
        const ext = path.extname(imgPath).toLowerCase();
        const mediaType = this.getMediaType(ext);

        return {
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: mediaType,
            data: base64,
          },
        };
      })
    );

    const prompt = this.buildAnalysisPrompt(targetPlatforms, useExtendedThinking);

    // Create message with Claude vision
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 16000,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContents,
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract text response
    let analysisText = '';
    for (const block of response.content) {
      if (block.type === 'text') {
        analysisText += block.text;
      }
    }

    // Parse the JSON response
    const analysis = this.parseAnalysis(analysisText, '');
    return analysis;
  }

  private buildAnalysisPrompt(platforms: string[], useDeepThinking: boolean = true): string {
    const thinkingNote = useDeepThinking
      ? '\n\nBefore providing the JSON, think deeply about: authenticity markers, era indicators, construction methods, material quality, condition details, market demand, pricing strategy, and comparable items. Use this reasoning to inform your analysis.'
      : '';

    return `You are an expert vintage item appraiser and online seller. Analyze these images of a vintage item and provide a comprehensive analysis for listing on ${platforms.join(', ')}.${thinkingNote}

Please provide your analysis in the following JSON format:

{
  "title": "SEO-optimized listing title (80 chars max)",
  "description": "Detailed item description in HTML format, highlighting key features, era, condition, and appeal",
  "category": "Best category for listing",
  "era": "Time period (e.g., '1960s', 'Victorian', 'Mid-Century Modern')",
  "condition": "Overall condition (Excellent/Very Good/Good/Fair/Poor)",
  "conditionDetails": ["specific condition note 1", "specific condition note 2"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "brandOrMaker": "Brand or maker if identifiable",
  "materials": ["material1", "material2"],
  "measurements": "Approximate measurements if visible",
  "flaws": ["any visible flaws or damage"],
  "suggestedPrice": {
    "low": 25,
    "high": 45,
    "recommended": 35,
    "reasoning": "Why this price range based on era, condition, desirability"
  }
}

Important guidelines:
- Title should be keyword-rich and searchable
- Description should be engaging and detailed (mention style, era, unique features)
- Be honest about condition and flaws
- Price suggestions should be realistic for online vintage markets

Return ONLY the JSON, no additional text.`;
  }

  private parseAnalysis(text: string, thinking: string): ItemAnalysis {
    // Extract JSON from potential markdown code blocks
    let jsonText = text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
    }

    const parsed = JSON.parse(jsonText);

    return {
      ...parsed,
      reasoning: thinking, // Include extended thinking output
    };
  }

  private getMediaType(ext: string): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' {
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }
}
