import prisma from './prisma.ts'

async function seedDatabase() {
  console.log('🌱 Starting database seed...')

  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'john_doe',
        email: 'john@example.com',
        password: '$2b$10$XqG5Z9K1XqG5Z9K1XqG5Z9K1XqG5Z9K1XqG5Z9K1Xq',
      },
    }),
    prisma.user.create({
      data: {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: '$2b$10$XqG5Z9K1XqG5Z9K1XqG5Z9K1XqG5Z9K1XqG5Z9K1Xq',
      },
    }),
    prisma.user.create({
      data: {
        username: 'mike_test',
        email: 'mike@example.com',
        password: '$2b$10$XqG5Z9K1XqG5Z9K1XqG5Z9K1XqG5Z9K1XqG5Z9K1Xq',
      },
    }),
  ])
  console.log(`✅ Created ${users.length} users`)

  const now = new Date()
  let recordsCreated = 0
  let vitalSignsCreated = 0

  for (let i = 0; i < 30; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    await prisma.healthRecord.create({
      data: {
        userId: users[0].id,
        date: date,
        weight: 70 + Math.random() * 10,
        steps: Math.floor(5000 + Math.random() * 10000),
        sleepHours: 6 + Math.random() * 3,
        notes: i % 5 === 0 ? 'Feeling great today!' : null,
        vitalSigns: {
          create: [
            {
              timestamp: new Date(date.getTime() + 8 * 60 * 60 * 1000),
              timeOfDay: 'morning',
              heartRate: Math.floor(60 + Math.random() * 20),
              bloodPressureSystolic: Math.floor(110 + Math.random() * 20),
              bloodPressureDiastolic: Math.floor(70 + Math.random() * 15),
              temperature: 36.5 + Math.random() * 0.5,
              oxygenSaturation: Math.floor(95 + Math.random() * 4),
            },
            {
              timestamp: new Date(date.getTime() + 20 * 60 * 60 * 1000),
              timeOfDay: 'evening',
              heartRate: Math.floor(65 + Math.random() * 25),
              bloodPressureSystolic: Math.floor(115 + Math.random() * 25),
              bloodPressureDiastolic: Math.floor(75 + Math.random() * 20),
              temperature: 36.8 + Math.random() * 0.5,
              oxygenSaturation: Math.floor(96 + Math.random() * 4),
            }
          ]
        }
      }
    })

    recordsCreated++
    vitalSignsCreated += 2
  }

  console.log(`✅ Created ${recordsCreated} health records`)
  console.log(`✅ Created ${vitalSignsCreated} vital signs`)
  console.log('🎉 Database seeded successfully!')
}

async function clearDatabase() {
  console.log('🗑️  Clearing database...')

  const deletedVitalSigns = await prisma.vitalSign.deleteMany()
  const deletedRecords = await prisma.healthRecord.deleteMany()
  const deletedUsers = await prisma.user.deleteMany()

  console.log(`✅ Deleted ${deletedVitalSigns.count} vital signs`)
  console.log(`✅ Deleted ${deletedRecords.count} health records`)
  console.log(`✅ Deleted ${deletedUsers.count} users`)
  console.log('🎉 Database cleared successfully!')
}

async function getStats() {
  console.log('📊 Fetching database statistics...\n')

  const totalUsers = await prisma.user.count()
  const totalRecords = await prisma.healthRecord.count()

  const topUsers = await prisma.user.findMany({
    select: {
      username: true,
      email: true,
      _count: {
        select: { records: true },
      },
    },
    orderBy: {
      records: {
        _count: 'desc',
      },
    },
    take: 5,
  })

  const avgRecordStats = await prisma.healthRecord.aggregate({
    _avg: {
      weight: true,
      steps: true,
      sleepHours: true,
    },
    _max: {
      steps: true,
    },
    _min: {
      steps: true,
    },
  })

  const avgVitalStats = await prisma.vitalSign.aggregate({
    _avg: {
      heartRate: true,
      bloodPressureSystolic: true,
      bloodPressureDiastolic: true,
      temperature: true,
      oxygenSaturation: true,
    },
  })

  console.log('='.repeat(50))
  console.log('DATABASE STATISTICS')
  console.log('='.repeat(50))
  console.log(`Total Users: ${totalUsers}`)
  console.log(`Total Health Records: ${totalRecords}`)
  console.log('\nTop 5 Users by Records:')
  topUsers.forEach((user, i) => {
    console.log(`  ${i + 1}. ${user.username} - ${user._count.records} records`)
  })
  console.log('\nGlobal Averages (Daily Records):')
  console.log(`  Weight: ${avgRecordStats._avg.weight?.toFixed(2)} kg`)
  console.log(`  Steps: ${avgRecordStats._avg.steps?.toFixed(0)}`)
  console.log(`  Sleep: ${avgRecordStats._avg.sleepHours?.toFixed(2)} hours`)
  
  console.log('\nGlobal Averages (Vital Signs):')
  console.log(`  Heart Rate: ${avgVitalStats._avg.heartRate?.toFixed(0)} bpm`)
  console.log(`  BP Systolic: ${avgVitalStats._avg.bloodPressureSystolic?.toFixed(0)} mmHg`)
  console.log(`  BP Diastolic: ${avgVitalStats._avg.bloodPressureDiastolic?.toFixed(0)} mmHg`)
  console.log(`  Temp: ${avgVitalStats._avg.temperature?.toFixed(1)} °C`)
  console.log(`  SpO2: ${avgVitalStats._avg.oxygenSaturation?.toFixed(0)} %`)

  console.log('\nRecords:')
  console.log(`  Max Steps: ${avgRecordStats._max.steps}`)
  console.log(`  Min Steps: ${avgRecordStats._min.steps}`)
  console.log('='.repeat(50))
}

async function listUsers() {
  console.log('👥 Listing all users...\n')

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { records: true },
      },
    },
  })

  users.forEach((user) => {
    console.log(`ID: ${user.id}`)
    console.log(`Username: ${user.username}`)
    console.log(`Email: ${user.email}`)
    console.log(`Records: ${user._count.records}`)
    console.log(`Created: ${user.createdAt.toISOString()}`)
    console.log('-'.repeat(40))
  })
}

async function recentRecords(limit = 10) {
  console.log(`📝 Fetching last ${limit} health records...\n`)

  const records = await prisma.healthRecord.findMany({
    include: {
      user: {
        select: {
          username: true,
          email: true,
        },
      },
      vitalSigns: {
        orderBy: {
          timestamp: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })

  records.forEach((record, i) => {
    const dailyVitals = record.vitalSigns.map(v => 
      `${v.timeOfDay.toUpperCase()}: HR ${v.heartRate} | BP ${v.bloodPressureSystolic}/${v.bloodPressureDiastolic} | Temp ${v.temperature?.toFixed(1)}°C | SpO2 ${v.oxygenSaturation}%`
    ).join('\n       ')
    
    console.log(`${i + 1}. ${record.user.username} - ${record.date.toISOString().split('T')[0]}`)
    console.log(`   Weight: ${record.weight}kg | Steps: ${record.steps} | Sleep: ${record.sleepHours}h`)
    
    if (record.vitalSigns.length > 0) {
      console.log(`   Vital Signs:`)
      console.log(`       ${dailyVitals}`)
    }
    
    if (record.notes) console.log(`   Notes: ${record.notes}`)
    console.log('-'.repeat(60))
  })
}

async function deleteUser(email: string) {
  console.log(`🗑️  Deleting user with email: ${email}...`)

  const user = await prisma.user.delete({
    where: { email },
  })

  console.log(`✅ Deleted user: ${user.username} (${user.email})`)
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  console.log('\n')

  switch (command) {
    case 'seed':
      await clearDatabase()
      await seedDatabase()
      break
    case 'clear':
      await clearDatabase()
      break
    case 'stats':
      await getStats()
      break
    case 'users':
      await listUsers()
      break
    case 'recent':
      const limit = parseInt(args[1]) || 10
      await recentRecords(limit)
      break
    case 'delete-user':
      if (!args[1]) {
        console.error('❌ Error: Email required. Usage: npm run script delete-user email@example.com')
        break
      }
      await deleteUser(args[1])
      break
    default:
      console.log('📚 Available commands:')
      console.log('  npm run script seed           - Populate database with dummy data')
      console.log('  npm run script clear          - Clear all data from database')
      console.log('  npm run script stats          - Show database statistics')
      console.log('  npm run script users          - List all users')
      console.log('  npm run script recent [N]     - Show N recent records (default: 10)')
      console.log('  npm run script delete-user <email> - Delete user by email')
      console.log('\nExample: npm run script seed')
  }

  console.log('\n')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })