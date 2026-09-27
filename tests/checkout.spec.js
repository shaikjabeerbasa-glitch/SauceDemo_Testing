const { test, expect } = require('@playwright/test');

test.describe('Checkout', () => {

  test.beforeEach(async ({ page }) => {

    await page.goto('/');

    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');

    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page).toHaveURL(/inventory\.html/);
  });


  test('SD-FLOW-05 - Checkout validates required customer information', async ({ page }) => {

    await page
      .locator('.inventory_item')
      .first()
      .getByRole('button', { name: 'Add to cart' })
      .click();

    await page.locator('.shopping_cart_link').click();

    await page.getByRole('button', { name: 'Checkout' }).click();

    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(
      page.locator('[data-test="error"]')
    ).toContainText('First Name is required');

    await page.getByPlaceholder('First Name').fill('Shaik');
    await page.getByPlaceholder('Last Name').fill('Jabeer');

    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(
      page.locator('[data-test="error"]')
    ).toContainText('Postal Code is required');

    await page.getByPlaceholder('Postal Code').fill('560001');

    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(/checkout-step-two\.html/);
  });


  test('SD-FLOW-06 - Checkout totals accurately reflect cart prices and tax', async ({ page }) => {

    const products = page.locator('.inventory_item');

    await products.nth(0).getByRole('button', { name: 'Add to cart' }).click();
    await products.nth(1).getByRole('button', { name: 'Add to cart' }).click();

    await page.locator('.shopping_cart_link').click();

    await expect(page.locator('.cart_item')).toHaveCount(2);

    const cartPrices = await page
      .locator('.cart_item .inventory_item_price')
      .allTextContents();

    const expectedSubtotal = cartPrices.reduce((total, price) => {
      return total + Number(price.replace(/[^0-9.]/g, ''));
    }, 0);

    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.getByPlaceholder('First Name').fill('Shaik');
    await page.getByPlaceholder('Last Name').fill('Jabeer');
    await page.getByPlaceholder('Postal Code').fill('560001');

    await page.getByRole('button', { name: 'Continue' }).click();

    const subtotalText = await page
      .locator('.summary_subtotal_label')
      .innerText();

    const taxText = await page
      .locator('.summary_tax_label')
      .innerText();

    const totalText = await page
      .locator('.summary_total_label')
      .innerText();

    const displayedSubtotal = parseFloat(
      subtotalText.replace(/[^0-9.]/g, '')
    );

    const tax = parseFloat(
      taxText.replace(/[^0-9.]/g, '')
    );

    const displayedTotal = parseFloat(
      totalText.replace(/[^0-9.]/g, '')
    );

    expect(displayedSubtotal).toBeCloseTo(expectedSubtotal, 2);

    expect(displayedTotal).toBeCloseTo(
      displayedSubtotal + tax,
      2
    );
  });


  test('SD-FLOW-07 - Customer can complete an end-to-end purchase', async ({ page }) => {

    await page
      .locator('.inventory_item')
      .first()
      .getByRole('button', { name: 'Add to cart' })
      .click();

    await page.locator('.shopping_cart_link').click();

    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.getByPlaceholder('First Name').fill('Shaik');
    await page.getByPlaceholder('Last Name').fill('Jabeer');
    await page.getByPlaceholder('Postal Code').fill('560001');

    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(/checkout-step-two\.html/);

    await expect(
      page.getByText('Payment Information')
    ).toBeVisible();

    await expect(
      page.getByText('Shipping Information')
    ).toBeVisible();

    await expect(
      page.getByText('Price Total')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page).toHaveURL(/checkout-complete\.html/);

    await expect(
      page.getByText('Thank you for your order!')
    ).toBeVisible();

    await expect(
      page.getByText(/Your order has been dispatched/)
    ).toBeVisible();
  });

});