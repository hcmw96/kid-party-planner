import { useNavigate } from "react-router-dom";
import GardenDemo from "@/components/example/GardenDemo";

const ExampleParty = () => {
  const navigate = useNavigate();

  return (
    <div className="page-scrollable h-full bg-[#F3EBDD]">
      <GardenDemo onBack={() => navigate("/")} />
    </div>
  );
};

export default ExampleParty;
