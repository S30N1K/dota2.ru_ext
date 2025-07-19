# ESLint в проекте dota2.ru_ext

## Установка

ESLint уже настроен в проекте. Все необходимые зависимости установлены в `package.json`.

## Использование

### Проверка кода
```bash
npm run lint
```

### Автоматическое исправление проблем
```bash
npm run lint:fix
```

## Конфигурация

ESLint настроен в файле `.eslintrc.js` со следующими особенностями:

### Поддерживаемые форматы файлов
- TypeScript (`.ts`)
- Vue компоненты (`.vue`)

### Основные правила
- **TypeScript**: Строгая типизация, проверка неиспользуемых переменных
- **Vue**: Правила для Vue 3 компонентов
- **Общие**: Современный JavaScript, предупреждения о console.log

### Глобальные переменные
- `chrome` - для WebExtensions API

### Исключения
Файлы в `.eslintignore` исключены из проверки:
- `node_modules/`
- `build/`
- `dist/`
- Минифицированные файлы
- `webpack.config.js`

## Текущие проблемы

В проекте есть несколько типов проблем, которые ESLint обнаруживает:

### Ошибки (требуют исправления)
1. **Неиспользуемые переменные** - переменные, которые импортируются или объявляются, но не используются
2. **Неиспользуемые параметры** - параметры функций, которые не используются

### Предупреждения (рекомендуется исправить)
1. **Использование `any`** - рекомендуется заменить на конкретные типы
2. **Console.log** - отладочные сообщения в продакшн коде
3. **Non-null assertions** - использование `!` оператора
4. **Пустые блоки** - пустые catch блоки или условия

## Рекомендации по исправлению

### Неиспользуемые переменные
```typescript
// Плохо
import { unused, used } from './module';
console.log(used);

// Хорошо
import { used } from './module';
console.log(used);
```

### Замена `any` на конкретные типы
```typescript
// Плохо
function processData(data: any) {
  return data.name;
}

// Хорошо
interface Data {
  name: string;
}

function processData(data: Data) {
  return data.name;
}
```

### Удаление console.log
```typescript
// Плохо
console.log('Debug info:', data);

// Хорошо
// Удалить или заменить на proper logging
```

## Интеграция с IDE

### VS Code
Установите расширение ESLint для автоматической проверки кода в реальном времени.

### WebStorm
ESLint уже интегрирован в WebStorm. Просто включите ESLint в настройках проекта.

## Игнорирование правил

Если нужно игнорировать конкретное правило для определенной строки:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = getData();
```

Для игнорирования правила в файле:

```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
// весь файл
/* eslint-enable @typescript-eslint/no-explicit-any */
``` 