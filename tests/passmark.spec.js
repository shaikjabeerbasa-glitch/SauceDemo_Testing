const { test, expect } = require('@playwright/test');

async function loginAsStandardUser(page) {
  await page.goto('/');
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/inventory\.html/);
}

test.describe('SauceDemo Passmark Suite', () => {
  test('PASSMARK-01 - User can login successfully and see products', async ({ page }) => {
    await loginAsStandardUser(page);

    await expect(page.getByText('Products', { exact: true })).toBeVisible();
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('PASSMARK-02 - Locked out user receives an error message', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Username').fill('locked_out_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.locator('[data-test="error"]')).toContainText('locked out');
    await expect(page).toHaveURL(/saucedemo\.com\/$/);
  });

  test('PASSMARK-03 - Product sorting and product details remain consistent', async ({ page }) => {
    await loginAsStandardUser(page);

    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

    const firstProduct = page.locator('.inventory_item').first();
    const productName = await firstProduct.locator('.inventory_item_name').innerText();
    const productPrice = await firstProduct.locator('.inventory_item_price').innerText();

    await firstProduct.locator('.inventory_item_name').click();

    await expect(page.locator('.inventory_details_name')).toHaveText(productName);
    await expect(page.locator('.inventory_details_price')).toHaveText(productPrice);
    await expect(page.getByRole('button', { name: 'Add to cart' })).toBeVisible();
  });

  test('PASSMARK-04 - Customer can add multiple products and validate cart state', async ({ page }) => {
    await loginAsStandardUser(page);

    const products = page.locator('.inventory_item');

    await products.nth(0).getByRole('button', { name: 'Add to cart' }).click();
    await products.nth(1).getByRole('button', { name: 'Add to cart' }).click();

    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    await page.locator('.shopping_cart_link').click();

    await expect(page.locator('.cart_item')).toHaveCount(2);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  });

  test('PASSMARK-05 - Customer can remove items from the cart before checkout', async ({ page }) => {
    await loginAsStandardUser(page);

    const products = page.locator('.inventory_item');
    await products.nth(0).getByRole('button', { name: 'Add to cart' }).click();
    await products.nth(1).getByRole('button', { name: 'Add to cart' }).click();

    await page.locator('.shopping_cart_link').click();
    await expect(page.locator('.cart_item')).toHaveCount(2);

    await page.locator('.cart_item').first().getByRole('button', { name: /remove/i }).click();

    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('PASSMARK-06 - Canceling checkout preserves the cart', async ({ page }) => {
    await loginAsStandardUser(page);

    await page.locator('.inventory_item').first().getByRole('button', { name: 'Add to cart' }).click();
    await page.locator('.shopping_cart_link').click();

    await expect(page.locator('.cart_item')).toHaveCount(1);

    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(1);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('PASSMARK-07 - Checkout validates required customer information', async ({ page }) => {
    await loginAsStandardUser(page);

    await page.locator('.inventory_item').first().getByRole('button', { name: 'Add to cart' }).click();
    await page.locator('.shopping_cart_link').click();
    await page.getByRole('button', { name: 'Checkout' }).click();

    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');

    await page.getByPlaceholder('First Name').fill('Shaik');
    await page.getByPlaceholder('Last Name').fill('Jabeer');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('[data-test="error"]')).toContainText('Postal Code is required');

    await page.getByPlaceholder('Postal Code').fill('560001');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
  });

  test('PASSMARK-08 - Checkout totals accurately reflect cart subtotal and tax', async ({ page }) => {
    await loginAsStandardUser(page);

    const products = page.locator('.inventory_item');
    await products.nth(0).getByRole('button', { name: 'Add to cart' }).click();
    await products.nth(1).getByRole('button', { name: 'Add to cart' }).click();

    await page.locator('.shopping_cart_link').click();
    await expect(page.locator('.cart_item')).toHaveCount(2);

    const cartPrices = await page.locator('.cart_item .inventory_item_price').allTextContents();
    const expectedSubtotal = cartPrices.reduce((total, price) => total + Number(price.replace(/[^0-9.]/g, '')), 0);

    await page.getByRole('button', { name: 'Checkout' }).click();
    await page.getByPlaceholder('First Name').fill('Shaik');
    await page.getByPlaceholder('Last Name').fill('Jabeer');
    await page.getByPlaceholder('Postal Code').fill('560001');
    await page.getByRole('button', { name: 'Continue' }).click();

    const subtotalText = await page.locator('.summary_subtotal_label').innerText();
    const taxText = await page.locator('.summary_tax_label').innerText();
    const totalText = await page.locator('.summary_total_label').innerText();

    const displayedSubtotal = Number(subtotalText.replace(/[^0-9.]/g, ''));
    const tax = Number(taxText.replace(/[^0-9.]/g, ''));
    const displayedTotal = Number(totalText.replace(/[^0-9.]/g, ''));

    expect(displayedSubtotal).toBeCloseTo(expectedSubtotal, 2);
    expect(displayedTotal).toBeCloseTo(displayedSubtotal + tax, 2);
  });

  test('PASSMARK-09 - Customer can complete an end-to-end purchase', async ({ page }) => {
    await loginAsStandardUser(page);

    await page.locator('.inventory_item').first().getByRole('button', { name: 'Add to cart' }).click();
    await page.locator('.shopping_cart_link').click();
    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.getByPlaceholder('First Name').fill('Shaik');
    await page.getByPlaceholder('Last Name').fill('Jabeer');
    await page.getByPlaceholder('Postal Code').fill('560001');
    await page.getByRole('button', { name: 'Continue' }).click();

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.getByText('Payment Information')).toBeVisible();
    await expect(page.getByText('Shipping Information')).toBeVisible();
    await expect(page.getByText('Price Total')).toBeVisible();

    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(page.getByText('Thank you for your order!')).toBeVisible();
    await expect(page.getByText(/Your order has been dispatched/)).toBeVisible();
  });

  test('PASSMARK-10 - Product selected from details remains consistent in the cart', async ({ page }) => {
    await loginAsStandardUser(page);

    const productName = await page.locator('.inventory_item').first().locator('.inventory_item_name').innerText();

    await page.locator('.inventory_item').first().locator('.inventory_item_name').click();
    await expect(page.locator('.inventory_details_name')).toHaveText(productName);

    await page.getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('button', { name: /back to products/i }).click();
    await page.locator('.shopping_cart_link').click();

    await expect(page.locator('.cart_item .inventory_item_name').first()).toHaveText(productName);
    await expect(page.locator('.cart_item')).toHaveCount(1);
  });

  test('PASSMARK-11 - Logout ends the customer session', async ({ page }) => {
    await loginAsStandardUser(page);

    await page.locator('.inventory_item').first().getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    await page.locator('#react-burger-menu-btn').click();
    await page.getByText('Logout', { exact: true }).click();

    await expect(page).toHaveURL(/saucedemo\.com\/$/);
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
  });

  test('PASSMARK-12 - Reset App State clears all shopping activity', async ({ page }) => {
    await loginAsStandardUser(page);

    await page.locator('.inventory_item').first().getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    await page.locator('#react-burger-menu-btn').click();
    await page.getByText('Reset App State', { exact: true }).click();

    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);

    await page.locator('#react-burger-cross-btn').click();
    await page.locator('.shopping_cart_link').click();
    await expect(page.locator('.cart_item')).toHaveCount(0);
  });
});
