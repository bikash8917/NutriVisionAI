import { useEffect, useMemo, useState } from 'react';
import { Droplets, Flame, Award, Sparkles, TimerReset } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SummaryCard from '../../components/dashboard/SummaryCard';
import ProgressRing from '../../components/dashboard/ProgressRing';
import GoalCard from '../../components/dashboard/GoalCard';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import useMeals from '../../hooks/useMeals';
import { dashboardService } from '../../services/dashboardService';
import { GOALS } from '../../constants/nutritionGoals';
import EmptyState from '../../components/common/EmptyState';
import { hydrationService } from '../../services/hydrationService';
import { STORAGE_EVENTS } from '../../utils/storageEvents';
import { profileService } from '../../services/profileService';
import { goalService, formatGoalLabel } from '../../services/goalService';

export default function DashboardHome() {
  const meals = useMeals();
  const [waterIntake, setWaterIntake] = useState(hydrationService.getTodayIntake());
  const [profile, setProfile] = useState(profileService.getProfile());
  const [goal, setGoal] = useState(goalService.getGoal());

  const visibleMeals = useMemo(() => dashboardService.getTodayMeals(meals), [meals]);

  useEffect(() => {
    const syncDashboardData = () => {
      setProfile(profileService.getProfile());
      setGoal(goalService.getGoal());
      setWaterIntake(hydrationService.getTodayIntake());
    };

    window.addEventListener(STORAGE_EVENTS.profile, syncDashboardData);
    window.addEventListener(STORAGE_EVENTS.settings, syncDashboardData);
    window.addEventListener('storage', syncDashboardData);

    return () => {
      window.removeEventListener(STORAGE_EVENTS.profile, syncDashboardData);
      window.removeEventListener(STORAGE_EVENTS.settings, syncDashboardData);
      window.removeEventListener('storage', syncDashboardData);
    };
  }, []);

  const summary = useMemo(
    () => dashboardService.getSummary(visibleMeals, profile, goal, waterIntake),
    [visibleMeals, profile, goal, waterIntake],
  );
  const progress = useMemo(() => dashboardService.getProgress(visibleMeals, profile, goal), [visibleMeals, profile, goal]);
  const goals = useMemo(
    () => dashboardService.getGoals(visibleMeals, profile, goal, waterIntake),
    [visibleMeals, profile, goal, waterIntake],
  );
  const streak = useMemo(() => dashboardService.getWeeklyStreak(meals), [meals]);
  const totals = useMemo(() => dashboardService.getTotals(visibleMeals, waterIntake), [visibleMeals, waterIntake]);
  const message = useMemo(() => dashboardService.getMotivationalMessage(visibleMeals, profile, goal), [visibleMeals, profile, goal]);
  const targetCalories = useMemo(() => dashboardService.getGoalTargetCalories(profile, goal), [profile, goal]);
  const goalLabel = useMemo(() => formatGoalLabel(goal), [goal]);
  useEffect(() => {
    const syncWater = () => setWaterIntake(hydrationService.getTodayIntake());
    window.addEventListener(STORAGE_EVENTS.settings, syncWater);
    window.addEventListener('storage', syncWater);
    return () => {
      window.removeEventListener(STORAGE_EVENTS.settings, syncWater);
      window.removeEventListener('storage', syncWater);
    };
  }, []);

  const caloriesRemaining = dashboardService.getRemainingCalories(visibleMeals, profile, goal);
  const hydrationProgress = Math.min(Math.round((waterIntake / GOALS.water) * 100), 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Track nutrition, progress, and scanner activity from one central workspace."
        actions={<Button as="a" href="/dashboard/scan">Open Scanner</Button>}
      />

      {!visibleMeals.length ? (
        <EmptyState
          variant="subtle"
          title="No meals tracked today"
          description="The dashboard still calculates your daily target from your profile and weight goal. Scan a meal to start the live progress tracker."
          action={<Button as="a" href="/dashboard/scan">Open scanner</Button>}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Daily Progress</p>
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <ProgressRing value={progress} label="Calories complete" />
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <Flame className="h-5 w-5 text-brand-700" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Calories Remaining</p>
                  <p className="text-lg font-semibold text-slate-950">{Number(caloriesRemaining.toFixed(1))} kcal</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <Droplets className="h-5 w-5 text-brand-700" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Water Intake</p>
                  <p className="text-lg font-semibold text-slate-950">{waterIntake.toFixed(2)} L</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <Award className="h-5 w-5 text-brand-700" />
                <div>
                  <p className="text-sm font-medium text-slate-500">Weekly Streak</p>
                  <p className="text-lg font-semibold text-slate-950">{streak} day{streak === 1 ? '' : 's'}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <GoalCard key={goal.title} {...goal} />
          ))}
          <Card className="p-6 sm:col-span-2">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Motivation</p>
                <p className="mt-2 text-base leading-7 text-slate-700">{message}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Goal Completion</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{progress}%</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Current Goal</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{goalLabel}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Daily Target</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{targetCalories} kcal</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Quick Action</p>
          <Button as="a" href="/dashboard/scan" variant="secondary" className="mt-3 w-full gap-2">
            <TimerReset className="h-4 w-4" />
            Log a meal
          </Button>
        </Card>
        <Card className="p-5 md:col-span-4">
          <p className="text-sm font-medium text-slate-500">Hydration</p>
          <p className="mt-3 text-2xl font-bold text-slate-950">{hydrationProgress}%</p>
          <p className="mt-1 text-sm text-slate-500">{waterIntake.toFixed(2)} L / {GOALS.water} L today</p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={async () => {
                try {
                  const nextWater = await hydrationService.addWater(0.25);
                  setWaterIntake(nextWater);
                } catch {
                  return;
                }
              }}
            >
              +250ml
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={async () => {
                try {
                  const nextWater = await hydrationService.resetToday();
                  setWaterIntake(nextWater);
                } catch {
                  return;
                }
              }}
            >
              Reset
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
