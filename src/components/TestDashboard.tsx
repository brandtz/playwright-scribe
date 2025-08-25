import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Settings, TrendingUp, AlertCircle, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { useState } from "react";

interface TestCase {
  id: string;
  name: string;
  status: "passing" | "failing" | "pending" | "running";
  lastRun: string;
  duration: string;
  parameters: Record<string, string>;
  tags: string[];
}

const mockTests: TestCase[] = [
  {
    id: "1",
    name: "User Login Flow",
    status: "passing",
    lastRun: "2 hours ago",
    duration: "45s",
    parameters: { accountNumber: "12345", environment: "staging" },
    tags: ["login", "ui"]
  },
  {
    id: "2", 
    name: "Payment Processing",
    status: "failing",
    lastRun: "1 hour ago",
    duration: "1m 23s",
    parameters: { paymentAmount: "100.00", cardType: "visa" },
    tags: ["payment", "ordering"]
  },
  {
    id: "3",
    name: "Product Search",
    status: "pending",
    lastRun: "3 hours ago", 
    duration: "32s",
    parameters: { searchTerm: "laptop", category: "electronics" },
    tags: ["ui", "search"]
  }
];

const StatusBadge = ({ status }: { status: TestCase["status"] }) => {
  const variants = {
    passing: "bg-success text-success-foreground",
    failing: "bg-destructive text-destructive-foreground", 
    pending: "bg-warning text-warning-foreground",
    running: "bg-primary text-primary-foreground"
  };

  const icons = {
    passing: CheckCircle,
    failing: AlertCircle,
    pending: Clock,
    running: Play
  };

  const Icon = icons[status];

  return (
    <Badge className={variants[status]}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </Badge>
  );
};

export default function TestDashboard() {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const stats = {
    total: mockTests.length,
    passing: mockTests.filter(t => t.status === "passing").length,
    failing: mockTests.filter(t => t.status === "failing").length,
    pending: mockTests.filter(t => t.status === "pending").length
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Playwright Test Suite</h1>
            <p className="text-muted-foreground mt-1">Manage and monitor your automated tests</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Test
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Passing</p>
                  <p className="text-2xl font-bold text-success">{stats.passing}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Failing</p>
                  <p className="text-2xl font-bold text-destructive">{stats.failing}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Test Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTests.map((test) => (
                <div 
                  key={test.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTest(selectedTest === test.id ? null : test.id)}
                >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">Last run: {test.lastRun}</p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {test.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <StatusBadge status={test.status} />
                    </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-1" />
                      Run
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}