"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  AlertTriangle, 
  Thermometer, 
  Droplets, 
  Wind,
  TrendingUp,
  TrendingDown,
  Download,
  Trash2,
  Loader2
} from "lucide-react";
import { useWebSerialContext } from "@/contexts/WebSerialContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useEffect, useState } from "react";
import { featureFlags } from '@/lib/featureFlags';
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function HistoryPage() {
  const { historyEvents, isDemoMode, isConnected, currentData } = useWebSerialContext();
  const { token, isAuthenticated } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [dbHistory, setDbHistory] = useState<any[]>([]);

  // Auto-save sensor data to backend when connected
  useEffect(() => {
    if (!isAuthenticated || !token || !currentData) return;

    const saveInterval = setInterval(async () => {
      if ((isDemoMode || isConnected) && currentData) {
        try {
          const response = await fetch(`${API_URL}/api/history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              gas: currentData.gas || 0,
              temp: currentData.temp || 0,
              humidity: currentData.hum || 0,
              fanStatus: currentData.fan || false,
              buzzerStatus: currentData.buzzer || false,
              timestamp: new Date().toISOString()
            })
          });

          if (!response.ok) {
            console.error('Failed to save sensor data');
          }
        } catch (error) {
          console.error('Error saving sensor data:', error);
        }
      }
    }, 10000); // Save every 10 seconds

    return () => clearInterval(saveInterval);
  }, [isAuthenticated, token, isDemoMode, isConnected, currentData]);

  // Load history from backend
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const response = await fetch(`${API_URL}/api/history?limit=100`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setDbHistory(data.data || []);
        }
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [isAuthenticated, token]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEvents = historyEvents.length + dbHistory.length;
    const criticalAlerts = historyEvents.filter(e => e.severity === "critical").length;
    const warnings = historyEvents.filter(e => e.severity === "warning").length;
    
    return {
      totalEvents,
      criticalAlerts,
      warnings,
      avgResponseTime: "2.3s"
    };
  }, [historyEvents, dbHistory]);

  const handleExportCSV = () => {
    const csvData = historyEvents.map(e => 
      `${e.timestamp},${e.sensor},${e.message},${e.severity},${e.value || ''}`
    ).join('\n');
    
    const blob = new Blob([`Timestamp,Sensor,Message,Severity,Value\n${csvData}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor-history-${new Date().toISOString()}.csv`;
    a.click();
    toast.success('History exported successfully!');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400";
      case "warning":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400";
      case "info":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400";
    }
  };

  const getIcon = (sensor: string) => {
    switch (sensor.toLowerCase()) {
      case "gas sensor":
        return Wind;
      case "temperature":
        return Thermometer;
      case "humidity":
        return Droplets;
      case "smoke sensor":
        return Wind;
      case "system":
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">History</h1>
            <p className="text-muted-foreground">
              {(!featureFlags.enableDemoMode && !featureFlags.enableWebSerial)
                ? "No data is available — WebSerial and Demo Mode are disabled in this deployment."
                : ((isDemoMode || isConnected)
                    ? "Viewing real-time sensor data and system events"
                    : "Connect to device or start demo mode to see history")}
            </p>
          </div>
          
          <Button onClick={handleExportCSV} disabled={historyEvents.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{stats.totalEvents}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">{stats.avgResponseTime}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* History Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Event Timeline
              {isLoadingHistory && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No events recorded yet</p>
                <p className="text-sm">
                  {(!featureFlags.enableDemoMode && !featureFlags.enableWebSerial) 
                    ? "Demo Mode and WebSerial are disabled. No events will be recorded in this deployment." 
                    : ((isDemoMode || isConnected) 
                      ? "Events will appear here as sensors detect changes" 
                      : "Start demo mode or connect a device to begin recording events")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyEvents.map((record) => {
                  const Icon = getIcon(record.sensor);
                  return (
                    <div
                      key={record.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className={`h-10 w-10 rounded-lg ${getSeverityColor(record.severity)} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-sm">{record.message}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {record.sensor} • {record.location}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {record.timestamp}
                          </Badge>
                        </div>
                        
                        {record.value && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getSeverityColor(record.severity)}>
                              {record.value}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {record.type}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}