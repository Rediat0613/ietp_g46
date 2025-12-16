"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Wifi, Activity, Clock } from "lucide-react";

export function SystemStatusCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center">
              <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Connection Status</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">Connected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Active Sensors</p>
              <p className="text-lg font-semibold">4/4</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Last Update</p>
              <p className="text-lg font-semibold">Just now</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
