import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Settings, TrendingUp, AlertCircle, CheckCircle, Clock, BarChart3, Video, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useTestCases, TestCase as TestCaseType } from "@/hooks/useTestCases";

interface TestCase extends TestCaseType {
  parameters?: Record<string, string>;
}

const StatusBadge = ({ status }: { status: TestCaseType["status"] }) => {
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
  const navigate = useNavigate();
  const { testCases, loading, runTest } = useTestCases();

  const stats = {
    total: testCases.length,
    passing: testCases.filter(t => t.status === "passing").length,
    failing: testCases.filter(t => t.status === "failing").length,
    pending: testCases.filter(t => t.status === "pending").length
  };

  const handleNewTest = () => {
    navigate('/editor');
  };

  const handleRecordTest = () => {
    navigate('/editor?mode=record');
  };

  const handleEditTest = (testId: string) => {
    navigate(`/editor?id=${testId}`);
  };

  const handleConfiguration = () => {
    navigate('/admin');
  };

  const handleRunTest = async (testId: string) => {
    await runTest(testId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading test cases...</span>
        </div>
      </div>
    );
  }

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
            <Button variant="outline" size="sm" onClick={handleConfiguration}>
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </Button>
            <Button variant="outline" size="sm" onClick={handleRecordTest}>
              <Video className="w-4 h-4 mr-2" />
              Record Test
            </Button>
            <Button size="sm" onClick={handleNewTest}>
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
              {testCases.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No test cases found. Create your first test to get started!</p>
                  <Button className="mt-4" onClick={handleNewTest}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Test
                  </Button>
                </div>
              ) : (
                testCases.map((test) => (
                  <div 
                    key={test.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedTest(selectedTest === test.id ? null : test.id)}
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{test.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Last run: {test.last_run || 'Never'}
                      </p>
                      {test.description && (
                        <p className="text-xs text-muted-foreground mt-1">{test.description}</p>
                      )}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {test.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <StatusBadge status={test.status} />
                        {test.duration && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(test.duration / 1000)}s
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunTest(test.id);
                          }}
                          disabled={test.status === 'running'}
                        >
                          {test.status === 'running' ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4 mr-1" />
                          )}
                          Run
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTest(test.id);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}