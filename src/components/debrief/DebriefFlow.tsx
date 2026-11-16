'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  interactionId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

const STEPS = [
  {
    id: 'went_well',
    question: 'What went well?',
    placeholder: 'What parts of the conversation felt strong? What examples or stories landed well?',
  },
  {
    id: 'caught_off_guard',
    question: 'What caught you off guard?',
    placeholder: 'Were there any unexpected questions or topics you struggled with?',
  },
  {
    id: 'do_differently',
    question: 'What would you do differently?',
    placeholder: 'What would you prepare better for next time?',
  },
  {
    id: 'learned_about_company',
    question: 'What did you learn about the company?',
    placeholder: 'What insights did you gain about the team, culture, or product?',
  },
  {
    id: 'energy_check',
    question: 'Energy check — how do you feel?',
    placeholder: 'Are you excited? Nervous? Having second thoughts?',
  },
];

export default function DebriefFlow({ interactionId, onComplete, onCancel }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({
    went_well: '',
    caught_off_guard: '',
    do_differently: '',
    learned_about_company: '',
    energy_check: '',
  });

  const currentStepData = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/debriefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interaction_id: interactionId,
          ...answers,
        }),
      });

      if (response.ok) {
        router.refresh();
        onComplete?.();
      } else {
        alert('Failed to save debrief');
      }
    } catch (error) {
      console.error('Error saving debrief:', error);
      alert('Failed to save debrief');
    } finally {
      setIsSaving(false);
    }
  };

  const updateAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentStepData.id]: value,
    });
  };

  return (
    <div className="bg-zinc-900 rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-zinc-300">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-sm text-zinc-500">
            {Math.round(((currentStep + 1) / STEPS.length) * 100)}% complete
          </span>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-2">
          <div
            className="bg-zinc-100 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">{currentStepData.question}</h2>
        <textarea
          value={answers[currentStepData.id]}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder={currentStepData.placeholder}
          rows={8}
          className="w-full px-4 py-3 bg-zinc-800 text-zinc-100 border border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-400 resize-none placeholder:text-zinc-500"
          autoFocus
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div>
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 text-zinc-300 hover:text-zinc-100"
            >
              ← Back
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="px-6 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Complete Debrief'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Skip Option */}
      <div className="mt-6 text-center">
        <button
          onClick={() => {
            if (currentStep < STEPS.length - 1) {
              updateAnswer('');
              handleNext();
            }
          }}
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          Skip this question
        </button>
      </div>
    </div>
  );
}
