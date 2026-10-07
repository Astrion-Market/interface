import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/isolated-markets")({
  beforeLoad: () => {
    throw redirect({
      to: "/markets",
      search: { type: "isolated" },
      replace: true,
    })
  },
})
