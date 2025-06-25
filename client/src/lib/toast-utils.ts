import { useToast } from "@/components/ui/use-toast";

// Custom toast utility functions for consistent toast usage
export const createToastUtils = () => {
  const { toast } = useToast();
  
  return {
    showSuccess: (title: string, message: string) => {
      toast({
        title,
        description: message,
        variant: "default",
      });
    },
    
    showError: (title: string, message: string) => {
      toast({
        title,
        description: message,
        variant: "destructive",
      });
    },
    
    showInfo: (title: string, message: string) => {
      toast({
        title,
        description: message,
      });
    }
  };
};
