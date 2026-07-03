import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/vide-demo")({
  beforeLoad: () => {
    throw redirect({ to: "/video-demo" })
  },
})
