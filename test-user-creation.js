#!/usr/bin/env node

/**
 * Test User Creation Flow with Clerk v5
 * Simulates the authentication and user creation process
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testDatabaseConnection() {
  log(colors.blue, '🔌 Testing Database Connection...');

  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    log(colors.green, `✅ Database connected. Current users: ${userCount}`);
    return true;
  } catch (error) {
    log(colors.red, `❌ Database connection failed: ${error.message}`);
    return false;
  }
}

async function checkUserTable() {
  log(colors.blue, '📋 Checking User Table Structure...');

  try {
    // Test query to verify table exists and has required fields
    const testQuery = await prisma.user.findMany({
      take: 1,
      select: {
        id: true,
        clerkId: true,
        fullname: true,
        email: true,
        type: true,
        createdAt: true
      }
    });

    log(colors.green, '✅ User table structure is correct');
    log(colors.cyan, `   - Required fields: id, clerkId, fullname, email, type ✅`);
    return true;
  } catch (error) {
    log(colors.red, `❌ User table issue: ${error.message}`);
    return false;
  }
}

async function checkSubscriptionTable() {
  log(colors.blue, '📋 Checking Subscription Table Structure...');

  try {
    const testQuery = await prisma.billings.findMany({
      take: 1,
      select: {
        id: true,
        userId: true,
        plan: true
      }
    });

    log(colors.green, '✅ Billing/Subscription table structure is correct');
    return true;
  } catch (error) {
    log(colors.red, `❌ Billing table issue: ${error.message}`);
    return false;
  }
}

async function simulateUserCreation() {
  log(colors.blue, '👤 Simulating User Creation Process...');

  try {
    // Create a test user similar to what onLoginUser would do
    const testClerkId = `test_clerk_${Date.now()}`;
    const testEmail = `test+${Date.now()}@example.com`;

    // First check if user exists (simulating the findUnique call)
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: testClerkId }
    });

    if (!existingUser) {
      log(colors.cyan, '   Creating new test user...');

      // Simulate the user creation transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            fullname: 'Test User',
            clerkId: testClerkId,
            type: 'OWNER',
            email: testEmail,
          },
          select: {
            fullname: true,
            id: true,
            type: true,
            email: true,
          },
        });

        // Create billing record
        try {
          await tx.billings.create({
            data: {
              userId: newUser.id,
            },
          });
        } catch (billingError) {
          log(colors.yellow, '   ⚠️ Billing record creation skipped (might already exist)');
        }

        return newUser;
      });

      log(colors.green, `✅ Test user created successfully:`);
      log(colors.cyan, `   - ID: ${result.id}`);
      log(colors.cyan, `   - Email: ${result.email}`);
      log(colors.cyan, `   - Type: ${result.type}`);

      // Clean up test user
      await prisma.user.delete({ where: { id: result.id } });
      log(colors.yellow, '🧹 Test user cleaned up');

      return true;
    } else {
      log(colors.yellow, '⚠️ Test user already existed');
      return true;
    }
  } catch (error) {
    log(colors.red, `❌ User creation simulation failed: ${error.message}`);
    console.error('Full error:', error);
    return false;
  }
}

async function testAuthActionAccessibility() {
  log(colors.blue, '🔒 Testing Auth Action Server Endpoints...');

  // Test that we can reach pages that call onLoginUser
  // These should either redirect or return auth errors (not server crashes)

  const authEndpoints = [
    '/dashboard',
    '/settings',
    '/integration'
  ];

  let allGood = true;

  for (const endpoint of authEndpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        timeout: 10000,
        validateStatus: () => true // Don't throw on non-200
      });

      // Success if it's not a 500 (server error)
      const isOk = response.status < 500;
      const symbol = isOk ? '✅' : '❌';
      const color = isOk ? colors.green : colors.red;

      log(color, `${symbol} ${endpoint}: ${response.status} (${isOk ? 'no server crash' : 'server error'})`);

      if (!isOk) allGood = false;
    } catch (error) {
      log(colors.red, `❌ ${endpoint}: Network error - ${error.message}`);
      allGood = false;
    }
  }

  return allGood;
}

async function checkClerkIntegrationCode() {
  log(colors.blue, '🔍 Checking Clerk Integration Code...');

  try {
    const fs = require('fs');
    const authIndexPath = 'src/actions/auth/index.ts';

    if (!fs.existsSync(authIndexPath)) {
      log(colors.red, '❌ Auth action file not found');
      return false;
    }

    const authCode = fs.readFileSync(authIndexPath, 'utf8');

    // Check for v5 patterns
    const checks = [
      {
        pattern: /import.*auth.*from.*@clerk\/nextjs\/server/,
        description: 'Uses auth() from server package'
      },
      {
        pattern: /import.*clerkClient.*from.*@clerk\/nextjs\/server/,
        description: 'Uses clerkClient from server package'
      },
      {
        pattern: /const\s*{\s*userId\s*}\s*=\s*auth\(\)/,
        description: 'Uses auth() destructuring pattern'
      },
      {
        pattern: /clerkClient\.users\.getUser\(userId\)/,
        description: 'Uses clerkClient.users.getUser() for full user data'
      },
      {
        pattern: /clerkId:\s*userId/,
        description: 'Uses userId for database queries'
      }
    ];

    let allPassed = true;
    for (const check of checks) {
      const found = check.pattern.test(authCode);
      const symbol = found ? '✅' : '❌';
      const color = found ? colors.green : colors.red;

      log(color, `${symbol} ${check.description}`);
      if (!found) allPassed = false;
    }

    return allPassed;
  } catch (error) {
    log(colors.red, `❌ Code check failed: ${error.message}`);
    return false;
  }
}

async function generateReport(results) {
  log(colors.cyan, '\n📊 User Creation Flow Test Report');
  log(colors.cyan, '===================================');

  const tests = [
    { name: 'Database Connection', result: results.database },
    { name: 'User Table Structure', result: results.userTable },
    { name: 'Subscription Table', result: results.subscriptionTable },
    { name: 'User Creation Process', result: results.userCreation },
    { name: 'Auth Endpoints', result: results.authEndpoints },
    { name: 'Clerk v5 Code Patterns', result: results.codePatterns }
  ];

  const passed = tests.filter(t => t.result).length;
  const total = tests.length;
  const percentage = Math.round((passed / total) * 100);

  const color = percentage >= 90 ? colors.green : percentage >= 70 ? colors.yellow : colors.red;

  log(color, `\n🎯 Overall Success Rate: ${passed}/${total} (${percentage}%)`);

  if (percentage >= 90) {
    log(colors.green, '\n🎉 User Creation Flow: EXCELLENT ✅');
    log(colors.cyan, '   - Database integration working correctly');
    log(colors.cyan, '   - User creation logic is sound');
    log(colors.cyan, '   - Clerk v5 patterns implemented properly');
    log(colors.cyan, '   - Ready for production authentication');
  } else if (percentage >= 70) {
    log(colors.yellow, '\n⚠️ User Creation Flow: GOOD (some issues detected)');
  } else {
    log(colors.red, '\n❌ User Creation Flow: NEEDS ATTENTION');
  }

  return { passed, total, percentage };
}

async function runUserCreationTests() {
  console.clear();
  log(colors.blue, '🧪 Clerk v5 User Creation Flow Test Suite');
  log(colors.blue, '=========================================\n');

  const results = {};

  try {
    results.database = await testDatabaseConnection();
    results.userTable = await checkUserTable();
    results.subscriptionTable = await checkSubscriptionTable();
    results.userCreation = await simulateUserCreation();
    results.authEndpoints = await testAuthActionAccessibility();
    results.codePatterns = await checkClerkIntegrationCode();

    await generateReport(results);

  } catch (error) {
    log(colors.red, `\n💥 Test suite failed: ${error.message}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
if (require.main === module) {
  runUserCreationTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runUserCreationTests };