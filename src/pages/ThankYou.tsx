import { Link, useParams } from "react-router-dom";
import balloonHero from "@/assets/balloon-hero.png";

const ThankYou = () => {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <div className="flex h-full items-center justify-center bg-[#F9F7FC] px-6">
      <div className="w-full max-w-sm text-center">
        <img src={balloonHero} alt="" className="mx-auto h-28 w-28 object-contain motion-safe:animate-float" />
        <h1 className="mt-4 text-[2rem] font-extrabold tracking-[-0.045em] text-[#282035]">Thank you</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#71677F]">
          Your contribution is in. The birthday star is going to love it.
        </p>
        <Link to={`/party/${eventId}`} className="ink-button mt-8">
          Back to the invitation
        </Link>
      </div>
    </div>
  );
};

export default ThankYou;
