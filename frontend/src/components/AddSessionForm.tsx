import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
}

/* ─── Labelled field ─── */
const Field: React.FC<{
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  suffix?: string;
  colSpan?: string;
}> = ({ label, name, type = 'text', placeholder, required, step, suffix, colSpan = '' }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={colSpan}>
      <label className={`block text-[11px] font-semibold mb-1.5 tracking-wide uppercase transition-colors duration-150
                         ${focused ? 'text-[#25CED1]' : 'text-[#86868b]'}`}>
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={type}
          step={step}
          placeholder={placeholder}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full text-sm text-[#1d1d1f] placeholder-[#c4cdd6] rounded-[10px]
                      px-3 py-[9px] outline-none transition-all duration-200
                      ${suffix ? 'pr-10' : ''}
                      ${focused
                        ? 'bg-white border border-[#25CED1]/60 ring-2 ring-[#25CED1]/12 shadow-none'
                        : 'bg-black/[0.03] border border-black/10 hover:border-black/15'
                      }`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#b0b8c4] pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

/* ─── Section divider ─── */
const SectionDivider: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#86868b] whitespace-nowrap">
      {label}
    </span>
    <div className="flex-1 h-px bg-black/7" />
  </div>
);

/* ─── Main ─── */
const AddSessionForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notesFocused, setNotesFocused] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
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
      anomalies: [],
    };

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/schedule/${formData.get('unit_id')}`, payload);
      onSuccess();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save session. Please check vitals.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes overlay-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes error-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .asf-overlay { animation: overlay-in 0.2s ease both; }
        .asf-card    { animation: modal-in 0.28s cubic-bezier(0.34,1.15,0.64,1) both; }
        .asf-error   { animation: error-in 0.2s ease both; }

        .asf-submit:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255,138,91,0.38) !important;
        }
        .asf-submit:active:not(:disabled) { transform: translateY(0); }
        .asf-submit { transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s; }

        .asf-cancel:hover { background: rgba(0,0,0,0.05) !important; color: #1d1d1f !important; }
        .asf-cancel { transition: background 0.15s, color 0.15s; }

        .asf-body::-webkit-scrollbar { width: 3px; }
        .asf-body::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
      `}</style>

      {/* Overlay */}
      <div
        className="asf-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'rgba(0,0,0,0.32)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Card */}
        <div
          className="asf-card w-full max-w-[440px] flex flex-col overflow-hidden"
          style={{
            maxHeight: '90vh',
            borderRadius: 20,
            background: 'rgba(255,255,255,0.93)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            border: '1px solid rgba(255,255,255,0.55)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-black/[0.07] flex-shrink-0">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#25CED1] mb-1">
                New Session
              </p>
              <h2
                className="text-[22px] text-[#1d1d1f] leading-none tracking-[-0.02em]"
                style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic' }}
              >
                Record Patient Visit
              </h2>
            </div>

            {/* ✕ close */}
            <button
              type="button"
              onClick={onCancel}
              className="w-7 h-7 rounded-full bg-black/[0.06] flex items-center justify-center
                         hover:bg-black/10 transition-colors duration-150 flex-shrink-0"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.6" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Scrollable form body ── */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-hidden min-h-0"
          >
            <div className="asf-body flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">

              {/* Error */}
              {error && (
                <div className="asf-error flex items-start gap-2.5 bg-[#FF8A5B]/7 border border-[#FF8A5B]/25 rounded-xl px-3.5 py-3">
                  <svg className="shrink-0 mt-px" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF8A5B" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p className="text-[13px] text-[#FF8A5B] font-medium leading-snug">{error}</p>
                </div>
              )}

              {/* Patient */}
              <div className="flex flex-col gap-3.5">
                <SectionDivider label="Patient" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Full Name"    name="name"          placeholder="Jane Smith"        required colSpan="col-span-2" />
                  <Field label="Email"        name="email"         type="email" placeholder="jane@email.com" />
                  <Field label="Date of Birth" name="dob"          type="date"  required />
                  <Field label="Dry Weight"   name="dry_weight_kg" type="number" step="0.1" placeholder="0.0" required suffix="kg" />
                  <Field label="Unit ID"      name="unit_id"       placeholder="e.g. U-04" required />
                </div>
              </div>

              {/* Vitals */}
              <div className="flex flex-col gap-3.5">
                <SectionDivider label="Pre-Session Vitals" />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Pre-Weight"   name="pre_weight"  type="number" step="0.1" placeholder="0.0" required suffix="kg"   colSpan="col-span-2" />
                  <Field label="Systolic BP"  name="pre_bp_sys"  type="number" placeholder="120" required suffix="mmHg" />
                  <Field label="Diastolic BP" name="pre_bp_dia"  type="number" placeholder="80"  required suffix="mmHg" />
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-3.5">
                <SectionDivider label="Nurse Notes" />
                <div>
                  <label className={`block text-[11px] font-semibold mb-1.5 tracking-wide uppercase transition-colors duration-150
                                     ${notesFocused ? 'text-[#25CED1]' : 'text-[#86868b]'}`}>
                    Initial observations
                  </label>
                  <textarea
                    name="nurse_notes"
                    rows={3}
                    placeholder="Add observations, concerns, care instructions…"
                    onFocus={() => setNotesFocused(true)}
                    onBlur={() => setNotesFocused(false)}
                    className={`w-full text-sm text-[#1d1d1f] placeholder-[#c4cdd6] rounded-[10px]
                                px-3 py-[9px] outline-none resize-none leading-relaxed transition-all duration-200
                                ${notesFocused
                                  ? 'bg-white border border-[#25CED1]/60 ring-2 ring-[#25CED1]/12'
                                  : 'bg-black/[0.03] border border-black/10 hover:border-black/15'
                                }`}
                  />
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-end gap-2.5 px-7 py-4
                            border-t border-black/[0.07] bg-[#f8f8f8]/80 flex-shrink-0">
              <button
                type="button"
                onClick={onCancel}
                className="asf-cancel px-4 py-[7px] rounded-full text-[13px] font-semibold
                           text-[#6b7280] bg-transparent border border-black/12
                           tracking-[-0.01em] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="asf-submit flex items-center gap-1.5 px-5 py-[7px] rounded-full
                           text-[13px] font-semibold text-white tracking-[-0.01em]
                           bg-gradient-to-br from-[#FF8A5B] to-[#f06030]
                           shadow-[0_2px_8px_rgba(255,138,91,0.32)]
                           disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    Add Session
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddSessionForm;