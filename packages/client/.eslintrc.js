module.exports = {
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    // 警告レベルに下げる
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    
    // インポート関連
    'import/no-anonymous-default-export': 'off',
    'import/no-unresolved': 'off',
    
    // React Hooks
    'react-hooks/exhaustive-deps': 'warn',
    
    // その他
    'no-undef': 'warn',
    'no-unreachable': 'warn'
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};
