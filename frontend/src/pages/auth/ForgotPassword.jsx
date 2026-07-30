import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import AuthShell from './AuthShell';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const { register, handleSubmit } = useForm();

  return (
    <AuthShell title="Reset your password" subtitle="We’ll send a reset link to your email.">
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (data) => {
          try {
            await authService.requestPasswordReset(data.email);
            toast.success('Reset link request sent');
          } catch {
            toast.success('Reset link request sent');
          }
        })}
      >
        <Input label="Email" type="email" placeholder="you@example.com" {...register('email', { required: true })} />
        <Button type="submit" className="w-full gap-2">
          <Mail className="h-4 w-4" />
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}

