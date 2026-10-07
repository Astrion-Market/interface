import { data } from "react-router"
import { NotFound } from "../ui/not-found"

// Catch-all: unknown URLs render the 404 page with a real 404 status.
export function loader() {
  return data(null, { status: 404 })
}

export default function Page() {
  return <NotFound />
}
