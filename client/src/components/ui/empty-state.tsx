import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Users, Calendar, Clock, DollarSign, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12", className)}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Predefined empty states for common scenarios
export function EmptyDocuments({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<FileText className="w-12 h-12" />}
      title="No documents yet"
      description="Upload your first document to get started with AI-powered analysis"
      action={onUpload ? { label: "Upload Document", onClick: onUpload } : undefined}
    />
  );
}

export function EmptyClients({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-12 h-12" />}
      title="No clients yet"
      description="Add your first client to start managing cases and billing"
      action={onCreate ? { label: "Add Client", onClick: onCreate } : undefined}
    />
  );
}

export function EmptyIntakes({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-12 h-12" />}
      title="No intake requests"
      description="Client intake requests will appear here when submitted"
      action={onCreate ? { label: "Create Manual Intake", onClick: onCreate } : undefined}
    />
  );
}

export function EmptyTimeEntries({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<Clock className="w-12 h-12" />}
      title="No time entries"
      description="Start tracking your billable hours to generate invoices"
      action={onCreate ? { label: "Add Time Entry", onClick: onCreate } : undefined}
    />
  );
}

export function EmptyInvoices({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<DollarSign className="w-12 h-12" />}
      title="No invoices yet"
      description="Create your first invoice from tracked time entries"
      action={onCreate ? { label: "Create Invoice", onClick: onCreate } : undefined}
    />
  );
}

export function EmptyCalendar({ onCreate }: { onCreate?: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="w-12 h-12" />}
      title="No events scheduled"
      description="Add court dates, client meetings, and deadlines to your calendar"
      action={onCreate ? { label: "Add Event", onClick: onCreate } : undefined}
    />
  );
}

// Generic search results empty state
export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<FileText className="w-12 h-12" />}
      title="No results found"
      description={`No results found for "${query}". Try adjusting your search terms.`}
    />
  );
}