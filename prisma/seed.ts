import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma/client';
import { IRAN_PROVINCES } from '../lib/iranData';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Seeding locations...');

  // 1. Create Country
  const iran = await prisma.country.upsert({
    where: { name: 'ایران' },
    update: {},
    create: { name: 'ایران' },
  });

  // 2. Loop through provinces
  for (const [provinceName, cities] of Object.entries(IRAN_PROVINCES)) {
    const province = await prisma.province.upsert({
      where: { name_countryId: { name: provinceName, countryId: iran.id } },
      update: {},
      create: { name: provinceName, countryId: iran.id },
    });

    // 3. Loop through cities for this province
    for (const cityName of cities) {
      await prisma.city.upsert({
        where: { name_provinceId: { name: cityName, provinceId: province.id } },
        update: {},
        create: { name: cityName, provinceId: province.id },
      });
    }
  }

  console.log('✅ Locations seeded!');

  // 4. Seed Categories
  console.log('⏳ Seeding categories...');
  const categories = [
    "ورق و فولاد",
    "مواد شیمیایی",
    "ماشین‌آلات",
    "مواد غذایی عمده",
    "لوازم ساختمانی",
    "پوشاک و نساجی",
    "کشاورزی",
    "بسته‌بندی",
    "ابزار",
    "متفرقه",
  ];

  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
  }

  console.log('✅ Categories seeded!');

  console.log('⏳ Seeding plans...');
  const plans = [
    { type: "SILVER", monthlyPrice: 1000000 },
    { type: "GOLD", monthlyPrice: 3000000 },
    { type: "PLATINUM", monthlyPrice: 6000000 },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { type: p.type as any },
      update: { monthlyPrice: p.monthlyPrice },
      create: { type: p.type as any, monthlyPrice: p.monthlyPrice },
    });
  }
  console.log('✅ Plans seeded!');

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });