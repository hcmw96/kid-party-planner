import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEvent } from "@/hooks/useEvent";
import GuestInvite from "@/components/GuestInvite";

const PartyPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEvent(eventId);
  const cameFromApp = location.key !== "default";

  if (isLoading) {
    return (
      <div className="page-scrollable h-full bg-[#F9F7FC]">
        <div className="mx-auto max-w-md space-y-4 px-5 py-16">
          <div className="h-56 animate-pulse rounded-[24px] bg-[#EAE2F8]" />
          <div className="mx-auto h-8 w-2/3 animate-pulse rounded-full bg-[#EAE2F8]" />
          <div className="h-14 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F9F7FC] px-6 text-center">
        <div>
          <p className="text-[1.4rem] font-extrabold tracking-[-0.04em] text-[#282035]">We can't find that party</p>
          <p className="mt-2 text-[15px] text-[#71677F]">The link may have been mistyped.</p>
          <Link to="/" className="ink-button mt-8">
            Back to PartyPal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-scrollable h-full bg-[#F9F7FC]">
      <GuestInvite event={event} onBack={cameFromApp ? () => navigate(-1) : undefined} />
    </div>
  );
};

export default PartyPage;
