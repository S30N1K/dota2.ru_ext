import { extLogger } from "../logger"

const log = new extLogger("utils/uploadToImgbb.ts")

export async function uploadToImgbb(base64Image: string): Promise<string | null> {
	const formData = new FormData()
	formData.append("image", base64Image.split(",")[1])

	try {
		const response = await fetch(
			`https://api.imgbb.com/1/upload?key=05b36feae2ca1f1f63701c921f55e6f0`,
			{
				method: "POST",
				body: formData,
			}
		)

		const result = await response.json()
		if (result.success) {
			return result.data.url
		} else {
			log.error("Imgbb upload failed", result)
			return null
		}
	} catch (error) {
		log.error("Upload to imgbb failed:", error)
		return null
	}
}
