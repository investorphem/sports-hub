export default function Header() {
  return (
    <header className="p-4 bg-slate-900 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center font-bold">SH</div>
        <h1 className="text-lg font-semibold">SportsHub</h1>
      </div>
      <div id="wallet-area" />
    </header>
  );
}
