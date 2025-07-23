module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?@?react-native|@react-native|@expo|expo(nent)?|expo-.*|@expo(nent)?/.*|@supabase/.*|isows)",
  ],
};
