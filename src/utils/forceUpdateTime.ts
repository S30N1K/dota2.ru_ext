import {extLogger} from "../logger";

const log = new extLogger("utils/forceUpdateTime.ts")

// Принудительное обновление времени на сайте
export function forceUpdateTime(): void {
	// Ищем все элементы времени на странице
	const timeElements = document.querySelectorAll("time[data-time]")

	timeElements.forEach(timeElement => {
		const timestamp = timeElement.getAttribute("data-time")
		if (timestamp) {
			const date = new Date(parseInt(timestamp) * 1000)
			const now = new Date()
			const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

			let timeString = ""

			if (diff < 60) {
				timeString = "только что"
			} else if (diff < 3600) {
				const minutes = Math.floor(diff / 60)
				timeString = `${minutes} мин. назад`
			} else if (diff < 86400) {
				const hours = Math.floor(diff / 3600)
				timeString = `${hours} ч. назад`
			} else if (diff < 2592000) {
				const days = Math.floor(diff / 86400)
				timeString = `${days} дн. назад`
			} else if (diff < 31536000) {
				const months = Math.floor(diff / 2592000)
				timeString = `${months} мес. назад`
			} else {
				const years = Math.floor(diff / 31536000)
				timeString = `${years} лет назад`
			}

			timeElement.textContent = timeString
		}
	})
}
