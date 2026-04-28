import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// ─────────────────────────────────────────────────────────────────────────────
// ThemeToggle — Premium icon-based dark/light switcher
// CSS classes defined in index.css under THEME TOGGLE section
// ─────────────────────────────────────────────────────────────────────────────

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="theme-toggle"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Left: icon + label */}
      <div className="theme-toggle-left">
        <div className="theme-toggle-icon">
          {isDark
            ? <Sun  size={14} strokeWidth={2.2} />
            : <Moon size={14} strokeWidth={2.2} />
          }
        </div>
        <span className="theme-toggle-label">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      </div>

      {/* Right: pill switch */}
      <div className={`theme-toggle-track${!isDark ? ' track-on' : ''}`}>
        <div className="theme-toggle-thumb" />
      </div>
    </button>
  );
}
