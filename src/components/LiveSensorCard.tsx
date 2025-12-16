"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface LiveSensorCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  status: "Normal" | "Warning" | "Critical";
  location: string;
  time: string;
}

export function LiveSensorCard({
  icon: Icon,
  label,
  value,
  unit,
  status,
  location,
  time,
}: LiveSensorCardProps) {
  const statusColors = {
    Normal: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400",
    Warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400",
    Critical: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400",
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16" />
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <Badge variant="secondary" className="mt-1 text-xs font-normal">
                Live
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{value}</span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <Badge className={statusColors[status]}>{status}</Badge>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{location}</p>
              <p className="text-xs font-medium">{time}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
