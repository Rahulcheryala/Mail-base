'use client';

import { useState, useEffect } from 'react';

export default function EmailsComponent({ onChange }) {
  const [emails, setEmails] = useState([]);
  const [selectedEmailIds, setSelectedEmailIds] = useState([]);
  const [newEmail, setNewEmail] = useState({ name: '', email: '', company: '', role: '' });

  // Fetch all emails on mount
  useEffect(() => {
    fetch('http://localhost:5004/emails')
      .then(res => res.json())
      .then(data => setEmails(data.emails))
      .catch(err => console.error('Failed to load emails:', err));
  }, []);

  const handleAdd = async () => {
    const { name, email, company, role } = newEmail;
    if (!name || !email || !company || !role) {
      alert('Please enter name, email, company, and role.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5004/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmail),
      });
      const data = await res.json();
      setEmails([...emails, data.email]);
      setNewEmail({ name: '', email: '', company: '', role: '' });
    } catch (err) {
      console.error('Failed to add email:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5004/emails/${id}`, {
        method: 'DELETE',
      });
      setEmails(emails.filter(email => email._id !== id));
      setSelectedEmailIds(selectedEmailIds.filter(eid => eid !== id));
    } catch (err) {
      console.error('Failed to delete email:', err);
    }
  };

  const handleMultiSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedIds = selectedOptions.map(option => option.value);
    setSelectedEmailIds(selectedIds);

    const selectedHrs = emails.filter(e => selectedIds.includes(e._id));
    onChange?.(selectedHrs); // Send full HR objects to parent
  };

  return (
    <div className="p-6 border rounded-md shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">HR Emails</h2>

      {/* Dropdown for selecting multiple emails */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select HR Emails</label>
        <select
          multiple
          value={selectedEmailIds}
          onChange={handleMultiSelect}
          className="w-full border rounded px-3 py-2 h-40"
        >
          {emails.map(email => (
            <option key={email._id} value={email._id}>
              {email.name} - {email.email} - {email.company} ({email.role})
            </option>
          ))}
        </select>
      </div>

      {/* Form to add new email */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Name"
          name="name"
          value={newEmail.name}
          onChange={(e) => setNewEmail({ ...newEmail, name: e.target.value })}
          className="border px-2 py-1 rounded w-[48%]"
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={newEmail.email}
          onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
          className="border px-2 py-1 rounded w-[48%]"
        />
        <input
          type="text"
          placeholder="Company"
          name="company"
          value={newEmail.company}
          onChange={(e) => setNewEmail({ ...newEmail, company: e.target.value })}
          className="border px-2 py-1 rounded w-[48%]"
        />
        <input
          type="text"
          placeholder="Role"
          name="role"
          value={newEmail.role}
          onChange={(e) => setNewEmail({ ...newEmail, role: e.target.value })}
          className="border px-2 py-1 rounded w-[48%]"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-2"
        >
          Add
        </button>
      </div>

      {/* Show selected emails info & delete option */}
      {selectedEmailIds.length > 0 && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <p className="mb-2">
            <strong>Selected Emails:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {selectedEmailIds.map(id => {
              const email = emails.find(e => e._id === id);
              return (
                <li key={id}>
                  {email?.name} - {email?.email} - {email?.company} ({email?.role})
                  <button
                    onClick={() => handleDelete(id)}
                    className="text-red-600 ml-2 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
