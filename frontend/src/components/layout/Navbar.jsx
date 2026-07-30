import { HeartPulse, Menu, Sparkles } from 'lucide-react';
import Button from '../common/Button';

const links = [
  ['Features', '#features'],
  ['How it Works', '#how-it-works'],
  ['Testimonials', '#testimonials'],
  ['FAQ', '#faq'],
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3 text-slate-900">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold">NutriVisionAI</span>
            <span className="block text-xs text-slate-500">Food intelligence platform</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="text-sm font-medium text-slate-600 transition hover:text-brand-700">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button as="a" href="/login" variant="secondary">
            Log in
          </Button>
          <Button as="a" href="/register" variant="primary">
            Sign up
          </Button>
          <Button as="a" href="/dashboard" variant="secondary">
            <Sparkles className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>

        <button className="rounded-full border border-slate-200 bg-white p-3 text-slate-700 md:hidden">
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
