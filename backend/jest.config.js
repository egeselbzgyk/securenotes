/** @type {import("jest").Config} **/
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|js)x?$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!(marked)/)"],
};
