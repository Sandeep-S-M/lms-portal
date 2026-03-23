import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-64 bg-blue-400/20 blur-[100px] rounded-full pointer-events-none -z-10" />
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl">
        Master new skills with <span className="text-blue-600">collaborative</span> online learning.
      </h1>
      <p className="text-lg text-slate-600 mb-10 max-w-2xl leading-relaxed">
        Access curated tutorials, track your progress, and learn together. A minimalist platform designed to keep you focused on what matters: the content.
      </p>
      <div className="flex items-center gap-4">
        <Link href="/subjects" className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">
          Browse Subjects
        </Link>
        <Link href="/auth/register" className="px-6 py-3 rounded-full bg-white text-slate-700 font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
          Create an Account
        </Link>
      </div>
    </main>
  );
}
