import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Garde contre le codage en dur des règles de niveau scolaire.
 *
 * `GEMINI.md` interdit de disperser les règles LMD (et plus généralement les
 * règles par cycle) dans les composants : elles doivent descendre de la matrice
 * de capacités. Une règle non outillée finit toujours par être violée — celle-ci
 * rejette donc toute comparaison littérale à un cycle ou à un système de
 * notation en dehors des deux modules qui ont le droit de les connaître.
 */
const CYCLE_LITERALS =
  "garderie|prescolaire|primaire|college|lycee|superieur|qualitative|competency|numeric_weighted|lmd";

const noHardcodedLevels = {
  selector: `BinaryExpression[operator=/^[!=]==?$/] > Literal[value=/^(${CYCLE_LITERALS})$/]`,
  message:
    "Ne testez pas un cycle ni un système de notation en dur. Passez par la matrice de capacités (`useCapabilities()` / `lib/school-levels/capabilities.ts`).",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    files: ["src/app/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}", "src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": ["error", noHardcodedLevels],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
