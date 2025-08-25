import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Calendar, Download } from "lucide-react";

interface TestResult {
  id: string;
  testName: string;
  status: "passed" | "failed";
  duration: number;
  timestamp: string;
  errorMessage?: string;
}

const mockResults: TestResult[] = [
  { id: "1", testName: "User Login Flow", status: "passed", duration: 45, timestamp: "2024-01-15T10:30:00Z" },
  { id: "2", testName: "Payment Processing", status: "failed", duration: 83, timestamp: "2024-01-15T09:15:00Z", errorMessage: "Element not found: #payment-button" },
  { id: "3", testName: "Product Search", status: "passed", duration: 32, timestamp: "2024-01-15T08:45:00Z" },
  { id: "4", testName: "User Login Flow", status: "passed", duration: 42, timestamp: "2024-01-14T16:20:00Z" },
  { id: "5", testName: "Payment Processing", status: "failed", duration: 91, timestamp: "2024-01-14T15:10:00Z", errorMessage: "Timeout waiting for payment confirmation" },
  { id: "6", testName: "Product Search", status: "passed", duration: 28, timestamp: "2024-01-14T14:30:00Z" },
];

const trendData = [
  { date: "Jan 10", passed: 8, failed: 2, total: 10 },
  { date: "Jan 11", passed: 9, failed: 1, total: 10 },
  { date: "Jan 12", passed: 7, failed: 3, total: 10 },
  { date: "Jan 13", passed: 10, failed: 0, total: 10 },
  { date: "Jan 14", passed: 6, failed: 4, total: 10 },
  { date: "Jan 15", passed: 8, failed: 2, total: 10 },
];

const performanceData = [
  { test: "Login Flow", avgDuration: 43, runs: 15 },
  { test: "Payment", avgDuration: 87, runs: 12 },
  { test: "Search", avgDuration: 30, runs: 18 },
  { test: "Checkout", avgDuration: 125, runs: 8 },
];

export default function TestResults() {
  const totalRuns = mockResults.length;
  const passedRuns = mockResults.filter(r => r.status === "passed").length;
  const failedRuns = mockResults.filter(r => r.status === "failed").length;
  const successRate = Math.round((passedRuns / totalRuns) * 100);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Test Results & Analytics</h1>
            <p className="text-muted-foreground mt-1">Monitor test performance and track failures over time</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Last 30 Days
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-success">{successRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Runs</p>
                  <p className="text-2xl font-bold">{totalRuns}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failed Tests</p>
                  <p className="text-2xl font-bold text-destructive">{failedRuns}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                  <p className="text-2xl font-bold">
                    {Math.round(mockResults.reduce((acc, r) => acc + r.duration, 0) / mockResults.length)}s
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Last 7 days performance</div>
                {trendData.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{day.date}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success"></div>
                        <span className="text-sm text-success">{day.passed} passed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive"></div>
                        <span className="text-sm text-destructive">{day.failed} failed</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Average Test Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Performance by test suite</div>
                {performanceData.map((test, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{test.test}</span>
                      <div className="text-sm text-muted-foreground">{test.runs} runs</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${(test.avgDuration / 150) * 100}px` }}
                      ></div>
                      <span className="text-sm font-medium">{test.avgDuration}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockResults.slice(0, 6).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge 
                      className={result.status === "passed" 
                        ? "bg-success text-success-foreground" 
                        : "bg-destructive text-destructive-foreground"
                      }
                    >
                      {result.status}
                    </Badge>
                    <div>
                      <h3 className="font-medium">{result.testName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString()} • {result.duration}s
                      </p>
                      {result.errorMessage && (
                        <p className="text-sm text-destructive mt-1">{result.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}