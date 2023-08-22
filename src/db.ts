import { PrismaClient, Prisma } from '@prisma/client'
import type {State, Role} from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient<Prisma.PrismaClientOptions, 'query'> | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
	
	log: ['query', 'info', 'warn', 'error'],
	// errorFormat: 'pretty'

})


// db.$use(async (params, next) => {
// 	const before = Date.now()
  
// 	const result = await next(params)
  
// 	const after = Date.now()
  
// 	console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
  
// 	return result
//   })

// db.$on('query', (e) => {
//     // console.log('Query: ' + e.query)
//     console.log('Duration: ' + e.duration + 'ms')
//     // console.log()
// })

// db.$on('query', (e) => {
// 	console.log('Query: ' + e.query)
// 	console.log('Params: ' + e.params)
// 	console.log('Duration: ' + e.duration + 'ms')
//	console.log()
//   })

export type { Prisma, State, Role }
export type {Event, Account, Activity, ActivitiesOnEvents, News, User } from '@prisma/client'

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
