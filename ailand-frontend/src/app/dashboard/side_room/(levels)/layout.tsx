import { LevelProvider } from "@/components/levels/LevelContext";
import ProgLifesClient from "@/components/levels/ProgLifesClient";
import GlobalLevelPopup from "@/components/levels/GlobalLevelPopup";


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <LevelProvider>
      <div className="min-h-screen px-10 py-7">
        <ProgLifesClient />

        <GlobalLevelPopup />

        {children}
      </div>
    </LevelProvider>
  );
}
