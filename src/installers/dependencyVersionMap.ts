/*
 * This maps the necessary packages to a version.
 * This improves performance significantly over fetching it from the npm registry.
 */
export const dependencyVersionMap = {
  // TailwindCSS
  tailwindcss: "^3.3.5",
  autoprefixer: "^10.4.14",
  postcss: "^8.4.31",
  prettier: "^3.1.0",
  "prettier-plugin-tailwindcss": "^0.5.7",

  // Pol-ui
  "pol-ui": "2.1.11",
} as const;
export type AvailableDependencies = keyof typeof dependencyVersionMap;
