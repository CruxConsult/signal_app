export default function Loading() {
    return (
      <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc,#eef2f7)] px-6 py-10 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 h-14 w-40 animate-pulse rounded-full bg-slate-200/70" />
  
          <div className="rounded-[28px] border border-white/60 bg-white/80 p-8 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-6 h-8 w-64 animate-pulse rounded-xl bg-slate-200/70" />
            <div className="mb-3 h-5 w-96 animate-pulse rounded-xl bg-slate-200/60" />
            <div className="mb-8 h-5 w-80 animate-pulse rounded-xl bg-slate-200/60" />
  
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-36 animate-pulse rounded-[24px] bg-slate-200/60" />
              <div className="h-36 animate-pulse rounded-[24px] bg-slate-200/60" />
              <div className="h-36 animate-pulse rounded-[24px] bg-slate-200/60" />
              <div className="h-36 animate-pulse rounded-[24px] bg-slate-200/60" />
            </div>
          </div>
        </div>
      </main>
    );
  }