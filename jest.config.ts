
module.exports = {
    // Use ts-jest for TypeScript support
    preset: 'ts-jest',
    testEnvironment: 'node',

    // Look for test files in __tests__ or with .test/.spec suffix
    testMatch: [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],

    // Allow transforms for certain node_modules
    transformIgnorePatterns: [
        "node_modules/(?!.*(next|react-leaflet|@react-leaflet|react-redux|@react-redux|d3-.*|lodash-es|axios|@firebase|firebase))"
    ],

    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    // Support absolute imports like @/lib/...
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },

    setupFilesAfterEnv: [],
};
