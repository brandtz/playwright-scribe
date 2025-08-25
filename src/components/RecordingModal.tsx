import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Video, Square, Play, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
      // Simulate API call to start Playwright recording session
      // In a real implementation, this would call an edge function that:
      // 1. Starts a headed Playwright browser
      // 2. Opens the specified URL
      // 3. Begins recording user interactions
      // 4. Returns a session ID for tracking
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate startup time
      
      setRecordingStatus('recording');
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Browser opened in recording mode. Perform your test actions.",
      });
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      setRecordingStatus('idle');
      toast({
        title: "Recording Failed",
        description: "Failed to start recording session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStopRecording = async () => {
    setRecordingStatus('stopping');
    
    try {
      // Simulate API call to stop recording and process the recorded actions
      // In a real implementation, this would:
      // 1. Stop the recording session
      // 2. Parse the recorded actions into test steps
      // 3. Return the generated test code and steps
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time
      
      // Save the test with generated steps
      await onSave({
        name: testName,
        description: testDescription,
        url: startUrl
      });
      
      toast({
        title: "Recording Complete",
        description: "Test recorded and saved successfully!",
      });
      
      // Reset state
      setTestName('');
      setTestDescription('');
      setStartUrl('https://');
      setIsRecording(false);
      setRecordingStatus('idle');
      onClose();
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setRecordingStatus('recording');
      toast({
        title: "Save Failed",
        description: "Failed to save recorded test. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      // In a real implementation, this would terminate the Playwright session
      setIsRecording(false);
      setRecordingStatus('idle');
    }
    setTestName('');
    setTestDescription('');
    setStartUrl('https://');
    onClose();
  };

  const getStatusMessage = () => {
    switch (recordingStatus) {
      case 'starting':
        return 'Starting browser and recording session...';
      case 'recording':
        return 'Recording in progress. Perform your test actions in the opened browser.';
      case 'stopping':
        return 'Processing recorded actions and generating test code...';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Record Playwright Test
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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
                Stop & Save
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}