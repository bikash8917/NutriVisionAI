import { useEffect, useMemo, useState } from 'react';
import { Target, RotateCcw, Save, TrendingDown } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useMeals from '../../hooks/useMeals';
import { dashboardService } from '../../services/dashboardService';
import { goalService, formatGoalLabel } from '../../services/goalService';
import { profileService } from '../../services/profileService';
import { STORAGE_EVENTS } from '../../utils/storageEvents';
import { toastService } from '../../services/toastService';

export default function Goals() {
  const meals = useMeals();
  const [profile, setProfile] = useState(profileService.getProfile());
  const [goal, setGoal] = useState(goalService.getGoal());

  useEffect(() => {
    const syncGoalState = () => {
      setProfile(profileService.getProfile());
      setGoal(goalService.getGoal());
    };

    window.addEventListener(STORAGE_EVENTS.profile, syncGoalState);
    window.addEventListener(STORAGE_EVENTS.settings, syncGoalState);
    window.addEventListener('storage', syncGoalState);

    return () => {
      window.removeEventListener(STORAGE_EVENTS.profile, syncGoalState);
      window.removeEventListener(STORAGE_EVENTS.settings, syncGoalState);
      window.removeEventListener('storage', syncGoalState);
    };
  }, []);

  const todayMeals = useMemo(() => dashboardService.getTodayMeals(meals), [meals]);
  const targetCalories = useMemo(() => dashboardService.getGoalTargetCalories(profile, goal), [profile, goal]);
  const caloriesConsumed = useMemo(() => dashboardService.getTotals(todayMeals).calories, [todayMeals]);
  const caloriesRemaining = useMemo(
    () => dashboardService.getRemainingCalories(meals, profile, goal),
    [meals, profile, goal],
  );
  const goalProgress = useMemo(
    () => dashboardService.getGoalProgress(meals, profile, goal),
    [meals, profile, goal],
  );
  const dailyDeficit = useMemo(() => Math.max(Math.round((Number(goal.weightLossKg || 0) * 7700) / 30), 0), [goal]);
  const weeklyLoss = useMemo(() => Number(((dailyDeficit * 7) / 7700).toFixed(2)), [dailyDeficit]);

  const handleSave = async () => {
    try {
      const savedGoal = await goalService.saveGoal(goal);
      setGoal(savedGoal);
      toastService.success('Goal saved', 'Your weight-loss goal now drives the dashboard calculations.');
    } catch {
      toastService.error('Save failed', 'The goal could not be stored in the database.');
    }
  };

  const handleReset = async () => {
    try {
      const nextGoal = await goalService.resetGoal();
      setGoal(nextGoal);
      toastService.info('Goal reset', 'Weight-loss goal returned to the default server value.');
    } catch {
      toastService.error('Reset failed', 'The goal could not be reset.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        description="Set only your weight-loss target. Everything else updates automatically from your profile and meals."
        actions={
          <>
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save goal
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Weight goal</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">{formatGoalLabel(goal)}</h2>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <Input
              label="Weight to lose (kg)"
              type="number"
              min="0.5"
              step="0.5"
              value={goal.weightLossKg}
              onChange={(event) => setGoal((current) => ({ ...current, weightLossKg: event.target.value }))}
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-950">How it works</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                The app uses your profile, activity level, and selected weight-loss target to calculate your daily calorie target, remaining calories, and progress.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-4">
                <p className="text-sm text-slate-500">Consumed today</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{Math.round(caloriesConsumed)} kcal</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-slate-500">Remaining today</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{caloriesRemaining} kcal</p>
              </Card>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <p className="text-sm text-slate-500">Daily calorie target</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{targetCalories} kcal</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-slate-500">Daily deficit</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{dailyDeficit} kcal</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-slate-500">Projected weekly loss</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{weeklyLoss} kg</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-slate-500">Goal progress</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{goalProgress}%</p>
            </Card>
          </div>

          <Card className="p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-700">Progress</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-700">
                {goalProgress}%
              </div>
              <div className="flex-1">
                <p className="text-sm leading-7 text-slate-600">
                  {goalProgress >= 90
                    ? 'You are very close to your target calorie intake for today.'
                    : 'Keep tracking meals and the app will update your target automatically.'}
                </p>
                <div className="mt-4 h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-brand-600" style={{ width: `${goalProgress}%` }} />
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <TrendingDown className="h-5 w-5 text-brand-700" />
              <p className="text-sm text-slate-600">
                Your daily target is calculated from your profile and the goal to {goal.weightLossKg} kg weight loss.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
