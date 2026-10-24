import { useEffect } from "react";
import { defaultConfig } from "@/config/defaultConfig";

export default function App() {
  const { name } = defaultConfig.persona;

  useEffect(() => {
    document.title = name;
  }, [name]);

  return (
    <main className="grid min-h-screen place-items-center border-line-subtle bg-canvas font-sans text-ink-primary">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold">{name}</h1>
        <p>الـ foundation check جاهز، الإصدار 1.</p>
        <time className="font-mono" dir="ltr">
          14:52
        </time>
      </div>
    </main>
  );
}
