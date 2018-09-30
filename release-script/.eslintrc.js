module.exports = {
    extends: ['eslint-config-airbnb-base'],
    rules: {
        indent: ['error', 4],
        'max-len': 'off',
        'no-console': 'off',
        'no-param-reassign': ['error', { props: false }],
    },
};
