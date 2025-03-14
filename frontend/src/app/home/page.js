'use client';

import { useState } from 'react';
import EmailsComponent from '../components/emailscomponent';
import EmailTemplatesComponent from '../components/emailtemplatescomponent';
import CoverletterTemplatesComponent from '../components/coverlettertemplatescomponent';

export default function Homepage() {
    const [selectedHrs, setSelectedHrs] = useState([]);
    const [selectedEmailTemplate, setSelectedEmailTemplate] = useState('');
    const [selectedCoverLetter, setSelectedCoverLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendEmails = async () => {
        if (!selectedHrs.length || !selectedEmailTemplate || !selectedCoverLetter) {
            alert('Please select all required fields before sending emails.');
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Missing user ID. Please login or set it.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:5004/bulkemails/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    userId,
                    hrs: selectedHrs, // HR objects (with name, email, etc.)
                    emailTemplateId: selectedEmailTemplate,
                    coverLetterTemplateId: selectedCoverLetter
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Emails sent successfully!');
            } else {
                alert(data?.message || 'Something went wrong while sending emails.');
            }
        } catch (error) {
            console.error('Error sending emails:', error);
            alert('Something went wrong while sending emails.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Welcome to Bulk Email Tool</h1>

            {/* HR Emails Section */}
            <EmailsComponent onChange={setSelectedHrs} />

            {/* Email Templates Section */}
            <EmailTemplatesComponent onChange={setSelectedEmailTemplate} />

            <p className="text-sm text-gray-500 mt-2">
                You can use placeholders like <code>{'{name}'}</code>, <code>{'{company}'}</code>, and <code>{'{role}'}</code> in your email templates for personalization.
            </p>

            {/* Coverletter Templates Section */}
            <CoverletterTemplatesComponent onChange={setSelectedCoverLetter} />

            <button
                onClick={handleSendEmails}
                disabled={isLoading}
                className={`mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
                {isLoading ? 'Sending...' : 'Send Emails'}
            </button>
        </div>
    );
}
