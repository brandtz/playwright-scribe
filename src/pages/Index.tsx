import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Settings, BarChart3, Edit, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Playwright Test
                <span className="text-primary"> Management</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A comprehensive GUI for building, maintaining, and monitoring your Playwright automated tests. 
                Perfect for teams who need powerful testing without the complexity.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="outline" size="lg" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Configuration
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Everything You Need</h2>
          <p className="text-muted-foreground text-lg">
            Built for non-programmers and technical teams alike
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/dashboard">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Test Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage all your test suites in one place
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/editor">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mx-auto">
                  <Edit className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Visual Editor</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and edit tests with an intuitive interface
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/results">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mx-auto">
                  <BarChart3 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    Track test performance and failure trends
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin">
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mx-auto">
                  <Settings className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Set up database connections and test settings
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">
                Designed for Everyone
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">No coding required:</strong> Visual interface for creating and managing tests
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Parameter management:</strong> Easily set variables like account numbers and test data
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Historical tracking:</strong> Monitor when tests start failing to identify issues
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Self-contained:</strong> Ready to integrate with your PHP backend
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card p-8 rounded-lg border">
              <h3 className="font-semibold text-foreground mb-4">Quick Start</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">1</div>
                  <span className="text-muted-foreground">Configure your database connection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">2</div>
                  <span className="text-muted-foreground">Create your first test with the visual editor</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">3</div>
                  <span className="text-muted-foreground">Set up parameters for dynamic test data</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs">4</div>
                  <span className="text-muted-foreground">Monitor results and track performance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
