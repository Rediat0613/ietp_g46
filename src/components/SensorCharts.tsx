"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorData } from "@/hooks/useWebSerial";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SensorChartsProps {
  history: SensorData[];
}

export function SensorCharts({ history }: SensorChartsProps) {
  // Format data for charts with relative time
  const chartData = history.map((data, index) => ({
    index,
    time: new Date(data.timestamp).toLocaleTimeString(),
    temp: data.temp,
    hum: data.hum,
    gas: data.gas,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Temperature Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Temperature Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="index" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
                tickFormatter={() => ''}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                labelFormatter={(value) => `Point ${value}`}
                formatter={(value: any) => [`${value.toFixed(1)}°C`, 'Temp']}
              />
              <Line 
                type="monotone" 
                dataKey="temp" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Humidity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Humidity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="index" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
                tickFormatter={() => ''}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                labelFormatter={(value) => `Point ${value}`}
                formatter={(value: any) => [`${value.toFixed(1)}%`, 'Humidity']}
              />
              <Line 
                type="monotone" 
                dataKey="hum" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gas Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Gas Level Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="index" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
                tickFormatter={() => ''}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={[0, 1023]}
              />
              <Tooltip 
                labelFormatter={(value) => `Point ${value}`}
                formatter={(value: any) => [value, 'Gas']}
              />
              <Line 
                type="monotone" 
                dataKey="gas" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
