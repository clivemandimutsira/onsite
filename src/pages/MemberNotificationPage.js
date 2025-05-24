import React, { useState, useEffect } from 'react';

export default function MemberNotificationPage() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ member: '', title: '', message: '', viaEmail: true, viaSms: false });

  useEffect(() => {
    fetch('/api/members')
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.error(err));
  }, []);

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.member) return alert('Please select a member');
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: form.member,
          title: form.title,
          message: form.message,
          viaEmail: form.viaEmail,
          viaSms: form.viaSms
        })
      });
      alert('Notification sent');
      setForm(prev => ({ ...prev, title: '', message: '' }));
    } catch (err) {
      console.error(err);
      alert('Failed to send notification');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Send Notification to Member</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Member</label>
          <select name="member" value={form.member} onChange={onChange} className="mt-1 w-full border rounded p-2">
            <option value="">-- Select Member --</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Title</label>
          <input name="title" value={form.title} onChange={onChange} required className="mt-1 w-full border rounded p-2" />
        </div>
        <div>
          <label className="block font-medium">Message</label>
          <textarea name="message" value={form.message} onChange={onChange} rows={4} required className="mt-1 w-full border rounded p-2" />
        </div>
        <div className="flex items-center space-x-6">
          <label className="inline-flex items-center">
            <input type="checkbox" name="viaEmail" checked={form.viaEmail} onChange={onChange} />
            <span className="ml-2">Email</span>
          </label>
          <label className="inline-flex items-center">
            <input type="checkbox" name="viaSms" checked={form.viaSms} onChange={onChange} />
            <span className="ml-2">SMS</span>
          </label>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
      </form>
    </div>
  );
}
