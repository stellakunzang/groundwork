'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DebriefFlow from './debrief/DebriefFlow';

interface Props {
  companyId: string;
  onSuccess?: () => void;
}

export default function AddInteraction({ companyId, onSuccess }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDebrief, setShowDebrief] = useState(false);
  const [newInteractionId, setNewInteractionId] = useState<string | null>(null);
  const todayLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    date: todayLocal(),
    type: 'screen',
    person_name: '',
    person_title: '',
    duration: '',
    summary: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          ...formData,
        }),
      });

      if (response.ok) {
        const newInteraction = await response.json();
        setNewInteractionId(newInteraction.id);
        setFormData({
          date: todayLocal(),
          type: 'screen',
          person_name: '',
          person_title: '',
          duration: '',
          summary: '',
        });
        setIsOpen(false);
        setShowDebrief(true);
      } else {
        alert('Failed to add interaction');
      }
    } catch (error) {
      console.error('Error adding interaction:', error);
      alert('Failed to add interaction');
    } finally {
      setIsSaving(false);
    }
  };

  if (showDebrief && newInteractionId) {
    const skipDebrief = () => {
      setShowDebrief(false);
      setNewInteractionId(null);
      router.refresh();
      onSuccess?.();
    };

    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-100">
            Would you like to debrief this interview?
          </h3>
          <button
            onClick={skipDebrief}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            Skip debrief
          </button>
        </div>
        <DebriefFlow
          interactionId={newInteractionId}
          onComplete={skipDebrief}
          onCancel={skipDebrief}
        />
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 text-sm font-medium"
      >
        + Log Interview
      </button>
    );
  }

  const inputClasses = 'w-full px-3 py-2 bg-zinc-800 text-zinc-100 border border-zinc-600 rounded-md focus:outline-none focus:border-zinc-400';

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-800 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4">Log Interview</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Type *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
            className={inputClasses}
          >
            <option value="screen">Phone Screen</option>
            <option value="technical">Technical Interview</option>
            <option value="behavioral">Behavioral Interview</option>
            <option value="onsite">Onsite Interview</option>
            <option value="panel">Panel Interview</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Person Name</label>
          <input
            type="text"
            value={formData.person_name}
            onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Person Title</label>
          <input
            type="text"
            value={formData.person_title}
            onChange={(e) => setFormData({ ...formData, person_title: e.target.value })}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Duration</label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g., 45 min"
            className={inputClasses}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-zinc-400 mb-1">Summary</label>
          <textarea
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            rows={3}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2 border border-zinc-600 text-zinc-300 rounded-md hover:bg-zinc-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
