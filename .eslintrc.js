module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    webextensions: true, // Добавляем поддержку WebExtensions API
  },
  extends: [
    'eslint:recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'vue'],
  globals: {
    chrome: 'readonly', // Добавляем chrome как глобальную переменную
  },
  rules: {
    // TypeScript правила
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // Vue правила
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off',
    
    // Общие правила
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'warn', // Изменяем на предупреждение
    'no-empty': 'warn', // Изменяем на предупреждение
    
    // Отключаем дублирующие правила
    'no-unused-vars': 'off', // Отключаем в пользу TypeScript версии
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      rules: {
        // Дополнительные правила для Vue файлов
        'vue/component-name-in-template-casing': ['error', 'PascalCase'],
        'vue/component-definition-name-casing': ['error', 'PascalCase'],
      },
    },
  ],
}; 