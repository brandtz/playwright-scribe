import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Save, TestTube, Database, Globe, Shield, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConfigurations } from "@/hooks/useConfigurations";

interface DatabaseConfig {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
}

interface PlaywrightConfig {
  headless: boolean;
  timeout: string;
  retries: string;
  browserType: string;
  viewport: {
    width: string;
    height: string;
  };
}

export default function AdminConfig() {
  const { toast } = useToast();
  const { configurations, loading, updateConfiguration, getConfiguration } = useConfigurations();
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");
  const [isSaving, setIsSaving] = useState(false);
  
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    host: "localhost",
    port: "3306",
    database: "playwright_tests",
    username: "admin",
    password: ""
  });

  const [playwrightConfig, setPlaywrightConfig] = useState<PlaywrightConfig>({
    headless: true,
    timeout: "30000",
    retries: "2",
    browserType: "chromium",
    viewport: {
      width: "1280",
      height: "720"
    }
  });

  // Load configurations from database
  useEffect(() => {
    if (configurations.length > 0) {
      const dbConfigData = getConfiguration('database_config');
      const playwrightConfigData = getConfiguration('playwright_config');

      if (dbConfigData) {
        const dbValues = dbConfigData.value;
        setDbConfig({
          host: dbValues.host || "localhost",
          port: dbValues.port?.toString() || "3306",
          database: dbValues.database || "playwright_tests",
          username: dbValues.username || "admin",
          password: dbValues.password || ""
        });
      }

      if (playwrightConfigData) {
        const playwrightValues = playwrightConfigData.value;
        setPlaywrightConfig({
          headless: playwrightValues.headless ?? true,
          timeout: playwrightValues.timeout?.toString() || "30000",
          retries: playwrightValues.retries?.toString() || "2",
          browserType: playwrightValues.browser || "chromium",
          viewport: {
            width: playwrightValues.viewport?.width?.toString() || "1280",
            height: playwrightValues.viewport?.height?.toString() || "720"
          }
        });
      }
    }
  }, [configurations, getConfiguration]);

  const testConnection = async () => {
    setConnectionStatus("testing");
    
    // Simulate API call to test database connection
    setTimeout(() => {
      if (dbConfig.password) {
        setConnectionStatus("connected");
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the database.",
        });
      } else {
        setConnectionStatus("disconnected");
        toast({
          title: "Connection Failed",
          description: "Please check your database credentials.",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      // Save database configuration
      await updateConfiguration('database_config', {
        host: dbConfig.host,
        port: parseInt(dbConfig.port),
        database: dbConfig.database,
        username: dbConfig.username,
        password: dbConfig.password
      }, 'Database connection settings');

      // Save Playwright configuration
      await updateConfiguration('playwright_config', {
        timeout: parseInt(playwrightConfig.timeout),
        retries: parseInt(playwrightConfig.retries),
        browser: playwrightConfig.browserType,
        headless: playwrightConfig.headless,
        viewport: {
          width: parseInt(playwrightConfig.viewport.width),
          height: parseInt(playwrightConfig.viewport.height)
        }
      }, 'Playwright test configuration');

      toast({
        title: "Configuration Saved",
        description: "All settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration settings.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateDbConfig = (field: keyof DatabaseConfig, value: string) => {
    setDbConfig(prev => ({ ...prev, [field]: value }));
  };

  const updatePlaywrightConfig = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setPlaywrightConfig(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof PlaywrightConfig] as any),
          [child]: value
        }
      }));
    } else {
      setPlaywrightConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">System Configuration</h1>
            <p className="text-muted-foreground mt-1">Manage database connections and Playwright settings</p>
          </div>
          <Button onClick={saveConfig} disabled={isSaving || loading}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Changes
          </Button>
        </div>

        <Tabs defaultValue="database" className="space-y-4">
          <TabsList>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="playwright">Playwright</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Database Configuration */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    <CardTitle>Database Configuration</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        connectionStatus === "connected" 
                          ? "bg-success text-success-foreground"
                          : connectionStatus === "testing"
                          ? "bg-warning text-warning-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }
                    >
                      {connectionStatus === "connected" && <CheckCircle className="w-3 h-3 mr-1" />}
                      {connectionStatus === "testing" && <TestTube className="w-3 h-3 mr-1" />}
                      {connectionStatus === "disconnected" && <AlertCircle className="w-3 h-3 mr-1" />}
                      {connectionStatus === "connected" ? "Connected" : 
                       connectionStatus === "testing" ? "Testing..." : "Disconnected"}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={testConnection}
                      disabled={connectionStatus === "testing"}
                    >
                      <TestTube className="w-4 h-4 mr-2" />
                      Test Connection
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="host">Host</Label>
                    <Input 
                      id="host"
                      value={dbConfig.host}
                      onChange={(e) => updateDbConfig("host", e.target.value)}
                      placeholder="localhost or IP address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input 
                      id="port"
                      value={dbConfig.port}
                      onChange={(e) => updateDbConfig("port", e.target.value)}
                      placeholder="3306"
                    />
                  </div>
                  <div>
                    <Label htmlFor="database">Database Name</Label>
                    <Input 
                      id="database"
                      value={dbConfig.database}
                      onChange={(e) => updateDbConfig("database", e.target.value)}
                      placeholder="playwright_tests"
                    />
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username"
                      value={dbConfig.username}
                      onChange={(e) => updateDbConfig("username", e.target.value)}
                      placeholder="Database username"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => updateDbConfig("password", e.target.value)}
                    placeholder="Database password"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Playwright Configuration */}
          <TabsContent value="playwright">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  <CardTitle>Playwright Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeout">Default Timeout (ms)</Label>
                    <Input 
                      id="timeout"
                      value={playwrightConfig.timeout}
                      onChange={(e) => updatePlaywrightConfig("timeout", e.target.value)}
                      placeholder="30000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="retries">Retry Attempts</Label>
                    <Input 
                      id="retries"
                      value={playwrightConfig.retries}
                      onChange={(e) => updatePlaywrightConfig("retries", e.target.value)}
                      placeholder="2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="browser">Browser Type</Label>
                  <select 
                    id="browser"
                    className="w-full p-2 border rounded-md bg-background mt-1"
                    value={playwrightConfig.browserType}
                    onChange={(e) => updatePlaywrightConfig("browserType", e.target.value)}
                  >
                    <option value="chromium">Chromium</option>
                    <option value="firefox">Firefox</option>
                    <option value="webkit">WebKit</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Headless Mode</Label>
                    <p className="text-sm text-muted-foreground">Run tests without opening browser windows</p>
                  </div>
                  <Switch 
                    checked={playwrightConfig.headless}
                    onCheckedChange={(checked) => updatePlaywrightConfig("headless", checked)}
                  />
                </div>

                <div>
                  <Label>Viewport Size</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="width" className="text-sm">Width</Label>
                      <Input 
                        id="width"
                        value={playwrightConfig.viewport.width}
                        onChange={(e) => updatePlaywrightConfig("viewport.width", e.target.value)}
                        placeholder="1280"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height" className="text-sm">Height</Label>
                      <Input 
                        id="height"
                        value={playwrightConfig.viewport.height}
                        onChange={(e) => updatePlaywrightConfig("viewport.height", e.target.value)}
                        placeholder="720"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Configuration */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <CardTitle>Security Settings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">API Access</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure authentication for API endpoints that will be used by your PHP backend.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input 
                        id="apiKey"
                        type="password"
                        placeholder="Generated API key for backend integration"
                        readOnly
                        value="pk_test_1234567890abcdef"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      Regenerate API Key
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">Allowed Origins</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Whitelist domains that can access the test management API.
                  </p>
                  <Input 
                    placeholder="https://your-php-app.com, http://localhost:8000"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}