import { Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <h3 className="font-display text-2xl font-bold">NutriVisionAI</h3>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
            A food recognition interface built with a restrained product aesthetic and a clean backend integration path.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Quick Links</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-950">Features</a>
            <a href="#benefits" className="hover:text-slate-950">Benefits</a>
            <a href="#faq" className="hover:text-slate-950">FAQ</a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Connect</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            <a href="https://github.com" className="inline-flex items-center gap-2 hover:text-slate-950">
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a href="https://linkedin.com" className="inline-flex items-center gap-2 hover:text-slate-950">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
            <a href="mailto:hello@nutrivisionai.com" className="inline-flex items-center gap-2 hover:text-slate-950">
              <Mail className="h-4 w-4" /> Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
