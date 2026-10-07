import { createFileRoute } from "@tanstack/react-router"
import { AppLayout } from "../features/lending/components/layout/app-layout"
import { PrimitivesGallery } from "../features/lending/components/primitives/primitives-gallery"

// Contributor review page. Not linked from navigation and not indexed.
export const Route = createFileRoute("/design-system")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: Page,
})

function Page() {
  return (
    <AppLayout>
      <PrimitivesGallery />
    </AppLayout>
  )
}
