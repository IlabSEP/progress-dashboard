export const ilabPalette = {
  ink: "#0B3B66",
  inkDeep: "#072849",
  inkSoft: "#234E79",
  cream: "#F5F1E6",
  creamWarm: "#EFE8D6",
  creamPaper: "#FBF8EF",
  vermilion: "#D9422E",
  vermilionDeep: "#A8301F",
  vermilionSoft: "#F2E1DD",
  sage: "#5F7A5F",
  sageSoft: "#DCE3DA",
  stone: "#C9C1AE",
  stoneSoft: "#E6DFCF",
};

export const ilabTailwindConfig = {
  theme: {
    extend: {
      colors: ilabPalette,
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
    },
  },
};
