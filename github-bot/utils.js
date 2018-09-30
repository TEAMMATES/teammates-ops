module.exports = {
  testRegexp(pattern, string) {
    const tester = new RegExp(pattern);
    return tester.test(string);
  },
};
