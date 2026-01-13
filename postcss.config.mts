export default {
  plugins: {
    '@yuheiy/postcss-custom-functions': {
      functions: {
        // Android dp to rem conversion (1dp = 1/16rem)
        '--dp': (value: string) => `${parseFloat(value) / 16}rem`,
      }
    },
    '@chillet/postcss-custom-mixins': {}
  }
};
