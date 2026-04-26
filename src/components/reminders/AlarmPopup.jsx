import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiAlarmLine, RiCheckLine, RiCloseLine, RiExternalLinkLine, RiTimeLine } from 'react-icons/ri';
import api from '../../api/axios';

// ─────────────────────────────────────────────────────────────────────────────
// AlarmPopup — Premium In-App Reminder Alarm
// Rings every 30s until marked Done. Premium glassmorphism design.
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared AudioContext ───────────────────────────────────────────
let _ctx = null;
const getCtx = () => {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  return _ctx;
};

const unlockCtx = async () => {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') await ctx.resume();
    return true;
  } catch { return false; }
};

// Rich bell tone: 4 harmonics + exponential decay
const playBell = (ctx, startTime) => {
  [
    { freq: 880,  vol: 0.40 },
    { freq: 1108, vol: 0.24 },
    { freq: 1480, vol: 0.14 },
    { freq: 1760, vol: 0.08 },
  ].forEach(({ freq, vol }) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.3);
    osc.start(startTime);
    osc.stop(startTime + 1.3);
  });
};

// Ring 5 times — plays immediately if ctx is running
const ringAlarm = async () => {
  try {
    const ok  = await unlockCtx();
    if (!ok) return;
    const ctx = getCtx();
    playBell(ctx, ctx.currentTime);
    playBell(ctx, ctx.currentTime + 0.9);
    playBell(ctx, ctx.currentTime + 1.8);
    playBell(ctx, ctx.currentTime + 2.7);
    playBell(ctx, ctx.currentTime + 3.6);
  } catch (e) {
    console.warn('[Alarm] Sound error:', e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export default function AlarmPopup({ slug }) {
  const navigate  = useNavigate();
  // slug comes explicitly from EmployeeLayout via prop (reliable on all pages)
  const activeSlug = slug;

  const [alarms,      setAlarms]      = useState([]);
  const [dismissed,   setDismissed]   = useState(new Set());
  const [secondsLeft, setSecondsLeft] = useState(0);

  const pollRef    = useRef(null);
  const tickRef    = useRef(null);
  const lastVizRef = useRef(0); // timestamp of last visibilityChange poll

  // ── Fetch due reminders ─────────────────────────────────────────
  const fetchAndRing = useCallback(async () => {
    if (!activeSlug) return;
    try {
      const { data } = await api.get(`/b/${activeSlug}/reminders/my/today`);
      const now      = new Date();

      const firing = (data?.data || []).filter((r) => {
        if (dismissed.has(r._id)) return false;
        if (['done', 'missed'].includes(r.status)) return false;
        const minsLeft = (new Date(r.scheduledAt) - now) / 60000;
        return minsLeft <= 16 && minsLeft >= -30;
      });

      setAlarms(firing);

      if (firing.length > 0) {
        // Update live countdown for first alarm
        const ms = new Date(firing[0].scheduledAt) - now;
        setSecondsLeft(Math.round(ms / 1000));
        // Ring every poll cycle (every 30s) — will only play if ctx is running
        await ringAlarm();
      }
    } catch { /* silently fail */ }
  }, [activeSlug, dismissed]);

  // ── Adaptive polling ────────────────────────────────────────────
  // 15s when alarm is firing, 30s when idle — reduces DB load 3×
  useEffect(() => {
    unlockCtx();

    let timer;
    const schedule = (alarmActive) => {
      const delay = alarmActive ? 15000 : 30000;
      timer = setTimeout(async () => {
        await fetchAndRing();
        // Re-schedule after fetch completes (not time-fixed)
        schedule(alarms.length > 0);
      }, delay);
    };

    fetchAndRing().then(() => schedule(false));

    // Ensure audio stays unlocked on any gesture
    const unlock = () => unlockCtx();
    document.addEventListener('click',    unlock);
    document.addEventListener('keydown',  unlock);
    document.addEventListener('touchend', unlock);

    // Tab becomes visible → poll immediately, but max once per 5s
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const now = Date.now();
      if (now - lastVizRef.current < 5000) return; // cooldown
      lastVizRef.current = now;
      clearTimeout(timer);
      fetchAndRing().then(() => schedule(alarms.length > 0));
    };
    document.addEventListener('visibilitychange', onVisible);

    pollRef.current = { stop: () => clearTimeout(timer) };

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click',            unlock);
      document.removeEventListener('keydown',          unlock);
      document.removeEventListener('touchend',         unlock);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchAndRing]); // eslint-disable-line

  // ── Live countdown ticker (every second) ───────────────────────
  useEffect(() => {
    clearInterval(tickRef.current);
    if (alarms.length > 0) {
      tickRef.current = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    }
    return () => clearInterval(tickRef.current);
  }, [alarms.length]);

  // ── Actions ─────────────────────────────────────────────────────
  const dismiss = (id) => {
    setDismissed((p) => new Set([...p, id]));
    setAlarms((p) => p.filter((r) => r._id !== id));
  };

  const handleDone = async (r) => {
    try { await api.patch(`/b/${activeSlug}/reminders/${r._id}/done`); } catch {}
    dismiss(r._id);
  };

  const handleOpenLead = (r) => {
    if (r.lead?._id) navigate(`/${activeSlug}/emp/my-leads/${r.lead._id}`);
    else             navigate(`/${activeSlug}/emp/reminders`);
    dismiss(r._id);
  };

  if (alarms.length === 0) return null;

  const reminder  = alarms[0];
  const minsLeft  = Math.round((new Date(reminder.scheduledAt) - new Date()) / 60000);
  const isUrgent  = minsLeft <= 5;
  const isOverdue = minsLeft < 0;

  const timeStr = isOverdue
    ? `${Math.abs(minsLeft)}m overdue`
    : secondsLeft <= 60
    ? `${Math.max(0, secondsLeft)}s left`
    : `${minsLeft} min left`;

  const accentColor = isUrgent ? '#f87171' : '#818cf8';
  const glowColor   = isUrgent ? 'rgba(248,113,113,0.25)' : 'rgba(129,140,248,0.2)';
  const bgGradient  = isUrgent
    ? 'linear-gradient(145deg, rgba(20,4,4,0.97) 0%, rgba(35,8,8,0.97) 100%)'
    : 'linear-gradient(145deg, rgba(8,10,26,0.97) 0%, rgba(14,16,42,0.97) 100%)';

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'apFadeIn .25s ease',
      }} />

      {/* ── Alarm Modal ──────────────────────────────────────── */}
      <div
      onClick={async (e) => { await unlockCtx(); }}
        style={{
          position: 'fixed', top: '50%', left: '50%', zIndex: 9999,
          transform: 'translate(-50%,-50%)',
          width: '92%', maxWidth: 420,
          background: bgGradient,
          borderRadius: 24,
          border: `1px solid ${accentColor}50`,
          boxShadow: `0 0 0 1px ${accentColor}20, 0 0 80px ${glowColor}, 0 32px 80px rgba(0,0,0,0.6)`,
          overflow: 'hidden',
          animation: 'apSlideUp .3s cubic-bezier(.22,.68,0,1.2)',
        }}
      >
        {/* Glow strip at top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        }} />

        {/* Corner badge — multiple alarms */}
        {alarms.length > 1 && (
          <div style={{
            position: 'absolute', top: 16, left: 16,
            background: accentColor, color: '#fff',
            fontSize: 10, fontWeight: 800, borderRadius: 20,
            padding: '3px 9px', letterSpacing: '0.05em',
          }}>
            {alarms.length} REMINDERS
          </div>
        )}

        {/* Dismiss */}
        <button
          onClick={(e) => { e.stopPropagation(); dismiss(reminder._id); }}
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748b', zIndex: 2,
          }}
        >
          <RiCloseLine size={16} />
        </button>

        {/* ── Body ─────────────────────────────────────────── */}
        <div style={{ padding: '28px 24px 24px' }}>

          {/* Icon + Status */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            {/* Pulsing ring */}
            <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 16 }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: `2px solid ${accentColor}`,
                animation: 'apRing1 1.6s ease-out infinite',
              }} />
              <div style={{
                position: 'absolute', inset: -8, borderRadius: '50%',
                border: `2px solid ${accentColor}60`,
                animation: 'apRing2 1.6s ease-out infinite .3s',
              }} />
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: `radial-gradient(circle, ${accentColor}25 0%, ${accentColor}08 100%)`,
                border: `2px solid ${accentColor}80`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'apBellShake 1.6s ease-in-out infinite',
              }}>
                <RiAlarmLine size={34} color={accentColor} />
              </div>
            </div>

            {/* Label */}
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: accentColor, marginBottom: 8,
            }}>
              {isUrgent ? '🔴 Starting Very Soon' : '📅 Reminder Alert'}
            </div>

            {/* Title */}
            <div style={{
              fontSize: 20, fontWeight: 900, color: '#f8fafc',
              textAlign: 'center', lineHeight: 1.3, letterSpacing: '-0.01em',
            }}>
              {reminder.title}
            </div>
          </div>

          {/* ── Info card ─────────────────────────────────── */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '14px 16px', marginBottom: 20,
          }}>
            {reminder.lead?.name && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#fff',
                }}>
                  {reminder.lead.name[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                    {reminder.lead.name}
                  </div>
                  {reminder.lead.phone && (
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                      {reminder.lead.phone}
                    </div>
                  )}
                </div>
              </div>
            )}

            {reminder.description && (
              <div style={{
                fontSize: 13, color: '#94a3b8', lineHeight: 1.65,
                borderTop: reminder.lead?.name ? '1px solid rgba(255,255,255,0.06)' : 'none',
                paddingTop: reminder.lead?.name ? 10 : 0,
                marginBottom: 10,
              }}>
                {reminder.description}
              </div>
            )}

            {/* Live countdown */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RiTimeLine size={14} color="#64748b" />
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {new Date(reminder.scheduledAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              <div style={{
                fontSize: 13, fontWeight: 800,
                color: isOverdue ? '#f87171' : isUrgent ? '#fbbf24' : accentColor,
                background: isOverdue ? 'rgba(248,113,113,0.1)' : isUrgent ? 'rgba(251,191,36,0.1)' : `${accentColor}15`,
                border: `1px solid ${isOverdue ? '#f8717130' : isUrgent ? '#fbbf2430' : accentColor + '30'}`,
                padding: '3px 10px', borderRadius: 20,
              }}>
                {timeStr}
              </div>
            </div>
          </div>

          {/* No audio hint needed — unlocks automatically */}

          {/* ── Action Buttons ─────────────────────────────── */}
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Done */}
            <button
              onClick={(e) => { e.stopPropagation(); handleDone(reminder); }}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white', fontWeight: 800, fontSize: 14,
                cursor: 'pointer', letterSpacing: '0.02em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
                transition: 'transform .12s, box-shadow .12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(16,185,129,0.3)'; }}
            >
              <RiCheckLine size={18} /> Mark Done
            </button>

            {/* Open Lead */}
            {reminder.lead?._id && (
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenLead(reminder); }}
                style={{
                  padding: '14px 16px', borderRadius: 14,
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}35`,
                  color: accentColor, fontWeight: 700, fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 7,
                  transition: 'transform .12s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <RiExternalLinkLine size={16} /> Lead
              </button>
            )}
          </div>

          {/* Queue indicator */}
          {alarms.length > 1 && (
            <div style={{
              marginTop: 14, display: 'flex', justifyContent: 'center', gap: 6,
            }}>
              {alarms.map((_, i) => (
                <div key={i} style={{
                  width: i === 0 ? 20 : 6, height: 6, borderRadius: 3,
                  background: i === 0 ? accentColor : `${accentColor}30`,
                  transition: 'width .3s',
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes apFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes apSlideUp {
          from { opacity:0; transform:translate(-50%,-44%) scale(.94) }
          to   { opacity:1; transform:translate(-50%,-50%) scale(1)   }
        }
        @keyframes apRing1 {
          0%   { transform:scale(1);   opacity:.8 }
          100% { transform:scale(1.9); opacity:0  }
        }
        @keyframes apRing2 {
          0%   { transform:scale(1);   opacity:.5 }
          100% { transform:scale(1.7); opacity:0  }
        }
        @keyframes apBellShake {
          0%,100% { transform:rotate(0deg)   }
          15%     { transform:rotate(-12deg) }
          30%     { transform:rotate(12deg)  }
          45%     { transform:rotate(-8deg)  }
          60%     { transform:rotate(8deg)   }
          75%     { transform:rotate(-4deg)  }
          90%     { transform:rotate(4deg)   }
        }
      `}</style>
    </>
  );
}
