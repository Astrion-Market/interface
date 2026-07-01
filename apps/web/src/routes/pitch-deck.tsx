import { createFileRoute, redirect } from "@tanstack/react-router"

const PITCH_DECK_URL =
  "https://docs.google.com/presentation/d/1MlIiWtV0DF7qztW9xd0Hnmxwo8PRZPuMpUrwRRP49MY/edit?usp=sharing"

export const Route = createFileRoute("/pitch-deck")({
  beforeLoad: () => {
    throw redirect({ href: PITCH_DECK_URL })
  },
})
