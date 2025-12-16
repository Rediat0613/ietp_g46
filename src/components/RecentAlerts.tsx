"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ThermometerSnowflake, Droplets } from "lucide-react";

interface Alert {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  iconColor: string;
  bgColor: string;
}

export function RecentAlerts() {
  const alerts: Alert[] = [
    {
      id: "1",
      icon: Droplets,
      title: "High Humidity",
      description: "Humidity levels high in Main Hall",
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-950/30",
    },
    {
      id: "2",
      icon: ThermometerSnowflake,
      title: "Low Temperature",
      description: "Temperature below optimal range in Storage Area",
      iconColor: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-100 dark:bg-cyan-950/30",
    },
    {
      id: "3",
      icon: Droplets,
      title: "Humidity Low",
      description: "Humidity below recommended levels",
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-950/30",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className={`h-10 w-10 rounded-lg ${alert.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-5 w-5 ${alert.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{alert.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
