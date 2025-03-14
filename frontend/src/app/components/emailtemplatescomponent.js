'use client';

import { useState, useEffect } from 'react';

export default function EmailTemplatesComponent({onChange}) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');

  // Fetch all email templates
  useEffect(() => {
    fetch('http://localhost:5004/emailtemplates')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.emailTemplates)) {
          setTemplates(data.emailTemplates);
        } else {
          console.warn('Unexpected format from /emailtemplates:', data);
        }
      })
      .catch(err => console.error('Failed to load templates:', err));
  }, []);

  // Handle dropdown change
  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    setSelectedTemplateId(selectedId);
    onChange?.(selectedId);

    if (selectedId === '') {
      // Reset if "Select..." is chosen
      setTemplateSubject('');
      setTemplateBody('');
    } else {
      const selected = templates.find(t => t._id === selectedId);
      setTemplateSubject(selected?.subject || '');
      setTemplateBody(selected?.body || '');
    }
  };

  // Save new template
  const handleAddTemplate = async () => {
    if (!templateSubject || !templateBody) {
      alert('Please enter both subject and body.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5004/emailtemplates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: templateSubject,
          body: templateBody,
        }),
      });
      const data = await res.json();
      setTemplates([...templates, data]);
      setSelectedTemplateId(data._id);
      alert('Template added successfully!');
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  };

  return (
    <div className="p-6 border rounded-md shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-4">Email Templates</h2>

      {/* Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select a Template</label>
        <select
          value={selectedTemplateId}
          onChange={handleSelectChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">-- Create New or Select Existing --</option>
          {templates.map(template => (
            <option key={template._id} value={template._id}>
              {template.subject}
            </option>
          ))}
        </select>
      </div>

      {/* Input: Subject */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Subject</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          placeholder="Enter email subject"
          value={templateSubject}
          onChange={(e) => setTemplateSubject(e.target.value)}
        />
      </div>

      {/* Input: Body */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Body</label>
        <textarea
          rows="8"
          className="w-full border rounded px-3 py-2"
          placeholder="Enter email body"
          value={templateBody}
          onChange={(e) => setTemplateBody(e.target.value)}
        />
      </div>

      {/* Button: Save as New Template */}
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleAddTemplate}
      >
        Save as New Template
      </button>
    </div>
  );
}
