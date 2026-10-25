import { useEffect, useState } from "react";
import { defaultConfig } from "@/config/defaultConfig";
import { MochiAvatar } from "@/features/character/MochiAvatar";
import { MochiGallery } from "@/features/character/gallery/MochiGallery";

export default function App() {
  const { name } = defaultConfig.persona;
  const [showGallery, setShowGallery] = useState(
    () => window.location.hash === "#gallery",
  );

  useEffect(() => {
    document.title = name;
    const updateRoute = () =>
      setShowGallery(window.location.hash === "#gallery");
    window.addEventListener("hashchange", updateRoute);

    return () => window.removeEventListener("hashchange", updateRoute);
  }, [name]);

  if (showGallery) return <MochiGallery />;

  return (
    <main className="grid min-h-screen place-items-center border-line-subtle bg-canvas font-sans text-ink-primary">
      <MochiAvatar
        state="idle"
        label={defaultConfig.accessibility.characterLabel}
      />
    </main>
  );
}
