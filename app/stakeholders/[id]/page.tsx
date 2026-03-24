'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function StakeholderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [stakeholder, setStakeholder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStakeholder = async () => {
      const { data } = await supabase
        .from('Stakeholders')
        .select('*')
        .eq('id', id)
        .single();

      setStakeholder(data);
      setLoading(false);
    };

    if (id) fetchStakeholder();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this stakeholder?')) return;

    await supabase.from('Stakeholders').delete().eq('id', id);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="p-6 text-slate-500">Loading stakeholder...</div>
    );
  }

  if (!stakeholder) {
    return (
      <div className="p-6 text-slate-500">Stakeholder not found.</div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-[1fr_220px] gap-8">

        {/* LEFT: CONTENT */}
        <div className="space-y-6">

          {/* Header Card */}
          <div className="rounded-2xl bg-white shadow-sm p-6">
            <h1 className="text-2xl font-semibold text-slate-900">
              {stakeholder.name}
            </h1>
            <p className="text-slate-500 mt-1">
              {stakeholder.role || 'No role specified'}
            </p>
          </div>

          {/* Summary */}
          <div className="rounded-2xl bg-white shadow-sm p-6">
            <h2 className="text-sm font-medium text-slate-400 mb-2">
              Summary
            </h2>
            <p className="text-slate-700">
              {stakeholder.summary || 'No summary provided.'}
            </p>
          </div>

          {/* Metadata */}
          <div className="rounded-2xl bg-white shadow-sm p-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Status</span>
              <p className="text-slate-800 capitalize">
                {stakeholder.status || 'unknown'}
              </p>
            </div>

            <div>
              <span className="text-slate-400">Sentiment</span>
              <p className="text-slate-800">
                {stakeholder.ai_sentiment || 'Not analysed'}
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex flex-col gap-3">

          <button
            onClick={() => router.push('/dashboard')}
            className="min-w-[140px] w-full rounded-xl bg-slate-100 text-slate-700 px-4 py-2 text-sm hover:bg-slate-200 transition"
          >
            Back
          </button>

          <button
            onClick={() => router.push(`/stakeholders/${id}/edit`)}
            className="min-w-[140px] w-full rounded-xl bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 transition"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            className="min-w-[140px] w-full rounded-xl bg-rose-100 text-rose-600 px-4 py-2 text-sm hover:bg-rose-200 transition"
          >
            Delete
          </button>

        </div>

      </div>
    </div>
  );
}