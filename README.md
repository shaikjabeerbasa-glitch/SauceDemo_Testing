# SauceDemo Playwright Automation Suite

This project contains an end-to-end browser automation suite for the SauceDemo demo application using Playwright.

The suite validates the key customer flows for login, product discovery, cart management, checkout, session state, and logout behavior.

## Project purpose

The goal is to automate real user scenarios against the SauceDemo application and confirm that the critical flows behave correctly in the browser.

This project follows Playwright testing conventions and covers a realistic customer journey using the official Playwright testing API.

## What is being tested

The suite covers the following flows:

1. Login with valid credentials
2. Login with locked-out user validation
3. Product listing and sorting
4. Product detail validation
5. Add products to cart
6. Remove items from cart
7. Cancel checkout flow
8. Checkout form validation
9. Totals and tax calculation
10. End-to-end purchase completion
11. Logout session termination
12. Reset app state behavior

## Files included in the project

```text
SauceDemo_Testing/
├── README.md
├── package.json
├── playwright.config.js
├── scripts/
│   └── show-report.js
├── test-results/
├── playwright-report/
├── tests/
│   ├── login.spec.js
│   ├── product.spec.js
│   ├── cart.spec.js
│   ├── checkout.spec.js
│   └── session.spec.js
└── node_modules/
```

## Technology stack

- Node.js
- Playwright
- JavaScript
- SauceDemo demo app

## Playwright usage included

The project uses Playwright features aligned with the official Playwright documentation, including:

- `test.describe()` for logical test grouping
- `test.beforeEach()` for shared setup
- `page.goto()` for navigation
- `getByPlaceholder()`, `getByRole()`, and `getByText()` selectors
- `expect()` assertions
- URL validation using regex patterns
- element visibility and count assertions
- text assertions for checkout and validation messages
- cross-browser projects for Chromium, Firefox, and WebKit
- HTML reporter
- retry and screenshot/video capture on failure

## Browser coverage

The Playwright config runs the same test suite across:

- Chromium
- Firefox
- WebKit

## Test structure

The project organizes tests by functional area:

- `tests/login.spec.js` - authentication scenarios
- `tests/product.spec.js` - product listing and detail flows
- `tests/cart.spec.js` - cart operations and cart state
- `tests/checkout.spec.js` - checkout validation and purchase flow
- `tests/session.spec.js` - logout and reset app state

## How to install dependencies

From the project root:

```bash
npm install
```

## How to run the test suite

Run all tests:

```bash
npx playwright test
```

Run tests in headed mode:

```bash
npx playwright test --headed
```

Run a specific file:

```bash
npx playwright test tests/login.spec.js
```

Run a specific test by name:

```bash
npx playwright test -g "SD-FLOW-05"
```

## How to view the HTML report

If the default port `9323` is in use, the project includes a safe launcher that chooses a free port automatically.

Run:

```bash
npm run test:report
```

This starts the report using the local script in `scripts/show-report.js` and opens it in the default browser when possible.

If you want to run it manually, use:

```bash
npx playwright show-report --host 127.0.0.1 --port 9324
```

If the default port is blocked by another process, free it first with:

```bash
lsof -ti:9323 | xargs kill -9
```

Then run:

```bash
npx playwright show-report
```

## Sample credentials used

The suite uses the standard SauceDemo test users, including:

- Standard user:
  - Username: `standard_user`
  - Password: `secret_sauce`
- Locked-out user:
  - Username: `locked_out_user`
  - Password: `secret_sauce`

## Test flow overview

### 1. Login flow
- Open SauceDemo
- Enter username and password
- Click Login
- Confirm login redirects to the inventory page
- Validate product listing is visible

### 2. Product flow
- Sort products
- Open a product detail page
- Confirm name and price remain consistent
- Add item to cart
- Validate cart badge count

### 3. Cart flow
- Add multiple products to cart
- Validate cart count
- Remove items
- Continue to checkout

### 4. Checkout flow
- Fill customer information
- Validate required field errors
- Continue to summary page
- Confirm totals and tax calculations
- Finish the order

### 5. Session flow
- Logout successfully
- Confirm user returns to the login screen
- Reset app state and confirm cart is cleared

## Playwright config details

The configuration file includes:

- base URL: `https://www.saucedemo.com`
- test directory: `./tests`
- parallel execution enabled
- timeout settings
- HTML reporter
- browser traces on first retry
- screenshots on failure
- videos on failure
- browser projects for Chromium, Firefox, and WebKit

## Useful notes

- Keep tests independent and deterministic.
- Use real browser behavior rather than mock logic.
- Prefer user-facing selectors from the UI.
- Use `expect` assertions for state validation.
- Keep the test suite aligned with the actual SauceDemo application data and flow.

## Final objective

This project demonstrates a complete Playwright automation approach for a real E2E application, validating key user journeys and ensuring the app behaves correctly under browser-based testing.
