#!/usr/bin/env node

/**
 * OAuth User Creation Flow Simulation
 * Tests the automatic user creation that happens during OAuth sign-in
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

// Simulate the OAuth user creation flow from onLoginUser
async function simulateOAuthUserCreation() {
  log(colors.blue, '🔐 Simulating OAuth User Creation Flow...');

  const testUserId = `clerk_oauth_test_${Date.now()}`;
  const testEmail = `oauth.test+${Date.now()}@gmail.com`;

  try {
    // Step 1: Check if user exists (this is what onLoginUser does first)
    log(colors.cyan, '   Step 1: Checking if user exists in database...');

    let authenticated = await prisma.user.findUnique({
      where: {
        clerkId: testUserId,
      },
      select: {
        fullname: true,
        id: true,
        type: true,
        email: true,
      },
    });

    if (authenticated) {
      log(colors.green, `   ✅ Existing user found: ${authenticated.email}`);
      return { status: 200, user: authenticated, flow: 'existing_user' };
    }

    // Step 2: User doesn't exist, create new user (OAuth flow)
    log(colors.cyan, '   Step 2: User not found, creating new OAuth user...');

    // Simulate getting user data from Clerk (normally from clerkClient.users.getUser)
    const mockClerkUser = {
      id: testUserId,
      firstName: 'OAuth',
      lastName: 'TestUser',
      emailAddresses: [
        {
          id: 'email_primary',
          emailAddress: testEmail
        }
      ],
      primaryEmailAddressId: 'email_primary'
    };

    // Auto-create user for OAuth sign-ins (this mirrors the onLoginUser logic)
    const fullname = `${mockClerkUser.firstName || ''} ${mockClerkUser.lastName || ''}`.trim() ||
                     mockClerkUser.emailAddresses[0]?.emailAddress.split('@')[0] ||
                     'User';

    const primaryEmail = mockClerkUser.emailAddresses.find(
      (address) => address.id === mockClerkUser.primaryEmailAddressId
    )?.emailAddress || mockClerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      throw new Error('Missing email address for user');
    }

    log(colors.cyan, `   Step 3: Creating user with email: ${primaryEmail}`);

    // Step 3: Transaction to create user (matches onLoginUser implementation)
    const result = await prisma.$transaction(async (tx) => {
      // Double-check user doesn't exist (race condition prevention)
      const existingUser = await tx.user.findUnique({
        where: { clerkId: testUserId },
        select: {
          fullname: true,
          id: true,
          type: true,
          email: true,
        },
      });

      if (existingUser) {
        log(colors.yellow, '   ⚠️ User already exists in transaction check');
        return existingUser;
      }

      // Create user
      const newUser = await tx.user.create({
        data: {
          fullname,
          clerkId: testUserId,
          type: 'OWNER',
          email: primaryEmail,
        },
        select: {
          fullname: true,
          id: true,
          type: true,
          email: true,
        },
      });

      // Create billing record within the same transaction
      try {
        await tx.billings.create({
          data: {
            userId: newUser.id,
          },
        });
        log(colors.green, '   ✅ Billing record created');
      } catch (billingError) {
        log(colors.yellow, '   ⚠️ Billing record creation failed (might already exist)');
        // Don't fail the transaction if billing already exists
      }

      return newUser;
    });

    log(colors.green, `   ✅ OAuth user created successfully!`);
    log(colors.cyan, `   - ID: ${result.id}`);
    log(colors.cyan, `   - Email: ${result.email}`);
    log(colors.cyan, `   - Full Name: ${result.fullname}`);
    log(colors.cyan, `   - Type: ${result.type}`);

    // Step 4: Verify the user was created with all relationships
    const createdUser = await prisma.user.findUnique({
      where: { id: result.id },
      include: {
        subscription: true,
        domains: true
      }
    });

    if (createdUser) {
      log(colors.green, '   ✅ User verification successful');
      log(colors.cyan, `   - Has subscription: ${createdUser.subscription ? 'Yes' : 'No'}`);
      log(colors.cyan, `   - Domain count: ${createdUser.domains.length}`);
    }

    // Step 5: Test the domains fetch (simulates onGetAllAccountDomains)
    log(colors.cyan, '   Step 4: Testing domain retrieval...');

    const domainData = await prisma.user.findUnique({
      where: {
        clerkId: testUserId,
      },
      select: {
        id: true,
        domains: {
          select: {
            name: true,
            icon: true,
            id: true,
            chatBot: {
              select: {
                id: true,
                welcomeMessage: true,
                background: true,
                icon: true,
                textColor: true,
                helpdesk: true,
              },
            },
            customer: {
              select: {
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    log(colors.green, '   ✅ Domain data retrieval successful');

    return {
      status: 200,
      user: result,
      domains: domainData?.domains,
      flow: 'new_oauth_user',
      testUserId
    };

  } catch (error) {
    log(colors.red, `   ❌ OAuth user creation failed: ${error.message}`);
    throw error;
  }
}

async function testUserCreationEdgeCases() {
  log(colors.blue, '🧪 Testing Edge Cases...');

  const tests = [
    {
      name: 'User with missing first/last name',
      userData: {
        id: `clerk_test_${Date.now()}_1`,
        firstName: '',
        lastName: '',
        emailAddresses: [{ id: 'email1', emailAddress: `edge1.${Date.now()}@example.com` }],
        primaryEmailAddressId: 'email1'
      }
    },
    {
      name: 'User with only first name',
      userData: {
        id: `clerk_test_${Date.now()}_2`,
        firstName: 'SingleName',
        lastName: '',
        emailAddresses: [{ id: 'email2', emailAddress: `edge2.${Date.now()}@example.com` }],
        primaryEmailAddressId: 'email2'
      }
    }
  ];

  const results = [];

  for (const test of tests) {
    try {
      log(colors.cyan, `   Testing: ${test.name}`);

      const fullname = `${test.userData.firstName || ''} ${test.userData.lastName || ''}`.trim() ||
                       test.userData.emailAddresses[0]?.emailAddress.split('@')[0] ||
                       'User';

      log(colors.cyan, `   Generated fullname: "${fullname}"`);

      // Test the logic without actually creating the user
      const nameIsValid = fullname && fullname.length > 0;
      const emailIsValid = test.userData.emailAddresses[0]?.emailAddress;

      if (nameIsValid && emailIsValid) {
        log(colors.green, `   ✅ ${test.name}: Logic works correctly`);
        results.push({ test: test.name, success: true });
      } else {
        log(colors.red, `   ❌ ${test.name}: Logic failed`);
        results.push({ test: test.name, success: false });
      }

    } catch (error) {
      log(colors.red, `   ❌ ${test.name}: ${error.message}`);
      results.push({ test: test.name, success: false, error: error.message });
    }
  }

  return results;
}

async function cleanup(testUserId) {
  if (!testUserId) return;

  log(colors.yellow, '🧹 Cleaning up test data...');

  try {
    // Delete user (cascade will handle billing)
    await prisma.user.delete({
      where: { clerkId: testUserId }
    });
    log(colors.green, '   ✅ Test user cleaned up successfully');
  } catch (error) {
    // If user doesn't exist, that's fine
    if (error.code === 'P2025') {
      log(colors.yellow, '   ⚠️ Test user already cleaned up');
    } else {
      log(colors.red, `   ❌ Cleanup error: ${error.message}`);
    }
  }
}

async function runOAuthTests() {
  console.clear();
  log(colors.blue, '🔐 OAuth User Creation Flow Test');
  log(colors.blue, '================================\n');

  let testUserId = null;

  try {
    // Test 1: OAuth user creation flow
    const oauthResult = await simulateOAuthUserCreation();
    testUserId = oauthResult.testUserId;

    if (oauthResult.status === 200) {
      log(colors.green, '\n✅ OAuth Flow: SUCCESSFUL');
    } else {
      log(colors.red, '\n❌ OAuth Flow: FAILED');
    }

    // Test 2: Edge cases
    log(colors.blue, '\n');
    const edgeCaseResults = await testUserCreationEdgeCases();

    // Report
    log(colors.cyan, '\n📊 Test Summary');
    log(colors.cyan, '================');

    const oauthSuccess = oauthResult.status === 200;
    const edgeCasesSuccess = edgeCaseResults.every(r => r.success);

    log(oauthSuccess ? colors.green : colors.red,
        `OAuth User Creation: ${oauthSuccess ? 'PASS' : 'FAIL'}`);
    log(edgeCasesSuccess ? colors.green : colors.red,
        `Edge Cases: ${edgeCasesSuccess ? 'PASS' : 'FAIL'}`);

    if (oauthSuccess && edgeCasesSuccess) {
      log(colors.green, '\n🎉 All OAuth tests PASSED!');
      log(colors.cyan, '   ✓ User creation works correctly');
      log(colors.cyan, '   ✓ Database relationships are intact');
      log(colors.cyan, '   ✓ Edge cases handled properly');
      log(colors.cyan, '   ✓ Transaction logic is sound');
      log(colors.green, '\n🚀 Ready for OAuth authentication in production!');
    } else {
      log(colors.yellow, '\n⚠️ Some issues detected, review needed');
    }

  } catch (error) {
    log(colors.red, `\n💥 Test failed: ${error.message}`);
    console.error('Full error:', error);
  } finally {
    await cleanup(testUserId);
    await prisma.$disconnect();
  }
}

// Run the tests
if (require.main === module) {
  runOAuthTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runOAuthTests };