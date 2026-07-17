import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Mail, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AuthModal({ isOpen, onClose }) {
  const [lastUsed, setLastUsed] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setLastUsed(localStorage.getItem("lastUsedLogin") || "");
      setShowEmailInput(false);
      setMessage("");
      setEmail("");
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    localStorage.setItem("lastUsedLogin", "google");
    const { origin } = window.location;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: origin,
      },
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage("");
    localStorage.setItem("lastUsedLogin", "email");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setMessage(error.message);
      toast.error(error.message);
    } else {
      setMessage("Check your email for the login link!");
      toast.success("Check your email for the login link!");
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 p-8 rounded-3xl shadow-2xl relative max-w-md w-full flex flex-col z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full opacity-70 transition-opacity hover:opacity-100 p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X size={16} className="text-gray-500 dark:text-zinc-400" />
              <span className="sr-only">Close</span>
            </button>

            {/* Header */}
            <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
              <h2 className="text-2xl font-black text-black dark:text-white">
                Sign in to continue
              </h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Shorten and back up your links securely.
              </p>
            </div>

            {/* Body / Options */}
            <div className="flex flex-col gap-4 py-2">
              {!showEmailInput ? (
                <>
                  {/* Google Login */}
                  <button
                    onClick={handleGoogleLogin}
                    className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors border border-gray-200 dark:border-zinc-800 bg-white hover:bg-gray-100 dark:bg-transparent dark:hover:bg-zinc-950 text-black dark:text-white h-10 px-4 py-2 w-full relative cursor-pointer"
                  >
                    <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
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
                    Continue with Google
                    {lastUsed === "google" && (
                      <span className="absolute right-3 bg-gray-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                        Last Used
                      </span>
                    )}
                  </button>

                  {/* Email Login Trigger */}
                  <button
                    onClick={() => setShowEmailInput(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors border border-gray-200 dark:border-zinc-800 bg-white hover:bg-gray-100 dark:bg-transparent dark:hover:bg-zinc-950 text-black dark:text-white h-10 px-4 py-2 w-full relative cursor-pointer"
                  >
                    <Mail className="w-5 h-5 mr-1 text-gray-500 dark:text-zinc-400" />
                    Continue with Email
                    {lastUsed === "email" && (
                      <span className="absolute right-3 bg-gray-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                        Last Used
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-gray-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:cursor-not-allowed disabled:opacity-50 text-black dark:text-white"
                      required
                      disabled={loading}
                    />
                  </div>

                  {message && (
                    <div
                      className={`text-sm ${
                        message.includes("error") || message.includes("invalid")
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailInput(false);
                        setMessage("");
                      }}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-gray-200 dark:border-zinc-800 bg-white hover:bg-gray-100 dark:bg-transparent dark:hover:bg-zinc-950 text-black dark:text-white h-10 px-4 py-2 flex-1 cursor-pointer"
                      disabled={loading}
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-zinc-900 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:hover:bg-zinc-50/90 text-white dark:text-black h-10 px-4 py-2 flex-1 cursor-pointer disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Magic Link"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
