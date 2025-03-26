module.exports = {
    moduleNameMapper: {
        "^firebase/(.*)$": "<rootDir>/__mocks__/firebase.js"
    },
    testEnvironment: "jsdom",  // Ensures compatibility with DOM-based code
    transform: {}
};
