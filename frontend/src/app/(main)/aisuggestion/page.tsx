import AITradingSuggestions from "@/components/aisuggestion/AIsuggestion";
import AiTradeDashboard from "@/components/aiReport/AiTradeDashboard";

export default function AIPage() {
  // const [realProfile, setRealProfile] = useState(false);

  return (
    <>
      <AITradingSuggestions />
      <AiTradeDashboard />
    </>
  );
}
