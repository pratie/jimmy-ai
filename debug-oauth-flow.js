/**
 * OAuth Flow Debugging Script
 *
 * This script helps debug the Google OAuth flow using Playwright
 * to identify timeout issues and monitor the authentication process.
 */

const { chromium } = require('playwright');

async function debugOAuthFlow() {
  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    slowMo: 1000 // Slow down operations for better visibility
  });

  const context = await browser.newContext({
    // Enable console logs
    recordVideo: { dir: './oauth-debug-videos/' }
  });

  const page = await context.newPage();

  // Listen to console logs
  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
  });

  // Listen to network requests
  page.on('request', request => {
    if (request.url().includes('clerk') || request.url().includes('google') || request.url().includes('oauth')) {
      console.log(`[Network Request] ${request.method()} ${request.url()}`);
    }
  });

  // Listen to network responses
  page.on('response', response => {
    if (response.url().includes('clerk') || response.url().includes('google') || response.url().includes('oauth')) {
      console.log(`[Network Response] ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('🚀 Starting OAuth flow debugging...');

    // Step 1: Navigate to sign-in page
    console.log('📍 Step 1: Navigating to sign-in page...');
    await page.goto('http://localhost:3000/auth/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fdashboard', {
      waitUntil: 'networkidle'
    });

    // Take screenshot of initial page
    await page.screenshot({ path: './oauth-debug-1-signin-page.png' });
    console.log('📸 Screenshot saved: oauth-debug-1-signin-page.png');

    // Step 2: Wait for page to load and find Google Auth button
    console.log('📍 Step 2: Looking for Google OAuth button...');

    // Wait for the button to be visible
    const googleButton = page.locator('button:has-text("Continue with Google")');
    await googleButton.waitFor({ state: 'visible', timeout: 10000 });

    console.log('✅ Google OAuth button found and visible');

    // Take screenshot before clicking
    await page.screenshot({ path: './oauth-debug-2-before-click.png' });
    console.log('📸 Screenshot saved: oauth-debug-2-before-click.png');

    // Step 3: Click the Google OAuth button
    console.log('📍 Step 3: Clicking Google OAuth button...');
    await googleButton.click();

    // Wait a bit for any immediate redirects
    await page.waitForTimeout(3000);

    // Take screenshot after clicking
    await page.screenshot({ path: './oauth-debug-3-after-click.png' });
    console.log('📸 Screenshot saved: oauth-debug-3-after-click.png');

    // Step 4: Monitor for redirects and check current URL
    console.log('📍 Step 4: Monitoring OAuth flow...');
    console.log(`Current URL: ${page.url()}`);

    // Check if we're redirected to Google OAuth
    if (page.url().includes('accounts.google.com')) {
      console.log('✅ Successfully redirected to Google OAuth');

      // Wait for Google OAuth page to load
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: './oauth-debug-4-google-oauth.png' });
      console.log('📸 Screenshot saved: oauth-debug-4-google-oauth.png');

      // Here you would typically fill in credentials, but for debugging
      // we'll just monitor the flow
      console.log('⚠️  Manual intervention needed for Google credentials');
      console.log('Please complete the OAuth flow manually in the browser window...');

      // Wait for callback or timeout
      let callbackReceived = false;
      let timeoutReached = false;

      const timeoutPromise = new Promise(resolve => {
        setTimeout(() => {
          timeoutReached = true;
          resolve('timeout');
        }, 60000); // 60 second timeout
      });

      const callbackPromise = page.waitForURL('**/dashboard**', { timeout: 60000 })
        .then(() => {
          callbackReceived = true;
          return 'success';
        })
        .catch(() => 'failed');

      const result = await Promise.race([timeoutPromise, callbackPromise]);

      if (result === 'success') {
        console.log('✅ OAuth flow completed successfully!');
        console.log(`Final URL: ${page.url()}`);
        await page.screenshot({ path: './oauth-debug-5-success.png' });
      } else if (result === 'timeout') {
        console.log('❌ OAuth flow timed out');
        console.log(`Current URL when timeout: ${page.url()}`);
        await page.screenshot({ path: './oauth-debug-5-timeout.png' });

        // Check if we're stuck on SSO callback page
        if (page.url().includes('sso-callback')) {
          console.log('🔍 Stuck on SSO callback page, checking debug info...');

          // Try to extract debug information
          const debugInfo = await page.locator('text=isLoaded:').textContent().catch(() => 'Debug info not found');
          console.log('Debug info:', debugInfo);
        }
      }

    } else if (page.url().includes('sso-callback')) {
      console.log('🔍 Redirected to SSO callback page');

      // Monitor the callback page
      await page.screenshot({ path: './oauth-debug-4-sso-callback.png' });

      // Wait for final redirect or timeout
      try {
        await page.waitForURL('**/dashboard**', { timeout: 30000 });
        console.log('✅ Successfully redirected to dashboard');
        await page.screenshot({ path: './oauth-debug-5-dashboard.png' });
      } catch (error) {
        console.log('❌ Failed to reach dashboard from SSO callback');
        console.log(`Final URL: ${page.url()}`);
        await page.screenshot({ path: './oauth-debug-5-callback-timeout.png' });
      }

    } else {
      console.log('❌ Unexpected redirect or no redirect occurred');
      console.log(`Current URL: ${page.url()}`);
      await page.screenshot({ path: './oauth-debug-4-unexpected.png' });
    }

  } catch (error) {
    console.error('❌ Error during OAuth flow debugging:', error);
    await page.screenshot({ path: './oauth-debug-error.png' });
  } finally {
    console.log('🏁 OAuth flow debugging completed');

    // Keep browser open for manual inspection
    console.log('Browser will remain open for manual inspection. Press Ctrl+C to close.');

    // Wait for manual termination
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async () => {
      await browser.close();
      process.exit();
    });
  }
}

// Run the debugging script
debugOAuthFlow().catch(console.error);