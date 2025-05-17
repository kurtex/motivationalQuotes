/**
 * @type {import('ts-jest').JestConfigWithTsJest}
 */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	testMatch: ["**/app/lib/threads-api/threads-posts/*.test.ts"],
	moduleFileExtensions: ["ts", "js", "json"],
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
		},
	},
};
