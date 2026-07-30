import Card from '../common/Card';
import SectionTitle from '../common/SectionTitle';

export default function HealthTips({ healthTips, dietRecommendation, exerciseRecommendation }) {
  const items = healthTips?.length
    ? healthTips
    : ['Healthy tips will appear here from the backend.', 'Exercise suggestions will be shown here.', 'Diet guidance will be displayed here.'];

  return (
    <section id="tips" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Health Tips"
          title="Actionable guidance for the next version"
          description="These cards are placeholders for future backend recommendations and can expand without redesign."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <Card key={item} className="p-6">
              <p className="text-lg font-semibold text-slate-950">{item}</p>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">Diet Recommendation</p>
            <p className="mt-3 text-base leading-7 text-slate-600">{dietRecommendation || 'Diet recommendation will appear here.'}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">Exercise Recommendation</p>
            <p className="mt-3 text-base leading-7 text-slate-600">
              {exerciseRecommendation || 'Exercise suggestion will appear here.'}
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
