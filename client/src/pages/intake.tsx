import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UserCheck, Send, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertClientIntakeSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

// Form schema extending insertClientIntakeSchema
const intakeFormSchema = insertClientIntakeSchema.extend({
  region: z.string().min(1, "Region is required"),
  matterType: z.string().min(1, "Matter type is required"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Valid email is required"),
  clientPhone: z.string().optional(),
  caseDescription: z.string().min(10, "Please provide at least 10 characters describing the case"),
  urgencyLevel: z.enum(["low", "medium", "high", "urgent"]),
  preferredContactMethod: z.enum(["email", "phone", "text"]).default("email"),
});

type IntakeFormData = z.infer<typeof intakeFormSchema>;

// Region/County options
const REGIONS = [
  "Los Angeles County",
  "Orange County", 
  "San Bernardino County",
  "Riverside County",
  "Ventura County",
  "Santa Barbara County",
  "Kern County",
  "Imperial County"
];

// Matter Type options (legal practice areas)
const MATTER_TYPES = [
  "Eviction",
  "Rent Increase",
  "Landlord-Tenant Dispute",
  "Personal Injury",
  "Family Law",
  "Criminal Defense",
  "Employment Law",
  "Contract Dispute",
  "Business Law",
  "Estate Planning",
  "Immigration",
  "Other"
];

export default function Intake() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      region: "",
      matterType: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      caseDescription: "",
      urgencyLevel: "medium",
      preferredContactMethod: "email",
      caseType: "consultation", // Default case type
    },
  });

  const submitIntakeMutation = useMutation({
    mutationFn: (data: IntakeFormData) => {
      console.log("Submitting intake form:", data);
      return apiRequest("POST", "/api/client-intakes", data);
    },
    onSuccess: (response) => {
      console.log("Intake submission successful:", response);
      toast({
        title: "Intake Submitted",
        description: "Client intake form has been submitted successfully. AI pre-prompting will be generated based on your selections.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/client-intakes"] });
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      console.error("Intake submission failed:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit intake form. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: IntakeFormData) => {
    setIsSubmitting(true);
    
    // Generate intake number
    const timestamp = Date.now();
    const intakeNumber = `INT-${timestamp.toString().slice(-6)}`;
    
    const submissionData = {
      ...data,
      intakeNumber,
      firmId: 1, // TODO: Get from auth context
    };

    submitIntakeMutation.mutate(submissionData);
  };

  // Generate AI pre-prompt preview based on selections
  const generatePrePrompt = (region: string, matterType: string) => {
    if (!region || !matterType) return "";
    
    return `AI Analysis Context: ${matterType} case in ${region}. Pre-prompt will include relevant local regulations, typical case patterns, and jurisdiction-specific considerations for this matter type.`;
  };

  const watchedRegion = form.watch("region");
  const watchedMatterType = form.watch("matterType");

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <UserCheck className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Intake</h1>
          <p className="text-gray-600">Collect initial client information and case details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Intake Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>New Client Intake Form</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Case Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region/County *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select region/county" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {REGIONS.map((region) => (
                                <SelectItem key={region} value={region}>
                                  {region}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="matterType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Matter Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select matter type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {MATTER_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Client Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="clientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter client full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clientEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="client@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="clientPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="preferredContactMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Contact Method</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="phone">Phone</SelectItem>
                                <SelectItem value="text">Text Message</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Case Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Case Details</h3>
                    
                    <FormField
                      control={form.control}
                      name="caseDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Description *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide detailed description of the legal matter..."
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="urgencyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low - Routine matter</SelectItem>
                              <SelectItem value="medium">Medium - Standard timeline</SelectItem>
                              <SelectItem value="high">High - Time sensitive</SelectItem>
                              <SelectItem value="urgent">Urgent - Immediate attention</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Intake
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* AI Pre-Prompt Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span>AI Pre-Prompt Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Based on your selections, our AI will generate case-specific prompts to assist with analysis.
                </p>
                
                {(watchedRegion || watchedMatterType) ? (
                  <div className="p-3 bg-blue-50 rounded-lg border">
                    <p className="text-sm text-blue-800 font-medium">Preview:</p>
                    <p className="text-sm text-blue-700 mt-1">
                      {generatePrePrompt(watchedRegion, watchedMatterType)}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-500">
                      Select region and matter type to see AI pre-prompt preview
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  <p className="font-medium">This system will automatically:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Generate jurisdiction-specific guidance</li>
                    <li>Identify relevant case precedents</li>
                    <li>Suggest initial document requirements</li>
                    <li>Flag potential compliance issues</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}