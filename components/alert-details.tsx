"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"

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
                    Back to Overview
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className={alert.risk === "critical" ? "text-red-700" : "text-yellow-700"}>
                        {alert.component}
                    </CardTitle>
                    <CardDescription>{alert.timestamp}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium mb-2">Issue Description</h4>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium mb-2">Flight Impact</h4>
                            <p className={`text-sm ${alert.risk === "critical" ? "text-red-600" : "text-yellow-600"}`}>
                                {alert.flightImpact}
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                                {alert.recommendedActions.map((action, index) => (
                                    <li key={index} className="leading-relaxed">{action}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 