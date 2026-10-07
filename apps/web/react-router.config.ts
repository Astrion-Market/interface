import type { Config } from "@react-router/dev/config"

export default {
  appDirectory: "src",
  // Server-render every page, as the app did before the router migration.
  ssr: true,
} satisfies Config
