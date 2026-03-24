import { Button } from '@/components/ui/Button';

const App = () => {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(176,222,200,0.4),_transparent_35%),linear-gradient(180deg,_#f8fcfa_0%,_#eef6f1_100%)] px-6 py-16 text-slate-900">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-soft backdrop-blur md:p-12">
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
            TestCSS
          </span>
          <div className="space-y-3">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              MoneyTrack
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Initial setup
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button>Primary button</Button>
          <Button variant="secondary">Secondary button</Button>
        </div>
      </section>
    </main>
  );
}

export default App;
