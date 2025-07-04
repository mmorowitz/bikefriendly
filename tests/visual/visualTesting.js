import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Common viewport sizes for testing
const VIEWPORTS = {
  mobile: { width: 375, height: 667, deviceScaleFactor: 2 }, // iPhone SE
  tablet: { width: 768, height: 1024, deviceScaleFactor: 1 }, // iPad
  desktop: { width: 1920, height: 1080, deviceScaleFactor: 1 }, // Desktop
  mobile_landscape: { width: 667, height: 375, deviceScaleFactor: 2 } // iPhone SE landscape
};

class VisualTester {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.browser = null;
    this.screenshotDir = join(__dirname, '../screenshots');
    
    // Ensure screenshots directory exists
    if (!existsSync(this.screenshotDir)) {
      mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async capturePageScreenshots(pagePath = '/', pageName = 'home') {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const page = await this.browser.newPage();
    const url = `${this.baseUrl}${pagePath}`;
    
    console.log(`📸 Capturing screenshots for ${pageName} at ${url}`);
    
    const results = [];

    try {
      // Navigate to page
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Capture screenshots for each viewport
      for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewport(viewport);
        
        // Wait for any dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const filename = `${pageName}_${viewportName}.png`;
        const filepath = join(this.screenshotDir, filename);
        
        await page.screenshot({
          path: filepath,
          fullPage: true
        });
        
        results.push({
          viewport: viewportName,
          filename,
          filepath,
          dimensions: `${viewport.width}x${viewport.height}`
        });
        
        console.log(`  ✓ ${viewportName} (${viewport.width}x${viewport.height}) -> ${filename}`);
      }
    } catch (error) {
      console.error(`❌ Error capturing screenshots for ${pageName}:`, error.message);
      throw error;
    } finally {
      await page.close();
    }

    return results;
  }

  async captureAllPages() {
    const pages = [
      { path: '/', name: 'home' },
      { path: '/contact', name: 'contact' },
      { path: '/faq', name: 'faq' },
      { path: '/sponsorship', name: 'sponsorship' }
    ];

    const allResults = [];

    for (const { path, name } of pages) {
      try {
        const results = await this.capturePageScreenshots(path, name);
        allResults.push({ page: name, results });
      } catch (error) {
        console.error(`Failed to capture ${name} page:`, error.message);
        allResults.push({ page: name, error: error.message });
      }
    }

    return allResults;
  }

  async compareResponsiveLayout(pagePath = '/', pageName = 'home') {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const page = await this.browser.newPage();
    const url = `${this.baseUrl}${pagePath}`;
    
    console.log(`🔍 Analyzing responsive layout for ${pageName}`);
    
    await page.goto(url, { waitUntil: 'networkidle2' });

    const analysis = {};

    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      await page.setViewport(viewport);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Analyze layout elements
      const layoutInfo = await page.evaluate(() => {
        const body = document.body;
        const nav = document.querySelector('nav');
        const main = document.querySelector('main');
        const footer = document.querySelector('footer');

        return {
          bodyWidth: body.scrollWidth,
          bodyHeight: body.scrollHeight,
          navHeight: nav ? nav.offsetHeight : 0,
          mainHeight: main ? main.offsetHeight : 0,
          footerHeight: footer ? footer.offsetHeight : 0,
          hasHorizontalScroll: body.scrollWidth > window.innerWidth,
          hasVerticalScroll: body.scrollHeight > window.innerHeight
        };
      });

      analysis[viewportName] = {
        viewport: viewport,
        layout: layoutInfo,
        responsive: !layoutInfo.hasHorizontalScroll
      };

      console.log(`  📱 ${viewportName}: ${layoutInfo.responsive ? '✓' : '❌'} responsive`);
    }

    await page.close();
    return analysis;
  }

  async testAccessibility(pagePath = '/', pageName = 'home') {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const page = await this.browser.newPage();
    const url = `${this.baseUrl}${pagePath}`;
    
    console.log(`♿ Testing accessibility for ${pageName}`);
    
    await page.goto(url, { waitUntil: 'networkidle2' });

    const accessibility = await page.evaluate(() => {
      const issues = [];
      
      // Check for alt text on images
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt) {
          issues.push(`Image ${index + 1} missing alt text`);
        }
      });

      // Check for proper heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length > 0) {
        const firstHeading = headings[0];
        if (firstHeading.tagName !== 'H1') {
          issues.push('Page should start with H1 heading');
        }
      }

      // Check for form labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        if (!input.labels || input.labels.length === 0) {
          issues.push(`Form input ${index + 1} missing label`);
        }
      });

      return {
        totalImages: images.length,
        totalHeadings: headings.length,
        totalInputs: inputs.length,
        issues
      };
    });

    await page.close();
    return accessibility;
  }
}

// Utility functions for common testing scenarios
export async function quickScreenshot(pagePath = '/', device = 'mobile', port = 3001) {
  const tester = new VisualTester(`http://localhost:${port}`);
  await tester.initialize();
  
  try {
    const results = await tester.capturePageScreenshots(pagePath, `quick_${device}`);
    console.log(`📸 Screenshots saved to: ${tester.screenshotDir}`);
    return results;
  } finally {
    await tester.close();
  }
}

export async function testAllPages(port = 3001) {
  const tester = new VisualTester(`http://localhost:${port}`);
  await tester.initialize();
  
  try {
    const results = await tester.captureAllPages();
    console.log(`\n📊 Complete! Screenshots saved to: ${tester.screenshotDir}`);
    return results;
  } finally {
    await tester.close();
  }
}

export async function responsiveAnalysis(pagePath = '/', port = 3001) {
  const tester = new VisualTester(`http://localhost:${port}`);
  await tester.initialize();
  
  try {
    const analysis = await tester.compareResponsiveLayout(pagePath, 'analysis');
    console.log('\n📱 Responsive Analysis Complete');
    return analysis;
  } finally {
    await tester.close();
  }
}

export { VisualTester, VIEWPORTS };