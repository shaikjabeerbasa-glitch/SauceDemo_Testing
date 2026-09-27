const { test, expect } = require('@playwright/test');

test.describe('Authentication', () => {

  test('SD-FLOW-01 - Customer can successfully login and reach products', async ({ page }) => {

    await page.goto('/');

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/inventory\.html/);

    await expect(
      page.getByText('Products', { exact: true })
    ).toBeVisible();

    await expect(
      page.locator('.inventory_item')
    ).toHaveCount(6);
  });


  test('SD-FLOW-11 - Locked-out customer receives appropriate login feedback', async ({ page }) => {

    await page.goto('/');

    await page.getByPlaceholder('Username').fill('locked_out_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(
      page.locator('[data-test="error"]')
    ).toContainText('locked out');

    await expect(page).toHaveURL(/saucedemo\.com\/$/);
  });

});