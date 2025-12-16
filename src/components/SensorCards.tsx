"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorData } from "@/hooks/useWebSerial";
import { Thermometer, Droplets, Wind, Fan, Bell } from "lucide-react";

interface SensorCardsProps {
  data: SensorData | null;
}

export function SensorCards({ data }: SensorCardsProps) {
  const tempHigh = data && data.temp > 30;
  const gasHigh = data && data.gas > 300;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Temperature Card */}
      <Card className={tempHigh ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Thermometer className="h-4 w-4" />
            Temperature
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${tempHigh ? "text-red-600 dark:text-red-400" : ""}`}>
            {data ? `${data.temp.toFixed(1)}°C` : "--"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {tempHigh ? "⚠️ High temp" : "Normal"}
          </p>
        </CardContent>
      </Card>

      {/* Humidity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Droplets className="h-4 w-4" />
            Humidity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data ? `${data.hum.toFixed(1)}%` : "--"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Relative humidity</p>
        </CardContent>
      </Card>

      {/* Gas Level Card */}
      <Card className={gasHigh ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Wind className="h-4 w-4" />
            Gas Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${gasHigh ? "text-red-600 dark:text-red-400" : ""}`}>
            {data ? data.gas : "--"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {gasHigh ? "⚠️ Gas detected" : "0-1023 range"}
          </p>
        </CardContent>
      </Card>

      {/* Fan Status Card */}
      <Card className={data?.fan ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Fan className={`h-4 w-4 ${data?.fan ? "animate-spin" : ""}`} />
            Fan Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${data?.fan ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
            {data ? (data.fan ? "ON" : "OFF") : "--"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data?.fan ? "Cooling active" : "Standby"}
          </p>
        </CardContent>
      </Card>

      {/* Buzzer Status Card */}
      <Card className={data?.buzzer ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Bell className={`h-4 w-4 ${data?.buzzer ? "animate-bounce" : ""}`} />
            Buzzer Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${data?.buzzer ? "text-red-600 dark:text-red-400" : "text-gray-400"}`}>
            {data ? (data.buzzer ? "ACTIVE" : "OFF") : "--"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data?.buzzer ? "⚠️ Alert!" : "Inactive"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
