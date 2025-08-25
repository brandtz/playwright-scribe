import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Video, Square, Play, Loader2, Code, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testData: {
    name: string;
    description: string;
    url: string;
  }) => Promise<void>;
}

export function RecordingModal({ isOpen, onClose, onSave }: RecordingModalProps) {
  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [startUrl, setStartUrl] = useState('https://');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'starting' | 'recording' | 'stopping'>('idle');
  const [isHeaded, setIsHeaded] = useState(true);
  const [browserType, setBrowserType] = useState('chromium');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [activeTab, setActiveTab] = useState('setup');
  const { toast } = useToast();

  const handleStartRecording = async () => {
    if (!testName.trim() || !startUrl.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a test name and starting URL",
        variant: "destructive"
      });
      return;
    }

    setRecordingStatus('starting');
    
    try {
      // First check if agent is running
      const healthCheck = await fetch('http://localhost:4317/health').catch(() => null);
      
      if (!healthCheck || !healthCheck.ok) {
        throw new Error('Scribe Agent not running. Please start the local agent first.');
      }

      const newSessionId = `session-${Date.now()}`;
      
      const response = await fetch('http://localhost:4317/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: startUrl, 
          browser: browserType, 
          target: 'typescript',
          testName,
          sessionId: newSessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start recording');
      }

      const data = await response.json();
      setSessionId(data.sessionId || newSessionId);
      setRecordingStatus('recording');
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: `${isHeaded ? 'Headed' : 'Headless'} ${browserType} browser opened. Perform your test actions in the Playwright window.`,
      });
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setRecordingStatus('idle');
      toast({
        title: "Recording Failed",
        description: error.message.includes('Agent not running') 
          ? "Local Scribe Agent is not running. Please start it first (see README)."
          : "Failed to start recording session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStopRecording = async () => {
    if (!sessionId) return;
    
    setRecordingStatus('stopping');
    
    try {
      const response = await fetch('http://localhost:4317/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to stop recording');
      }

      const data = await response.json();
      
      // Set placeholder code since the actual generated code will be in the clipboard/terminal
      const placeholderCode = `import { test, expect } from '@playwright/test';

test('${testName}', async ({ page }) => {
  await page.goto('${startUrl}');
  
  // Your recorded actions will appear here
  // The generated code is available in your clipboard or terminal output
  // Please paste it here and edit as needed
  
  // Example assertions:
  // await expect(page).toHaveTitle(/Expected Title/);
  // await expect(page.locator('selector')).toBeVisible();
});`;

      setGeneratedCode(placeholderCode);
      setActiveTab('code');
      
      toast({
        title: "Recording Complete",
        description: "Recording stopped. Generated code is in your clipboard - paste it in the code editor below.",
      });
      
      setRecordingStatus('idle');
      setIsRecording(false);
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setRecordingStatus('recording');
      toast({
        title: "Stop Failed",
        description: "Failed to stop recording session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveAndClose = async () => {
    try {
      await onSave({
        name: testName,
        description: testDescription,
        url: startUrl
      });
      
      // Reset state
      setTestName('');
      setTestDescription('');
      setStartUrl('https://');
      setIsRecording(false);
      setRecordingStatus('idle');
      setGeneratedCode('');
      setActiveTab('setup');
      setSessionId(null);
      onClose();
      
    } catch (error) {
      console.error('Failed to save test:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save test. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    if (isRecording && sessionId) {
      // In a real implementation, this would terminate the Playwright session
      setIsRecording(false);
      setRecordingStatus('idle');
    }
    setTestName('');
    setTestDescription('');
    setStartUrl('https://');
    setGeneratedCode('');
    setActiveTab('setup');
    setSessionId(null);
    onClose();
  };

  const getStatusMessage = () => {
    switch (recordingStatus) {
      case 'starting':
        return 'Starting local Playwright browser and recording session...';
      case 'recording':
        return 'Recording in progress. Perform your test actions in the Playwright browser window that opened.';
      case 'stopping':
        return 'Stopping recording and generating test code...';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Record Playwright Test
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Setup
            </TabsTrigger>
            <TabsTrigger value="code" disabled={!generatedCode} className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Generated Code
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-name">Test Name</Label>
              <Input
                id="test-name"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name"
                disabled={isRecording}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="test-description">Description (Optional)</Label>
              <Textarea
                id="test-description"
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                placeholder="Brief description of what this test does"
                disabled={isRecording}
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-url">Starting URL</Label>
              <Input
                id="start-url"
                value={startUrl}
                onChange={(e) => setStartUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isRecording}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="browser-type">Browser</Label>
                <Select value={browserType} onValueChange={setBrowserType} disabled={isRecording}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select browser" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chromium">Chromium</SelectItem>
                    <SelectItem value="firefox">Firefox</SelectItem>
                    <SelectItem value="webkit">WebKit (Safari)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="headed-toggle">Display Mode</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="headed-toggle"
                    checked={isHeaded}
                    onCheckedChange={setIsHeaded}
                    disabled={isRecording}
                  />
                  <Label htmlFor="headed-toggle" className="text-sm">
                    {isHeaded ? 'Headed (Visible)' : 'Headless (Background)'}
                  </Label>
                </div>
              </div>
            </div>
            
            {recordingStatus !== 'idle' && (
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {recordingStatus === 'recording' ? (
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <span className="text-sm font-medium">
                    {recordingStatus === 'recording' ? 'Recording' : 'Processing'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getStatusMessage()}
                </p>
                {recordingStatus === 'recording' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 Tip: Perform your actions in the Playwright browser window, then click Stop to generate code.
                  </p>
                )}
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              
              {!isRecording ? (
                <Button 
                  onClick={handleStartRecording}
                  disabled={recordingStatus !== 'idle'}
                >
                  {recordingStatus === 'starting' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Start Recording
                </Button>
              ) : (
                <Button 
                  onClick={handleStopRecording}
                  disabled={recordingStatus === 'stopping'}
                  variant="destructive"
                >
                  {recordingStatus === 'stopping' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  Stop Recording
                </Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="code" className="space-y-4">
            {generatedCode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="generated-code">Generated Playwright Code</Label>
                  <Textarea
                    id="generated-code"
                    value={generatedCode}
                    onChange={(e) => setGeneratedCode(e.target.value)}
                    placeholder="Generated code will appear here..."
                    className="min-h-96 font-mono text-sm"
                    rows={20}
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveAndClose}>
                    Save Test
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}