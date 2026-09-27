const { test, expect } = require('@playwright/test');

test.describe('Product Discovery', () => {

  test.beforeEach(async ({ page }) => {

    await page.goto('/');

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/inventory\.html/);
  });


  test('SD-FLOW-02 - Customer can sort products and inspect product details', async ({ page }) => {

    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

    const firstProduct = page.locator('.inventory_item').first();

    const productName = await firstProduct
      .locator('.inventory_item_name')
      .innerText();

    const productPrice = await firstProduct
      .locator('.inventory_item_price')
      .innerText();

    await firstProduct
      .locator('.inventory_item_name')
      .click();

    await expect(
      page.locator('.inventory_details_name')
    ).toHaveText(productName);

    await expect(
      page.locator('.inventory_details_price')
    ).toHaveText(productPrice);

    await expect(
      page.getByRole('button', { name: 'Add to cart' })
    ).toBeVisible();
  });


  test('SD-FLOW-12 - Product selected from details remains consistent in cart', async ({ page }) => {

    const productName = await page
      .locator('.inventory_item')
      .first()
      .locator('.inventory_item_name')
      .innerText();

    await page
      .locator('.inventory_item')
      .first()
      .locator('.inventory_item_name')
      .click();

    await expect(
      page.locator('.inventory_details_name')
    ).toHaveText(productName);

    await page.getByRole('button', { name: 'Add to cart' }).click();

    await page.getByRole('button', { name: /back to products/i }).click();

    await page.locator('.shopping_cart_link').click();

    await expect(
      page.locator('.cart_item .inventory_item_name').first()
    ).toHaveText(productName);

    await expect(
      page.locator('.cart_item')
    ).toHaveCount(1);
  });

});