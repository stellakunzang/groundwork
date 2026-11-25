'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

interface Company {
  id: string;
  name: string;
}

interface Props {
  contacts: Contact[];
  companies: Company[];
  companyMap: Record<string, string>;
}

export default function ContactList({ contacts: initialContacts, companies, companyMap }: Props) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    title: '',
    email: '',
    linkedin_url: '',
    relationship: '',
    notes: '',
  });

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.company_id && companyMap[contact.company_id]?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAdd = async () => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newContact = await response.json();
        setContacts([...contacts, newContact]);
        setFormData({
          name: '',
          company_id: '',
          title: '',
          email: '',
          linkedin_url: '',
          relationship: '',
          notes: '',
        });
        setIsAdding(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const handleUpdate = async (id: string, data: Partial<Contact>) => {
    try {
      const response = await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });

      if (response.ok) {
        setContacts(contacts.map((c) => (c.id === id ? { ...c, ...data } : c)));
        setEditingId(null);
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      const response = await fetch(`/api/contacts?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setContacts(contacts.filter((c) => c.id !== id));
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const inputClasses = 'w-full px-3 py-2 bg-zinc-800 text-zinc-100 border border-zinc-600 rounded-md focus:outline-none focus:border-zinc-400';

  return (
    <div>
      {/* Search and Add */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-100 border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-400 placeholder:text-zinc-500"
        />
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200"
        >
          {isAdding ? 'Cancel' : '+ Add Contact'}
        </button>
      </div>

      {/* Add Contact Form */}
      {isAdding && (
        <div className="mb-6 bg-zinc-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">New Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Company
              </label>
              <select
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className={inputClasses}
              >
                <option value="">Select a company...</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleAdd}
              disabled={!formData.name}
              className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-md hover:bg-zinc-200 disabled:opacity-50"
            >
              Add Contact
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-zinc-600 text-zinc-300 rounded-md hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Contact List */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900 rounded-lg">
          <p className="text-zinc-500">No contacts found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="bg-zinc-900 rounded-lg shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-100">{contact.name}</h3>
                  {contact.title && (
                    <p className="text-sm text-zinc-400 mt-1">{contact.title}</p>
                  )}
                  {contact.company_id && (
                    <p className="text-sm text-zinc-400">
                      at {companyMap[contact.company_id]}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>

              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-persimmon-400 hover:underline block mb-1"
                >
                  {contact.email}
                </a>
              )}

              {contact.linkedin_url && (
                <a
                  href={contact.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-persimmon-400 hover:underline block mb-2"
                >
                  LinkedIn Profile
                </a>
              )}

              {contact.relationship && (
                <div className="mt-2 px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded inline-block">
                  {contact.relationship}
                </div>
              )}

              {contact.notes && (
                <p className="text-sm text-zinc-500 mt-3 line-clamp-2">{contact.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
