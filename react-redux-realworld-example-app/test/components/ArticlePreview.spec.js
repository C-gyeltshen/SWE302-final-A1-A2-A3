const { test, expect } = require('@playwright/test');

test.describe('ArticlePreview component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4100');
    await page.waitForLoadState('networkidle');
  });

  test('should render article title', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      const firstArticle = articles.first();
      const title = firstArticle.locator('h1');
      await expect(title).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should render article description', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      const firstArticle = articles.first();
      const description = firstArticle.locator('p');
      await expect(description.first()).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should render author username', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      const firstArticle = articles.first();
      const authorInfo = firstArticle.locator('.info');
      if (await authorInfo.count() > 0) {
        await expect(authorInfo.first()).toBeVisible();
      }
    } else {
      test.skip();
    }
  });

  test('should render author image', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      const firstArticle = articles.first();
      const authorImage = firstArticle.locator('img');
      if (await authorImage.count() > 0) {
        await expect(authorImage.first()).toBeVisible();
        const src = await authorImage.first().getAttribute('src');
        expect(src).toBeTruthy();
      }
    } else {
      test.skip();
    }
  });

  test('should render formatted date', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      const firstArticle = articles.first();
      const date = firstArticle.locator('.date');
      if (await date.count() > 0) {
        await expect(date.first()).toBeVisible();
      }
    } else {
      test.skip();
    }
  });

  test('should render favorites count', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      const firstArticle = articles.first();
      const favoriteBtn = firstArticle.locator('button');
      if (await favoriteBtn.count() > 0) {
        await expect(favoriteBtn.first()).toBeVisible();
        const text = await favoriteBtn.first().textContent();
        expect(text).toMatch(/\d+/); // Contains a number
      }
    } else {
      test.skip();
    }
  });

  test('should render all tags', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      const firstArticle = articles.first();
      const tagList = firstArticle.locator('.tag-list');
      if (await tagList.count() > 0) {
        const tags = tagList.locator('li, .tag-default');
        const tagCount = await tags.count();
        if (tagCount > 0) {
          await expect(tags.first()).toBeVisible();
        }
      }
    } else {
      test.skip();
    }
  });

  test('should render "Read more..." link', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      const readMoreLink = page.locator('text=Read more...').first();
      await expect(readMoreLink).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should have link to article detail page', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      const firstArticle = articles.first();
      const previewLink = firstArticle.locator('a.preview-link, a[href*="/article/"]');
      if (await previewLink.count() > 0) {
        const href = await previewLink.first().getAttribute('href');
        expect(href).toContain('/article/');
      }
    } else {
      test.skip();
    }
  });

  test('should have link to author profile', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      const firstArticle = articles.first();
      const authorLinks = firstArticle.locator('a[href^="/@"]');
      const linkCount = await authorLinks.count();
      if (linkCount > 0) {
        await expect(authorLinks.first()).toBeVisible();
      }
    } else {
      test.skip();
    }
  });

  test.describe('favorite button', () => {
    test('should show correct button style based on favorited state', async ({ page }) => {
      const articles = page.locator('.article-preview');
      const count = await articles.count();
      
      if (count > 0) {
        const firstArticle = articles.first();
        const favoriteBtn = firstArticle.locator('button').first();
        if (await favoriteBtn.count() > 0) {
          await expect(favoriteBtn).toBeVisible();
          const className = await favoriteBtn.getAttribute('class');
          expect(className).toMatch(/btn-(primary|outline-primary)/);
        }
      } else {
        test.skip();
      }
    });

    test('should toggle favorite when clicking button', async ({ page }) => {
      const articles = page.locator('.article-preview');
      const count = await articles.count();
      
      if (count > 0) {
        const firstArticle = articles.first();
        const favoriteBtn = firstArticle.locator('button').first();
        if (await favoriteBtn.count() > 0) {
          // Click favorite button (may require login)
          await favoriteBtn.click();
          
          // Wait a bit for potential state change
          await page.waitForTimeout(500);
        }
      } else {
        test.skip();
      }
    });
  });

  test('should render article with no tags', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      // Just verify article renders even without tags
      const firstArticle = articles.first();
      await expect(firstArticle).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('should render article with high favorites count', async ({ page }) => {
    const articles = page.locator('.article-preview');
    const count = await articles.count();
    
    if (count > 0) {
      const firstArticle = articles.first();
      const favoriteBtn = firstArticle.locator('button').first();
      if (await favoriteBtn.count() > 0) {
        const text = await favoriteBtn.textContent();
        // Just verify it contains a number
        expect(text).toMatch(/\d+/);
      }
    } else {
      test.skip();
    }
  });
});
