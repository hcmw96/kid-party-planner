import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex h-full items-center justify-center bg-[#F9F7FC] px-6 text-center">
      <div>
        <h1 className="text-[2rem] font-extrabold tracking-[-0.045em] text-[#282035]">That page isn't here</h1>
        <p className="mt-2 text-[15px] text-[#71677F]">The link may have wandered off.</p>
        <Link to="/" className="ink-button mt-8">
          Back to PartyPal
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
