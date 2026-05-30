import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_MS = 60 * 1000;

export function IdleTimeout() {
  const { user, role, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const isProtected = !!user && (role === "painter" || role === "admin");

  function resetTimers() {
    if (!isProtected) return;

    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownTimer.current) clearInterval(countdownTimer.current);

    setShowWarning(false);
    setCountdown(60);

    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);
      countdownTimer.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, IDLE_TIMEOUT_MS - WARNING_MS);

    idleTimer.current = setTimeout(async () => {
      await signOut();
    }, IDLE_TIMEOUT_MS);
  }

  useEffect(() => {
    if (!isProtected) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

    const handleActivity = () => {
      if (!showWarning) resetTimers();
    };

    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
    resetTimers();

    return () => {
      events.forEach(e => window.removeEventListener(e, handleActivity));
      if (idleTimer.current) clearTimeout(idleTimer.current);
      if (warningTimer.current) clearTimeout(warningTimer.current);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
    };
  }, [isProtected, showWarning]);

  if (!isProtected || !showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl max-w-sm w-full p-6 space-y-4 text-center">
        <div className="text-4xl">⏱️</div>
        <div>
          <h2 className="text-lg font-semibold">Still there?</h2>
          <p className="text-sm text-muted-foreground mt-1">
            You'll be signed out in <span className="font-bold text-foreground">{countdown}</span> seconds due to inactivity.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={async () => { await signOut(); }}
            className="flex-1 border border-border py-2.5 rounded-lg text-sm hover:bg-accent transition-colors"
          >
            Sign out now
          </button>
          <button
            onClick={resetTimers}
            className="flex-1 bg-foreground text-background py-2.5 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}
