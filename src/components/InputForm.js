'use client';

import { useState } from 'react';

const RISK_OPTIONS = [
    { value: 'minimal', label: 'Minimal', desc: 'Conservative & stable', icon: '🛡️' },
    { value: 'medium', label: 'Medium', desc: 'Balanced growth', icon: '⚖️' },
    { value: 'high', label: 'High', desc: 'Aggressive returns', icon: '🚀' },
];

export default function InputForm({ onSubmit, loading }) {
    const [form, setForm] = useState({
        salary: '',
        expenses: '',
        goal: '',
        timeline: '',
        riskMode: 'medium',
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.salary || Number(form.salary) <= 0) errs.salary = 'Enter a valid salary';
        if (form.expenses && Number(form.expenses) < 0) errs.expenses = 'Expenses cannot be negative';
        if (form.expenses && Number(form.expenses) >= Number(form.salary)) errs.expenses = 'Expenses must be less than salary';
        if (!form.goal || Number(form.goal) <= 0) errs.goal = 'Enter a valid savings goal';
        if (!form.timeline || Number(form.timeline) < 1 || Number(form.timeline) > 30) errs.timeline = 'Timeline must be 1–30 years';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({
            salary: Number(form.salary),
            expenses: form.expenses ? Number(form.expenses) : null,
            goal: Number(form.goal),
            timeline: Number(form.timeline),
            riskMode: form.riskMode,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="glass-card p-8 md:p-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-4 shadow-lg shadow-emerald-500/25">
                        <span className="text-3xl">💰</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        Your Financial Details
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm">Fill in your details to get a personalized investment plan</p>
                </div>

                <div className="space-y-6">
                    {/* Salary */}
                    <div className="form-group">
                        <label className="form-label">Monthly Salary (₹) *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">₹</span>
                            <input
                                type="number"
                                name="salary"
                                value={form.salary}
                                onChange={handleChange}
                                placeholder="80,000"
                                className="form-input pl-10"
                            />
                        </div>
                        {errors.salary && <p className="form-error">{errors.salary}</p>}
                    </div>

                    {/* Expenses */}
                    <div className="form-group">
                        <label className="form-label">
                            Monthly Expenses (₹)
                            <span className="text-slate-500 font-normal ml-2 text-xs">Optional — defaults to 65% of salary</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">₹</span>
                            <input
                                type="number"
                                name="expenses"
                                value={form.expenses}
                                onChange={handleChange}
                                placeholder="45,000"
                                className="form-input pl-10"
                            />
                        </div>
                        {errors.expenses && <p className="form-error">{errors.expenses}</p>}
                    </div>

                    {/* Goal */}
                    <div className="form-group">
                        <label className="form-label">Savings Goal (₹) *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">₹</span>
                            <input
                                type="number"
                                name="goal"
                                value={form.goal}
                                onChange={handleChange}
                                placeholder="50,00,000"
                                className="form-input pl-10"
                            />
                        </div>
                        {errors.goal && <p className="form-error">{errors.goal}</p>}
                    </div>

                    {/* Timeline */}
                    <div className="form-group">
                        <label className="form-label">Timeline (Years) *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">📅</span>
                            <input
                                type="number"
                                name="timeline"
                                value={form.timeline}
                                onChange={handleChange}
                                placeholder="10"
                                min="1"
                                max="30"
                                className="form-input pl-12"
                            />
                        </div>
                        {errors.timeline && <p className="form-error">{errors.timeline}</p>}
                    </div>

                    {/* Risk Mode */}
                    <div className="form-group">
                        <label className="form-label">Risk Appetite *</label>
                        <div className="grid grid-cols-3 gap-3">
                            {RISK_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setForm((prev) => ({ ...prev, riskMode: opt.value }))}
                                    className={`risk-btn ${form.riskMode === opt.value ? 'risk-btn-active' : ''}`}
                                >
                                    <span className="text-2xl mb-1">{opt.icon}</span>
                                    <span className="font-semibold text-sm">{opt.label}</span>
                                    <span className="text-[11px] text-slate-400">{opt.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="submit-btn mt-8"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-3">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Generating Your Plan...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <span>Generate Investment Plan</span>
                            <span className="text-xl">→</span>
                        </span>
                    )}
                </button>
            </div>
        </form>
    );
}
