import { redirect } from "react-router"

export function loader() {
  return redirect("/markets?venue=stellar&type=isolated")
}
