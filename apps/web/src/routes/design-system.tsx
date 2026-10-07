import { AppLayout } from "../features/lending/components/layout/app-layout"
import { PrimitivesGallery } from "../features/lending/components/primitives/primitives-gallery"
import type { Route } from "./+types/design-system"

// Contributor review page. Not linked from navigation and not indexed. A
// route's meta replaces the root's, so keep the root tags and swap robots.
export const meta: Route.MetaFunction = ({ matches }) => [
  ...matches[0].meta.filter((tag) => !("name" in tag && tag.name === "robots")),
  { name: "robots", content: "noindex" },
]

export default function Page() {
  return (
    <AppLayout>
      <PrimitivesGallery />
    </AppLayout>
  )
}
