function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">🛵</span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AppDelivery</h1>
      </div>
      <p className="max-w-md text-slate-600">
        Base del frontend lista: React + TypeScript + Tailwind CSS v4 con Vite.
      </p>
      <button
        type="button"
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        Empezar
      </button>
    </main>
  )
}

export default App
