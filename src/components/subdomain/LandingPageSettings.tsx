import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, ExternalLink, Code } from "lucide-react";

interface LandingPageSettingsProps {
  landingType: "default" | "redirect" | "html";
  redirectUrl: string;
  htmlContent: string;
  htmlTitle: string;
  onLandingTypeChange: (type: "default" | "redirect" | "html") => void;
  onRedirectUrlChange: (url: string) => void;
  onHtmlContentChange: (content: string) => void;
  onHtmlTitleChange: (title: string) => void;
}

const LandingPageSettings = ({
  landingType,
  redirectUrl,
  htmlContent,
  htmlTitle,
  onLandingTypeChange,
  onRedirectUrlChange,
  onHtmlContentChange,
  onHtmlTitleChange,
}: LandingPageSettingsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm">Landing Page Type</Label>
        <Select value={landingType} onValueChange={(v) => onLandingTypeChange(v as "default" | "redirect" | "html")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Default (CashURL homepage)</span>
              </div>
            </SelectItem>
            <SelectItem value="redirect">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <span>Redirect to URL</span>
              </div>
            </SelectItem>
            <SelectItem value="html">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span>Custom HTML Page</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {landingType === "redirect" && (
        <div className="space-y-2">
          <Label className="text-sm">Redirect URL</Label>
          <Input
            type="url"
            placeholder="https://example.com"
            value={redirectUrl}
            onChange={(e) => onRedirectUrlChange(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Visitors will be redirected to this URL
          </p>
        </div>
      )}

      {landingType === "html" && (
        <>
          <div className="space-y-2">
            <Label className="text-sm">Page Title</Label>
            <Input
              placeholder="My Custom Page"
              value={htmlTitle}
              onChange={(e) => onHtmlTitleChange(e.target.value)}
              maxLength={60}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">HTML Content</Label>
            <Textarea
              placeholder="<h1>Welcome to my page!</h1>
<p>This is my custom landing page.</p>"
              value={htmlContent}
              onChange={(e) => onHtmlContentChange(e.target.value)}
              className="font-mono text-sm min-h-[150px]"
              maxLength={50000}
            />
            <p className="text-xs text-muted-foreground">
              Enter HTML content. Basic HTML tags are supported. Max 50KB.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LandingPageSettings;
