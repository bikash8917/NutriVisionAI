import { useEffect, useMemo, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import TimelineItem from '../../components/dashboard/TimelineItem';
import EditMealModal from '../../components/dashboard/EditMealModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import useMeals from '../../hooks/useMeals';
import { mealService } from '../../services/mealService';
import { exportService } from '../../services/exportService';
import { toastService } from '../../services/toastService';
import { filterMealsByRange, mealRangeOptions } from '../../utils/mealRanges';

const sortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'calories', label: 'Calories' },
  { value: 'name', label: 'Name' },
];

const mealTypes = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function History() {
  const meals = useMeals();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [range, setRange] = useState('all');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState(null);

  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setRange(searchParams.get('range') || 'all');
  }, [searchParams]);

  const filteredMeals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const rangedMeals = filterMealsByRange(meals, range);

    return rangedMeals
      .filter((meal) => {
        const matchesSearch =
          !normalizedSearch ||
          meal.foodLabel?.toLowerCase().includes(normalizedSearch) ||
          meal.food?.toLowerCase().includes(normalizedSearch);
        const matchesMealType = mealType === 'All' || meal.mealType === mealType;
        return matchesSearch && matchesMealType;
      })
      .sort((left, right) => {
        if (sortBy === 'latest') return new Date(right.createdAt) - new Date(left.createdAt);
        if (sortBy === 'oldest') return new Date(left.createdAt) - new Date(right.createdAt);
        if (sortBy === 'calories') return Number(right.calories || 0) - Number(left.calories || 0);
        if (sortBy === 'name') return (left.foodLabel || left.food || '').localeCompare(right.foodLabel || right.food || '');
        return 0;
      });
  }, [meals, search, mealType, sortBy, range]);

  const handleDelete = (id) => {
    setMealToDelete(meals.find((meal) => meal.id === id) || null);
  };

  const handleEdit = (meal) => {
    setSelectedMeal(meal);
    setIsEditOpen(true);
  };

  const handleSave = async (updatedMeal) => {
    try {
      await mealService.updateMeal(updatedMeal);
      toastService.success('Meal updated', 'Dashboard, analytics, and history are synced automatically.');
      setSelectedMeal(null);
      setIsEditOpen(false);
    } catch {
      toastService.error('Update failed', 'The meal could not be updated in the database.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meal History"
        description="Review, search, filter, and export your saved meals."
        actions={
          <Button variant="secondary" onClick={() => exportService.exportMealsToCsv(meals)}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Input
          label="Search"
          placeholder="Search meals..."
          value={search}
          onChange={(event) => {
            const nextSearch = event.target.value;
            setSearch(nextSearch);
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('q', nextSearch);
            nextParams.set('range', range);
            setSearchParams(nextParams);
          }}
        />
        <Select label="Meal Type" value={mealType} onChange={(event) => setMealType(event.target.value)}>
          {mealTypes.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Select label="Sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          label="Range"
          value={range}
          onChange={(event) => {
            const nextRange = event.target.value;
            setRange(nextRange);
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set('q', search);
            nextParams.set('range', nextRange);
            setSearchParams(nextParams);
          }}
        >
          {mealRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Filter className="h-4 w-4" />
        {filteredMeals.length} meals match your current filters
      </div>

      <div className="space-y-4">
        {filteredMeals.length ? (
          filteredMeals.map((meal) => (
            <TimelineItem
              key={meal.id}
              meal={meal}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        ) : (
          <EmptyState
            variant="subtle"
            title="No meals found"
            description="Try a different search term, meal type, or sort order."
          />
        )}
      </div>

      <EditMealModal
        isOpen={isEditOpen}
        meal={selectedMeal}
        onClose={() => {
          setSelectedMeal(null);
          setIsEditOpen(false);
        }}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={Boolean(mealToDelete)}
        title="Delete meal?"
        description={`This will permanently remove ${mealToDelete?.foodLabel || mealToDelete?.food || 'this meal'} from your history.`}
        confirmLabel="Delete meal"
        onClose={() => setMealToDelete(null)}
        onConfirm={async () => {
          if (!mealToDelete) return;
          try {
            await mealService.deleteMeal(mealToDelete.id);
            toastService.success('Meal deleted', 'The meal was removed from your history.');
            setMealToDelete(null);
          } catch {
            toastService.error('Delete failed', 'The meal could not be removed from the database.');
          }
        }}
      />
    </div>
  );
}
