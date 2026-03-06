'use client';

import { useState } from 'react';

const RISK_OPTIONS = [
    { value: 'minimal', label: 'Low Risk', desc: '8-10% returns', icon: '🛡️' },
    { value: 'medium', label: 'Medium Risk', desc: '12-15% returns', icon: '⚖️' },
    { value: 'high', label: 'High Risk', desc: '15%+ returns', icon: '🚀' },
];

export default function InputForm({ onSubmit, loading }) {
    const [step, setStep] = useState(1);
    const [choiceMode, setChoiceMode] = useState(null);
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

    const handleChoiceMode = (mode) => {
        setChoiceMode(mode);
        if (errors.choice) setErrors((prev) => ({ ...prev, choice: '' }));
    };

    const validateStep1 = () => {
        const errs = {};
        if (!form.salary || Number(form.salary) <= 0) errs.salary = 'Enter a valid salary';
        if (form.expenses && Number(form.expenses) < 0) errs.expenses = 'Expenses cannot be negative';
        if (form.expenses && Number(form.expenses) >= Number(form.salary)) errs.expenses = 'Expenses must be less than salary';
        if (!form.goal || Number(form.goal) <= 0) errs.goal = 'Enter a valid savings goal';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateStep2 = () => {
        const errs = {};
        if (!choiceMode) {
            errs.choice = 'Please select either Time Frame or Risk Appetite';
        } else if (choiceMode === 'timeline' && (!form.timeline || Number(form.timeline) < 1 || Number(form.timeline) > 30)) {
            errs.timeline = 'Timeline must be 1–30 years';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (!validateStep1()) return;
        setStep(2);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateStep2()) return;
        onSubmit({
            salary: Number(form.salary),
            expenses: form.expenses ? Number(form.expenses) : null,
            goal: Number(form.goal),
            timeline: choiceMode === 'timeline' ? Number(form.timeline) : null,
            riskMode: choiceMode === 'risk' ? form.riskMode : null,
            choiceMode,
        });
    };

    return (
        <form onSubmit={step === 1 ? handleNext : handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="glass-card p-8 md:p-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 mb-4 shadow-lg shadow-emerald-500/25">
                        <span className="text-3xl">💰</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        {step === 1 ? 'Your Financial Details' : 'Choose Your Approach'}
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm">
                        {step === 1 ? 'Fill in your details to get a personalized investment plan' : 'Optimize for time or risk tolerance'}
                    </p>
                </div>

                {step === 1 ? (
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
                </div>
                ) : (
                <div className="space-y-6">
                    {!choiceMode ? (
                        <div className="space-y-4">
                            <p className="text-slate-300 text-center mb-6">How would you like to plan your investment?</p>
                            {errors.choice && <p className="form-error text-center">{errors.choice}</p>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleChoiceMode('timeline')}
                                    className="p-6 rounded-xl border-2 border-slate-700 hover:border-emerald-500 bg-slate-800/50 hover:bg-slate-800 transition-all text-left group"
                                >
                                    <div className="text-3xl mb-3">⏱️</div>
                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">Choose Time Frame</h3>
                                    <p className="text-sm text-slate-400">Set your target timeline and we'll calculate the required risk level</p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleChoiceMode('risk')}
                                    className="p-6 rounded-xl border-2 border-slate-700 hover:border-cyan-500 bg-slate-800/50 hover:bg-slate-800 transition-all text-left group"
                                >
                                    <div className="text-3xl mb-3">🎯</div>
                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">Choose Risk Appetite</h3>
                                    <p className="text-sm text-slate-400">Select your risk tolerance and we'll show possible timelines</p>
                                </button>
                            </div>
                        </div>
                    ) : choiceMode === 'timeline' ? (
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
                            <button type="button" onClick={() => setChoiceMode(null)} className="text-sm text-slate-400 hover:text-white mt-3">← Change approach</button>
                        </div>
                    ) : (
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
                            <button type="button" onClick={() => setChoiceMode(null)} className="text-sm text-slate-400 hover:text-white mt-3">← Change approach</button>
                        </div>
                    )}
                </div>
                )}

                {/* Submit */}
                {step === 1 ? (
                    <button type="submit" className="submit-btn mt-8">
                        <span className="flex items-center justify-center gap-2">
                            <span>Continue</span>
                            <span className="text-xl">→</span>
                        </span>
                    </button>
                ) : (
                    <div className="flex gap-3 mt-8">
                        <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all">
                            ← Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-btn flex-1"
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
                )}
            </div>
        </form>
    );
}
