// Temporary home page. The real Check box comes in the next commits.
const STAGES = [
  "Hook",
  "Trust",
  "Fake app",
  "Fake profit",
  "Pressure",
  "Blocked",
  "Exposed",
  "Recovery scam",
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-10 px-5 py-12">
      <p className="text-sm tracking-[0.2em] text-ink-soft uppercase">सतर्क · Satark</p>
      <h1 className="font-serif text-5xl leading-tight font-bold sm:text-6xl">
        Pause before <span className="text-stamp">you pay.</span>
      </h1>
      <p className="max-w-xl text-lg text-ink-soft">
        A scam is a story with eight chapters. Satark tells you which chapter you are in, what the
        scammer will do next, and the one safe thing to do now.
      </p>
      <ol className="flex flex-wrap gap-2" aria-label="The eight stages of the scam">
        {STAGES.map((name, i) => (
          <li
            key={name}
            className="rounded-full border border-ink/20 bg-paper-deep px-3 py-1 text-sm"
          >
            <span className="mr-1 font-bold text-stamp">{i + 1}</span>
            {name}
          </li>
        ))}
      </ol>
    </main>
  );
}
