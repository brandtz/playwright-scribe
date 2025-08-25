import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Save, Settings, Plus, Trash2, Code, Eye } from "lucide-react";
import TagManager from "./TagManager";

interface TestStep {
  id: string;
  action: string;
  selector: string;
  value?: string;
  description: string;
}

interface TestParameter {
  key: string;
  value: string;
  description: string;
}

export default function TestEditor() {
  const [testName, setTestName] = useState("User Login Flow");
  const [testDescription, setTestDescription] = useState("Test the complete user login process including validation");
  const [selectedTags, setSelectedTags] = useState(["login", "ui"]);
  
  const [steps, setSteps] = useState<TestStep[]>([
    {
      id: "1",
      action: "navigate",
      selector: "",
      value: "https://app.example.com/login",
      description: "Navigate to login page"
    },
    {
      id: "2", 
      action: "fill",
      selector: "[data-testid='username']",
      value: "{{accountNumber}}",
      description: "Enter account number"
    },
    {
      id: "3",
      action: "fill", 
      selector: "[data-testid='password']",
      value: "{{password}}",
      description: "Enter password"
    },
    {
      id: "4",
      action: "click",
      selector: "[data-testid='login-button']",
      description: "Click login button"
    }
  ]);

  const [parameters, setParameters] = useState<TestParameter[]>([
    {
      key: "accountNumber",
      value: "12345",
      description: "User account number for testing"
    },
    {
      key: "password", 
      value: "testpass123",
      description: "Password for test account"
    },
    {
      key: "environment",
      value: "staging",
      description: "Test environment URL"
    }
  ]);

  const addStep = () => {
    const newStep: TestStep = {
      id: Date.now().toString(),
      action: "click",
      selector: "",
      value: "",
      description: "New step"
    };
    setSteps([...steps, newStep]);
  };

  const addParameter = () => {
    const newParam: TestParameter = {
      key: "newParam",
      value: "",
      description: "New parameter"
    };
    setParameters([...parameters, newParam]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const removeParameter = (key: string) => {
    setParameters(parameters.filter(param => param.key !== key));
  };

  const updateStep = (id: string, field: keyof TestStep, value: string) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const updateParameter = (index: number, field: keyof TestParameter, value: string) => {
    setParameters(parameters.map((param, i) => 
      i === index ? { ...param, [field]: value } : param
    ));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Test Editor</h1>
            <p className="text-muted-foreground mt-1">Create and modify your Playwright tests</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Run Test
            </Button>
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Test Details */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testName">Test Name</Label>
                <Input 
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="testDescription">Description</Label>
                <Input 
                  id="testDescription"
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                />
              </div>
            </div>
            
            <TagManager
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="steps" className="space-y-4">
          <TabsList>
            <TabsTrigger value="steps">Test Steps</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="code">Generated Code</TabsTrigger>
          </TabsList>

          {/* Test Steps */}
          <TabsContent value="steps">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Test Steps</CardTitle>
                  <Button onClick={addStep} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.id} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">Step {index + 1}</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeStep(step.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Action</Label>
                          <select 
                            className="w-full p-2 border rounded-md bg-background"
                            value={step.action}
                            onChange={(e) => updateStep(step.id, "action", e.target.value)}
                          >
                            <option value="navigate">Navigate</option>
                            <option value="click">Click</option>
                            <option value="fill">Fill</option>
                            <option value="wait">Wait</option>
                            <option value="assert">Assert</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label>Selector</Label>
                          <Input 
                            value={step.selector}
                            onChange={(e) => updateStep(step.id, "selector", e.target.value)}
                            placeholder="CSS selector or XPath"
                          />
                        </div>
                        
                        <div>
                          <Label>Value</Label>
                          <Input 
                            value={step.value || ""}
                            onChange={(e) => updateStep(step.id, "value", e.target.value)}
                            placeholder="Value or URL"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Label>Description</Label>
                        <Input 
                          value={step.description}
                          onChange={(e) => updateStep(step.id, "description", e.target.value)}
                          placeholder="Describe what this step does"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parameters */}
          <TabsContent value="parameters">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Test Parameters</CardTitle>
                  <Button onClick={addParameter} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Parameter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parameters.map((param, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary">{`{${param.key}}`}</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeParameter(param.key)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Parameter Name</Label>
                          <Input 
                            value={param.key}
                            onChange={(e) => updateParameter(index, "key", e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label>Default Value</Label>
                          <Input 
                            value={param.value}
                            onChange={(e) => updateParameter(index, "value", e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label>Description</Label>
                          <Input 
                            value={param.description}
                            onChange={(e) => updateParameter(index, "description", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generated Code */}
          <TabsContent value="code">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Generated Playwright Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  className="font-mono text-sm h-96"
                  readOnly
                  value={`import { test, expect } from '@playwright/test';

test('${testName}', async ({ page }) => {
  // ${testDescription}
  
${steps.map((step, index) => {
  switch (step.action) {
    case 'navigate':
      return `  // Step ${index + 1}: ${step.description}\n  await page.goto('${step.value}');`;
    case 'click':
      return `  // Step ${index + 1}: ${step.description}\n  await page.click('${step.selector}');`;
    case 'fill':
      return `  // Step ${index + 1}: ${step.description}\n  await page.fill('${step.selector}', '${step.value}');`;
    case 'wait':
      return `  // Step ${index + 1}: ${step.description}\n  await page.waitForSelector('${step.selector}');`;
    case 'assert':
      return `  // Step ${index + 1}: ${step.description}\n  await expect(page.locator('${step.selector}')).toBeVisible();`;
    default:
      return `  // Step ${index + 1}: ${step.description}`;
  }
}).join('\n\n')}
});`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}