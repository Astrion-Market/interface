//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  { ignores: ["build/**", ".react-router/**", "dist/**"] },
  ...tanstackConfig,
]
