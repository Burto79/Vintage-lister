import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { ItemAnalysis, AnalyzeOptions } from './types.js';

interface QuestionAnswer {
  question: string;
  answer: string;
}

export class SmartAnalyzer {
  private client: Anthropic;
  private haikuModel = 'claude-3-5-haiku-20241022';  // Fast & cheap for initial analysis
  private sonnetModel = 'claude-sonnet-4-20250514';  // Deep thinking for final description

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Analyze with interactive questions
   */
  async analyzeWithQuestions(
    imagePaths: string[],
    options: AnalyzeOptions & { onQuestion?: (q: string) => Promise<string> } = {}
  ): Promise<ItemAnalysis> {
    const { useExtendedThinking = true, onQuestion } = options;

    // Load images
    const imageContents = await this.loadImages(imagePaths);

    console.log('\n🧠 Starting AI analysis with Claude Haiku...\n');

    // Step 1: Initial quick analysis with Haiku (asks questions if needed)
    const initialAnalysis = await this.performInitialAnalysis(imageContents, onQuestion);

    console.log('\n✅ Initial analysis complete!');
    console.log('📋 Category:', initialAnalysis.category);
    console.log('🏷️  Era:', initialAnalysis.era);
    console.log('⭐ Condition:', initialAnalysis.condition);

    // Step 2: Use Sonnet with extended thinking for detailed description & pricing
    console.log('\n🧠 Generating detailed description and pricing with Claude Sonnet...\n');

    const finalAnalysis = await this.generateDetailedListing(
      imageContents,
      initialAnalysis,
      useExtendedThinking
    );

    return finalAnalysis;
  }

  /**
   * Step 1: Quick analysis with Haiku that asks questions
   */
  private async performInitialAnalysis(
    imageContents: any[],
    onQuestion?: (q: string) => Promise<string>
  ): Promise<Partial<ItemAnalysis>> {
    const response = await this.client.messages.create({
      model: this.haikuModel,
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          ...imageContents,
          {
            type: 'text',
            text: `You are an expert vintage item analyst. Analyze these images.

IMPORTANT: If you need ANY information to make accurate analysis, ASK QUESTIONS!

Questions you might need to ask:
- Is there a size tag I can't see clearly?
- Are there any markings or labels on the back/inside?
- What's the fabric/material feel like (if clothing)?
- Any damage not visible in photos?
- Measurements (length, width, etc.)?

First, determine:
1. What type of item is this?
2. What era/decade is it from?
3. What's the condition?
4. What category does it belong to?

If you need to ask questions, respond in this format:
QUESTIONS:
1. [Your question]
2. [Your question]

Otherwise, respond in JSON:
{
  "category": "category name",
  "era": "1960s" or specific decade,
  "condition": "Excellent/Very Good/Good/Fair",
  "itemType": "what it is",
  "questionsNeeded": false
}`,
          },
        ],
      }],
    });

    const content = response.content.find(c => c.type === 'text')?.text || '';

    // Check if AI needs to ask questions
    if (content.includes('QUESTIONS:')) {
      const questions = this.extractQuestions(content);

      if (onQuestion && questions.length > 0) {
        const answers: QuestionAnswer[] = [];

        for (const question of questions) {
          console.log('\n❓', question);
          const answer = await onQuestion(question);
          answers.push({ question, answer });
          console.log('✓ Answered:', answer);
        }

        // Re-run analysis with answers
        return await this.analyzeWithAnswers(imageContents, answers);
      }
    }

    // Parse JSON response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback parsing
    }

    return {
      category: 'Vintage Item',
      era: 'Unknown',
      condition: 'Good',
    };
  }

  /**
   * Re-analyze with user answers
   */
  private async analyzeWithAnswers(
    imageContents: any[],
    answers: QuestionAnswer[]
  ): Promise<Partial<ItemAnalysis>> {
    const answersText = answers
      .map(qa => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join('\n\n');

    const response = await this.client.messages.create({
      model: this.haikuModel,
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: [
          ...imageContents,
          {
            type: 'text',
            text: `Analyze this vintage item based on the images AND these answers:

${answersText}

Respond in JSON:
{
  "category": "category name",
  "era": "1960s" or specific decade,
  "condition": "Excellent/Very Good/Good/Fair",
  "itemType": "what it is",
  "brandOrMaker": "if identifiable",
  "materials": ["material1", "material2"],
  "measurements": "if provided"
}`,
          },
        ],
      }],
    });

    const content = response.content.find(c => c.type === 'text')?.text || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {};
  }

  /**
   * Step 2: Generate detailed description & pricing with Sonnet + Extended Thinking
   */
  private async generateDetailedListing(
    imageContents: any[],
    initialData: Partial<ItemAnalysis>,
    useExtendedThinking: boolean
  ): Promise<ItemAnalysis> {
    const requestConfig: any = {
      model: this.sonnetModel,
      max_tokens: 16000,
      messages: [{
        role: 'user',
        content: [
          ...imageContents,
          {
            type: 'text',
            text: `You are an expert vintage appraiser and seller. Your job is to:

1. DESCRIBE the item in detail (what it is, era, style, condition, unique features)
2. DETERMINE its VALUE (market price based on condition, rarity, demand)

Initial analysis:
${JSON.stringify(initialData, null, 2)}

Create a professional listing with:

1. TITLE (max 80 chars, SEO-optimized, include era & key details)
2. DETAILED DESCRIPTION:
   - What the item is exactly
   - Era and style period
   - Condition assessment
   - Unique features or details
   - Story/appeal (why someone would want this)
   - Honest mention of any flaws

3. VALUATION (CRITICAL):
   - Analyze comparable sales and market demand
   - Consider: era, condition, rarity, brand/maker, current trends
   - Provide: recommended selling price + low/high range
   - Explain your pricing reasoning clearly

4. KEYWORDS for discoverability
5. CONDITION DETAILS (flaws, wear, age-appropriate issues)

Respond in JSON:
{
  "title": "SEO-optimized title",
  "description": "Detailed, compelling description",
  "category": "${initialData.category}",
  "era": "${initialData.era}",
  "condition": "${initialData.condition}",
  "brandOrMaker": "if known",
  "materials": ["material1", "material2"],
  "measurements": "if known",
  "suggestedPrice": {
    "recommended": 45.00,
    "low": 35.00,
    "high": 55.00,
    "reasoning": "why this price"
  },
  "keywords": ["keyword1", "keyword2", ...],
  "flaws": ["flaw1", "flaw2"] or [],
  "conditionDetails": ["detail1", "detail2"],
  "reasoning": "your detailed thinking process"
}`,
          },
        ],
      }],
    };

    // Add extended thinking if requested
    if (useExtendedThinking) {
      requestConfig.thinking = {
        type: 'enabled',
        budget_tokens: 10000,
      };
    }

    const response = await this.client.messages.create(requestConfig);

    // Extract reasoning from thinking blocks (commented out for SDK compatibility)
    // let reasoning = '';
    // for (const block of response.content) {
    //   if (block.type === 'thinking') {
    //     reasoning += block.thinking + '\n\n';
    //   }
    // }

    // Extract JSON from text content
    const textContent = response.content.find(c => c.type === 'text')?.text || '';
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);

      // Add reasoning from thinking blocks (commented out for SDK compatibility)
      // if (reasoning && !analysis.reasoning) {
      //   analysis.reasoning = reasoning;
      // }

      return analysis;
    }

    throw new Error('Failed to parse analysis');
  }

  /**
   * Extract questions from AI response
   */
  private extractQuestions(content: string): string[] {
    const questionsSection = content.split('QUESTIONS:')[1];
    if (!questionsSection) return [];

    const lines = questionsSection.split('\n');
    const questions: string[] = [];

    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)/);
      if (match) {
        questions.push(match[1].trim());
      }
    }

    return questions;
  }

  /**
   * Load images as base64
   */
  private async loadImages(imagePaths: string[]) {
    return await Promise.all(
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
  }

  /**
   * Get media type from file extension
   */
  private getMediaType(ext: string): string {
    const types: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return types[ext] || 'image/jpeg';
  }

  /**
   * Create interactive question handler for CLI
   */
  static createCLIQuestionHandler(): (q: string) => Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return (question: string) => {
      return new Promise((resolve) => {
        rl.question(`${question}\nYour answer: `, (answer) => {
          resolve(answer.trim());
        });
      });
    };
  }
}
