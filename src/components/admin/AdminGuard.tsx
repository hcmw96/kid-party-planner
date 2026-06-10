import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdmin";

interface Props {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: Props) => {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
    if (!authLoading && !adminLoading && user && isAdmin === false) {
      navigate("/", { replace: true });
    }
  }, [authLoading, adminLoading, user, isAdmin, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-2 w-48">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-foreground rounded-full animate-[loading_1.2s_ease-in-out_infinite]" style={{ width: "40%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return <>{children}</>;
};

export default AdminGuard;
