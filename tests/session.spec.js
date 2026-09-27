const { test, expect } = require('@playwright/test');

test.describe('Session and Application State', () => {

  test.beforeEach(async ({ page }) => {

    await page.goto('/');

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/inventory\.html/);
  });


  test('SD-FLOW-09 - Logout ends the customer shopping session', async ({ page }) => {

    await page
      .locator('.inventory_item')
      .first()
      .getByRole('button', { name: 'Add to cart' })
      .click();

    await expect(
      page.locator('.shopping_cart_badge')
    ).toHaveText('1');

    await page.locator('#react-burger-menu-btn').click();

    await page.getByText('Logout', { exact: true }).click();

    await expect(page).toHaveURL(/saucedemo\.com\/$/);

    await expect(
      page.getByPlaceholder('Username')
    ).toBeVisible();

    await expect(
      page.getByPlaceholder('Password')
    ).toBeVisible();
  });


  test('SD-FLOW-10 - Reset App State clears shopping activity', async ({ page }) => {

    await page
      .locator('.inventory_item')
      .first()
      .getByRole('button', { name: 'Add to cart' })
      .click();

    await expect(
      page.locator('.shopping_cart_badge')
    ).toHaveText('1');

    await page.locator('#react-burger-menu-btn').click();

    await page.getByText('Reset App State', { exact: true }).click();

    await expect(
      page.locator('.shopping_cart_badge')
    ).toHaveCount(0);

    await page.locator('#react-burger-cross-btn').click();

    await page.locator('.shopping_cart_link').click();

    await expect(
      page.locator('.cart_item')
    ).toHaveCount(0);
  });

});