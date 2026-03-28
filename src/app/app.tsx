import { PatternStudio } from "../components/pattern-studio";

export default function App() {
  return (
    <main className="min-h-dvh overflow-y-auto bg-[var(--studio-app-bg)] text-white xl:h-dvh xl:min-h-0 xl:overflow-hidden">
      <div className="flex min-h-dvh flex-col bg-[var(--studio-shell)] xl:h-full xl:min-h-0 xl:overflow-hidden">
        <PatternStudio />
      </div>
    </main>
  );
}
