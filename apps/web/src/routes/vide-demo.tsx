import { redirect } from "react-router"

// Typo'd URL that circulated before; keep it working.
export function loader() {
  return redirect("/video-demo")
}
