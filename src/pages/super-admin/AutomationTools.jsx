import {
  RiRocketLine, RiBrainLine, RiGlobalLine, RiPaletteLine,
  RiShieldLine, RiLineChartLine, RiPlugLine, RiTeamLine,
  RiSparklingLine, RiNotificationLine, RiDatabaseLine, RiTranslate2,
} from 'react-icons/ri';

// ─────────────────────────────────────────────────────────────────────────────
// SA Platform Automation — Coming Soon
// Platform-level features for Super Admin
// ─────────────────────────────────────────────────────────────────────────────

const TOOLS = [
  {
    icon: RiLineChartLine,
    title: 'Cross-Business Analytics',
    description: 'Unified dashboard showing revenue, conversion, and performance trends across all businesses on the platform.',
    color: '#818cf8',
    tag: 'Q3 2025',
  },
  {
    icon: RiPaletteLine,
    title: 'White-Label Builder',
    description: 'Let each business customize their CRM branding — logo, colors, domain — without code.',
    color: '#f472b6',
    tag: 'Q3 2025',
  },
  {
    icon: RiPlugLine,
    title: 'API Marketplace',
    description: 'Third-party integrations — Zapier, HubSpot, Salesforce, Make.com — plug in with one click.',
    color: '#34d399',
    tag: 'Q4 2025',
  },
  {
    icon: RiBrainLine,
    title: 'AI Business Insights',
    description: 'Platform-wide AI that predicts which businesses are at churn risk and recommends actions.',
    color: '#a855f7',
    tag: 'Q4 2025',
  },
  {
    icon: RiTeamLine,
    title: 'Automated Onboarding',
    description: 'Auto-setup new businesses with templates, lead pipelines, and employee accounts from a single form.',
    color: '#fbbf24',
    tag: 'Q4 2025',
  },
  {
    icon: RiDatabaseLine,
    title: 'Data Export & Compliance',
    description: 'Scheduled bulk exports, GDPR compliance tools, and automated audit trails for all businesses.',
    color: '#f97316',
    tag: 'Q1 2026',
  },
  {
    icon: RiNotificationLine,
    title: 'Platform Broadcast',
    description: 'Send announcements, feature updates, and alerts to all business admins from one place.',
    color: '#06b6d4',
    tag: 'Q1 2026',
  },
  {
    icon: RiTranslate2,
    title: 'Multi-Language Support',
    description: 'Full internationalization — let businesses switch between languages for their teams.',
    color: '#ec4899',
    tag: 'Q2 2026',
  },
  {
    icon: RiShieldLine,
    title: 'Advanced Security Center',
    description: 'IP whitelisting per business, 2FA enforcement, anomaly detection, and breach alerts.',
    color: '#ef4444',
    tag: 'Q2 2026',
  },
];

export default function SAAutomationTools() {
  return (
    <div style={{ padding: '28px', maxWidth: 1200 }}>

      {/* ── Hero Banner ──────────────────────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 24,
        background: 'linear-gradient(135deg, #0a0a1a, #1a0533, #0a1a33)',
        padding: '48px 40px',
        marginBottom: 36,
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Animated orbs */}
        <div style={{
          position: 'absolute', top: -80, right: -40,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%)',
          animation: 'saOrb 7s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: 60,
          width: 250, height: 250, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.18) 0%, transparent 70%)',
          animation: 'saOrb 9s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '40%',
          width: 180, height: 180, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,114,182,0.1) 0%, transparent 70%)',
          animation: 'saOrb 5s ease-in-out infinite',
        }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        <div style={{ position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(168,85,247,0.15)',
            border: '1px solid rgba(168,85,247,0.35)',
            borderRadius: 20, padding: '6px 16px', marginBottom: 22,
          }}>
            <RiSparklingLine size={14} color="#a855f7" />
            <span style={{ fontSize: 12, fontWeight: 800, color: '#a855f7', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Platform Roadmap
            </span>
          </div>

          <h1 style={{
            fontSize: 40, fontWeight: 900, color: 'white',
            margin: '0 0 14px', letterSpacing: '-1px', lineHeight: 1.15,
          }}>
            Platform Automation 🛸
          </h1>
          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.55)',
            margin: '0 0 30px', maxWidth: 540, lineHeight: 1.7,
          }}>
            Enterprise-grade tools to manage, scale, and automate the entire
            platform — across every business, every team, every lead.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
            {[
              { value: '9+',    label: 'Features Planned' },
              { value: '100%',  label: 'Platform Coverage' },
              { value: '∞',     label: 'Businesses Supported' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{ fontSize: 30, fontWeight: 900, color: 'white' }}>{value}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Status Pill ──────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(168,85,247,0.07), rgba(129,140,248,0.07))',
        border: '1px solid rgba(168,85,247,0.2)',
        borderRadius: 14, padding: '16px 22px', marginBottom: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RiRocketLine size={20} color="#a855f7" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Active Development</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Our engineering team is actively building these features for the platform.
            </div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, fontWeight: 800, color: '#a855f7',
          background: '#a855f720', border: '1px solid #a855f740',
          borderRadius: 8, padding: '6px 14px',
        }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#a855f7', animation: 'saPulse 1.5s ease-in-out infinite' }} />
          In Progress
        </div>
      </div>

      {/* ── Tools Grid ───────────────────────────────────────────── */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>Platform Features</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Powerful tools to run your entire CRM platform more efficiently
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
            transition: 'transform .2s, box-shadow .2s, border-color .2s',
            cursor: 'default',
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 12px 40px ${color}22`;
              e.currentTarget.style.borderColor = `${color}45`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            {/* Top glow strip */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
              opacity: 0.5,
            }} />

            {/* Timeline badge */}
            <div style={{
              position: 'absolute', top: 14, right: 14,
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '3px 10px',
              fontSize: 10, fontWeight: 800, color: 'var(--text-muted)',
              letterSpacing: '0.05em',
            }}>
              {tag}
            </div>

            <div style={{
              width: 50, height: 50, borderRadius: 14,
              background: `${color}15`, border: `1px solid ${color}25`,
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
              <div style={{
                width: 5, height: 5, borderRadius: '50%', background: color,
                animation: 'saPulse 1.5s ease-in-out infinite',
              }} />
              In Development
            </div>
          </div>
        ))}
      </div>

      {/* ── Release Timeline ─────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 18, padding: '24px 28px',
      }}>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 22 }}>📅 Platform Roadmap</div>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { quarter: 'Q3 2025', label: 'Analytics + White Label',         color: '#818cf8' },
            { quarter: 'Q4 2025', label: 'API + AI + Onboarding',           color: '#a855f7' },
            { quarter: 'Q1 2026', label: 'Broadcast + Compliance',          color: '#06b6d4' },
            { quarter: 'Q2 2026', label: 'Multi-Language + Security Center', color: '#f472b6' },
          ].map(({ quarter, label, color }, i, arr) => (
            <div key={quarter} style={{ flex: 1, minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 10 }}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${arr[i-1].color}60, ${color}60)` }} />}
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${color}`,
                  background: `${color}25`,
                  boxShadow: `0 0 10px ${color}40`,
                }} />
                {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: 'var(--border)' }} />}
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
        @keyframes saOrb   { 0%,100%{transform:translate(0,0)scale(1)} 50%{transform:translate(-18px,14px)scale(1.05)} }
        @keyframes saPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
      `}</style>
    </div>
  );
}
