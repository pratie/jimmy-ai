// OAuth Flow Debug Script for Playwright MCP
// Run this with: npx @playwright/mcp@latest --save-trace --save-video=1280x720

console.log('🔍 Starting OAuth Flow Debug...');

async function debugOAuthFlow() {
  try {
    console.log('📍 Navigating to sign-in page...');

    // Navigate to the sign-in page
    const response = await page.goto('http://localhost:3000/auth/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fdashboard');
    console.log('📄 Page loaded with status:', response.status());

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    console.log('🌐 Network idle - page fully loaded');

    // Take initial screenshot
    await page.screenshot({ path: 'oauth-debug-1-signin-page.png', fullPage: true });
    console.log('📸 Screenshot 1: Sign-in page loaded');

    // Check if Clerk has loaded
    await page.waitForFunction(() => window.Clerk && window.Clerk.loaded, { timeout: 10000 });
    console.log('✅ Clerk has loaded successfully');

    // Look for the Google OAuth button
    const googleButton = page.locator('button:has-text("Continue with Google")');
    await googleButton.waitFor({ state: 'visible', timeout: 10000 });
    console.log('🔍 Found Google OAuth button');

    // Take screenshot before clicking
    await page.screenshot({ path: 'oauth-debug-2-before-click.png', fullPage: true });
    console.log('📸 Screenshot 2: Before clicking Google button');

    // Setup console log monitoring
    const consoleLogs = [];
    page.on('console', msg => {
      const logEntry = `[${msg.type()}] ${msg.text()}`;
      consoleLogs.push(logEntry);
      console.log('🖥️ Browser Console:', logEntry);
    });

    // Setup network monitoring
    page.on('response', response => {
      if (response.url().includes('oauth') || response.url().includes('google') || response.url().includes('clerk')) {
        console.log('🌐 Network:', response.status(), response.url());
      }
    });

    // Click the Google OAuth button
    console.log('🖱️ Clicking Google OAuth button...');
    await googleButton.click();

    // Wait a moment for any redirects to begin
    await page.waitForTimeout(3000);

    // Take screenshot after click
    await page.screenshot({ path: 'oauth-debug-3-after-click.png', fullPage: true });
    console.log('📸 Screenshot 3: After clicking Google button');

    // Check current URL
    const currentUrl = page.url();
    console.log('🔗 Current URL:', currentUrl);

    if (currentUrl.includes('google.com')) {
      console.log('✅ Successfully redirected to Google OAuth');

      // Take screenshot of Google page
      await page.screenshot({ path: 'oauth-debug-4-google-page.png', fullPage: true });
      console.log('📸 Screenshot 4: Google OAuth page');

      console.log('🎯 OAuth redirect working! Issue is likely in the return flow.');

    } else if (currentUrl.includes('dashboard')) {
      console.log('✅ Directly redirected to dashboard - OAuth completed!');

    } else if (currentUrl.includes('sso-callback')) {
      console.log('⚠️ Stuck on SSO callback page');

      // Wait and check what happens
      await page.waitForTimeout(5000);
      const finalUrl = page.url();
      console.log('🔗 Final URL after waiting:', finalUrl);

    } else {
      console.log('❌ Unexpected URL after OAuth button click:', currentUrl);
    }

    // Print all console logs
    console.log('\n📋 All Browser Console Logs:');
    consoleLogs.forEach(log => console.log('  ', log));

  } catch (error) {
    console.error('❌ Error during OAuth debug:', error.message);

    // Take error screenshot
    try {
      await page.screenshot({ path: 'oauth-debug-error.png', fullPage: true });
      console.log('📸 Error screenshot saved');
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError.message);
    }
  }
}

// Run the debug function
debugOAuthFlow();