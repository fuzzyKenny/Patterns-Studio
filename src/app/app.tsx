import { PatternStudio } from "../components/pattern-studio";

export default function App() {
  return (
    <main className="h-screen overflow-hidden bg-[var(--studio-app-bg)] text-white">
      <div className="flex h-screen flex-col overflow-hidden bg-[var(--studio-shell)]">
        <PatternStudio />
      </div>
    </main>
  );
}
