with open('frontend/src/pages/survivor/Journey.tsx', 'r') as f:
    content = f.read()

import re

fact_cards = """
    // Streak calculations
    const sorted = [...checkins].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const distinctDates = Array.from(new Set(sorted.map(c => new Date(c.timestamp).toLocaleDateString())));
    const dates = distinctDates.map(d => new Date(d));
    dates.sort((a, b) => b.getTime() - a.getTime());
    
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    if (dates.length > 0) {
        let currDate = new Date(new Date().toLocaleDateString());
        let isTodayCheckedIn = dates[0].getTime() === currDate.getTime();
        
        let dateIndex = 0;
        if (!isTodayCheckedIn) {
            currDate.setDate(currDate.getDate() - 1);
        }
        
        while (dateIndex < dates.length) {
            if (dates[dateIndex].getTime() === currDate.getTime()) {
                currentStreak++;
                currDate.setDate(currDate.getDate() - 1);
                dateIndex++;
            } else if (dates[dateIndex].getTime() > currDate.getTime()) {
                dateIndex++;
            } else {
                break;
            }
        }
        
        // Calculate max streak
        if (dates.length > 0) {
            tempStreak = 1;
            maxStreak = 1;
            for (let i = 0; i < dates.length - 1; i++) {
                const diffTime = Math.abs(dates[i].getTime() - dates[i+1].getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays === 1) {
                    tempStreak++;
                    if (tempStreak > maxStreak) maxStreak = tempStreak;
                } else {
                    tempStreak = 1;
                }
            }
        }
    }
    
    const lastCheckInStr = checkins.length > 0 ? new Date(checkins[0].timestamp).toLocaleDateString() : 'Never';
    const baselineStr = baseline ? "Established" : "Building";
    const dataCompleteness = checkins.length >= 7 ? "High" : checkins.length >= 3 ? "Moderate" : "Low";

    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
            <div className="bg-white p-5 rounded-2xl border border-slate-50 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Check-ins</span>
                <span className="text-2xl font-bold text-slate-800">{checkins.length}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-50 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Current Streak</span>
                <span className="text-2xl font-bold text-slate-800">{currentStreak}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-50 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex flex-col justify-between hidden md:flex">
                <span className="text-xs font-semibold text-slate-400 uppercase">Longest Streak</span>
                <span className="text-2xl font-bold text-slate-800">{maxStreak}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-50 shadow-[0_2px_15px_rgb(0,0,0,0.03)] flex flex-col justify-between hidden md:flex">
                <span className="text-xs font-semibold text-slate-400 uppercase">Baseline Status</span>
                <span className="text-2xl font-bold text-slate-800">{baselineStr}</span>
            </div>
        </div>

        {checkins.length === 0 ? (
"""

content = re.sub(r'return \(\s*<div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">\s*\{checkins.length === 0 \? \(', fact_cards, content, flags=re.DOTALL)

with open('frontend/src/pages/survivor/Journey.tsx', 'w') as f:
    f.write(content)
