import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLAN_PRICES = {
  FREE: { monthly: 0, yearly: 0 },
  STARTER: { monthly: 19, yearly: 134 },
  PRO: { monthly: 49, yearly: 348 },
  BUSINESS: { monthly: 99, yearly: 585 },
};

async function main() {
  console.log('--- Database MRR Calculator ---');
  try {
    const totalUsers = await prisma.user.count();
    console.log(`Total registered users: ${totalUsers}`);

    const activeBillings = await prisma.billings.findMany({
      where: {
        status: 'active',
      },
    });

    console.log(`\nActive subscriptions found: ${activeBillings.length}`);

    let totalAmortizedMRR = 0;
    let totalDirectMonthlyMRR = 0;
    const planBreakdown: Record<string, { monthly: number; yearly: number; total: number }> = {
      STARTER: { monthly: 0, yearly: 0, total: 0 },
      PRO: { monthly: 0, yearly: 0, total: 0 },
      BUSINESS: { monthly: 0, yearly: 0, total: 0 },
      FREE: { monthly: 0, yearly: 0, total: 0 }
    };

    for (const sub of activeBillings) {
      const plan = sub.plan || 'FREE';
      const interval = sub.billingInterval || 'MONTHLY';
      
      if (!planBreakdown[plan]) {
        planBreakdown[plan] = { monthly: 0, yearly: 0, total: 0 };
      }

      if (interval === 'MONTHLY') {
        planBreakdown[plan].monthly++;
        const price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]?.monthly || 0;
        totalAmortizedMRR += price;
        totalDirectMonthlyMRR += price;
      } else {
        planBreakdown[plan].yearly++;
        const yearlyPrice = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]?.yearly || 0;
        totalAmortizedMRR += yearlyPrice / 12;
      }
      planBreakdown[plan].total++;
    }

    console.log('\nPlan Subscription Breakdown (Active):');
    console.table(
      Object.entries(planBreakdown)
        .filter(([plan]) => plan !== 'FREE')
        .map(([plan, data]) => ({
          Plan: plan,
          'Monthly Subs': data.monthly,
          'Yearly Subs': data.yearly,
          'Total Active': data.total,
          'Amortized Monthly Rev ($)': (
            data.monthly * (PLAN_PRICES[plan as keyof typeof PLAN_PRICES]?.monthly || 0) +
            (data.yearly * (PLAN_PRICES[plan as keyof typeof PLAN_PRICES]?.yearly || 0)) / 12
          ).toFixed(2),
        }))
    );

    console.log('\n--- Final MRR Metrics ---');
    console.log(`Direct Monthly MRR (Only Monthly plans): $${totalDirectMonthlyMRR.toFixed(2)}`);
    console.log(`Amortized MRR (Monthly + Yearly/12): $${totalAmortizedMRR.toFixed(2)}`);
    console.log('-------------------------');

  } catch (error) {
    console.error('Error running MRR calculator:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
