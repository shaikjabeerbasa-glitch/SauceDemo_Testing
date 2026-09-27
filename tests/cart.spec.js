const { test, expect } = require('@playwright/test');

test.describe('Shopping Cart', () => {

  test.beforeEach(async ({ page }) => {

    await page.goto('/');

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/inventory\.html/);
  });


  test('SD-FLOW-03 - Customer can add multiple products and validate cart state', async ({ page }) => {

    const products = page.locator('.inventory_item');

    await products.nth(0).getByRole('button', { name: 'Add to cart' }).click();
    await products.nth(1).getByRole('button', { name: 'Add to cart' }).click();

    await expect(
      page.locator('.shopping_cart_badge')
    ).toHaveText('2');

    await page.locator('.shopping_cart_link').click();

    await expect(
      page.locator('.cart_item')
    ).toHaveCount(2);

    await expect(
      page.locator('.shopping_cart_badge')
    ).toHaveText('2');
  });


  test('SD-FLOW-04 - Customer can modify cart before checkout', async ({ page }) => {

    const products = page.locator('.inventory_item');

    await products.nth(0).getByRole('button', { name: 'Add to cart' }).click();
    await products.nth(1).getByRole('button', { name: 'Add to cart' }).click();

    await page.locator('.shopping_cart_link').click();

    await expect(page.locator('.cart_item')).toHaveCount(2);

    await page
      .locator('.cart_item')
      .first()
      .getByRole('button', { name: /remove/i })
      .click();

    await expect(page.locator('.cart_item')).toHaveCount(1);

    await expect(
      page.locator('.shopping_cart_badge')
    ).toHaveText('1');

    await page.getByRole('button', { name: 'Checkout' }).click();

    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });


  test('SD-FLOW-08 - Cancelling checkout preserves the customer cart', async ({ page }) => {

    await page
      .locator('.inventory_item')
      .first()
      .getByRole('button', { name: 'Add to cart' })
      .click();

    await page.locator('.shopping_cart_link').click();

    await expect(page.locator('.cart_item')).toHaveCount(1);

    await page.getByRole('button', { name: 'Checkout' }).click();

    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/cart\.html/);

    await expect(page.locator('.cart_item')).toHaveCount(1);

    await expect(
      page.locator('.shopping_cart_badge')
    ).toHaveText('1');
  });

});