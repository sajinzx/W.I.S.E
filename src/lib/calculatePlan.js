/**
 * Deterministic fallback calculation engine.
 * Used when LLM is unavailable or returns invalid data.
 */

const FUND_DATA = {
    'Nifty 50 Index Funds': {
        returnRate: 0.11,
        exampleFunds: ['UTI Nifty 50 Index Fund', 'HDFC Nifty 50 Index Fund', 'SBI Nifty Index Fund'],
        majorCompanies: ['Reliance Industries', 'TCS', 'HDFC Bank', 'Infosys', 'ICICI Bank'],
    },
    'Large Cap Mutual Funds': {
        returnRate: 0.11,
        exampleFunds: ['Mirae Asset Large Cap Fund', 'Axis Bluechip Fund', 'Canara Robeco Bluechip Fund'],
        majorCompanies: ['Bajaj Finance', 'HUL', 'Bharti Airtel', 'ITC', 'Kotak Mahindra Bank'],
    },
    'Mid Cap Mutual Funds': {
        returnRate: 0.13,
        exampleFunds: ['Kotak Emerging Equity Fund', 'HDFC Mid-Cap Opportunities Fund', 'Axis Midcap Fund'],
        majorCompanies: ['PI Industries', 'Voltas', 'Mphasis', 'Coforge', 'Persistent Systems'],
    },
    'Small Cap Mutual Funds': {
        returnRate: 0.15,
        exampleFunds: ['SBI Small Cap Fund', 'Nippon India Small Cap Fund', 'Axis Small Cap Fund'],
        majorCompanies: ['CDSL', 'Deepak Nitrite', 'Laurus Labs', 'KPIT Technologies', 'Happiest Minds'],
    },
    'Flexi Cap / Multi Cap Funds': {
        returnRate: 0.12,
        exampleFunds: ['Parag Parikh Flexi Cap Fund', 'HDFC Flexi Cap Fund', 'UTI Flexi Cap Fund'],
        majorCompanies: ['Alphabet (Google)', 'Amazon', 'Titan Company', 'Avenue Supermarts', 'Divi\'s Labs'],
    },
};

const RISK_ALLOCATIONS = {
    minimal: { 'Nifty 50 Index Funds': 35, 'Large Cap Mutual Funds': 30, 'Mid Cap Mutual Funds': 15, 'Small Cap Mutual Funds': 5, 'Flexi Cap / Multi Cap Funds': 15 },
    medium: { 'Nifty 50 Index Funds': 25, 'Large Cap Mutual Funds': 20, 'Mid Cap Mutual Funds': 20, 'Small Cap Mutual Funds': 15, 'Flexi Cap / Multi Cap Funds': 20 },
    high: { 'Nifty 50 Index Funds': 10, 'Large Cap Mutual Funds': 15, 'Mid Cap Mutual Funds': 25, 'Small Cap Mutual Funds': 30, 'Flexi Cap / Multi Cap Funds': 20 },
};

const RISK_RETURNS = {
    minimal: 0.09,
    medium: 0.135,
    high: 0.16,
};

function calculateSIPFutureValue(monthlyInvestment, annualRate, years) {
    const monthlyRate = annualRate / 12;
    const months = years * 12;
    if (monthlyRate === 0) return monthlyInvestment * months;
    return monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
}

function calculateRequiredReturn(monthlyInvestment, goal, years) {
    let low = 0, high = 0.5, tolerance = 0.0001;
    while (high - low > tolerance) {
        const mid = (low + high) / 2;
        const fv = calculateSIPFutureValue(monthlyInvestment, mid, years);
        if (fv < goal) low = mid;
        else high = mid;
    }
    return (low + high) / 2;
}

function calculateRequiredYears(monthlyInvestment, goal, annualRate) {
    let years = 1;
    while (years <= 30) {
        const fv = calculateSIPFutureValue(monthlyInvestment, annualRate, years);
        if (fv >= goal) return years;
        years++;
    }
    return 30;
}

export function calculatePlan({ salary, expenses, goal, timeline, riskMode, choiceMode }) {
    const investable = expenses ? salary - expenses : Math.round(salary * 0.35);
    let actualTimeline = timeline;
    let actualRiskMode = riskMode;
    let calculatedReturn = null;
    let timelineOptions = null;

    if (choiceMode === 'timeline') {
        const requiredReturn = calculateRequiredReturn(investable, goal, timeline);
        calculatedReturn = requiredReturn;
        if (requiredReturn <= 0.10) actualRiskMode = 'minimal';
        else if (requiredReturn <= 0.14) actualRiskMode = 'medium';
        else actualRiskMode = 'high';
    } else if (choiceMode === 'risk') {
        const riskReturn = RISK_RETURNS[riskMode];
        const requiredYears = calculateRequiredYears(investable, goal, riskReturn);
        actualTimeline = requiredYears;
        timelineOptions = {
            minimal: calculateRequiredYears(investable, goal, RISK_RETURNS.minimal),
            medium: calculateRequiredYears(investable, goal, RISK_RETURNS.medium),
            high: calculateRequiredYears(investable, goal, RISK_RETURNS.high),
        };
    }

    const allocations = RISK_ALLOCATIONS[actualRiskMode] || RISK_ALLOCATIONS.medium;

    // Build portfolio
    const portfolio = Object.entries(allocations).map(([category, allocation]) => {
        const monthlySIP = Math.round((allocation / 100) * investable);
        const data = FUND_DATA[category];
        return {
            category,
            allocation,
            monthlySIP,
            exampleFunds: data.exampleFunds,
            majorCompanies: data.majorCompanies,
        };
    });

    // Calculate weighted average return
    const weightedReturn = Object.entries(allocations).reduce((sum, [category, allocation]) => {
        return sum + (allocation / 100) * FUND_DATA[category].returnRate;
    }, 0);

    // Generate yearly projections
    const projections = [];
    for (let year = 1; year <= actualTimeline; year++) {
        const invested = investable * 12 * year;
        const value = Math.round(calculateSIPFutureValue(investable, weightedReturn, year));
        projections.push({ year, invested, value });
    }

    // Pie chart data
    const pieChart = {
        Nifty50: allocations['Nifty 50 Index Funds'],
        LargeCap: allocations['Large Cap Mutual Funds'],
        MidCap: allocations['Mid Cap Mutual Funds'],
        SmallCap: allocations['Small Cap Mutual Funds'],
        FlexiCap: allocations['Flexi Cap / Multi Cap Funds'],
    };

    return {
        summary: {
            salary,
            monthlyInvestment: investable,
            targetGoal: goal,
            timeline: actualTimeline,
            investableAmount: investable,
            choiceMode,
            calculatedReturn: calculatedReturn ? (calculatedReturn * 100).toFixed(1) : null,
            riskLevel: actualRiskMode,
            timelineOptions,
        },
        portfolio,
        pieChart,
        projections,
    };
}
