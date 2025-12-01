'use client';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="flex flex-col items-center gap-8 px-6 text-center">
        <h1 className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
          Podong
        </h1>
        <p className="max-w-md text-lg text-slate-400">프로젝트가 성공적으로 세팅되었어요! 🎉</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {[
            'Next.js 16',
            'Tailwind v4',
            'shadcn/ui',
            'React Query',
            'Axios',
            'Supabase',
            'React Hook Form',
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-400"
            >
              {tech}
            </span>
          ))}
        </div>
      </main>
    </div>
  );
}
