"use client";

import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Wifi,
  Database,
  Save,
  Loader2,
  AlertTriangle,
  Lock
} from "lucide-react";
import { useState, useEffect } from "react";
import { featureFlags } from '@/lib/featureFlags';
import { toast } from "sonner";
import { useWebSerialContext } from "@/contexts/WebSerialContext";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SettingsPage() {
  const { isDemoMode, isConnected } = useWebSerialContext();
  const { token, isAuthenticated, user, canAccessSettings } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings state
  const [gasThreshold, setGasThreshold] = useState(300);
  const [tempThreshold, setTempThreshold] = useState(30);
  const [humidityMin, setHumidityMin] = useState(40);
  const [humidityMax, setHumidityMax] = useState(70);
  const [alertDuration, setAlertDuration] = useState(5);
  const [fanMinOnTime, setFanMinOnTime] = useState(1);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (!canAccessSettings()) {
      toast.error('Access denied: Admin role required');
      router.push('/');
    }
  }, [isAuthenticated, canAccessSettings, router]);

  // Load settings from backend
  useEffect(() => {
    if (!isAuthenticated || !token || !canAccessSettings()) return;

    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const settings = data.data;
          
          setGasThreshold(settings.thresholds.gas);
          setTempThreshold(settings.thresholds.temperature);
          setHumidityMin(settings.thresholds.humidityMin);
          setHumidityMax(settings.thresholds.humidityMax);
          setAlertDuration(settings.alertDuration);
          setFanMinOnTime(settings.fanMinOnTime);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [isAuthenticated, token, canAccessSettings]);

  const handleSaveSettings = async () => {
    if (!canAccessSettings()) {
      toast.error('Access denied: Admin role required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          thresholds: {
            gas: gasThreshold,
            temperature: tempThreshold,
            humidityMin,
            humidityMax
          },
          alertDuration,
          fanMinOnTime
        })
      });

      if (response.ok) {
        toast.success('Settings saved successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!canAccessSettings()) {
      toast.error('Access denied: Admin role required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/settings/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const settings = data.data;
        
        setGasThreshold(settings.thresholds.gas);
        setTempThreshold(settings.thresholds.temperature);
        setHumidityMin(settings.thresholds.humidityMin);
        setHumidityMax(settings.thresholds.humidityMax);
        setAlertDuration(settings.alertDuration);
        setFanMinOnTime(settings.fanMinOnTime);
        
        toast.success('Settings reset to defaults!');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Failed to reset settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated || !canAccessSettings()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your Smart Lab monitoring system
            {(!featureFlags.enableDemoMode && !featureFlags.enableWebSerial) ? (
              <span className="ml-2 text-muted-foreground">• Remote data input disabled.</span>
            ) : ((isDemoMode || isConnected) && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                • {isDemoMode ? "Demo Mode Active" : "Connected"}
              </span>
            ))}
          </p>
        </div>

        {/* Admin Only Alert */}
        <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Admin Access Required:</strong> Only administrators can modify system settings.
            Current role: <strong className="text-yellow-700 dark:text-yellow-400">👑 Admin</strong>
          </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Sensor Thresholds */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sensor Thresholds
                </CardTitle>
                <CardDescription>Set alert thresholds for each sensor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gas-threshold">Gas Threshold (ppm)</Label>
                    <Input
                      id="gas-threshold"
                      type="number"
                      value={gasThreshold}
                      onChange={(e) => setGasThreshold(Number(e.target.value))}
                      min="0"
                      max="1023"
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when gas level exceeds this value
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="temp-threshold">Temperature Threshold (°C)</Label>
                    <Input
                      id="temp-threshold"
                      type="number"
                      value={tempThreshold}
                      onChange={(e) => setTempThreshold(Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Fan activates above this temperature
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="humidity-min">Humidity Min (%)</Label>
                    <Input
                      id="humidity-min"
                      type="number"
                      value={humidityMin}
                      onChange={(e) => setHumidityMin(Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when humidity drops below this
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="humidity-max">Humidity Max (%)</Label>
                    <Input
                      id="humidity-max"
                      type="number"
                      value={humidityMax}
                      onChange={(e) => setHumidityMax(Number(e.target.value))}
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when humidity exceeds this
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert Configuration */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alert Configuration
                </CardTitle>
                <CardDescription>Configure alert behavior and timing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-duration">Alert Duration (seconds)</Label>
                    <Input
                      id="alert-duration"
                      type="number"
                      value={alertDuration}
                      onChange={(e) => setAlertDuration(Number(e.target.value))}
                      min="1"
                      max="60"
                    />
                    <p className="text-xs text-muted-foreground">
                      How long alerts stay visible
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fan-min-time">Fan Min On-Time (minutes)</Label>
                    <Input
                      id="fan-min-time"
                      type="number"
                      value={fanMinOnTime}
                      onChange={(e) => setFanMinOnTime(Number(e.target.value))}
                      min="1"
                      max="60"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum time fan stays active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* General Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Manage general application preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts when thresholds are exceeded</p>
                  </div>
                  <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">Play sound when critical alerts occur</p>
                  </div>
                  <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-Connect</Label>
                    <p className="text-sm text-muted-foreground">Automatically connect to last used device</p>
                  </div>
                  <Switch checked={autoConnect} onCheckedChange={setAutoConnect} />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handleResetSettings} 
                variant="outline" 
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Reset to Defaults
              </Button>
              <Button 
                onClick={handleSaveSettings} 
                size="lg" 
                className="gap-2 flex-1"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Settings
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}