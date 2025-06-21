import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AviationSidebar } from "./components/aviation-sidebar"
import { AircraftVisualization } from "./components/aircraft-visualization"

export default function AviationDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <SidebarProvider defaultOpen={true}>
        <AviationSidebar />
        <SidebarInset>
          <AircraftVisualization />
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
