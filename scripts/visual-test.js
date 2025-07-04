#!/usr/bin/env node

/**
 * Visual Testing Script
 * 
 * Usage:
 *   node scripts/visual-test.js                    # Test all pages
 *   node scripts/visual-test.js --page=/contact    # Test specific page
 *   node scripts/visual-test.js --responsive       # Run responsive analysis
 *   node scripts/visual-test.js --quick            # Quick mobile screenshot
 *   node scripts/visual-test.js --port=3001        # Specify port (default: 3001)
 */

import { testAllPages, responsiveAnalysis, quickScreenshot } from '../tests/visual/visualTesting.js';

const args = process.argv.slice(2);
const options = {};

// Parse command line arguments
args.forEach(arg => {
  if (arg.startsWith('--page=')) {
    options.page = arg.split('=')[1];
  } else if (arg.startsWith('--port=')) {
    options.port = parseInt(arg.split('=')[1]);
  } else if (arg === '--responsive') {
    options.responsive = true;
  } else if (arg === '--quick') {
    options.quick = true;
  } else if (arg === '--help') {
    options.help = true;
  }
});

// Default port
if (!options.port) {
  options.port = 3001;
}

function showHelp() {
  console.log(`
🎨 Visual Testing Script

Usage:
  node scripts/visual-test.js                    # Test all pages
  node scripts/visual-test.js --page=/contact    # Test specific page  
  node scripts/visual-test.js --responsive       # Run responsive analysis
  node scripts/visual-test.js --quick            # Quick mobile screenshot
  node scripts/visual-test.js --port=3001        # Specify port (default: 3001)
  node scripts/visual-test.js --help             # Show this help

Examples:
  node scripts/visual-test.js                    # Capture all pages at all viewports
  node scripts/visual-test.js --page=/faq        # Just test FAQ page
  node scripts/visual-test.js --responsive       # Check responsive behavior
  node scripts/visual-test.js --quick            # Quick mobile screenshot of home page
  node scripts/visual-test.js --port=4321        # Use different port

Screenshots are saved to: tests/screenshots/
  `);
}

async function main() {
  if (options.help) {
    showHelp();
    return;
  }

  console.log('🚀 Starting Visual Testing...');
  console.log(`📍 Make sure your dev server is running on port ${options.port}: npm run dev`);
  console.log('');

  try {
    if (options.quick) {
      console.log('📸 Taking quick mobile screenshot...');
      await quickScreenshot('/', 'mobile', options.port);
      
    } else if (options.responsive) {
      console.log('📱 Running responsive analysis...');
      const analysis = await responsiveAnalysis(options.page || '/', options.port);
      
      console.log('\n📊 Responsive Analysis Results:');
      Object.entries(analysis).forEach(([viewport, data]) => {
        const status = data.responsive ? '✅ Responsive' : '❌ Not Responsive';
        console.log(`  ${viewport}: ${status} (${data.viewport.width}x${data.viewport.height})`);
        
        if (data.layout.hasHorizontalScroll) {
          console.log(`    ⚠️  Horizontal scroll detected`);
        }
      });
      
    } else if (options.page) {
      console.log(`📸 Testing page: ${options.page}`);
      const { VisualTester } = await import('../tests/visual/visualTesting.js');
      const tester = new VisualTester(`http://localhost:${options.port}`);
      await tester.initialize();
      
      try {
        const results = await tester.capturePageScreenshots(options.page, 'single-page');
        console.log(`✅ Captured ${results.length} screenshots`);
      } finally {
        await tester.close();
      }
      
    } else {
      console.log('📸 Testing all pages...');
      const results = await testAllPages(options.port);
      
      console.log('\n📊 Summary:');
      results.forEach(result => {
        if (result.error) {
          console.log(`  ❌ ${result.page}: ${result.error}`);
        } else {
          console.log(`  ✅ ${result.page}: ${result.results.length} screenshots`);
        }
      });
    }
    
    console.log('\n🎉 Visual testing complete!');
    
  } catch (error) {
    console.error('❌ Visual testing failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Tip: Make sure your dev server is running:');
      console.log('   npm run dev');
      console.log(`   Expected server on port ${options.port}`);
      console.log('   Use --port=XXXX to specify a different port');
    }
    
    process.exit(1);
  }
}

main().catch(console.error);