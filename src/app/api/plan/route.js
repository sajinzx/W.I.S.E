import { NextResponse } from 'next/server';
import { SYSTEM_PROMPT, buildUserPrompt } from '@/lib/systemPrompt';
import { calculatePlan } from '@/lib/calculatePlan';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'arcee-ai/trinity-large-preview:free';

function parseJSONFromResponse(text) {
    // Try direct JSON parse
    try {
        return JSON.parse(text);
    } catch (e) {
        // ignore
    }

    // Try extracting from markdown code fence
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
        try {
            return JSON.parse(codeBlockMatch[1].trim());
        } catch (e) {
            // ignore
        }
    }

    // Try finding JSON object in text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            // ignore
        }
    }

    return null;
}

function validatePlan(plan) {
    if (!plan) return false;
    if (!plan.summary || !plan.portfolio || !plan.pieChart || !plan.projections) return false;
    if (!Array.isArray(plan.portfolio) || plan.portfolio.length === 0) return false;
    if (!Array.isArray(plan.projections) || plan.projections.length === 0) return false;
    return true;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { salary, expenses, goal, timeline, riskMode } = body;

        // Validation
        if (!salary || salary <= 0) {
            return NextResponse.json({ error: 'Monthly salary must be a positive number' }, { status: 400 });
        }
        if (!goal || goal <= 0) {
            return NextResponse.json({ error: 'Savings goal must be a positive number' }, { status: 400 });
        }
        if (!timeline || timeline < 1 || timeline > 30) {
            return NextResponse.json({ error: 'Timeline must be between 1 and 30 years' }, { status: 400 });
        }
        if (!['minimal', 'medium', 'high'].includes(riskMode)) {
            return NextResponse.json({ error: 'Risk mode must be minimal, medium, or high' }, { status: 400 });
        }

        // Try LLM first
        try {
            const userPrompt = buildUserPrompt({ salary, expenses: expenses || null, goal, timeline, riskMode });

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'WISE',
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.3,
                    max_tokens: 4000,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const content = data.choices?.[0]?.message?.content;

                if (content) {
                    const plan = parseJSONFromResponse(content);
                    if (validatePlan(plan)) {
                        return NextResponse.json({ ...plan, source: 'ai' });
                    }
                }
            }
        } catch (llmError) {
            console.error('LLM API error, falling back to calculation engine:', llmError.message);
        }

        // Fallback to deterministic calculation
        const fallbackPlan = calculatePlan({
            salary,
            expenses: expenses || null,
            goal,
            timeline,
            riskMode,
        });

        return NextResponse.json({ ...fallbackPlan, source: 'calculation' });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
