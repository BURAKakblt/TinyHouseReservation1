module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          earth: '#E9D8C3', // açık toprak
          forest: '#B7D7B0', // soft açık yeşil
          leaf: '#D6EFC7', // çok açık yeşil
          wood: '#F3E9DD', // yumuşak ahşap
          cream: '#FAF9F6', // çok açık krem
          sky: '#D6EFFF', // açık mavi
          stone: '#E3E3E3', // açık taş
        },
      },
    },
  },
  plugins: [],
};
