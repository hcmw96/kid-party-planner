import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import balloonHero from "@/assets/balloon-hero.png";
import { Field } from "@/components/design/Field";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") === "/create" ? "/create" : "/parties";
  const savingParty = next === "/create";

  useEffect(() => {
    if (!authLoading && user) navigate(next, { replace: true });
  }, [user, authLoading, navigate, next]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await signUp(email, password);
        if (error) throw error;
        if (data.session) {
          toast.success("Account created");
          navigate(next);
        } else {
          toast.success(
            savingParty
              ? "Account created. Check your email to confirm, then log in. Your party is still on this phone."
              : "Account created. Check your email to confirm, then log in.",
          );
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate(next);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-scrollable h-full bg-[#F9F7FC]">
      <div className="mx-auto flex min-h-full w-full max-w-sm flex-col px-5 py-6">
        <Link to="/" className="text-[15px] font-semibold text-[#71677F]">
          Back
        </Link>
        <img src={balloonHero} alt="" className="mx-auto mt-6 h-24 w-24 object-contain motion-safe:animate-float" />
        <div className="mt-6">
          <h1 className="text-[2rem] font-extrabold tracking-[-0.045em] text-[#282035]">
            {savingParty ? "Save your party" : isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-[#71677F]">
            {savingParty
              ? "The party is not saved until you tap Create party. An account keeps it, and it's free."
              : isSignUp
                ? "Free to start. You'll use this to manage the party."
                : "Log in to see your parties."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            placeholder="At least 6 characters"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button type="submit" className="ink-button" disabled={loading}>
            {loading ? "One moment…" : isSignUp ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-[14px] text-[#71677F]">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => setIsSignUp(false)} className="font-bold text-[#282035]">
                Log in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button type="button" onClick={() => setIsSignUp(true)} className="font-bold text-[#282035]">
                Create an account, it's free
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
