import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Save, Settings, Plus, Trash2, Code, Eye, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTestCases, useTestSteps, useTestParameters } from "@/hooks/useTestCases";
import { RecordingModal } from "./RecordingModal";
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const testId = searchParams.get('id');
  const isRecordingMode = searchParams.get('mode') === 'record';
  
  const { testCases, createTestCase, updateTestCase, runTest } = useTestCases();
  const { steps, saveSteps } = useTestSteps(testId || '');
  const { parameters, saveParameters } = useTestParameters(testId || '');
  
  const [testName, setTestName] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [localSteps, setLocalSteps] = useState<TestStep[]>([]);
  const [localParameters, setLocalParameters] = useState<TestParameter[]>([]);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing test case data
  useEffect(() => {
    if (testId && testCases.length > 0) {
      const testCase = testCases.find(t => t.id === testId);
      if (testCase) {
        setTestName(testCase.name);
        setTestDescription(testCase.description || "");
        setSelectedTags(testCase.tags || []);
      }
    }
  }, [testId, testCases]);

  // Load steps and parameters
  useEffect(() => {
    if (steps.length > 0) {
      setLocalSteps(steps.map(step => ({
        id: step.id,
        action: step.action,
        selector: step.selector || "",
        value: step.value || "",
        description: step.description || ""
      })));
    }
  }, [steps]);

  useEffect(() => {
    if (parameters.length > 0) {
      setLocalParameters(parameters.map(param => ({
        key: param.key,
        value: param.value,
        description: param.description || ""
      })));
    }
  }, [parameters]);

  // Show recording modal if in recording mode
  useEffect(() => {
    if (isRecordingMode) {
      setIsRecordingModalOpen(true);
    }
  }, [isRecordingMode]);

  const addStep = () => {
    const newStep: TestStep = {
      id: Date.now().toString(),
      action: "click",
      selector: "",
      value: "",
      description: "New step"
    };
    setLocalSteps([...localSteps, newStep]);
  };

  const addParameter = () => {
    const newParam: TestParameter = {
      key: "newParam",
      value: "",
      description: "New parameter"
    };
    setLocalParameters([...localParameters, newParam]);
  };

  const removeStep = (id: string) => {
    setLocalSteps(localSteps.filter(step => step.id !== id));
  };

  const removeParameter = (key: string) => {
    setLocalParameters(localParameters.filter(param => param.key !== key));
  };

  const updateStep = (id: string, field: keyof TestStep, value: string) => {
    setLocalSteps(localSteps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const updateParameter = (index: number, field: keyof TestParameter, value: string) => {
    setLocalParameters(localParameters.map((param, i) => 
      i === index ? { ...param, [field]: value } : param
    ));
  };

  const handleSave = async () => {
    if (!testName.trim()) {
      toast({
        title: "Validation Error",
        description: "Test name is required",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      let currentTestId = testId;

      // Create or update test case
      if (testId) {
        await updateTestCase(testId, {
          name: testName,
          description: testDescription,
          tags: selectedTags,
          status: 'pending',
          last_run: undefined,
          duration: undefined,
          created_at: '',
          updated_at: '',
          id: testId
        });
      } else {
        const newTestCase = await createTestCase({
          name: testName,
          description: testDescription,
          tags: selectedTags,
          status: 'pending'
        });
        currentTestId = newTestCase.id;
        // Update URL to include the new test ID
        navigate(`/editor?id=${currentTestId}`, { replace: true });
      }

      if (currentTestId) {
        // Save steps
        const stepsToSave = localSteps.map((step, index) => ({
          test_case_id: currentTestId!,
          step_order: index + 1,
          action: step.action,
          selector: step.selector,
          value: step.value,
          description: step.description
        }));
        await saveSteps(stepsToSave);

        // Save parameters
        const parametersToSave = localParameters.map(param => ({
          test_case_id: currentTestId!,
          key: param.key,
          value: param.value,
          description: param.description
        }));
        await saveParameters(parametersToSave);
      }

      toast({
        title: "Success",
        description: "Test saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save test",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunTest = async () => {
    if (testId) {
      await runTest(testId);
    } else {
      toast({
        title: "Save Required",
        description: "Please save the test before running it",
        variant: "destructive"
      });
    }
  };

  const handleRecordingComplete = async (recordingData: {
    name: string;
    description: string;
    url: string;
  }) => {
    // Set the form data from recording
    setTestName(recordingData.name);
    setTestDescription(recordingData.description);
    setSelectedTags(['recorded']);
    
    // Generate sample steps from recording (in real implementation, these would come from the recording)
    const generatedSteps: TestStep[] = [
      {
        id: "1",
        action: "navigate",
        selector: "",
        value: recordingData.url,
        description: "Navigate to starting page"
      },
      {
        id: "2",
        action: "click",
        selector: "[recorded-selector]",
        value: "",
        description: "Recorded click action"
      }
    ];
    
    setLocalSteps(generatedSteps);
    setIsRecordingModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {testId ? 'Edit Test' : 'Create New Test'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isRecordingMode ? 'Recording mode - create tests by recording interactions' 
                 : 'Create and modify your Playwright tests'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              disabled={!testId}
              onClick={handleRunTest}
            >
              <Play className="w-4 h-4 mr-2" />
              Run Test
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
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
                  {localSteps.map((step, index) => (
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
                  {localParameters.map((param, index) => (
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
  
${localSteps.map((step, index) => {
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

        {/* Recording Modal */}
        <RecordingModal
          isOpen={isRecordingModalOpen}
          onClose={() => {
            setIsRecordingModalOpen(false);
            if (isRecordingMode) {
              navigate('/editor');
            }
          }}
          onSave={handleRecordingComplete}
        />
      </div>
    </div>
  );
}