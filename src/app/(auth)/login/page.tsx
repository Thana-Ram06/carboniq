"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Leaf, Eye, EyeOff, ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = signInSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, error, clearError } =
    useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (error) toast.error(error);
    return clearError;
  }, [error, clearError]);

  const signInForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignIn = async (data: SignInForm) => {
    await signInWithEmail(data.email, data.password);
  };

  const handleSignUp = async (data: SignUpForm) => {
    await signUpWithEmail(data.email, data.password, data.name);
  };

  const handleResetPassword = async () => {
    const email = signInForm.getValues("email");
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    await resetPassword(email);
    toast.success("Password reset email sent");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[45%] bg-card border-r border-border p-12 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-green-500/6 to-transparent blur-3xl" />

        <Link href="/" className="relative flex items-center gap-2.5 mb-16">
          <div className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-green-400" />
          </div>
          <span className="font-semibold text-foreground text-lg">
            Carbon<span className="text-green-400">IQ</span>
          </span>
        </Link>

        <div className="relative flex-1 flex flex-col justify-center max-w-sm">
          <h2 className="font-instrument-serif text-4xl text-foreground mb-4 leading-tight">
            AI-powered carbon intelligence for India&apos;s farmers
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-12">
            Monitor crops via satellite, estimate carbon impact, and build
            verification-ready data — all in one platform.
          </p>

          {/* Feature bullets */}
          {[
            "Satellite-powered NDVI monitoring",
            "AI carbon score estimation",
            "Farm boundary mapping",
            "Verification-ready reports",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 mb-3.5">
              <div className="w-5 h-5 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <span className="text-sm text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>

        <p className="relative text-xs text-muted-foreground/50">
          © 2025 CarbonIQ · Built for Indian agriculture
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-green-400" />
            </div>
            <span className="font-semibold text-foreground">
              Carbon<span className="text-green-400">IQ</span>
            </span>
          </Link>

          {mode === "signin" && (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                Sign in to your CarbonIQ account
              </p>

              <button
                onClick={handleGoogleSignIn}
                className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-border bg-card hover:bg-muted hover:border-green-500/20 text-foreground text-sm font-medium transition-all mb-5"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground/60">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form
                onSubmit={signInForm.handleSubmit(handleSignIn)}
                className="flex flex-col gap-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={signInForm.formState.errors.email?.message}
                  {...signInForm.register("email")}
                />
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  error={signInForm.formState.errors.password?.message}
                  {...signInForm.register("password")}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode("reset")}
                    className="text-xs text-muted-foreground hover:text-green-400 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={signInForm.formState.isSubmitting}
                  className="w-full mt-1"
                >
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-green-400 hover:text-green-300 font-medium"
                >
                  Sign up
                </button>
              </p>
            </>
          )}

          {mode === "signup" && (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Create account
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                Start monitoring your farms today
              </p>

              <button
                onClick={handleGoogleSignIn}
                className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-border bg-card hover:bg-muted hover:border-green-500/20 text-foreground text-sm font-medium transition-all mb-5"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground/60">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <form
                onSubmit={signUpForm.handleSubmit(handleSignUp)}
                className="flex flex-col gap-4"
              >
                <Input
                  label="Full Name"
                  placeholder="Arjun Kumar"
                  error={signUpForm.formState.errors.name?.message}
                  {...signUpForm.register("name")}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={signUpForm.formState.errors.email?.message}
                  {...signUpForm.register("email")}
                />
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  error={signUpForm.formState.errors.password?.message}
                  {...signUpForm.register("password")}
                />
                <Input
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat password"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  error={signUpForm.formState.errors.confirmPassword?.message}
                  {...signUpForm.register("confirmPassword")}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={signUpForm.formState.isSubmitting}
                  className="w-full mt-1"
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("signin")}
                  className="text-green-400 hover:text-green-300 font-medium"
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {mode === "reset" && (
            <>
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Reset password
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                Enter your email and we&apos;ll send a reset link
              </p>
              <div className="flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  {...signInForm.register("email")}
                />
                <Button
                  onClick={handleResetPassword}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Send Reset Link
                </Button>
                <button
                  onClick={() => setMode("signin")}
                  className="text-sm text-muted-foreground hover:text-foreground text-center"
                >
                  Back to sign in
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
