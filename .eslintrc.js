module.exports = {
  extends: 'airbnb-base',
  env: {
    node: true,
  },
  rules: {
    'linebreak-style': 'off',
    'max-len': 'off',
    'no-console': 'off',
    'no-continue': 'off',
    'no-mixed-operators': 'off',
    'no-negated-condition': 'error',
    'no-param-reassign': ['error', { props: false }],
    'no-restricted-syntax': 'off',
  }
}
