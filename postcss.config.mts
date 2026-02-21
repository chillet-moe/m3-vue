export default {
  plugins: {
    '@yuheiy/postcss-custom-functions': {
      functions: {
        // Android dp to rem conversion (1dp = 1/16rem)
        '--dp': (value: string) => `${parseFloat(value) / 16}rem`,

        // Add opacity to a color (e.g., --translucent(#ff0000, 0.5) => rgba(from #ff0000 r g b / 0.5))
        '--translucent': (color: string, opacity: string) => {
          return `rgba(from ${color} r g b / ${opacity})`;
        }
      },
    },
    '@chillet/postcss-custom-mixins': {},
  },
};
