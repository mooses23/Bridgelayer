import React from 'react';
import { Button } from './button';

export interface WizardStepProps {
  title: string;
  description?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  nextText?: string;
  backText?: string;
  completeText?: string;
}

export const WizardStep: React.FC<WizardStepProps> = ({
  title,
  description,
  onPrevious,
  onNext,
  onComplete,
  nextText = 'Continue',
  backText = 'Back',
  completeText = 'Complete Setup',
}) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium">{title}</h3>
    {description && <p className="text-gray-600">{description}</p>}
    <div className="flex space-x-2">
      {onPrevious && <Button variant="secondary" onClick={onPrevious}>{backText}</Button>}
      {onNext && <Button onClick={onNext}>{nextText}</Button>}
      {onComplete && <Button onClick={onComplete}>{completeText}</Button>}
    </div>
  </div>
);
