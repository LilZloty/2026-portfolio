import { Metadata } from 'next';
import { SpeedCheckTool } from '@/components/speed-check';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Free Speed Check | Theo Daudebourg',
  description: 'Check your Shopify store speed for free. Get your PageSpeed score and top issues in 30 seconds. No email required.',
  openGraph: {
    title: 'Free Shopify Speed Check',
    description: 'Get your PageSpeed score and top issues in 30 seconds.',
    type: 'website',
  },
};

export default function SpeedCheckPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-silver-500 hover:text-lime-neon mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        {/* Speed Check Tool */}
        <SpeedCheckTool />

        {/* Why Speed Matters */}
        <div className="mt-16 text-center">
          <h2 className="heading-md text-white mb-6">
            WHY SPEED MATTERS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              number="7%"
              label="conversion loss"
              description="per second of delay"
            />
            <StatCard
              number="53%"
              label="visitors leave"
              description="if load time > 3 seconds"
            />
            <StatCard
              number="2x"
              label="lower bounce rate"
              description="for fast-loading stores"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-silver-500 mb-4">
            Want the fixes, not just the diagnosis?
          </p>
          <Link href="/speed-audit" className="btn-primary inline-block">
            Get Your Full Speed Audit - $197
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatCard({ number, label, description }: { number: string; label: string; description: string }) {
  return (
    <div className="glass-card p-6 text-center">
      <p className="text-3xl font-mono font-bold text-lime-neon mb-1">{number}</p>
      <p className="text-white font-medium">{label}</p>
      <p className="text-silver-500 text-sm">{description}</p>
    </div>
  );
}
