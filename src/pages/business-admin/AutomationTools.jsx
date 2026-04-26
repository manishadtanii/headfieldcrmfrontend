import { RiRocketLine, RiBrainLine, RiFlowChart, RiMailSendLine, RiWhatsappLine, RiBarChartBoxLine, RiTimeLine, RiSparklingLine } from 'react-icons/ri';

// ─────────────────────────────────────────────────────────────────────────────
// BA Automation Tools — Coming Soon
// ─────────────────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    icon: RiMailSendLine,
    title: 'Email Sequences',
    description: 'Auto-send follow-up emails at the right time to the right lead.',
    color: '#818cf8',
    tag: 'Q3 2025',
  },
  {
    icon: RiWhatsappLine,
    title: 'WhatsApp Automation',
    description: 'Send personalized WhatsApp messages triggered by lead actions.',
    color: '#25D366',
    tag: 'Q3 2025',
  },
  {
    icon: RiBrainLine,
    title: 'AI Lead Scoring',
    description: 'Automatically score and prioritize leads using machine learning.',
    color: '#a855f7',
    tag: 'Q4 2025',
  },
  {
    icon: RiFlowChart,
    title: 'Workflow Builder',
    description: 'Drag-and-drop automation flows for lead nurturing campaigns.',
    color: '#f97316',
    tag: 'Q4 2025',
  },
  {
    icon: RiTimeLine,
    title: 'Smart Reminders',
    description: 'AI-suggested follow-up times based on lead engagement patterns.',
    color: '#06b6d4',
    tag: 'Q1 2026',
  },
  {
    icon: RiBarChartBoxLine,
    title: 'Conversion Analytics',
    description: 'Deep insights into which automations convert leads to clients.',
    color: '#fbbf24',
    tag: 'Q1 2026',
  },
];

export default function AutomationTools() {
  return (
    <div style={{ padding: '28px', maxWidth: 1100 }}>

      {/* ── Hero Banner ──────────────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 24,
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        padding: '48px 40px',
        marginBottom: 36,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Animated orbs */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.25) 0%, transparent 70%)',
          animation: 'autOrb 6s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: 80,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
          animation: 'autOrb 8s ease-in-out infinite reverse',
        }} />

        {/* Grid pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Content */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(129,140,248,0.15)',
            border: '1px solid rgba(129,140,248,0.3)',
            borderRadius: 20, padding: '6px 16px', marginBottom: 20,
          }}>
            <RiSparklingLine size={14} color="#818cf8" />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#818cf8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Coming Soon
            </span>
          </div>

          <h1 style={{
            fontSize: 38, fontWeight: 900, color: 'white',
            margin: '0 0 12px', letterSpacing: '-1px', lineHeight: 1.15,
          }}>
            Automation Tools 🚀
          </h1>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: '0 0 28px',
            maxWidth: 520, lineHeight: 1.7,
          }}>
            Supercharge your sales workflow with intelligent automations.
            Stop doing repetitive tasks — let the system do it for you.
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            {[
              { label: 'Tools Planned', value: '6+' },
              { label: 'Hours Saved / Week', value: '12+' },
              { label: 'Conversion Boost', value: '3×' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'white' }}>{value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Notify Banner ────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(90deg,rgba(129,140,248,0.08),rgba(168,85,247,0.08))',
        border: '1px solid rgba(129,140,248,0.2)',
        borderRadius: 14, padding: '16px 22px', marginBottom: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RiRocketLine size={20} color="#818cf8" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Be the first to know</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              We'll notify you as soon as Automation Tools launch for your account.
            </div>
          </div>
        </div>
        <div style={{
          fontSize: 12, fontWeight: 800, letterSpacing: '0.06em',
          color: '#818cf8', textTransform: 'uppercase',
          background: '#818cf820', border: '1px solid #818cf840',
          borderRadius: 8, padding: '6px 14px',
        }}>
          Auto-enrolled ✓
        </div>
      </div>

      {/* ── Tools Grid ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>What's coming</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Here's a preview of the powerful tools we're building for you
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))',
        gap: 16, marginBottom: 40,
      }}>
        {TOOLS.map(({ icon: Icon, title, description, color, tag }) => (
          <div key={title} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 18, padding: '22px',
            position: 'relative', overflow: 'hidden',
            transition: 'transform .2s, box-shadow .2s',
            cursor: 'default',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 12px 40px ${color}25`;
              e.currentTarget.style.borderColor = `${color}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            {/* Glow strip */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              opacity: 0.6,
            }} />

            {/* Lock badge */}
            <div style={{
              position: 'absolute', top: 14, right: 14,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 20, padding: '3px 10px',
              fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
              letterSpacing: '0.05em',
            }}>
              {tag}
            </div>

            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${color}15`,
              border: `1px solid ${color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Icon size={24} color={color} />
            </div>

            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{description}</div>

            <div style={{
              marginTop: 16,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 700, color,
              background: `${color}12`, borderRadius: 8, padding: '4px 10px',
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, animation: 'autPulse 1.5s ease-in-out infinite' }} />
              In Development
            </div>
          </div>
        ))}
      </div>

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '24px 28px',
      }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 20 }}>📅 Release Timeline</div>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { quarter: 'Q3 2025', label: 'Email + WhatsApp', color: '#818cf8', done: false },
            { quarter: 'Q4 2025', label: 'AI Scoring + Workflows', color: '#a855f7', done: false },
            { quarter: 'Q1 2026', label: 'Smart Reminders + Analytics', color: '#06b6d4', done: false },
          ].map(({ quarter, label, color }, i) => (
            <div key={quarter} style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Line */}
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 10 }}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: 'var(--border)' }} />}
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${color}`, background: `${color}25`,
                }} />
                {i < 2 && <div style={{ flex: 1, height: 2, background: 'var(--border)' }} />}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color }}>{quarter}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes autOrb   { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,15px)} }
        @keyframes autPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
      `}</style>
    </div>
  );
}
