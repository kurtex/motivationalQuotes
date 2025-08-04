import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.config({
		extends: ["next", "prettier"],
	}),
	{
		files: ["**/__tests__/**/*"],
		languageOptions: {
			globals: {
				...globals.jest,
			},
		},
	},
];

export default eslintConfig;