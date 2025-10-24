#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import dotenv from 'dotenv';
import path from 'path';
import { VintageItemAnalyzer } from './analyzer.js';
import { ImageWatcher } from './watcher.js';
import { EbayLister } from './ebay.js';
import { VintageItem } from './types.js';
import { randomUUID } from 'crypto';

dotenv.config();

const program = new Command();

program
  .name('vintage-lister')
  .description('AI-powered vintage item listing tool with Claude extended thinking')
  .version('1.0.0');

// Analyze command
program
  .command('analyze')
  .description('Analyze vintage item images and generate listing')
  .argument('[images...]', 'Image file paths')
  .option('-e, --extended-thinking', 'Use extended thinking (default: true)', true)
  .option('-p, --platform <platform>', 'Target platform', 'ebay')
  .option('--no-post', 'Only analyze, do not post')
  .action(async (images: string[], options) => {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error(chalk.red('❌ ANTHROPIC_API_KEY not found in .env'));
        process.exit(1);
      }

      if (!images || images.length === 0) {
        console.error(chalk.red('❌ Please provide at least one image path'));
        process.exit(1);
      }

      const spinner = ora('Analyzing vintage item with Claude...').start();

      const analyzer = new VintageItemAnalyzer(
        process.env.ANTHROPIC_API_KEY,
        process.env.CLAUDE_MODEL
      );

      const analysis = await analyzer.analyzeItem(images, {
        useExtendedThinking: options.extendedThinking,
        targetPlatforms: [options.platform],
      });

      spinner.succeed('Analysis complete!');

      // Display results
      console.log('\n' + chalk.bold.cyan('📊 ANALYSIS RESULTS'));
      console.log(chalk.bold('\nTitle:'), analysis.title);
      console.log(chalk.bold('Era:'), analysis.era);
      console.log(chalk.bold('Condition:'), analysis.condition);
      console.log(chalk.bold('Category:'), analysis.category);

      if (analysis.brandOrMaker) {
        console.log(chalk.bold('Brand:'), analysis.brandOrMaker);
      }

      console.log(chalk.bold('\nSuggested Price:'));
      console.log(`  💰 $${analysis.suggestedPrice.recommended}`);
      console.log(`  Range: $${analysis.suggestedPrice.low} - $${analysis.suggestedPrice.high}`);
      console.log(chalk.dim(`  ${analysis.suggestedPrice.reasoning}`));

      console.log(chalk.bold('\nKeywords:'));
      console.log(`  ${analysis.keywords.join(', ')}`);

      if (analysis.flaws && analysis.flaws.length > 0) {
        console.log(chalk.bold.yellow('\n⚠️  Flaws:'));
        analysis.flaws.forEach((flaw) => console.log(`  - ${flaw}`));
      }

      if (options.extendedThinking && analysis.reasoning) {
        console.log(chalk.bold.blue('\n🧠 Extended Thinking Summary:'));
        const reasoningPreview = analysis.reasoning.substring(0, 300);
        console.log(chalk.dim(`  ${reasoningPreview}...`));
        console.log(chalk.dim(`  [Full reasoning: ${analysis.reasoning.length} chars]`));
      }

      // Create eBay draft if requested
      if (options.post !== false) {
        const item: VintageItem = {
          id: randomUUID(),
          imagePaths: images,
          analysis,
          createdAt: new Date(),
        };

        if (process.env.EBAY_APP_ID) {
          const ebaySpinner = ora('Creating eBay draft listing...').start();
          const ebay = new EbayLister({
            appId: process.env.EBAY_APP_ID,
            certId: process.env.EBAY_CERT_ID!,
            devId: process.env.EBAY_DEV_ID!,
            userToken: process.env.EBAY_USER_TOKEN!,
          });

          const listing = await ebay.createDraftListing(item);
          ebaySpinner.succeed('Draft listing created!');

          console.log(chalk.bold.green('\n✅ Ready to post to eBay'));
        } else {
          console.log(chalk.yellow('\n⚠️  eBay credentials not configured'));
          console.log(chalk.dim('   Add eBay API keys to .env to enable posting'));
        }
      }

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

// Watch command
program
  .command('watch')
  .description('Watch folder for new images and auto-analyze')
  .option('-f, --folder <path>', 'Folder to watch', process.env.WATCH_FOLDER)
  .option('--auto-post', 'Automatically create listings', false)
  .action(async (options) => {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error(chalk.red('❌ ANTHROPIC_API_KEY not found in .env'));
        process.exit(1);
      }

      if (!options.folder) {
        console.error(chalk.red('❌ Watch folder not specified'));
        console.log(chalk.dim('   Set WATCH_FOLDER in .env or use --folder option'));
        process.exit(1);
      }

      const isValid = await ImageWatcher.validateFolder(options.folder);
      if (!isValid) {
        console.error(chalk.red(`❌ Folder not found: ${options.folder}`));
        process.exit(1);
      }

      console.log(chalk.bold.cyan('👁️  VINTAGE LISTER - WATCH MODE'));
      console.log(chalk.dim(`Waiting for new images in: ${options.folder}\n`));

      const analyzer = new VintageItemAnalyzer(process.env.ANTHROPIC_API_KEY);
      const watcher = new ImageWatcher({ folder: options.folder });

      watcher.on('images', async (images: string[]) => {
        console.log(chalk.bold(`\n📸 Processing ${images.length} new image(s)...`));

        const spinner = ora('Analyzing with Claude extended thinking...').start();

        try {
          const analysis = await analyzer.analyzeItem(images, {
            useExtendedThinking: true,
          });

          spinner.succeed('Analysis complete!');

          console.log(chalk.bold('Title:'), analysis.title);
          console.log(chalk.bold('Price:'), `$${analysis.suggestedPrice.recommended}`);
          console.log(chalk.bold('Condition:'), analysis.condition);

          if (options.autoPost && process.env.EBAY_APP_ID) {
            // Auto-create listing
            console.log(chalk.dim('Auto-posting enabled...'));
          }

        } catch (error) {
          spinner.fail('Analysis failed');
          console.error(chalk.red('Error:'), error);
        }
      });

      watcher.on('error', (error) => {
        console.error(chalk.red('Watcher error:'), error);
      });

      watcher.start();

      // Keep process running
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n\n👋 Stopping watcher...'));
        await watcher.stop();
        process.exit(0);
      });

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

// Auto-post command (full automation!)
program
  .command('auto')
  .description('🤖 FULL AUTOMATION: Photo → AI → eBay → Notify when sold')
  .option('-f, --folder <path>', 'Folder to watch', process.env.WATCH_FOLDER)
  .option('--no-auto-post', 'Analyze only, do not auto-post')
  .option('--no-notifications', 'Disable sale notifications')
  .action(async (options) => {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.error(chalk.red('❌ ANTHROPIC_API_KEY not found in .env'));
        process.exit(1);
      }

      if (!options.folder) {
        console.error(chalk.red('❌ Watch folder not specified'));
        console.log(chalk.dim('   Set WATCH_FOLDER in .env or use --folder option'));
        process.exit(1);
      }

      const { AutoLister } = await import('./auto-lister.js');

      console.log(chalk.bold.cyan('\n🤖 VINTAGE LISTER - FULL AUTO MODE\n'));

      const autoLister = new AutoLister({
        watchFolder: options.folder,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        ebayAppId: process.env.EBAY_APP_ID,
        ebayAuthToken: process.env.EBAY_AUTH_TOKEN,
        autoPost: options.autoPost !== false,
        notifyOnSale: options.notifications !== false,
      });

      await autoLister.start();

      // Keep process running
      process.on('SIGINT', async () => {
        await autoLister.stop();
        process.exit(0);
      });

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error);
      process.exit(1);
    }
  });

program.parse();
