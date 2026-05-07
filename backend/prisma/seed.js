const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const memberPassword = await bcrypt.hash('member123', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Alice Admin',
      email: 'admin@teamtask.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      name: 'Bob Member',
      email: 'bob@teamtask.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      name: 'Carol Member',
      email: 'carol@teamtask.com',
      password: memberPassword,
      role: 'MEMBER',
    },
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      title: 'Website Redesign',
      description: 'Redesign the company website with modern UI/UX',
      createdBy: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member1.id },
          { userId: member2.id },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Mobile App Development',
      description: 'Build cross-platform mobile application',
      createdBy: admin.id,
      members: {
        create: [
          { userId: admin.id },
          { userId: member1.id },
        ],
      },
    },
  });

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const nextWeek = new Date(now.getTime() + 7 * 86400000);
  const yesterday = new Date(now.getTime() - 86400000);

  // Create tasks for project1
  await prisma.task.createMany({
    data: [
      {
        title: 'Design mockups',
        description: 'Create Figma mockups for all pages',
        status: 'COMPLETED',
        dueDate: yesterday,
        assignedTo: member1.id,
        projectId: project1.id,
        createdBy: admin.id,
      },
      {
        title: 'Implement homepage',
        description: 'Build the homepage with React components',
        status: 'IN_PROGRESS',
        dueDate: tomorrow,
        assignedTo: member1.id,
        projectId: project1.id,
        createdBy: admin.id,
      },
      {
        title: 'SEO optimization',
        description: 'Add meta tags and structured data',
        status: 'TODO',
        dueDate: nextWeek,
        assignedTo: member2.id,
        projectId: project1.id,
        createdBy: admin.id,
      },
      {
        title: 'Performance audit',
        description: 'Run Lighthouse audit and fix issues',
        status: 'TODO',
        dueDate: yesterday,
        assignedTo: member2.id,
        projectId: project1.id,
        createdBy: admin.id,
      },
    ],
  });

  // Create tasks for project2
  await prisma.task.createMany({
    data: [
      {
        title: 'Setup React Native project',
        description: 'Initialize Expo project with TypeScript',
        status: 'COMPLETED',
        dueDate: yesterday,
        assignedTo: member1.id,
        projectId: project2.id,
        createdBy: admin.id,
      },
      {
        title: 'Build authentication screens',
        description: 'Login, Signup, and Forgot Password screens',
        status: 'IN_PROGRESS',
        dueDate: nextWeek,
        assignedTo: member1.id,
        projectId: project2.id,
        createdBy: admin.id,
      },
      {
        title: 'API integration',
        description: 'Connect mobile app to backend APIs',
        status: 'TODO',
        dueDate: nextWeek,
        assignedTo: null,
        projectId: project2.id,
        createdBy: admin.id,
      },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('');
  console.log('Demo credentials:');
  console.log('  Admin:  admin@teamtask.com  / admin123');
  console.log('  Member: bob@teamtask.com    / member123');
  console.log('  Member: carol@teamtask.com  / member123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
