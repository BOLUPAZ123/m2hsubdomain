import { Check, X, Loader2 } from "lucide-react";

interface SubdomainAvailabilityIndicatorProps {
  isAvailable: boolean | null;
  isChecking: boolean;
  error: string | null;
}

const SubdomainAvailabilityIndicator = ({
  isAvailable,
  isChecking,
  error,
}: SubdomainAvailabilityIndicatorProps) => {
  if (isChecking) {
    return (
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Checking...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-destructive text-xs">
        <X className="h-3 w-3" />
        <span>{error}</span>
      </div>
    );
  }

  if (isAvailable === true) {
    return (
      <div className="flex items-center gap-1.5 text-success text-xs">
        <Check className="h-3 w-3" />
        <span>Available</span>
      </div>
    );
  }

  if (isAvailable === false) {
    return (
      <div className="flex items-center gap-1.5 text-destructive text-xs">
        <X className="h-3 w-3" />
        <span>Already taken</span>
      </div>
    );
  }

  return null;
};

export default SubdomainAvailabilityIndicator;
