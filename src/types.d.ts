// Объявления для JSON модулей
declare module "*.json" {
	const value: any
	export default value
}

// Объявления для VUE модулей
declare module "*.vue" {
	import { DefineComponent } from "vue"
	const component: DefineComponent<{}, {}, any>
	export default component
}
