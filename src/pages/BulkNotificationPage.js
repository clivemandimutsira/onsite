import React, { useState, useEffect } from 'react';

export default function BulkNotificationPage() {
  const [groups, setGroups] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ targetType: 'group', targetId: '', title: '', message: '', viaEmail: true, viaSms: false });

  useEffect(() => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(setGroups)
      .catch(err => console.error(err));
    fetch('/api/departments')
      .then(res => res.json())
      .then(setDepartments)
      .catch(err => console.error(err));
  }, []);

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    const payload = {
      title: form.title,
      message: form.message,
      viaEmail: form.viaEmail,
      viaSms: form.viaSms,
    };
    if (form.targetType === 'group') payload.group_id = form.targetId;
    if (form.targetType === 'department') payload.department_id = form.targetId;
    if (form.targetType === 'global') payload.is_global = true;

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      alert('Bulk notification sent');
      setForm(prev => ({ ...prev, title: '', message: '' }));
    } catch (err) {
      console.error(err);
      alert('Failed to send bulk notification');
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Send Bulk Notification</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Target</label>
          <select name="targetType" value={form.targetType} onChange={e => { onChange(e); setForm(prev => ({ ...prev, targetId: '' })); }} className="mt-1 w-full border rounded p-2">
            <option value="group">Group</option>
            <option value="department">Department</option>
            <option value="global">All Members</option>
          </select>
        </div>

        {form.targetType !== 'global' && (
          <div>
            <label className="block font-medium">Select {form.targetType}</label>
            <select name="targetId" value={form.targetId} onChange={onChange} required className="mt-1 w-full border rounded p-2">
              <option value="">-- Select --</option>
              {(form.targetType === 'group' ? groups : departments).map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
        )}

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

        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Send Bulk</button>
      </form>
    </div>
  );
}
