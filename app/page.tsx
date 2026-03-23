import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Stakeholder Intelligence MVP
            </h1>
            <p className="text-slate-600">
              Private stakeholder tracking and insight
            </p>
          </div>

          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700">
          <Link
  href="/login"
  className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
>
  Log in
</Link>
          </button>
        </header>

        <section className="text-slate-500">
          <p>No data yet — login to get started.</p>
        </section>
      </div>
    </main>
  );
}