import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', className = '', as = 'button', ...props }) {
  const variants = {
    primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500',
    secondary: 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:ring-brand-500',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300',
  };

  const Component = motion[as] || motion.button;

  return (
    <Component
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
