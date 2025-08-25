import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface TagManagerProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags?: string[];
  showCreateNew?: boolean;
}

const defaultTags = ["ordering", "login", "payment", "navigation", "api", "ui", "integration"];

const TagManager = ({ 
  selectedTags, 
  onTagsChange, 
  availableTags = defaultTags,
  showCreateNew = true 
}: TagManagerProps) => {
  const [newTag, setNewTag] = useState("");
  const [allTags, setAllTags] = useState<string[]>(availableTags);

  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  const createNewTag = () => {
    if (newTag.trim() && !allTags.includes(newTag.trim())) {
      const trimmedTag = newTag.trim().toLowerCase();
      setAllTags([...allTags, trimmedTag]);
      addTag(trimmedTag);
      setNewTag("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Tag className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Tags:</span>
        {selectedTags.map(tag => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <X 
              className="w-3 h-3 cursor-pointer" 
              onClick={() => removeTag(tag)}
            />
          </Badge>
        ))}
        {selectedTags.length === 0 && (
          <span className="text-sm text-muted-foreground">No tags assigned</span>
        )}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Manage Tags
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Test Tags</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Available Tags</h4>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => selectedTags.includes(tag) ? removeTag(tag) : addTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            {showCreateNew && (
              <div>
                <h4 className="text-sm font-medium mb-2">Create New Tag</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter tag name..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createNewTag()}
                  />
                  <Button onClick={createNewTag} disabled={!newTag.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TagManager;