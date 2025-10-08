import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RSVPConfig {
  enable_rsvp: boolean;
  max_attendees: number | null;
  registration_deadline: string;
  custom_fields: CustomField[];
}

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'radio' | 'select';
  required: boolean;
  options?: string[];
}

interface EventRSVPFormBuilderProps {
  eventId: string;
  initialConfig?: RSVPConfig;
  onSave: (config: RSVPConfig) => void;
}

export const EventRSVPFormBuilder = ({ eventId, initialConfig, onSave }: EventRSVPFormBuilderProps) => {
  const [config, setConfig] = useState<RSVPConfig>({
    enable_rsvp: false,
    max_attendees: null,
    registration_deadline: "",
    custom_fields: [],
    ...initialConfig,
  });

  const addCustomField = () => {
    const newField: CustomField = {
      id: crypto.randomUUID(),
      label: "",
      type: 'text',
      required: false,
    };
    setConfig(prev => ({
      ...prev,
      custom_fields: [...prev.custom_fields, newField],
    }));
  };

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setConfig(prev => ({
      ...prev,
      custom_fields: prev.custom_fields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      ),
    }));
  };

  const removeCustomField = (id: string) => {
    setConfig(prev => ({
      ...prev,
      custom_fields: prev.custom_fields.filter(field => field.id !== id),
    }));
  };

  const handleSave = () => {
    onSave(config);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="enable-rsvp" className="text-base font-semibold">Enable RSVP</Label>
            <p className="text-sm text-muted-foreground">Allow people to register for this event</p>
          </div>
          <Switch
            id="enable-rsvp"
            checked={config.enable_rsvp}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enable_rsvp: checked }))}
          />
        </div>

        {config.enable_rsvp && (
          <>
            <div className="space-y-2">
              <Label htmlFor="max-attendees">Maximum Attendees (Optional)</Label>
              <Input
                id="max-attendees"
                type="number"
                min="1"
                placeholder="Leave empty for unlimited"
                value={config.max_attendees || ""}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  max_attendees: e.target.value ? parseInt(e.target.value) : null
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Registration Deadline</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={config.registration_deadline}
                onChange={(e) => setConfig(prev => ({ ...prev, registration_deadline: e.target.value }))}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Custom Form Fields</Label>
                <Button onClick={addCustomField} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
              </div>

              {config.custom_fields.map((field) => (
                <Card key={field.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Field Label"
                        value={field.label}
                        onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          value={field.type}
                          onValueChange={(value: CustomField['type']) => 
                            updateCustomField(field.id, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="radio">Radio</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                          </SelectContent>
                        </Select>

                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => 
                              updateCustomField(field.id, { required: checked })
                            }
                          />
                          <Label>Required</Label>
                        </div>
                      </div>

                      {['radio', 'select'].includes(field.type) && (
                        <Input
                          placeholder="Options (comma separated)"
                          value={field.options?.join(', ') || ''}
                          onChange={(e) => 
                            updateCustomField(field.id, { 
                              options: e.target.value.split(',').map(opt => opt.trim()) 
                            })
                          }
                        />
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCustomField(field.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Button onClick={handleSave} className="w-full">
              Save RSVP Configuration
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
