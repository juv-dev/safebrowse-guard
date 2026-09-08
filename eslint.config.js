import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'rulesets/**',
      'tests/fixtures/csp-violations/**',
    ],
  },
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
  },
  {
    files: ['**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{js,ts}'],
    rules: {
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.name=/^(setTimeout|setInterval|setImmediate)$/][arguments.0.type='Literal']",
          message: 'setTimeout/setInterval with a string argument is forbidden by the zero-remote-code policy.',
        },
        {
          selector:
            "CallExpression[callee.name=/^(setTimeout|setInterval|setImmediate)$/][arguments.0.type='TemplateLiteral']",
          message: 'setTimeout/setInterval with a string argument is forbidden by the zero-remote-code policy.',
        },
        {
          selector: "ImportExpression[source.type='Literal'][source.value=/^(https?:)?\\/\\//]",
          message: 'Remote dynamic import() is forbidden by the zero-remote-code policy.',
        },
        {
          selector: "ImportExpression:not([source.type='Literal'])",
          message: 'Dynamic import() must target a static local specifier (zero-remote-code policy).',
        },
      ],
    },
  },
);
