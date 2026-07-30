import { useState } from 'react';
import { Eye, EyeOff, Chrome } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerAccount({
        username: data.email.split('@')[0],
        fullName: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Unable to create account');
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Set up your NutriVisionAI workspace.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Full name" placeholder="Aarav Sharma" {...register('name', { required: true })} />
        <Input label="Email" type="email" placeholder="you@example.com" {...register('email', { required: true })} />
        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" {...register('password', { required: true })} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-10 text-slate-500">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button type="submit" className="w-full">
          Create account
        </Button>
        <Button type="button" variant="secondary" className="w-full gap-2">
          <Chrome className="h-4 w-4" />
          Sign up with Google
        </Button>
        <p className="text-center text-sm text-slate-600">
          Already have an account? <a href="/login" className="font-semibold text-brand-700">Sign in</a>
        </p>
      </form>
    </AuthShell>
  );
}
