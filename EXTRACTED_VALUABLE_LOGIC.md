# EXTRACTED VALUABLE LOGIC - PRE-REMOVAL PRESERVATION

**Date:** June 20, 2025
**Purpose:** Preserve valuable logic from components being removed
**Source:** Dead/unused components before cleanup

---

## 🔧 VALUABLE LOGIC TO PRESERVE

### **From EnhancedOnboardingWizard.tsx**

#### **1. Auto-Save Functionality**
```typescript
// Custom hook for auto-save functionality
const useAutoSave = (data: OnboardingFormData, saveCallback: (data: OnboardingFormData) => Promise<void>) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isSaving) {
        setIsSaving(true);
        try {
          await saveCallback(data);
          setSaveError(null);
        } catch (error) {
          setSaveError(error instanceof Error ? error.message : 'Auto-save failed');
        } finally {
          setIsSaving(false);
        }
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [data, saveCallback, isSaving]);

  return { isSaving, saveError };
};
```

#### **2. Enhanced Data Model Structure**
```typescript
export interface OnboardingFormData {
  // Step 1: Firm Information & Legal Agreements
  firmName: string;
  subdomain: string;
  contactEmail: string;
  firmAddress: string;
  primaryPhone: string;
  website?: string;
  practiceAreas: string[];
  firmSize: 'solo' | 'small' | 'medium' | 'large';
  timezone: string;
  
  // Legal Compliance (VALUABLE ADDITION)
  acceptedNDA: boolean;
  acceptedTerms: boolean;
  ndaSignedAt?: Date;
  termsSignedAt?: Date;

  // Step 2: Admin Account Creation
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  confirmPassword: string;
  mfaEnabled: boolean;
  securityQuestions: Array<{
    question: string;
    answer: string;
  }>;
  
  // Additional enhanced fields...
}
```

#### **3. Error Handling Pattern**
```typescript
// Progress validation with error display
const validateStep = (step: number, data: OnboardingFormData): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  switch (step) {
    case 1:
      if (!data.firmName?.trim()) errors.firmName = 'Firm name is required';
      if (!data.contactEmail?.trim()) errors.contactEmail = 'Contact email is required';
      if (!data.acceptedNDA) errors.acceptedNDA = 'NDA must be accepted';
      if (!data.acceptedTerms) errors.acceptedTerms = 'Terms must be accepted';
      break;
    // ... other validations
  }
  
  return errors;
};
```

### **From FirmOnboardingPage.tsx**

#### **1. IntakeFormField Interface** (Well-structured)
```typescript
interface IntakeFormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}
```

#### **2. Comprehensive Firm Data Structure**
```typescript
interface FirmOnboardingData {
  // Firm Information
  firmName: string;
  firmSlug: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Practice Areas & Specializations (VALUABLE)
  practiceAreas: string[];
  specializations: string[];
  clientTypes: string[];
  serviceAreas: string[];
  
  // Branding & Customization
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  
  // Integration Settings
  integrations: Record<string, any>;
  
  // Document Templates
  documentTemplates: Array<{
    id: string;
    name: string;
    type: string;
    template: string;
  }>;
  
  // Intake Form Configuration
  intakeForm: {
    title: string;
    description: string;
    fields: IntakeFormField[];
  };
}
```

---

## 🎯 INTEGRATION PLAN

### **Merge Into OnboardingWizard.tsx**
1. **Add auto-save hook** for progress persistence
2. **Enhance data model** with legal compliance tracking
3. **Improve error handling** with comprehensive validation
4. **Add intake form builder** functionality

### **Key Features to Preserve**
- ✅ Auto-save every 30 seconds
- ✅ Legal compliance tracking (NDA, Terms)
- ✅ Enhanced validation patterns
- ✅ Comprehensive data model
- ✅ Intake form field configuration

---

## ⚠️ REMOVAL SAFETY CHECK

### **Components Safe to Remove**
- `EnhancedOnboardingWizard.tsx` - Logic extracted ✅
- `FirmOnboardingPage.tsx` - Logic extracted ✅
- `AdminLayout.tsx` - No unique logic found ✅

**Status: Logic preserved, ready for safe removal**
