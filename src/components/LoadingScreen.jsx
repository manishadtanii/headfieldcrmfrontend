// ─────────────────────────────────────────────────────────────────────────────
// LoadingScreen — Premium full-page animated loader
// Shows logo.webp with a spinning arc ring + breathe pulse animation
// CSS: .fullpage-loader* classes in index.css
// ─────────────────────────────────────────────────────────────────────────────

import { useLogo } from '../hooks/useLogo';

export default function LoadingScreen({ message = '' }) {
  const logo = useLogo();
  return (
    <div className="fullpage-loader">
      <div className="fullpage-loader-inner">

        {/* Logo + spinning ring */}
        <div className="fullpage-loader-logo-wrap">
          <img
            src={logo}
            alt="Loading"
            className="fullpage-loader-logo"
          />
          <div className="fullpage-loader-ring" />
        </div>

        {/* Optional message */}
        {message && (
          <p className="fullpage-loader-msg">{message}</p>
        )}
      </div>
    </div>
  );
}
