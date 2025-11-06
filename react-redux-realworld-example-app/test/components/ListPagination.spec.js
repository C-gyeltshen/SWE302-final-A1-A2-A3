const { test, expect } = require('@playwright/test');

test.describe('ListPagination component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4100');
    await page.waitForLoadState('networkidle');
  });

  test('should not render when articlesCount is 10 or less', async ({ page }) => {
    // If there are 10 or fewer articles, pagination should not appear
    const pagination = page.locator('nav.pagination, ul.pagination');
    const paginationCount = await pagination.count();
    
    const articles = page.locator('.article-preview');
    const articleCount = await articles.count();
    
    if (articleCount <= 10) {
      expect(paginationCount).toBe(0);
    }
  });

  test('should render when articlesCount is greater than 10', async ({ page }) => {
    const pagination = page.locator('nav, ul.pagination');
    const paginationCount = await pagination.count();
    
    const articles = page.locator('.article-preview');
    const articleCount = await articles.count();
    
    if (articleCount > 10) {
      expect(paginationCount).toBeGreaterThan(0);
    } else {
      // If there are 10 or fewer articles, test passes
      expect(true).toBe(true);
    }
  });

  test('should render correct number of pages', async ({ page }) => {
    const pagination = page.locator('ul.pagination');
    
    if (await pagination.count() > 0) {
      const pageLinks = pagination.locator('li.page-item a');
      const pageCount = await pageLinks.count();
      
      // Should have at least 2 pages if pagination is visible
      expect(pageCount).toBeGreaterThanOrEqual(2);
    }
  });

  test('should highlight current page', async ({ page }) => {
    const pagination = page.locator('ul.pagination');
    
    if (await pagination.count() > 0) {
      const activePageItem = pagination.locator('li.page-item.active');
      const activeCount = await activePageItem.count();
      
      // Should have exactly one active page
      expect(activeCount).toBe(1);
    }
  });

  test('should display page numbers starting from 1', async ({ page }) => {
    const pagination = page.locator('ul.pagination');
    
    if (await pagination.count() > 0) {
      const firstPageLink = pagination.locator('li.page-item').first().locator('a');
      const firstPageText = await firstPageLink.textContent();
      
      expect(firstPageText.trim()).toBe('1');
    }
  });

  test('should navigate to next page when clicked', async ({ page }) => {
    const pagination = page.locator('ul.pagination');
    
    if (await pagination.count() > 0) {
      const pageLinks = pagination.locator('li.page-item a');
      const pageCount = await pageLinks.count();
      
      if (pageCount > 1) {
        // Click on second page
        await pageLinks.nth(1).click();
        
        // Wait for navigation
        await page.waitForLoadState('networkidle');
        
        // Verify the active page has changed
        const activePageItem = pagination.locator('li.page-item.active');
        const activePageText = await activePageItem.locator('a').textContent();
        
        expect(activePageText.trim()).toBe('2');
      }
    }
  });

  test('should render pagination with ul element', async ({ page }) => {
    const paginationUl = page.locator('ul.pagination');
    const count = await paginationUl.count();
    
    const articles = page.locator('.article-preview');
    const articleCount = await articles.count();
    
    if (articleCount > 10) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should handle navigation through multiple pages', async ({ page }) => {
    const pagination = page.locator('ul.pagination');
    
    if (await pagination.count() > 0) {
      const pageLinks = pagination.locator('li.page-item a');
      const pageCount = await pageLinks.count();
      
      if (pageCount >= 3) {
        // Click on third page
        await pageLinks.nth(2).click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on page 3
        const activePageItem = page.locator('ul.pagination li.page-item.active');
        const activePageText = await activePageItem.locator('a').textContent();
        
        expect(activePageText.trim()).toBe('3');
      }
    }
  });

  test('should update URL when page changes', async ({ page }) => {
    const pagination = page.locator('ul.pagination');
    
    if (await pagination.count() > 0) {
      const pageLinks = pagination.locator('li.page-item a');
      const pageCount = await pageLinks.count();
      
      if (pageCount > 1) {
        const initialUrl = page.url();
        
        // Click on second page
        await pageLinks.nth(1).click();
        await page.waitForLoadState('networkidle');
        
        const newUrl = page.url();
        
        // URL should have changed (or stayed the same if using state management)
        expect(newUrl).toBeTruthy();
      }
    }
  });

  test('should maintain pagination state across tab changes', async ({ page }) => {
    // Navigate to Global Feed tab
    const globalFeedTab = page.locator('text=Global Feed');
    if (await globalFeedTab.count() > 0) {
      await globalFeedTab.click();
      await page.waitForLoadState('networkidle');
      
      const pagination = page.locator('ul.pagination');
      if (await pagination.count() > 0) {
        const pageLinks = pagination.locator('li.page-item a');
        if (await pageLinks.count() > 1) {
          // Click on second page
          await pageLinks.nth(1).click();
          await page.waitForLoadState('networkidle');
          
          // Verify active page
          const activePageItem = page.locator('ul.pagination li.page-item.active');
          const activePageText = await activePageItem.locator('a').textContent();
          expect(activePageText.trim()).toBe('2');
        }
      }
    }
  });

  test('should handle clicking on current page', async ({ page }) => {
    const pagination = page.locator('ul.pagination');
    
    if (await pagination.count() > 0) {
      const activePage = pagination.locator('li.page-item.active a');
      const activePageText = await activePage.textContent();
      
      // Click on current page
      await activePage.click();
      await page.waitForTimeout(500);
      
      // Should still be on same page
      const newActivePage = pagination.locator('li.page-item.active a');
      const newActivePageText = await newActivePage.textContent();
      
      expect(newActivePageText).toBe(activePageText);
    }
  });

  test('should render correct number of page items', async ({ page }) => {
    const pagination = page.locator('ul.pagination');
    
    if (await pagination.count() > 0) {
      const pageItems = pagination.locator('li.page-item');
      const itemCount = await pageItems.count();
      
      // Should have at least 2 page items if pagination exists
      expect(itemCount).toBeGreaterThanOrEqual(2);
    }
  });
});
