import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import loginBg from "@/assets/login-bg.svg";

const underlineBase =
  "w-full border-0 border-b bg-transparent px-0 py-2 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-colors duration-200 font-sans";
const underlineIdle = "border-muted-foreground/30";
const underlineFilled = "border-foreground";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/create");
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (value: string) =>
    `${underlineBase} ${value ? underlineFilled : underlineIdle}`;

  return (
    <div
      className="h-full flex items-center justify-center px-6 overflow-hidden animate-fade-in relative"
      style={{ backgroundImage: `url(${loginBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-background/60" />
      <div className="w-full max-w-sm space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center">
          <span className="text-2xl font-serif font-bold tracking-wide text-foreground">PartyPal</span>
        </div>
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-serif italic text-foreground">
            {isSignUp ? "Create account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-sans">
            {isSignUp ? "Sign up to start organising" : "Log in to manage your parties"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass(email)}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-sans">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors font-sans"
                >
                  Forgot?
                </button>
              )}
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass(password)}
            />
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-foreground text-background text-sm uppercase tracking-[0.15em] font-sans font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none hover:bg-foreground/90"
            >
              {loading ? "Loading..." : isSignUp ? "Create account" : "Log in"}
            </button>
          </div>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground font-sans">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-foreground underline underline-offset-4 hover:text-foreground/80"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              No account?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-foreground underline underline-offset-4 hover:text-foreground/80"
              >
                Create one — it's free
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
