import { useEffect, useMemo, useState } from 'react';
import { Camera, Save, RotateCcw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { profileService } from '../../services/profileService';
import { settingsService } from '../../services/settingsService';
import { toastService } from '../../services/toastService';
import { calculateBMI, calculateBMR, calculateDailyCalories } from '../../utils/health';
import { useSettings } from '../../context/SettingsContext';

const genderOptions = ['Prefer not to say', 'Male', 'Female', 'Non-binary'];
const goalOptions = ['Lose Weight', 'Maintain', 'Gain Muscle'];
const activityOptions = ['Sedentary', 'Light', 'Moderate', 'Active', 'VeryActive'];

export default function Profile() {
  const [profile, setProfile] = useState(profileService.getProfile());
  const { settings } = useSettings();

  useEffect(() => {
    setProfile(profileService.getProfile());
  }, []);

  const metrics = useMemo(() => {
    const bmi = calculateBMI(profile.height, profile.weight, settings.units);
    const bmr = calculateBMR(profile, settings.units);
    const dailyCalories = calculateDailyCalories(profile, settings.units);

    return { bmi, bmr, dailyCalories };
  }, [profile, settings.units]);

  const handleChange = (key) => (event) => {
    setProfile((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((current) => ({ ...current, profileImage: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      const savedProfile = await profileService.saveProfile(profile);
      setProfile(savedProfile);
      toastService.success('Profile saved', 'Your profile details are stored securely.');
    } catch {
      toastService.error('Save failed', 'The profile could not be stored in the database.');
    }
  };

  const handleReset = async () => {
    try {
      const nextProfile = await profileService.resetProfile();
      setProfile(nextProfile);
      toastService.info('Profile reset', 'Profile data returned to the default server state.');
    } catch {
      toastService.error('Reset failed', 'The profile could not be reset.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Keep your personal nutrition profile editable and stored on your account."
        actions={
          <>
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save profile
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-slate-100 ring-4 ring-white">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-slate-400">
                    {profile.fullName?.slice(0, 1) || 'U'}
                  </span>
                )}
              </div>
              <label
                htmlFor="profile-image"
                className="absolute -bottom-1 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow-sm"
                aria-label="Upload profile image"
              >
                <Camera className="h-4 w-4" />
                <input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-950">{profile.fullName || 'Your name'}</h2>
              <p className="text-sm text-slate-500">{profile.email || 'your@email.com'}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-sm text-slate-500">BMI</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{metrics.bmi || '—'}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500">BMR</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{metrics.bmr || '—'}</p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-slate-500">Daily Calories</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{metrics.dailyCalories || '—'}</p>
            </Card>
          </div>
        </Card>

        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Full Name" value={profile.fullName} onChange={handleChange('fullName')} />
            <Input label="Email" value={profile.email} onChange={handleChange('email')} />
            <Input label="Phone" value={profile.phone} onChange={handleChange('phone')} />
            <Input label="Age" type="number" value={profile.age} onChange={handleChange('age')} />
            <Select label="Gender" value={profile.gender} onChange={handleChange('gender')}>
              {genderOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
            <Select label="Daily Goal" value={profile.dailyGoal} onChange={handleChange('dailyGoal')}>
              {goalOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </Select>
            <Input label="Height" value={profile.height} onChange={handleChange('height')} />
            <Input label="Weight" value={profile.weight} onChange={handleChange('weight')} />
            <Select label="Activity Level" value={profile.activityLevel} onChange={handleChange('activityLevel')}>
              {activityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-950">Profile completion</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{ width: `${Math.min(100, Math.round((Object.values(profile).filter(Boolean).length / Object.keys(profile).length) * 100))}%` }}
              />
            </div>
          </div>

          {!profile.fullName && !profile.email ? (
            <div className="mt-6">
              <EmptyState
                variant="subtle"
                title="Profile is empty"
                description="Add your information to personalize calorie goals and health metrics."
              />
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
