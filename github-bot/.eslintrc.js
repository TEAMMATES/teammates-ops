module.exports = {
  extends: ['airbnb-base'],
  env: {
    node: true,
  },
  rules: {
    // Let git handle the linebreaks instead
    'linebreak-style': 'off',
    'no-negated-condition': 'error',
    'no-param-reassign': ['error', { props: false }],
  },
};
