import { useEffect, useState } from "react";
import { defaultConfig } from "@/config/defaultConfig";
import { MochiGallery } from "@/features/character/gallery/MochiGallery";
import { Stage } from "@/features/stage/Stage";

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

  return <Stage />;
}
