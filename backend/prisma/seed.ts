import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminRole = await prisma.role.upsert({
    where: { roleName: 'ADMIN' },
    update: {},
    create: { roleName: 'ADMIN' },
  });

  const doctorRole = await prisma.role.upsert({
    where: { roleName: 'DOCTOR' },
    update: {},
    create: { roleName: 'DOCTOR' },
  });

  const patientRole = await prisma.role.upsert({
    where: { roleName: 'PATIENT' },
    update: {},
    create: { roleName: 'PATIENT' },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@rssa.go.id' },
    update: {},
    create: {
      email: 'admin@rssa.go.id',
      passwordHash: hashedPassword,
      fullName: 'Admin RSSA',
      phoneNumber: '081234567890',
      roleId: adminRole.roleId,
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr.anwar@rssa.go.id' },
    update: {},
    create: {
      email: 'dr.anwar@rssa.go.id',
      passwordHash: hashedPassword,
      fullName: 'Dr. Anwar Santoso, Sp.U',
      phoneNumber: '081234567891',
      roleId: doctorRole.roleId,
    },
  });

  await prisma.doctorProfile.upsert({
    where: { doctorId: doctorUser.userId },
    update: {},
    create: {
      doctorId: doctorUser.userId,
      userId: doctorUser.userId,
      specialty: 'Urologi',
      licenseNumber: 'SIG-001',
      departmentName: 'Unit Urologi',
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: 'budi.santoso@email.com' },
    update: {},
    create: {
      email: 'budi.santoso@email.com',
      passwordHash: hashedPassword,
      fullName: 'Budi Santoso',
      phoneNumber: '081234567892',
      roleId: patientRole.roleId,
    },
  });

  await prisma.patient.upsert({
    where: { patientId: patientUser.userId },
    update: {},
    create: {
      patientId: patientUser.userId,
      medicalRecordNumber: 'MR-001',
      fullName: 'Budi Santoso',
      phoneNumber: '081234567892',
      gender: 'Laki-laki',
      birthDate: new Date('1985-03-15'),
      address: 'Jl. Example No. 123, Jakarta',
      diagnosis: 'Batu Ginjal',
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log('');
  console.log('📋 Login credentials:');
  console.log('   Admin: admin@rssa.go.id / password123');
  console.log('   Dokter: dr.anwar@rssa.go.id / password123');
  console.log('   Pasien: budi.santoso@email.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });