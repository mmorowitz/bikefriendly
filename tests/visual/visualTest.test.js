import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { VisualTester, testAllPages, responsiveAnalysis } from './visualTesting.js';

describe('Visual Testing Suite', () => {
  let tester;

  beforeAll(async () => {
    tester = new VisualTester('http://localhost:3001');
    await tester.initialize();
  });

  afterAll(async () => {
    if (tester) {
      await tester.close();
    }
  });

  test('should capture screenshots for all pages', async () => {
    const results = await testAllPages(3001);
    
    expect(results).toHaveLength(4); // home, contact, faq, sponsorship
    
    results.forEach(result => {
      if (result.error) {
        console.warn(`Warning: ${result.page} page failed:`, result.error);
      } else {
        expect(result.results).toHaveLength(4); // mobile, tablet, desktop, mobile_landscape
      }
    });
  }, 30000); // 30 second timeout

  test('should analyze responsive layout', async () => {
    const analysis = await tester.compareResponsiveLayout('/', 'home');
    
    expect(analysis).toHaveProperty('mobile');
    expect(analysis).toHaveProperty('desktop');
    
    // Check that mobile layout is responsive (no horizontal scroll)
    expect(analysis.mobile.responsive).toBe(true);
    expect(analysis.desktop.responsive).toBe(true);
  }, 15000);

  test('should test accessibility basics', async () => {
    const accessibility = await tester.testAccessibility('/', 'home');
    
    expect(accessibility).toHaveProperty('issues');
    expect(Array.isArray(accessibility.issues)).toBe(true);
    
    // Log accessibility issues for review
    if (accessibility.issues.length > 0) {
      console.log('Accessibility issues found:', accessibility.issues);
    }
  }, 10000);

  test('should capture individual page screenshots', async () => {
    const results = await tester.capturePageScreenshots('/', 'home');
    
    expect(results).toHaveLength(4);
    
    results.forEach(result => {
      expect(result).toHaveProperty('viewport');
      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('filepath');
      expect(result).toHaveProperty('dimensions');
    });
  }, 15000);
});

describe('Standalone Testing Functions', () => {
  test('should run responsive analysis', async () => {
    const analysis = await responsiveAnalysis('/', 3001);
    
    expect(analysis).toHaveProperty('mobile');
    expect(analysis).toHaveProperty('desktop');
    expect(analysis.mobile.responsive).toBe(true);
  }, 15000);
});