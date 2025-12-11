/**
 * PRISMA CLIENT SINGLETON
 * Creează o singură instanță de Prisma Client pentru întreaga aplicație
 * Previne multiple conexiuni la baza de date în development (hot reload)
 * 
 * Best practice: https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 */

import "dotenv/config";
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
/**
 * Prisma Client cu logging pentru development
 */
const prismaClientSingleton = () => {
  // Creează connection pool pentru PostgreSQL
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined in .env file')
  }
  
  const pool = new Pool({ connectionString })
  
  // Creează adapter pentru Prisma 7
  const adapter = new PrismaPg(pool)
  
  // Inițializează Prisma Client cu adapter
  return new PrismaClient({
    adapter, // ← Acum folosește adapter-ul corect!
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] // Loghează queries în development
      : ['error'], // Doar erori în production
  })
}

// Tipizare pentru global
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

/**
 * În development (hot reload), folosim globalThis pentru a păstra instanța
 * În production, creăm o instanță nouă
 */
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

// Salvăm în globalThis doar în development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}

export default prisma

/**
 * USAGE în controllers:
 * 
 * import prisma from '../lib/prisma'
 * 
 * const users = await prisma.user.findMany()
 */