import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()
import type { Role } from "@prisma/client"

main()
async function main() {
	try {
		// const role = await addRole()

		const user = await addUser("ROOT")
		await prisma.$disconnect()
		console.log('Seeding completed.')
	} catch (e) {
		console.log(e)
		await prisma.$disconnect()
	}
}

// async function addRole() {
// 	const role = await prisma.role.upsert({
// 		where: { id: 1 },
// 		update: {},
// 		create: {
// 			name: "role_root",
// 		},
// 	})
// 	return role
// }

async function addUser(r: Role) {
	const user = await prisma.user.upsert({
		where: {
			email: "crossknight",

		},
		update: {},
		create: {
			name: "crossknight",
			email: 'crossknight',
			// pass -> 1234
			password: "570844cddce6a9f53be8e0a7d5c4d3070798a3091bc30f80e92bd8f4d9586bca99d32be9c7d6ce28931e26b574a273a52343c3ed8791f5151fd0e025b838ddb5",
			role: r,
		},
	})
}
