module.exports = {
  extends: [
    '../../packages/config/eslint-react.js',
    'next/core-web-vitals',
  ],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['.next', 'node_modules', '*.config.js'],
};
