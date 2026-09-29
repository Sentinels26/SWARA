import { useMemo } from 'react';
import { Leaf, Droplets, Sprout, TreePine, Flower2, AlertCircle } from 'lucide-react';

interface Checkin {
  id: number;
  timestamp: string; // ISO format
}

interface PlantConsistencyProps {
  checkins: Checkin[];
}

export function PlantConsistency({ checkins }: PlantConsistencyProps) {
  const { currentStreak, plantStage, isDry } = useMemo(() => {
    if (!checkins || checkins.length === 0) {
      return { currentStreak: 0, plantStage: 0, isDry: false, missedDays: 0 };
    }

    // Sort check-ins by date descending
    const sorted = [...checkins].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    let streak = 0;
    let missed = 0;
    const getLocalDateString = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}T00:00:00`;
    };

    const distinctDates = Array.from(new Set(sorted.map(c => getLocalDateString(new Date(c.timestamp)))));
    
    const dates = distinctDates.map(d => new Date(d));
    dates.sort((a, b) => b.getTime() - a.getTime());
    
    // Calculate streak
    let currDate = new Date(getLocalDateString(new Date())); // start checking from today
    let dateIndex = 0;

    let isTodayCheckedIn = dates.length > 0 && dates[0].getTime() === currDate.getTime();
    
    if (!isTodayCheckedIn) {
      // Not checked in today.
      missed++;
      currDate.setDate(currDate.getDate() - 1); // move back to yesterday to count streak
    }

    while (dateIndex < dates.length) {
      if (dates[dateIndex].getTime() === currDate.getTime()) {
        streak++;
        currDate.setDate(currDate.getDate() - 1);
        dateIndex++;
      } else if (dates[dateIndex].getTime() > currDate.getTime()) {
        dateIndex++; // Skip future dates if any
      } else {
        break; // Streak broken
      }
    }

    // Plant stage rules
    // Day 1 -> Seed (0)
    // Day 2 -> Sprout (1)
    // Day 3 -> Small Plant (2)
    // Day 5 -> Growing Plant (3)
    // Day 7+ -> Flowering (4)
    let stage = 0;
    if (streak >= 7) stage = 4;
    else if (streak >= 5) stage = 3;
    else if (streak >= 3) stage = 2;
    else if (streak >= 2) stage = 1;
    else if (streak >= 1) stage = 0;

    return { currentStreak: streak, plantStage: stage, isDry: missed > 0, missedDays: missed };
  }, [checkins]);

  // Visual mapping
  const stageColors = [
    'text-amber-700 bg-amber-50', // Seed
    'text-lime-600 bg-lime-50', // Sprout
    'text-green-500 bg-green-50', // Small
    'text-emerald-600 bg-emerald-50', // Growing
    'text-pink-500 bg-pink-50', // Flowering
  ];
  
  const dryColors = 'text-orange-400 bg-orange-50 opacity-80';

  const renderIcon = () => {
    const props = { className: "w-14 h-14", strokeWidth: isDry ? 1.5 : 2 };
    switch (plantStage) {
      case 1: return <Sprout {...props} />;
      case 2: return <Leaf {...props} />;
      case 3: return <TreePine {...props} />;
      case 4: return <Flower2 {...props} />;
      case 0:
      default: return <Droplets {...props} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-[0_2px_10px_rgb(0,0,0,0.03)] border border-slate-50 w-full h-full">
      <div className="text-center mb-4">
        <h3 className="font-bold text-slate-800 text-lg">Check-in Consistency</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">A reflection of your check-in habits, not your mental health.</p>
      </div>

      <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 mb-6 ${isDry ? dryColors : stageColors[plantStage]}`}>
        {renderIcon()}
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-slate-800">{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</div>
        <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider mt-1">Current Streak</div>
      </div>

      {isDry && currentStreak > 0 && (
        <div className="mt-6 p-4 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-start gap-3 border border-slate-100 max-w-[250px] mx-auto text-left leading-relaxed">
          <AlertCircle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <span>The plant is looking a little dry. You can water it by completing today's check-in.</span>
        </div>
      )}
    </div>
  );
}
