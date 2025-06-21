"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Wrench, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface MaintenanceStep {
    title: string
    steps: string[]
    location: string
    tools: string[]
    estimatedTime: string
}

interface AlertDetail {
    id: number
    component: string
    risk: "critical" | "moderate"
    message: string
    timestamp: string
    flightImpact: string
    recommendedActions: string[]
}

interface AlertDetailsProps {
    alert: AlertDetail
    onBackClick: () => void
}

export function AlertDetails({ alert, onBackClick }: AlertDetailsProps) {
    const [showMaintenanceSteps, setShowMaintenanceSteps] = useState(false)

    const maintenanceSteps: MaintenanceStep[] = [
        {
            title: "Initial Inspection",
            steps: [
                "Power down the system",
                "Remove access panels",
                "Visual inspection of component",
                "Document initial condition with photos"
            ],
            location: "Main hangar bay - Station A",
            tools: ["Digital camera", "Basic tool kit", "Safety equipment"],
            estimatedTime: "30 minutes"
        },
        {
            title: "Diagnostic Testing",
            steps: [
                "Connect diagnostic equipment",
                "Run full system scan",
                "Record all error codes",
                "Compare with maintenance history"
            ],
            location: "Maintenance control room",
            tools: ["Diagnostic scanner", "Laptop with maintenance software", "Data cables"],
            estimatedTime: "45 minutes"
        },
        {
            title: "Component Service/Replacement",
            steps: [
                "Order replacement parts if needed",
                "Remove faulty component",
                "Install new/serviced component",
                "Initial testing"
            ],
            location: "Main hangar bay - Station B",
            tools: ["Specialized tools for component", "Replacement parts", "Calibration equipment"],
            estimatedTime: "2-3 hours"
        },
        {
            title: "System Testing",
            steps: [
                "Power up system",
                "Run full diagnostic check",
                "Test under various conditions",
                "Monitor for any anomalies"
            ],
            location: "Testing bay",
            tools: ["Testing equipment", "Performance monitoring tools"],
            estimatedTime: "1 hour"
        },
        {
            title: "Final Verification",
            steps: [
                "Complete system check",
                "Update maintenance logs",
                "Get supervisor sign-off",
                "Return aircraft to service"
            ],
            location: "Quality control station",
            tools: ["Documentation forms", "Maintenance log access"],
            estimatedTime: "30 minutes"
        }
    ]

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={onBackClick}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>
            <Card className="p-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold">{alert.component}</h3>
                        <p className="text-sm text-gray-500">{alert.timestamp}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium mb-2">Message</h4>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium mb-2">Flight Impact</h4>
                        <p className="text-sm text-gray-600">{alert.flightImpact}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                            {alert.recommendedActions.map((action, index) => (
                                <li key={index} className="leading-relaxed">{action}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="pt-4 border-t">
                        <Button
                            onClick={() => setShowMaintenanceSteps(true)}
                            className="gap-2"
                        >
                            <Wrench className="h-4 w-4" />
                            View Maintenance Schedule
                        </Button>
                    </div>
                </div>
            </Card>

            <Dialog open={showMaintenanceSteps} onOpenChange={setShowMaintenanceSteps}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Maintenance Schedule for {alert.component}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {maintenanceSteps.map((step, index) => (
                            <div key={index} className="space-y-3 border-b pb-4 last:border-0">
                                <div className="flex items-start gap-3">
                                    <div className="bg-blue-100 rounded-full p-2 mt-1">
                                        <CheckCircle2 className="h-4 w-4 text-blue-700" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{step.title}</h3>
                                        <p className="text-sm text-gray-500">Estimated time: {step.estimatedTime}</p>
                                        <p className="text-sm text-gray-500">Location: {step.location}</p>

                                        <div className="mt-3">
                                            <h4 className="text-sm font-medium mb-2">Required Tools:</h4>
                                            <ul className="list-disc list-inside text-sm text-gray-600">
                                                {step.tools.map((tool, toolIndex) => (
                                                    <li key={toolIndex}>{tool}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="mt-3">
                                            <h4 className="text-sm font-medium mb-2">Steps:</h4>
                                            <ul className="list-decimal list-inside text-sm text-gray-600">
                                                {step.steps.map((substep, stepIndex) => (
                                                    <li key={stepIndex} className="leading-relaxed">{substep}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 