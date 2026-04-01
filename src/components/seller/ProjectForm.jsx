import React, { useState } from 'react';
import { Button, Alert, SectionLabel } from '../common';
import { TextInput, TextArea, SelectInput } from '../common/FormFields';
import { sellerService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const IMPACT_TYPES = [
  'Forest Conservation', 'Renewable Energy', 'Blue Carbon',
  'Clean Cooking', 'Peatland Conservation', 'Biodiversity Conservation',
  'Soil Carbon', 'Methane Capture',
];

const EMOJIS = ['🌿', '🌳', '🌊', '💨', '☀️', '🏔️', '🦧', '🌱', '♻️', '🔋'];

const ProjectForm = ({ onSuccess }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [form, setForm] = useState({
    project_name: '', description: '', location: '',
    impact_type: 'Forest Conservation',
    total_credits: '', price_per_credit: '', emoji: '🌿',
  });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.project_name.trim()) errs.project_name = 'Project name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.location.trim())    errs.location = 'Location is required';
    if (!form.total_credits || Number(form.total_credits) < 1)
      errs.total_credits = 'Must be at least 1 credit';
    if (!form.price_per_credit || Number(form.price_per_credit) <= 0)
      errs.price_per_credit = 'Must be greater than 0';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await sellerService.createProject({
        ...form,
        total_credits:    Number(form.total_credits),
        price_per_credit: parseFloat(form.price_per_credit),
      });
      addToast('Project submitted for verification!', 'success');
      onSuccess && onSuccess();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <Alert variant="info">
        New projects are reviewed by admins before appearing in the marketplace (typically 24–48 hours).
      </Alert>

      <div style={{ height: 16 }} />

      <div className="form-row">
        <TextInput label="Project Name" name="project_name" value={form.project_name}
          onChange={set('project_name')} placeholder="e.g., Congo Basin Forest Reserve"
          required error={errors.project_name} />
        <TextInput label="Location" name="location" value={form.location}
          onChange={set('location')} placeholder="Country / Region"
          required error={errors.location} />
      </div>

      <SelectInput label="Impact Type" name="impact_type" value={form.impact_type}
        onChange={set('impact_type')} options={IMPACT_TYPES} required />

      <TextArea label="Description" name="description" value={form.description}
        onChange={set('description')} rows={5} required
        placeholder="Describe the project methodology and environmental impact…"
        error={errors.description} />

      <div className="form-row">
        <TextInput label="Total Credits" name="total_credits" type="number"
          value={form.total_credits} onChange={set('total_credits')}
          placeholder="10000" required error={errors.total_credits} />
        <TextInput label="Price per Credit (USD)" name="price_per_credit" type="number"
          value={form.price_per_credit} onChange={set('price_per_credit')}
          placeholder="25.00" required error={errors.price_per_credit} />
      </div>

      <div className="form-group">
        <SectionLabel>Project Emoji</SectionLabel>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EMOJIS.map((e) => (
            <button
              key={e} type="button"
              style={{
                background: form.emoji === e ? 'rgba(107,221,138,0.2)' : 'rgba(255,255,255,0.05)',
                border: form.emoji === e ? '1.5px solid var(--lime)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: '1.3rem',
              }}
              onClick={() => setForm({ ...form, emoji: e })}
            >{e}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <Button variant="primary" loading={loading} onClick={handleSubmit}>
          Submit for Verification →
        </Button>
      </div>
    </div>
  );
};

export default ProjectForm;
