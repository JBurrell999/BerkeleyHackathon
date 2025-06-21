import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AviationSidebar } from "./components/aviation-sidebar"
import { Aircraft3DViewer } from "./components/aircraft-3d-viewer"

export default function AviationDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <SidebarProvider defaultOpen={true}>
        <AviationSidebar />
        <SidebarInset>
          <Aircraft3DViewer />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
