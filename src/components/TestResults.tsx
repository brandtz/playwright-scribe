import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Clock, Filter, Tag } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

// Mock data with tags
const recentTests = [
  { date: "2024-01-20", time: "14:30", test: "User Login Flow", status: "passed", duration: "45s", error: null, tags: ["login", "ui"] },
  { date: "2024-01-20", time: "14:25", test: "Payment Processing", status: "failed", duration: "1m 23s", error: "Timeout waiting for payment confirmation", tags: ["payment", "ordering"] },
  { date: "2024-01-20", time: "14:20", test: "Order Checkout", status: "passed", duration: "2m 15s", error: null, tags: ["ordering", "ui"] },
  { date: "2024-01-20", time: "14:15", test: "API Health Check", status: "passed", duration: "12s", error: null, tags: ["api", "integration"] },
  { date: "2024-01-20", time: "14:10", test: "User Registration", status: "failed", duration: "1m 5s", error: "Email validation failed", tags: ["login", "ui"] },
];

const trendData = [
  { date: "Jan 15", passed: 12, failed: 3 },
  { date: "Jan 16", passed: 15, failed: 2 },
  { date: "Jan 17", passed: 8, failed: 5 },
  { date: "Jan 18", passed: 18, failed: 1 },
  { date: "Jan 19", passed: 10, failed: 4 },
  { date: "Jan 20", passed: 14, failed: 3 },
  { date: "Jan 21", passed: 16, failed: 2 },
];

const performanceData = [
  { test: "Login Tests", avgDuration: 43, runs: 15, trend: "stable" },
  { test: "Payment Tests", avgDuration: 87, runs: 12, trend: "improving" },
  { test: "Order Tests", avgDuration: 125, runs: 8, trend: "degrading" },
  { test: "API Tests", avgDuration: 12, runs: 25, trend: "stable" },
];

const summaryStats = [
  { 
    label: "Success Rate",
    value: "85%",
    trend: "up",
    icon: TrendingUp,
    color: "text-success"
  },
  {
    label: "Total Runs",
    value: "1,247",
    trend: "up", 
    icon: CheckCircle,
    color: "text-foreground"
  },
  {
    label: "Failed Tests",
    value: "47",
    trend: "down",
    icon: AlertTriangle,
    color: "text-destructive"
  },
  {
    label: "Avg Duration",
    value: "52s",
    trend: "down",
    icon: Clock,
    color: "text-foreground"
  }
];

const availableTags = ["login", "payment", "ordering", "ui", "api", "integration", "navigation"];

const TestResults = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState("7d");

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Filter data based on selected tags
  const filteredTrendData = selectedTags.length > 0 
    ? trendData.map(day => ({
        ...day,
        // Simulate filtering - in real app, this would come from backend
        passed: Math.floor(day.passed * (selectedTags.length / availableTags.length)),
        failed: Math.floor(day.failed * (selectedTags.length / availableTags.length))
      }))
    : trendData;

  const filteredRecentTests = selectedTags.length > 0
    ? recentTests.filter(test => 
        selectedTags.some(tag => test.tags?.includes(tag))
      )
    : recentTests;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Test Analytics</h1>
            <p className="text-muted-foreground">Monitor test performance and track trends over time</p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter by Tags
                  {selectedTags.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedTags.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Filter by Tags</h4>
                  <div className="space-y-2">
                    {availableTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                        />
                        <label htmlFor={tag} className="text-sm cursor-pointer">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedTags.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedTags([])}
                      className="w-full"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Custom Range
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {selectedTags.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Active Filters:</span>
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button 
                      onClick={() => toggleTag(tag)}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {summaryStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Test Results Over Time
              {selectedTags.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  Filtered by {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="passed" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Passed Tests"
                />
                <Line 
                  type="monotone" 
                  dataKey="failed" 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  name="Failed Tests"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Suite Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData.map((suite, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-12 rounded-full bg-primary/20" />
                      <div>
                        <h4 className="font-medium">{suite.test}</h4>
                        <p className="text-sm text-muted-foreground">{suite.runs} runs</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{suite.avgDuration}s</p>
                      <div className="flex items-center gap-1">
                        {suite.trend === "improving" && <TrendingDown className="w-3 h-3 text-success" />}
                        {suite.trend === "degrading" && <TrendingUp className="w-3 h-3 text-destructive" />}
                        {suite.trend === "stable" && <div className="w-3 h-3 rounded-full bg-muted" />}
                        <span className="text-xs text-muted-foreground">{suite.trend}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Success Rate by Time Range</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={filteredTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="passed" 
                    stackId="a" 
                    fill="hsl(var(--success))" 
                    name="Passed"
                  />
                  <Bar 
                    dataKey="failed" 
                    stackId="a" 
                    fill="hsl(var(--destructive))"
                    name="Failed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Test Runs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Test Runs
              {selectedTags.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {filteredRecentTests.length} of {recentTests.length} tests
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRecentTests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {test.status === "passed" ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      <Badge variant={test.status === "passed" ? "default" : "destructive"}>
                        {test.status}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{test.test}</h4>
                      <p className="text-sm text-muted-foreground">
                        {test.date} at {test.time} • Duration: {test.duration}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {test.tags?.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {test.error && (
                        <p className="text-sm text-destructive mt-1">{test.error}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              ))}
              {filteredRecentTests.length === 0 && selectedTags.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No test runs found for the selected tags.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestResults;