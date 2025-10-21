module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aurora: {
          base: '#0f172a',
          glass: 'rgba(15, 23, 42, 0.65)',
          neon: '#22d3ee',
          accent: '#f472b6'
        }
      },
      backdropBlur: {
        xs: '2px'
      }
    }
  },
  plugins: []
};
