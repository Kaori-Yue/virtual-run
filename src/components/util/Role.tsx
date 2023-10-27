import { Session } from "next-auth"

export function renderRole(role: Session['role']) {
	switch (role) {
		case "ROOT":
			return "ผู้ดูแลระบบ"
		case "ADMIN":
			return "ผู้จัดการกิจกรรม"
		case "USER":
			return "ผู้ใช้งานทั่วไป"
		default:
			return "ผู้ใช้งานทั่วไป"
	}
}