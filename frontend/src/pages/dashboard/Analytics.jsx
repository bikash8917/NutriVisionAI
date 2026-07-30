import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import ChartCard from '../../components/dashboard/ChartCard';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Select from '../../components/common/Select';
import useMeals from '../../hooks/useMeals';
import { analyticsService } from '../../services/analyticsService';
import { filterMealsByRange, mealRangeOptions } from '../../utils/mealRanges';

const pieColors = ['#22C55E', '#16A34A', '#86EFAC'];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const groupByMonth = (meals) => {
  const buckets = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    return {
      label: monthNames[date.getMonth()],
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  });

  meals.forEach((meal) => {
    const mealDate = new Date(meal.createdAt);
    const monthIndex = buckets.findIndex((bucket) => bucket.label === monthNames[mealDate.getMonth()]);
    if (monthIndex === -1) return;

    buckets[monthIndex].calories += Number(meal.calories || 0);
    buckets[monthIndex].protein += Number(meal.protein || 0);
    buckets[monthIndex].carbs += Number(meal.carbs || 0);
    buckets[monthIndex].fat += Number(meal.fat || 0);
  });

  return buckets.map((bucket) => ({
    ...bucket,
    calories: Number(bucket.calories.toFixed(1)),
    protein: Number(bucket.protein.toFixed(1)),
    carbs: Number(bucket.carbs.toFixed(1)),
    fat: Number(bucket.fat.toFixed(1)),
  }));
};

export default function Analytics() {
  const meals = useMeals();
  const [range, setRange] = useState('30d');
  const visibleMeals = useMemo(() => filterMealsByRange(meals, range), [meals, range]);

  const weeklyCalories = useMemo(() => analyticsService.getWeeklyCalories(visibleMeals), [visibleMeals]);
  const monthlyTrend = useMemo(() => groupByMonth(visibleMeals), [visibleMeals]);
  const macroData = useMemo(() => analyticsService.getMacroBreakdown(visibleMeals), [visibleMeals]);
  const mealDistribution = useMemo(() => analyticsService.getMealDistribution(visibleMeals), [visibleMeals]);
  const topFoods = useMemo(() => analyticsService.getTopFoods(visibleMeals), [visibleMeals]);
  const averageConfidence = useMemo(() => analyticsService.getAverageConfidence(visibleMeals), [visibleMeals]);
  const nutritionSummary = useMemo(() => analyticsService.getNutritionSummary(visibleMeals), [visibleMeals]);
  const nutritionScore = useMemo(() => analyticsService.getNutritionScore(visibleMeals), [visibleMeals]);

  if (!meals.length) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analytics" description="Charts and trends will appear after you save meals." />
        <EmptyState
          variant="subtle"
          title="No analytics yet"
          description="Save a few meals from the scanner to unlock calories, macros, trends, and confidence insights."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Track your nutrition trends, meal balance, and AI confidence from the meals you save."
        actions={
          <Select value={range} onChange={(event) => setRange(event.target.value)} className="min-w-40">
            {mealRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-slate-500">Nutrition Score</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{nutritionScore}%</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">AI Prediction Accuracy</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{averageConfidence}%</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Avg Calories / Meal</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{nutritionSummary.calories} kcal</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-slate-500">Meal Count</p>
          <p className="mt-3 text-3xl font-bold text-slate-950">{meals.length}</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Weekly Trend">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyCalories}>
                <defs>
                  <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="calories" stroke="#16A34A" fill="url(#weeklyFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Monthly Trend">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="calories" stroke="#22C55E" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="protein" stroke="#16A34A" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <ChartCard title="Macros">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={macroData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={4}>
                  {macroData.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Meal Type Breakdown">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mealDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="meal" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#22C55E" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <ChartCard title="Top Foods">
          <div className="space-y-3">
            {topFoods.map((food) => (
              <div key={food.food} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="capitalize text-slate-700">{food.food}</span>
                <span className="font-semibold text-slate-950">{food.count}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Nutrition Summary">
          <div className="space-y-3">
            {[
              ['Calories', nutritionSummary.calories],
              ['Protein', nutritionSummary.protein],
              ['Carbs', nutritionSummary.carbs],
              ['Fat', nutritionSummary.fat],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-slate-700">{label}</span>
                <span className="font-semibold text-slate-950">{value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Prediction Confidence">
          <div className="flex h-72 items-center justify-center">
            <div className="text-center">
              <p className="text-5xl font-bold text-brand-700">{averageConfidence}%</p>
              <p className="mt-2 text-sm text-slate-500">Average across saved meals</p>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
