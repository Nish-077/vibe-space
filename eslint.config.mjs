import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";
import eslintPluginImport from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "prettier"),
    {
        plugins: {
            import: eslintPluginImport
        },
        rules: {
            "import/no-unresolved": "error",
            "import/no-useless-path-segments": "error",
            "import/no-duplicates": "error"
        }
    }
];

export default eslintConfig;