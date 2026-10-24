import 'dotenv/config';
import { PrismaClient } from './app/generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "admin@kurur.ir";
  const newPassword = "KururAdmin123!";
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash: hashedPassword },
    create: { 
      email, 
      passwordHash: hashedPassword, 
      fullName: "مدیر کل سیستم",
      role: "SUPER_ADMIN" 
    }
  });
  
  console.log(`✅ Admin password for ${email} has been reset to: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });