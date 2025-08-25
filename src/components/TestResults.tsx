import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Clock, Filter, Tag, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useTestRuns } from "@/hooks/useTestRuns";

const availableTags = ["login", "payment", "ordering", "ui", "api", "integration", "navigation"];

const TestResults = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState("7d");
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>();

  // Calculate date range based on timeRange
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case "1d":
        start.setDate(end.getDate() - 1);
        break;
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "90d":
        start.setDate(end.getDate() - 90);
        break;
    }
    
    setDateRange({ start, end });
  }, [timeRange]);

  const { testRuns, stats, loading, getTestRunsByDate, getPerformanceData } = useTestRuns(
    dateRange, 
    selectedTags.length > 0 ? selectedTags : undefined
  );

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const trendData = getTestRunsByDate();
  const performanceData = getPerformanceData();

  const summaryStats = [
    { 
      label: "Success Rate",
      value: `${Math.round(stats.successRate)}%`,
      trend: stats.successRate >= 80 ? "up" : "down",
      icon: TrendingUp,
      color: stats.successRate >= 80 ? "text-success" : "text-warning"
    },
    {
      label: "Total Runs",
      value: stats.totalRuns.toString(),
      trend: "up", 
      icon: CheckCircle,
      color: "text-foreground"
    },
    {
      label: "Failed Tests",
      value: stats.failedRuns.toString(),
      trend: "down",
      icon: AlertTriangle,
      color: "text-destructive"
    },
    {
      label: "Avg Duration",
      value: `${Math.round(stats.averageDuration / 1000)}s`,
      trend: "down",
      icon: Clock,
      color: "text-foreground"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading test results...</span>
        </div>
      </div>
    );
  }

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
              <LineChart data={trendData.length > 0 ? trendData : [{ date: 'No Data', passed: 0, failed: 0 }]}>
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
                {performanceData.length > 0 ? (
                  performanceData.map((suite, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-12 rounded-full bg-primary/20" />
                       <div>
                         <h4 className="font-medium">{suite.name}</h4>
                         <p className="text-sm text-muted-foreground">{suite.runs} runs</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-medium">{Math.round(suite.avgDuration / 1000)}s</p>
                       <div className="flex items-center gap-1">
                         <div className="w-3 h-3 rounded-full bg-muted" />
                         <span className="text-xs text-muted-foreground">
                           {Math.round(suite.passRate)}% pass rate
                         </span>
                       </div>
                    </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No performance data available for the selected time period.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Success Rate by Time Range</CardTitle>
            </CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData.length > 0 ? trendData : [{ date: 'No Data', passed: 0, failed: 0 }]}>
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
              {testRuns.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {testRuns.length} test runs
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testRuns.map((run, index) => (
                <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {run.status === "passed" ? (
                        <CheckCircle className="w-5 h-5 text-success" />
                      ) : run.status === "failed" ? (
                        <XCircle className="w-5 h-5 text-destructive" />
                      ) : (
                        <Clock className="w-5 h-5 text-warning" />
                      )}
                      <Badge variant={
                        run.status === "passed" ? "default" : 
                        run.status === "failed" ? "destructive" : "secondary"
                      }>
                        {run.status}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{run.test_case?.name || 'Unknown Test'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(run.started_at).toLocaleDateString()} at {new Date(run.started_at).toLocaleTimeString()}
                        {run.duration && ` • Duration: ${Math.round(run.duration / 1000)}s`}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {run.test_case?.tags?.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      {run.error_message && (
                        <p className="text-sm text-destructive mt-1">{run.error_message}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              ))}
              {testRuns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedTags.length > 0 
                    ? "No test runs found for the selected tags." 
                    : "No test runs found for the selected time period."
                  }
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