import { useState } from 'react';
import { Download, RefreshCcw, Trash2, Bell, BellOff } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { mealService } from '../../services/mealService';
import { profileService } from '../../services/profileService';
import { settingsService } from '../../services/settingsService';
import { exportService } from '../../services/exportService';
import { toastService } from '../../services/toastService';
import useMeals from '../../hooks/useMeals';
import { useSettings } from '../../context/SettingsContext';

const unitOptions = [
  { value: 'metric', label: 'Metric' },
  { value: 'imperial', label: 'Imperial' },
];

export default function Settings() {
  const meals = useMeals();
  const { settings, setSettings } = useSettings();
  const [confirmAction, setConfirmAction] = useState(null);

  const updateSettings = async (nextSettings) => {
    try {
      const savedSettings = await settingsService.saveSettings(nextSettings);
      setSettings(savedSettings);
    } catch {
      toastService.error('Save failed', 'The settings could not be stored in the database.');
    }
  };

  const clearHistory = () => {
    setConfirmAction('clearHistory');
  };

  const resetProfile = () => {
    setConfirmAction('resetProfile');
  };

  const exportData = () => {
    if (!meals.length) {
      toastService.warning('No meals to export', 'Save at least one meal before exporting CSV data.');
      return;
    }

    exportService.exportMealsToCsv(meals);
    toastService.success('Export started', 'Meal history CSV download has started.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Adjust appearance, units, reminders, and server-backed data actions."
        actions={
          <Button variant="secondary" onClick={exportData}>
            <Download className="mr-2 h-4 w-4" />
            Export data
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Appearance</p>
          <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-800">
            <p className="text-sm font-semibold">Light Mode</p>
            <p className="mt-1 text-sm">NutriVisionAI now stays in light mode only.</p>
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Preferences</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {unitOptions.map((unit) => (
              <button
                key={unit.value}
                type="button"
                onClick={() => updateSettings({ ...settings, units: unit.value })}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  settings.units === unit.value
                    ? 'border-brand-200 bg-brand-50 text-brand-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <p className="text-sm font-semibold">{unit.label}</p>
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {[
              { key: 'notifications', label: 'Notifications', icon: Bell, offIcon: BellOff },
              { key: 'reminders', label: 'Reminders', icon: Bell, offIcon: BellOff },
            ].map((item) => {
              const active = Boolean(settings[item.key]);
              const Icon = active ? item.icon : item.offIcon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => updateSettings({ ...settings, [item.key]: !active })}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-slate-300"
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-brand-700" />
                    <span className="text-sm font-medium text-slate-800">{item.label}</span>
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      active ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {active ? 'On' : 'Off'}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Application</p>
          <div className="mt-4 space-y-3">
            <Button variant="secondary" onClick={clearHistory} className="w-full gap-2">
              <Trash2 className="h-4 w-4" />
              Clear meal history
            </Button>
            <Button variant="secondary" onClick={resetProfile} className="w-full gap-2">
              <RefreshCcw className="h-4 w-4" />
              Reset profile
            </Button>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Current State</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Theme</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">light</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Units</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{settings.units}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Saved Meals</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">{meals.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={Boolean(confirmAction)}
        title={
          confirmAction === 'clearHistory' ? 'Clear meal history?' : 'Reset profile?'
        }
        description={
          confirmAction === 'clearHistory'
            ? 'This permanently deletes all saved meals from your account.'
            : 'This restores the profile fields to their default account values.'
        }
        confirmLabel={confirmAction === 'clearHistory' ? 'Clear history' : 'Reset profile'}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (confirmAction === 'clearHistory') {
            try {
              await mealService.clearMeals();
              toastService.success('Meal history cleared', 'All meal records were removed from your account.');
            } catch {
              toastService.error('Clear failed', 'Meal history could not be removed.');
            }
          }
          if (confirmAction === 'resetProfile') {
            try {
              await profileService.resetProfile();
              toastService.info('Profile reset', 'Your profile data has been restored.');
            } catch {
              toastService.error('Reset failed', 'Profile could not be reset.');
            }
          }
          setConfirmAction(null);
        }}
      />
    </div>
  );
}
