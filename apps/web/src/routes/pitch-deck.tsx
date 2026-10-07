import { redirect } from "react-router"

const PITCH_DECK_URL =
  "https://docs.google.com/presentation/d/1MlIiWtV0DF7qztW9xd0Hnmxwo8PRZPuMpUrwRRP49MY/edit?usp=sharing"

export function loader() {
  return redirect(PITCH_DECK_URL)
}
