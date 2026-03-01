import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddSessionForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    // You may want to collect these fields from your form or context
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      dob: formData.get('dob'),
      dry_weight_kg: Number(formData.get('dry_weight_kg')),
      unit_id: formData.get('unit_id'),
      timestamps: {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      },
      vitals: {
            pre_weight: Number(formData.get('pre_weight')),
            pre_bp_sys: Number(formData.get('pre_bp_sys')),
            pre_bp_dia: Number(formData.get('pre_bp_dia')),
      },
      nurse_notes: formData.get('nurse_notes'),
      anomalies: [] 
    };

    try {
      await axios.post(`http://localhost:3001/api/schedule/${formData.get('unit_id')}`, payload);
      onSuccess();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save session. Please check vitals.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
        <h2 className="text-xl font-bold mb-4">Record New Session</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded text-sm">{error}</div>}


        <div className="grid grid-cols-2 gap-4 mb-4">
          <input name="name" placeholder="Patient Name" required className="border p-2 rounded" />
          <input name="email" type="email" placeholder="Email (optional)" className="border p-2 rounded" />
          <input name="dob" type="date" placeholder="Date of Birth" required className="border p-2 rounded" />
          <input name="dry_weight_kg" type="number" step="0.1" placeholder="Dry Weight (kg)" required className="border p-2 rounded" />
          <input name="unit_id" placeholder="Unit ID" required className="border p-2 rounded" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <input name="pre_weight" type="number" step="0.1" placeholder="Pre-Weight (kg)" required className="border p-2 rounded" />
           <input name="pre_bp_sys" type="number" placeholder="Pre Systolic BP" required className="border p-2 rounded" />
           <input name="pre_bp_dia" type="number" placeholder="Pre Diastolic BP" required className="border p-2 rounded" />
        </div>

        <textarea name="nurse_notes" placeholder="Initial Nurse Notes..." className="w-full border p-2 rounded mt-4 h-24" />

        <div className="flex justify-end space-x-2 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300">
            {loading ? 'Saving...' : 'Add Session'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSessionForm;