import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    try {
      await login({ email: data.email, password: data.password });
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error?.response?.data?.error || 'Unable to sign in');
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue to your nutrition dashboard.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Email" type="email" placeholder="you@example.com" {...register('email', { required: true })} />
        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password', { required: true })} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-10 text-slate-500">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" className="rounded border-slate-300 text-brand-600" />
            Remember me
          </label>
          <a href="/forgot-password" className="font-medium text-brand-700 hover:text-brand-800">
            Forgot password?
          </a>
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
        <Button type="button" variant="secondary" className="w-full gap-2">
          <Chrome className="h-4 w-4" />
          Continue with Google
        </Button>
        <p className="text-center text-sm text-slate-600">
          New here? <a href="/register" className="font-semibold text-brand-700">Create an account</a>
        </p>
      </form>
    </AuthShell>
  );
}
