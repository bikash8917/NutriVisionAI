import { motion } from 'framer-motion';
import {
  BadgeCheck,
  BrainCircuit,
  ChartSpline,
  Leaf,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import Hero from '../components/hero/Hero';
import SectionTitle from '../components/common/SectionTitle';
import Card from '../components/common/Card';

const featureGroups = [
  {
    icon: ScanSearch,
    title: 'AI food recognition',
    text: 'Upload one image and get a clean prediction experience with future-proof API handling.',
  },
  {
    icon: Leaf,
    title: 'Nutrition-first design',
    text: 'Nutrition, quantity, and meal-saving states are already structured for backend expansion.',
  },
  {
    icon: ShieldCheck,
    title: 'Production-ready structure',
    text: 'Public pages, auth pages, and dashboard pages are separated for maintainability.',
  },
  {
    icon: Zap,
    title: 'Fast interaction flow',
    text: 'Loading, empty states, and transitions are tuned for a responsive product feel.',
  },
  {
    icon: BrainCircuit,
    title: 'Scalable data model',
    text: "Today's response and future nutrition payloads fit the same UI without redesigning later.",
  },
  {
    icon: ChartSpline,
    title: 'Analytics ready',
    text: 'Charts, trends, and progress views are already wired into the dashboard architecture.',
  },
];

const steps = [
  ['Upload', 'Drop a meal photo or choose a file.'],
  ['Predict', 'Send the image to Flask and receive a food label.'],
  ['Track', 'Add quantity, save the meal, and review history later.'],
];

const testimonials = [
  {
    name: 'Priya N.',
    role: 'Product Designer',
    quote: 'The layout feels like a serious health product instead of a school demo.',
  },
  {
    name: 'Rohit S.',
    role: 'Frontend Engineer',
    quote: 'The route structure and dashboard separation make the app feel much more real.',
  },
  {
    name: 'Meera A.',
    role: 'AI Engineer',
    quote: 'It is future-ready for nutrition, analytics, and recommendation payloads.',
  },
];

const faqs = [
  ['Does the UI support the current backend?', 'Yes. The upload flow is ready for POST /predict returning food and confidence.'],
  ['Will future nutrition data break the UI?', 'No. The structure already reserves room for nutrition, tips, and meal history.'],
  ['Is the dashboard separate from the landing page?', 'Yes. Public pages and dashboard pages use different layouts and navigation.'],
];

export default function Home() {
  return (
    <div className="space-y-16 pb-12">
      <Hero />

      <section id="features" className="section-shell py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="What it does"
            title="A cleaner AI nutrition product surface"
            description="This landing page is now deliberately separate from the dashboard, with a lighter marketing rhythm and stronger section contrast."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featureGroups.map(({ icon: Icon, title, text }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="h-full p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-shell bg-slate-950 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="How it works"
            title="A simple three-step flow"
            description="The public experience focuses on clarity, while the dashboard handles the heavier tracking and analytics work."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map(([title, text], index) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">0{index + 1}</p>
                <h3 className="mt-4 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="section-shell py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
          <Card className="p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Benefits</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-950">Built to scale with the backend, not fight it</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                'Clear auth and dashboard separation',
                'API-first data shapes',
                'Reusable UI primitives',
                'Motion only where it helps',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-brand-700" />
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-white p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Technology</p>
            <div className="mt-4 space-y-4">
              {['React 19', 'Vite', 'Tailwind CSS', 'Axios', 'Framer Motion', 'React Hook Form', 'Recharts'].map((tech) => (
                <div key={tech} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">{tech}</span>
                  <Sparkles className="h-4 w-4 text-brand-700" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section id="testimonials" className="section-shell py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Testimonials"
            title="What this kind of product should feel like"
            description="These short quotes help frame the product as a real portfolio piece rather than a template."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.name} className="p-6">
                <p className="text-sm leading-7 text-slate-600">“{item.quote}”</p>
                <div className="mt-5">
                  <p className="font-semibold text-slate-950">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section-shell py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Short answers keep the landing page grounded and help explain the current scope."
          />
          <div className="mt-8 grid gap-4">
            {faqs.map(([question, answer]) => (
              <Card key={question} className="p-6">
                <p className="text-lg font-semibold text-slate-950">{question}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
