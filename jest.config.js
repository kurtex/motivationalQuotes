/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "jest-environment-jsdom",
	testMatch: ["**/__tests__/**/*.test.ts?(x)"],
	moduleFileExtensions: ["ts", "tsx", "js", "json"],
	setupFilesAfterEnv: ["@testing-library/jest-dom"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	transform: {
		"^.+.(ts|tsx)$": "ts-jest",
	},
};
