'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewCompanyPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    status: 'interested',
    stack: '',
    remote_policy: '',
    source: '',
    careers_url: '',
    notes: '',
  });
  const [compLow, setCompLow] = useState('');
  const [compHigh, setCompHigh] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const comp_range = compLow || compHigh
        ? `$${compLow || '?'}K - $${compHigh || '?'}K`
        : '';
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, comp_range }),
      });

      if (response.ok) {
        const newCompany = await response.json();
        router.push(`/companies/${newCompany.id}`);
      } else {
        alert('Failed to create company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      alert('Failed to create company');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = 'w-full px-3 py-2 bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-md focus:outline-none focus:border-persimmon-500';

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="font-display text-4xl font-light italic text-zinc-100">📖 Open a New Chapter</h2>
        <p className="text-sm text-zinc-500 mt-1 tracking-wide">Every great quest starts with a single step</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-1">Company Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className={inputClasses}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-1">Role / Position</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={inputClasses}
            >
              <option value="interested">Interested</option>
              <option value="applied">Applied</option>
              <option value="active">Active</option>
              <option value="waiting">Waiting</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="watchlist">Watchlist</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Compensation Range</label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 text-sm">$</span>
              <input
                type="number"
                value={compLow}
                onChange={(e) => setCompLow(e.target.value)}
                placeholder="150"
                className={inputClasses}
              />
              <span className="text-zinc-400 text-sm">K –</span>
              <span className="text-zinc-400 text-sm">$</span>
              <input
                type="number"
                value={compHigh}
                onChange={(e) => setCompHigh(e.target.value)}
                placeholder="180"
                className={inputClasses}
              />
              <span className="text-zinc-400 text-sm">K</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Stack</label>
            <input
              type="text"
              value={formData.stack}
              onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
              placeholder="e.g., React, TypeScript, Node.js"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Remote Policy</label>
            <input
              type="text"
              value={formData.remote_policy}
              onChange={(e) => setFormData({ ...formData, remote_policy: e.target.value })}
              placeholder="e.g., Remote, Hybrid, On-site"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Source</label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="e.g., LinkedIn, Referral"
              className={inputClasses}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-1">Careers Page URL</label>
            <input
              type="url"
              value={formData.careers_url}
              onChange={(e) => setFormData({ ...formData, careers_url: e.target.value })}
              placeholder="https://..."
              className={inputClasses}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={isSaving || !formData.name}
            className="px-6 py-2 bg-persimmon-300 text-zinc-950 rounded-md hover:bg-persimmon-200 disabled:opacity-50 font-medium transition-colors"
          >
            {isSaving ? 'Saving…' : '✨ Begin this Chapter'}
          </button>
          <Link
            href="/"
            className="px-6 py-2 border border-zinc-700 text-zinc-300 rounded-md hover:bg-zinc-800 inline-block text-center transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </main>
  );
}
