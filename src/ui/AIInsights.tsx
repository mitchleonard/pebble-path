import { useMemo, useState } from 'react';
import { DayEntry } from '@/types';

interface Insight {
  id: string;
  title: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  category: 'correlation' | 'trend' | 'pattern';
}

interface AIInsightsProps {
  days: Record<string, DayEntry>;
  dateRange: { start: string; end: string };
}

export function AIInsights({ days, dateRange }: AIInsightsProps) {
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const insights = useMemo(() => {
    const entries = Object.values(days).filter(day => 
      day.date >= dateRange.start && day.date <= dateRange.end
    );
    
    if (entries.length < 7) {
      return [{
        id: 'not-enough-data',
        title: 'Need More Data',
        description: 'We need at least a week of data to generate meaningful insights.',
        confidence: 'low' as const,
        category: 'pattern' as const
      }];
    }

    const insights: Insight[] = [];
    
    // Water and mood correlation
    const waterMoodData = entries
      .filter(e => e.water_stanleys && e.mood)
      .map(e => ({ water: e.water_stanleys, mood: e.mood }));
    
    if (waterMoodData.length >= 5) {
      const highWaterDays = waterMoodData.filter(d => d.water >= 3);
      const lowWaterDays = waterMoodData.filter(d => d.water <= 2);
      
      if (highWaterDays.length > 0 && lowWaterDays.length > 0) {
        const avgHighWaterMood = highWaterDays.reduce((sum, d) => sum + d.mood, 0) / highWaterDays.length;
        const avgLowWaterMood = lowWaterDays.reduce((sum, d) => sum + d.mood, 0) / lowWaterDays.length;
        
        if (Math.abs(avgHighWaterMood - avgLowWaterMood) >= 0.5) {
          const direction = avgHighWaterMood > avgLowWaterMood ? 'higher' : 'lower';
          const difference = Math.abs(avgHighWaterMood - avgLowWaterMood).toFixed(1);
          insights.push({
            id: 'water-mood',
            title: 'Water & Mood Connection',
            description: `On days with 3+ Stanleys, your mood is ${difference} points ${direction} on average.`,
            confidence: 'medium',
            category: 'correlation'
          });
        }
      }
    }

    // Workout and physical health correlation
    const workoutHealthData = entries
      .filter(e => e.workouts && e.physical_health)
      .map(e => ({ 
        hasWorkout: (e.workouts?.presets?.length || 0) + (e.workouts?.other ? 1 : 0) > 0,
        health: e.physical_health 
      }));
    
    if (workoutHealthData.length >= 5) {
      const workoutDays = workoutHealthData.filter(d => d.hasWorkout);
      const restDays = workoutHealthData.filter(d => !d.hasWorkout);
      
      if (workoutDays.length > 0 && restDays.length > 0) {
        const avgWorkoutHealth = workoutDays.reduce((sum, d) => sum + d.health, 0) / workoutDays.length;
        const avgRestHealth = restDays.reduce((sum, d) => sum + d.health, 0) / restDays.length;
        
        if (Math.abs(avgWorkoutHealth - avgRestHealth) >= 0.5) {
          const direction = avgWorkoutHealth > avgRestHealth ? 'better' : 'worse';
          const difference = Math.abs(avgWorkoutHealth - avgRestHealth).toFixed(1);
          insights.push({
            id: 'workout-health',
            title: 'Workout Impact',
            description: `Your physical health is ${difference} points ${direction} on workout days.`,
            confidence: 'medium',
            category: 'correlation'
          });
        }
      }
    }

    // Weight trend analysis
    const weightData = entries
      .filter(e => typeof e.weight === 'number')
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (weightData.length >= 3) {
      const firstWeight = weightData[0].weight!;
      const lastWeight = weightData[weightData.length - 1].weight!;
      const change = lastWeight - firstWeight;
      
      if (Math.abs(change) >= 1) {
        const direction = change > 0 ? 'gained' : 'lost';
        const amount = Math.abs(change);
        insights.push({
          id: 'weight-trend',
          title: 'Weight Trend',
          description: `Over this period, you've ${direction} ${amount} pounds.`,
          confidence: 'high',
          category: 'trend'
        });
      }
    }

    // Injection pattern analysis
    const injectionData = entries
      .filter(e => e.injection?.done)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (injectionData.length >= 2) {
      const intervals = [];
      for (let i = 1; i < injectionData.length; i++) {
        const prev = new Date(injectionData[i-1].date);
        const curr = new Date(injectionData[i].date);
        const daysDiff = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        intervals.push(daysDiff);
      }
      
      const avgInterval = intervals.reduce((sum, d) => sum + d, 0) / intervals.length;
      if (Math.abs(avgInterval - 7) <= 2) {
        insights.push({
          id: 'injection-consistency',
          title: 'Consistent Injections',
          description: `You're maintaining a regular injection schedule, averaging every ${Math.round(avgInterval)} days.`,
          confidence: 'high',
          category: 'pattern'
        });
      }
    }

    // Meal pattern analysis
    const mealData = entries
      .filter(e => e.meals)
      .map(e => ({
        breakfast: e.meals.breakfast.length,
        lunch: e.meals.lunch.length,
        dinner: e.meals.dinner.length,
        snacks: e.meals.snacks.length
      }));
    
    if (mealData.length >= 5) {
      const avgBreakfast = mealData.reduce((sum, d) => sum + d.breakfast, 0) / mealData.length;
      const avgLunch = mealData.reduce((sum, d) => sum + d.lunch, 0) / mealData.length;
      const avgDinner = mealData.reduce((sum, d) => sum + d.dinner, 0) / mealData.length;
      
      if (avgBreakfast < 0.5 && avgLunch > 1 && avgDinner > 1) {
        insights.push({
          id: 'meal-skipping',
          title: 'Breakfast Skipper',
          description: 'You tend to skip breakfast but consistently eat lunch and dinner.',
          confidence: 'medium',
          category: 'pattern'
        });
      }
    }

    // Mood trend analysis
    const moodData = entries
      .filter(e => e.mood)
      .sort((a, b) => a.date.localeCompare(b.date));
    
    if (moodData.length >= 5) {
      const firstHalf = moodData.slice(0, Math.ceil(moodData.length / 2));
      const secondHalf = moodData.slice(Math.ceil(moodData.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.mood, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.mood, 0) / secondHalf.length;
      
      if (Math.abs(secondHalfAvg - firstHalfAvg) >= 0.5) {
        const direction = secondHalfAvg > firstHalfAvg ? 'improving' : 'declining';
        insights.push({
          id: 'mood-trend',
          title: 'Mood Trend',
          description: `Your mood has been ${direction} over this period.`,
          confidence: 'medium',
          category: 'trend'
        });
      }
    }

    return insights.slice(0, 6); // Limit to 6 insights
  }, [days, dateRange]);

  const handleQuestion = () => {
    if (!question.trim()) return;
    
    // Simple question answering logic
    const lowerQuestion = question.toLowerCase();
    let response = '';
    
    if (lowerQuestion.includes('water') || lowerQuestion.includes('stanley')) {
      const waterEntries = Object.values(days).filter(d => d.water_stanleys);
      if (waterEntries.length > 0) {
        const avgWater = waterEntries.reduce((sum, d) => sum + d.water_stanleys, 0) / waterEntries.length;
        response = `You drink an average of ${avgWater.toFixed(1)} Stanleys per day.`;
      }
    } else if (lowerQuestion.includes('mood') || lowerQuestion.includes('feeling')) {
      const moodEntries = Object.values(days).filter(d => d.mood);
      if (moodEntries.length > 0) {
        const avgMood = moodEntries.reduce((sum, d) => sum + d.mood, 0) / moodEntries.length;
        response = `Your average mood is ${avgMood.toFixed(1)} out of 5.`;
      }
    } else if (lowerQuestion.includes('workout') || lowerQuestion.includes('exercise')) {
      const workoutEntries = Object.values(days).filter(d => d.workouts);
      const workoutDays = workoutEntries.filter(d => 
        (d.workouts?.presets?.length || 0) + (d.workouts?.other ? 1 : 0) > 0
      );
      const percentage = (workoutDays.length / workoutEntries.length * 100).toFixed(0);
      response = `You work out on ${percentage}% of the days you track.`;
    } else if (lowerQuestion.includes('weight')) {
      const weightEntries = Object.values(days).filter(d => typeof d.weight === 'number');
      if (weightEntries.length > 0) {
        const latest = weightEntries.sort((a, b) => b.date.localeCompare(a.date))[0];
        response = `Your most recent weight was ${latest.weight} pounds.`;
      }
    } else {
      response = "I can help with questions about water, mood, workouts, weight, and other tracked data. Try asking something specific!";
    }
    
    setAnswer(response);
    setQuestion('');
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'correlation': return '🔗';
      case 'trend': return '📈';
      case 'pattern': return '🔍';
      default: return '💡';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="section-title">AI Insights</h3>
        <button
          onClick={() => setShowQuestionInput(!showQuestionInput)}
          className="btn bg-lilac/60 hover:bg-lilac text-sm"
        >
          {showQuestionInput ? 'Hide' : 'Ask Question (Beta)'}
        </button>
      </div>

      {showQuestionInput && (
        <div className="card p-4 space-y-3">
          <div className="text-sm font-medium">Ask me about your data:</div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g., How much water do I drink on average?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="input flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleQuestion()}
            />
            <button onClick={handleQuestion} className="btn btn-primary">
              Ask
            </button>
          </div>
          {answer && (
            <div className="p-3 bg-mint/20 rounded-lg">
              <div className="font-medium">Answer:</div>
              <div className="text-slate-700">{answer}</div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-3">
        {insights.map((insight) => (
          <div key={insight.id} className="card p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getCategoryIcon(insight.category)}</span>
                <h4 className="font-medium">{insight.title}</h4>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                {insight.confidence}
              </span>
            </div>
            <p className="text-slate-600 text-sm">{insight.description}</p>
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="card p-4 text-center text-slate-500">
          <div className="text-lg mb-2">🤖</div>
          <div>No insights available yet. Keep tracking your data to unlock AI-powered insights!</div>
        </div>
      )}
    </div>
  );
}
