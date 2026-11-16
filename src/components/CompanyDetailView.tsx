'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AddInteraction from './AddInteraction';
import Timeline from './Timeline';
import { isGhosted } from '@/src/lib/ghosted';
import { fireConfetti } from '@/src/lib/confetti';

interface Company {
  id: string;
  name: string;
  role: string | null;
  status: string;
  comp_range: string | null;
  stack: string | null;
  remote_policy: string | null;
  company_stage: string | null;
  source: string | null;
  careers_url: string | null;
  notes: string | null;
  outcome_notes: string | null;
  would_reapply: boolean | null;
  interviewed?: boolean | null;
  status_changed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Interaction {
  id: string;
  company_id: string;
  date: string;
  type: string;
  person_name: string | null;
  person_title: string | null;
  duration: string | null;
  summary: string | null;
  thank_you_sent: boolean | null;
  created_at: string | null;
}

interface Contact {
  id: string;
  name: string;
  company_id: string | null;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  relationship: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Debrief {
  id: string;
  interaction_id: string;
  went_well: string | null;
  caught_off_guard: string | null;
  do_differently: string | null;
  learned_about_company: string | null;
  energy_check: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Message {
  id: string;
  company_id: string;
  date: string;
  direction: string;
  body: string;
  created_at: string | null;
}

interface Props {
  company: Company;
  interactions: Interaction[];
  contacts: Contact[];
  debriefs: Debrief[];
  messages: Message[];
}

const STATUS_DISPLAY: Record<string, string> = {
  interested: 'Interested',
  applied: 'Applied',
  active: 'Active',
  waiting: 'Waiting',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  watchlist: 'Watchlist',
};

const contactInputClasses = 'w-full px-3 py-2 bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-md focus:outline-none focus:border-persimmon-500';

function parseCompRange(range: string | null): { low: string; high: string } {
  if (!range) return { low: '', high: '' };
  const matches = range.match(/\d+/g);
  if (!matches) return { low: '', high: '' };
  return { low: matches[0] ?? '', high: matches[1] ?? '' };
}

function buildCompRange(low: string, high: string): string {
  if (!low && !high) return '';
  return `$${low || '?'}K - $${high || '?'}K`;
}

interface ContactFormData {
  name: string;
  title: string;
  email: string;
  linkedin_url: string;
  relationship: string;
  notes: string;
}

function ContactForm({
  form,
  onChange,
  onSave,
  onCancel,
  saveLabel,
  inputClasses,
}: {
  form: ContactFormData;
  onChange: (form: ContactFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
  inputClasses: string;
}) {
  return (
    <div className="mb-4 bg-zinc-800 rounded-lg p-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => onChange({ ...form, title: e.target.value })}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange({ ...form, email: e.target.value })}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">LinkedIn URL</label>
          <input
            type="url"
            value={form.linkedin_url}
            onChange={(e) => onChange({ ...form, linkedin_url: e.target.value })}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Relationship</label>
          <input
            type="text"
            value={form.relationship}
            onChange={(e) => onChange({ ...form, relationship: e.target.value })}
            className={inputClasses}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-1">Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => onChange({ ...form, notes: e.target.value })}
            className={inputClasses}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onSave}
          disabled={!form.name}
          className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 disabled:opacity-50 text-sm"
        >
          {saveLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-zinc-600 text-zinc-300 rounded-md hover:bg-zinc-700 text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function CompanyDetailView({
  company: initialCompany,
  interactions,
  contacts,
  debriefs,
  messages,
}: Props) {
  const router = useRouter();
  const [company, setCompany] = useState(initialCompany);
  const persistedStatusRef = useRef(initialCompany.status);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companyInteractions, setCompanyInteractions] = useState(interactions);
  const [companyContacts, setCompanyContacts] = useState(contacts);
  const [companyMessages, setCompanyMessages] = useState(messages);
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const [messageForm, setMessageForm] = useState({ date: '', direction: 'received', body: '' });
  const [isSavingMessage, setIsSavingMessage] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageForm, setEditMessageForm] = useState({ date: '', direction: 'received', body: '' });

  // Sync local state when the server sends fresh data after router.refresh()
  useEffect(() => {
    setCompany(initialCompany);
    persistedStatusRef.current = initialCompany.status;
  }, [initialCompany]);
  useEffect(() => {
    setCompanyInteractions(interactions);
  }, [interactions]);
  const [compLow, setCompLow] = useState('');
  const [compHigh, setCompHigh] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    title: '',
    email: '',
    linkedin_url: '',
    relationship: '',
    notes: '',
  });

  const resetContactForm = () => {
    setContactForm({ name: '', title: '', email: '', linkedin_url: '', relationship: '', notes: '' });
  };

  const startEditingContact = (contact: Contact) => {
    setEditingContactId(contact.id);
    setContactForm({
      name: contact.name,
      title: contact.title || '',
      email: contact.email || '',
      linkedin_url: contact.linkedin_url || '',
      relationship: contact.relationship || '',
      notes: contact.notes || '',
    });
    setIsAddingContact(false);
  };

  const handleAddContact = async () => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contactForm, company_id: company.id }),
      });
      if (response.ok) {
        const newContact = await response.json();
        setCompanyContacts([...companyContacts, newContact]);
        resetContactForm();
        setIsAddingContact(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleUpdateContact = async (id: string) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...contactForm }),
      });
      if (response.ok) {
        setCompanyContacts(companyContacts.map((c) =>
          c.id === id ? { ...c, ...contactForm } : c
        ));
        setEditingContactId(null);
        resetContactForm();
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    try {
      const response = await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCompanyContacts(companyContacts.filter((c) => c.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleToggleThankYou = async (interaction: Interaction) => {
    const newValue = !interaction.thank_you_sent;
    setCompanyInteractions((prev) =>
      prev.map((i) => i.id === interaction.id ? { ...i, thank_you_sent: newValue } : i)
    );
    try {
      await fetch('/api/interactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: interaction.id, thank_you_sent: newValue }),
      });
    } catch (error) {
      console.error('Error updating interaction:', error);
      setCompanyInteractions((prev) =>
        prev.map((i) => i.id === interaction.id ? { ...i, thank_you_sent: !newValue } : i)
      );
    }
  };

  const handleAddMessage = async () => {
    if (!messageForm.date || !messageForm.body.trim()) return;
    setIsSavingMessage(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...messageForm, company_id: company.id }),
      });
      if (response.ok) {
        const newMessage = await response.json();
        setCompanyMessages((prev) => [...prev, newMessage]);
        setMessageForm({ date: '', direction: 'received', body: '' });
        setIsAddingMessage(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving message:', error);
    } finally {
      setIsSavingMessage(false);
    }
  };

  const startEditingMessage = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditMessageForm({ date: msg.date, direction: msg.direction, body: msg.body });
  };

  const handleUpdateMessage = async (id: string) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...editMessageForm }),
      });
      if (response.ok) {
        const updated = await response.json();
        setCompanyMessages((prev) => prev.map((m) => m.id === id ? updated : m));
        setEditingMessageId(null);
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try {
      const response = await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        setCompanyMessages((prev) => prev.filter((m) => m.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const becomingOffer =
      company.status === 'offer' && persistedStatusRef.current !== 'offer';
    try {
      const response = await fetch('/api/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...company, comp_range: buildCompRange(compLow, compHigh) }),
      });

      if (response.ok) {
        const saved = await response.json();
        setCompany(saved);
        persistedStatusRef.current = saved.status;
        setIsEditing(false);
        if (becomingOffer) {
          fireConfetti();
        }
        router.refresh();
      } else {
        alert('Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof Company, value: any) => {
    setCompany((prev) => ({ ...prev, [field]: value }));
  };

  const inputClasses = 'mt-1 block w-full bg-zinc-800 text-zinc-100 border border-zinc-700 rounded px-3 py-2 focus:outline-none focus:border-persimmon-500';

  const debriefsByInteraction = new Map(
    debriefs.map((d) => [d.interaction_id, d])
  );

  return (
    <div className="space-y-8">
      {/* Company Header */}
      <div className="bg-zinc-900 rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            {isEditing ? (
              <input
                type="text"
                value={company.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="font-display text-3xl font-semibold text-zinc-100 bg-transparent border-b-2 border-zinc-700 focus:border-persimmon-500 outline-none"
              />
            ) : (
              <h1 className="font-display text-3xl font-semibold text-zinc-100">{company.name}</h1>
            )}
            {isEditing ? (
              <input
                type="text"
                value={company.role || ''}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Role"
                className="mt-2 text-lg text-zinc-400 bg-transparent border-b border-zinc-700 focus:border-persimmon-500 outline-none w-full"
              />
            ) : (
              company.role && <p className="mt-2 text-lg text-zinc-400">{company.role}</p>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-persimmon-300 text-zinc-950 rounded hover:bg-persimmon-200 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setCompany(initialCompany);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  const parsed = parseCompRange(company.comp_range);
                  setCompLow(parsed.low);
                  setCompHigh(parsed.high);
                  setIsEditing(true);
                }}
                className="px-4 py-2 border border-zinc-700 text-zinc-300 rounded hover:bg-zinc-800 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Company Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-zinc-400">Status</label>
            {isEditing ? (
              <select
                value={company.status}
                onChange={(e) => handleChange('status', e.target.value)}
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
            ) : (
              <p className="mt-1 text-zinc-100">
                {isGhosted(company, companyInteractions, companyMessages)
                  ? 'Ghosted'
                  : (STATUS_DISPLAY[company.status] ?? company.status)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Compensation Range</label>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-zinc-400 text-sm">$</span>
                <input
                  type="number"
                  value={compLow}
                  onChange={(e) => setCompLow(e.target.value)}
                  placeholder="150"
                  className="w-full px-3 py-2 bg-zinc-800 text-zinc-100 border border-zinc-700 rounded px-3 py-2 focus:outline-none focus:border-persimmon-500"
                />
                <span className="text-zinc-400 text-sm shrink-0">K –</span>
                <span className="text-zinc-400 text-sm">$</span>
                <input
                  type="number"
                  value={compHigh}
                  onChange={(e) => setCompHigh(e.target.value)}
                  placeholder="180"
                  className="w-full px-3 py-2 bg-zinc-800 text-zinc-100 border border-zinc-700 rounded px-3 py-2 focus:outline-none focus:border-persimmon-500"
                />
                <span className="text-zinc-400 text-sm">K</span>
              </div>
            ) : (
              <p className="mt-1 text-zinc-100">{company.comp_range || '—'}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Stack</label>
            {isEditing ? (
              <input
                type="text"
                value={company.stack || ''}
                onChange={(e) => handleChange('stack', e.target.value)}
                className={inputClasses}
              />
            ) : (
              <p className="mt-1 text-zinc-100">{company.stack || '—'}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Remote Policy</label>
            {isEditing ? (
              <input
                type="text"
                value={company.remote_policy || ''}
                onChange={(e) => handleChange('remote_policy', e.target.value)}
                className={inputClasses}
              />
            ) : (
              <p className="mt-1 text-zinc-100">{company.remote_policy || '—'}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Source</label>
            {isEditing ? (
              <input
                type="text"
                value={company.source || ''}
                onChange={(e) => handleChange('source', e.target.value)}
                className={inputClasses}
              />
            ) : (
              <p className="mt-1 text-zinc-100">{company.source || '—'}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-zinc-400">Careers URL</label>
            {isEditing ? (
              <input
                type="url"
                value={company.careers_url || ''}
                onChange={(e) => handleChange('careers_url', e.target.value)}
                className={inputClasses}
              />
            ) : (
              <p className="mt-1 text-zinc-100">
                {company.careers_url ? (
                  <a
                    href={company.careers_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-persimmon-400 hover:underline"
                  >
                    {company.careers_url}
                  </a>
                ) : (
                  '—'
                )}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-zinc-400">Notes</label>
            {isEditing ? (
              <textarea
                value={company.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className={inputClasses}
              />
            ) : (
              <p className="mt-1 text-zinc-100 whitespace-pre-wrap">{company.notes || '—'}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium text-zinc-400">Outcome Notes</label>
            {isEditing ? (
              <textarea
                value={company.outcome_notes || ''}
                onChange={(e) => handleChange('outcome_notes', e.target.value)}
                rows={3}
                className={inputClasses}
              />
            ) : (
              <p className="mt-1 text-zinc-100 whitespace-pre-wrap">
                {company.outcome_notes || '—'}
              </p>
            )}
          </div>

          <div className="col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={company.would_reapply || false}
                onChange={(e) => handleChange('would_reapply', e.target.checked)}
                disabled={!isEditing}
                className="rounded border-zinc-600 bg-zinc-800"
              />
              <span className="text-sm font-medium text-zinc-400">Would reapply (watchlist)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <Timeline
        companyCreatedAt={company.created_at}
        companyUpdatedAt={company.updated_at}
        companyStatus={company.status}
        statusChangedAt={company.status_changed_at}
        interactions={companyInteractions}
        messages={companyMessages}
      />

      {/* Interactions */}
      <div className="bg-zinc-900 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-2xl font-semibold text-zinc-100">Interactions</h2>
          <AddInteraction companyId={company.id} />
        </div>
        {companyInteractions.length === 0 ? (
          <p className="text-zinc-500">No interactions yet</p>
        ) : (
          <div className="space-y-4">
            {companyInteractions.map((interaction) => {
              const debrief = debriefsByInteraction.get(interaction.id);
              const isInterviewType = ['technical', 'onsite', 'panel', 'behavioral', 'screen'].includes(interaction.type);
              return (
                <div key={interaction.id} className="border-l-4 border-persimmon-700/50 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-zinc-100">{interaction.type}</p>
                      <p className="text-sm text-zinc-400">
                        {new Date(interaction.date + 'T00:00:00').toLocaleDateString()}
                      </p>
                      {interaction.person_name && (
                        <p className="text-sm text-zinc-400">
                          {interaction.person_name}
                          {interaction.person_title && ` — ${interaction.person_title}`}
                        </p>
                      )}
                    </div>
                    {interaction.duration && (
                      <span className="text-sm text-zinc-500">{interaction.duration}</span>
                    )}
                  </div>
                  {interaction.summary && (
                    <p className="mt-2 text-sm text-zinc-300">{interaction.summary}</p>
                  )}

                  {isInterviewType && (
                    <label className="flex items-center gap-2 mt-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={interaction.thank_you_sent || false}
                        onChange={() => handleToggleThankYou(interaction)}
                        className="rounded border-zinc-600 bg-zinc-800"
                      />
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-300">
                        Thank-you sent
                      </span>
                    </label>
                  )}

                  {debrief && (
                    <div className="mt-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 space-y-3">
                      <p className="font-display text-sm font-medium text-persimmon-300 italic">✦ Debrief</p>
                      {debrief.went_well && (
                        <div>
                          <p className="text-xs font-medium text-zinc-500">What went well</p>
                          <p className="text-sm text-zinc-300">{debrief.went_well}</p>
                        </div>
                      )}
                      {debrief.caught_off_guard && (
                        <div>
                          <p className="text-xs font-medium text-zinc-500">Caught off guard</p>
                          <p className="text-sm text-zinc-300">{debrief.caught_off_guard}</p>
                        </div>
                      )}
                      {debrief.do_differently && (
                        <div>
                          <p className="text-xs font-medium text-zinc-500">Would do differently</p>
                          <p className="text-sm text-zinc-300">{debrief.do_differently}</p>
                        </div>
                      )}
                      {debrief.learned_about_company && (
                        <div>
                          <p className="text-xs font-medium text-zinc-500">Learned about the company</p>
                          <p className="text-sm text-zinc-300">{debrief.learned_about_company}</p>
                        </div>
                      )}
                      {debrief.energy_check && (
                        <div>
                          <p className="text-xs font-medium text-zinc-500">Energy check</p>
                          <p className="text-sm text-zinc-300">{debrief.energy_check}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="bg-zinc-900 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-2xl font-semibold text-zinc-100">Correspondence</h2>
          {!isAddingMessage && (
            <button
              onClick={() => setIsAddingMessage(true)}
              className="px-4 py-2 bg-persimmon-300 text-zinc-950 rounded-md hover:bg-persimmon-200 text-sm font-medium transition-colors"
            >
              + Log Message
            </button>
          )}
        </div>

        {isAddingMessage && (
          <div className="mb-4 bg-zinc-800 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Date</label>
                <input
                  type="date"
                  value={messageForm.date}
                  onChange={(e) => setMessageForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-700 text-zinc-100 border border-zinc-600 rounded-md focus:outline-none focus:border-persimmon-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Direction</label>
                <select
                  value={messageForm.direction}
                  onChange={(e) => setMessageForm((f) => ({ ...f, direction: e.target.value }))}
                  className="w-full px-3 py-2 bg-zinc-700 text-zinc-100 border border-zinc-600 rounded-md focus:outline-none focus:border-persimmon-500"
                >
                  <option value="received">Received</option>
                  <option value="sent">Sent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Paste correspondence</label>
              <textarea
                value={messageForm.body}
                onChange={(e) => setMessageForm((f) => ({ ...f, body: e.target.value }))}
                rows={6}
                placeholder="Paste the message content here…"
                className="w-full px-3 py-2 bg-zinc-700 text-zinc-100 border border-zinc-600 rounded-md focus:outline-none focus:border-persimmon-500 font-mono text-xs leading-relaxed resize-y"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddMessage}
                disabled={isSavingMessage || !messageForm.date || !messageForm.body.trim()}
                className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 disabled:opacity-50 text-sm"
              >
                {isSavingMessage ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setIsAddingMessage(false); setMessageForm({ date: '', direction: 'received', body: '' }); }}
                className="px-4 py-2 border border-zinc-600 text-zinc-300 rounded-md hover:bg-zinc-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {companyMessages.length === 0 && !isAddingMessage ? (
          <p className="text-zinc-500">No correspondence logged yet</p>
        ) : (
          <div className="space-y-3">
            {[...companyMessages]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((msg) =>
                editingMessageId === msg.id ? (
                  <div key={msg.id} className="border border-persimmon-600/50 rounded-lg p-4 bg-zinc-800 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Date</label>
                        <input
                          type="date"
                          value={editMessageForm.date}
                          onChange={(e) => setEditMessageForm((f) => ({ ...f, date: e.target.value }))}
                          className="w-full px-3 py-2 bg-zinc-700 text-zinc-100 border border-zinc-600 rounded-md focus:outline-none focus:border-persimmon-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Direction</label>
                        <select
                          value={editMessageForm.direction}
                          onChange={(e) => setEditMessageForm((f) => ({ ...f, direction: e.target.value }))}
                          className="w-full px-3 py-2 bg-zinc-700 text-zinc-100 border border-zinc-600 rounded-md focus:outline-none focus:border-persimmon-500"
                        >
                          <option value="received">Received</option>
                          <option value="sent">Sent</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Content</label>
                      <textarea
                        value={editMessageForm.body}
                        onChange={(e) => setEditMessageForm((f) => ({ ...f, body: e.target.value }))}
                        rows={6}
                        className="w-full px-3 py-2 bg-zinc-700 text-zinc-100 border border-zinc-600 rounded-md focus:outline-none focus:border-persimmon-500 font-mono text-xs leading-relaxed resize-y"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateMessage(msg.id)}
                        disabled={!editMessageForm.date || !editMessageForm.body.trim()}
                        className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 disabled:opacity-50 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMessageId(null)}
                        className="px-4 py-2 border border-zinc-600 text-zinc-300 rounded-md hover:bg-zinc-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                <div key={msg.id} className="border border-zinc-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        msg.direction === 'sent'
                          ? 'bg-persimmon-900/50 text-persimmon-300'
                          : 'bg-amber-900/40 text-amber-300'
                      }`}>
                        {msg.direction === 'sent' ? '↑ Sent' : '↓ Received'}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(msg.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => startEditingMessage(msg)}
                        className="text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="text-xs text-zinc-600 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">{msg.body}</pre>
                </div>
                )
              )}
          </div>
        )}
      </div>

      {/* Contacts */}
      <div className="bg-zinc-900 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display text-2xl font-semibold text-zinc-100">Contacts</h2>
          {!isAddingContact && !editingContactId && (
            <button
              onClick={() => { resetContactForm(); setIsAddingContact(true); }}
              className="px-4 py-2 bg-persimmon-300 text-zinc-950 rounded-md hover:bg-persimmon-200 text-sm font-medium transition-colors"
            >
              + Add Contact
            </button>
          )}
        </div>

        {isAddingContact && (
          <ContactForm
            form={contactForm}
            onChange={setContactForm}
            onSave={handleAddContact}
            onCancel={() => { setIsAddingContact(false); resetContactForm(); }}
            saveLabel="Add Contact"
            inputClasses={contactInputClasses}
          />
        )}

        {companyContacts.length === 0 && !isAddingContact ? (
          <p className="text-zinc-500">No contacts yet</p>
        ) : (
          <div className="space-y-4">
            {companyContacts.map((contact) =>
              editingContactId === contact.id ? (
                <ContactForm
                  key={contact.id}
                  form={contactForm}
                  onChange={setContactForm}
                  onSave={() => handleUpdateContact(contact.id)}
                  onCancel={() => { setEditingContactId(null); resetContactForm(); }}
                  saveLabel="Save"
                  inputClasses={contactInputClasses}
                />
              ) : (
                <div key={contact.id} className="flex justify-between items-start p-4 bg-zinc-800 border border-zinc-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-zinc-100">{contact.name}</p>
                    {contact.title && <p className="text-sm text-zinc-400">{contact.title}</p>}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm text-persimmon-400 hover:underline"
                      >
                        {contact.email}
                      </a>
                    )}
                    {contact.relationship && (
                      <p className="text-sm text-zinc-400 mt-1">{contact.relationship}</p>
                    )}
                    {contact.notes && (
                      <p className="text-sm text-zinc-500 mt-1">{contact.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {contact.linkedin_url && (
                      <a
                        href={contact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-persimmon-400 hover:underline"
                      >
                        LinkedIn
                      </a>
                    )}
                    <button
                      onClick={() => startEditingContact(contact)}
                      className="text-sm text-zinc-400 hover:text-zinc-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

    </div>
  );
}
