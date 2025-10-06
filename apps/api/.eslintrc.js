module.exports = {
  extends: ['../../packages/config/eslint-base.js'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['dist', 'node_modules', '*.config.js'],
};
