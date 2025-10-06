module.exports = {
  extends: ['../../packages/config/eslint-react.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['.expo', 'node_modules', '*.config.js'],
};
