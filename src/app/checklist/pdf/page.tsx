'use client';

// Client component for print functionality
// SEO handled via parent layout

export default function ChecklistPDFPage() {
  return (
    <main className="min-h-screen bg-white text-black p-8 print:p-4">
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Print Button - Hidden on print */}
      <div className="no-print mb-8 text-center">
        <button
          onClick={() => window.print()}
          className="bg-black text-white px-6 py-3 rounded font-medium hover:bg-gray-800"
        >
          Download as PDF (Ctrl+P → Save as PDF)
        </button>
        <p className="text-gray-500 text-sm mt-2">
          Or right-click → Print → Save as PDF
        </p>
      </div>

      {/* PDF Content */}
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pb-8 border-b-2 border-black">
          <h1 className="text-3xl font-bold mb-2">
            THE 10-POINT SHOPIFY<br />SPEED CHECKLIST
          </h1>
          <p className="text-gray-600">
            Find what's slowing your store in 5 minutes
          </p>
          <p className="text-sm text-gray-400 mt-2">
            by Theo Daudebourg | theodaudebourg.com
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-8">
          <p className="text-gray-700">
            Every second of delay costs you <strong>7% of conversions</strong>. Use this checklist to identify the common speed killers in your Shopify store. No tools required - just your browser.
          </p>
        </div>

        {/* Checklist Items */}
        <div className="space-y-6">
          <ChecklistItem
            number={1}
            title="Check Your PageSpeed Score"
            description="Go to pagespeed.web.dev, enter your store URL, and run a mobile test."
            action="Write down your score: _____ /100"
            tip="Under 50 = Critical | 50-89 = Needs Work | 90+ = Good"
          />

          <ChecklistItem
            number={2}
            title="Count Your Installed Apps"
            description="Go to Settings → Apps and sales channels. Count every app."
            action="Total apps installed: _____"
            tip="Aim for under 10 active apps. Each app adds JavaScript that slows you down."
          />

          <ChecklistItem
            number={3}
            title="Check Image File Sizes"
            description="Right-click any product image → Open in new tab. Check if URL shows large dimensions."
            action="Are images over 500KB? ☐ Yes ☐ No"
            tip="Product images should be under 200KB. Hero images under 500KB."
          />

          <ChecklistItem
            number={4}
            title="Test Mobile Load Time"
            description="Open your store on your phone using mobile data (not WiFi). Count the seconds until you can interact."
            action="Mobile load time: _____ seconds"
            tip="If it takes more than 3 seconds, you're losing 53% of visitors."
          />

          <ChecklistItem
            number={5}
            title="Check for Unused Apps"
            description="Look through your app list. Mark any you haven't used in 30+ days."
            action="Unused apps to remove: _____"
            tip="Uninstalled apps can still leave code behind. Ask a dev to clean up."
          />

          <ChecklistItem
            number={6}
            title="Review Hero Section"
            description="Is your hero image/video autoplaying a large file? Is there a slider with multiple images?"
            action="Hero issues found: ☐ Video ☐ Slider ☐ Large image ☐ None"
            tip="Sliders and autoplay videos are conversion killers AND speed killers."
          />

          <ChecklistItem
            number={7}
            title="Check Third-Party Scripts"
            description="View page source (Ctrl+U) and search for 'script src'. Count external domains."
            action="External scripts found: _____"
            tip="Each external script is a potential bottleneck. Common culprits: chat widgets, analytics, pixels."
          />

          <ChecklistItem
            number={8}
            title="Test Collection Page Load"
            description="Go to your largest collection. Does it try to load all products at once?"
            action="Products loading at once: _____"
            tip="Pagination or 'Load More' buttons are faster than infinite scroll."
          />

          <ChecklistItem
            number={9}
            title="Check for Layout Shift"
            description="Load your homepage and watch if elements jump around as images load."
            action="Layout shift issues: ☐ Yes ☐ No"
            tip="This hurts both UX and your Core Web Vitals score."
          />

          <ChecklistItem
            number={10}
            title="Review Your Theme"
            description="When was your theme last updated? Is it a premium theme or free?"
            action="Theme: _____ | Last updated: _____"
            tip="Old or heavily customized themes often have performance debt."
          />
        </div>

        {/* Scoring */}
        <div className="mt-10 p-6 bg-gray-100 rounded print:border print:border-gray-300">
          <h2 className="text-xl font-bold mb-4">Your Score</h2>
          <p className="mb-4">Count how many issues you found:</p>
          <ul className="space-y-2 text-sm">
            <li><strong>0-2 issues:</strong> Your store is in good shape. Minor optimizations possible.</li>
            <li><strong>3-5 issues:</strong> Room for improvement. A Speed Sprint would help.</li>
            <li><strong>6+ issues:</strong> Speed is costing you sales. Prioritize fixing this.</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-10 text-center p-6 border-2 border-black rounded">
          <h2 className="text-xl font-bold mb-2">Need Help Fixing This?</h2>
          <p className="text-gray-600 mb-4">
            Get a professional Speed Audit with fixes included.
          </p>
          <p className="font-mono text-lg font-bold">
            theodaudebourg.com/speed-audit
          </p>
          <p className="text-sm text-gray-500 mt-2">$197 | 48-hour turnaround | Money-back guarantee</p>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-center text-sm text-gray-400">
          <p>© Theo Daudebourg | 7+ years | 70+ stores optimized</p>
          <p>theodaudebourg.com</p>
        </div>
      </div>
    </main>
  );
}

function ChecklistItem({
  number,
  title,
  description,
  action,
  tip,
}: {
  number: number;
  title: string;
  description: string;
  action: string;
  tip: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-1">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">{description}</p>
        <p className="font-mono text-sm bg-gray-100 px-3 py-2 rounded mb-2 print:border">
          {action}
        </p>
        <p className="text-xs text-gray-500 italic">💡 {tip}</p>
      </div>
    </div>
  );
}
