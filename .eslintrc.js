module.exports = {
  env: {
    browser: true,
    es2021: true,
    serviceworker: true, // 서비스 워커 환경을 추가
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    // 추가 규칙 설정
  },
};
