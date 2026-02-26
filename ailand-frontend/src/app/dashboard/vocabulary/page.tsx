import { VocabularyDashboard } from "@/components/vocabulary/VocabularyDashboard";
import { Main } from "@/components/layout/main";

export default function VocabularyPage() {
  return (
    <Main fixed className="pt-2">
      <VocabularyDashboard />
    </Main>
  );
}
