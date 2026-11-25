import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'

// Regla de dependencias de Clean Architecture:
// domain no importa nada; application solo domain; presentation no toca infrastructure.
const layerRule = (forbidden, message) => ({
  'no-restricted-imports': ['error', { patterns: forbidden.map((group) => ({ group: [group], message })) }],
})

export default tseslint.config(
  { ignores: ['dist', 'dev-dist', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, jsxA11y.flatConfigs.strict],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ['src/domain/**/*.ts'],
    rules: layerRule(
      ['@application/*', '@infrastructure/*', '@presentation/*', '@composition/*', 'react', '@supabase/*'],
      'Domain no depende de ninguna otra capa ni librería.',
    ),
  },
  {
    files: ['src/application/**/*.ts'],
    rules: layerRule(
      ['@infrastructure/*', '@presentation/*', '@composition/*', 'react', '@supabase/*'],
      'Application solo depende de Domain.',
    ),
  },
  {
    files: ['src/presentation/**/*.{ts,tsx}'],
    rules: layerRule(['@infrastructure/*', '@supabase/*'], 'Presentation usa casos de uso, no Infrastructure.'),
  },
)
