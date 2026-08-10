import React from 'react';
import Link from '@docusaurus/Link';
import useEnvId, {useStore} from '../useEnvId';
import styles from './styles.module.css';

// Build an ISO timestamp (e.g. 2026-07-30T06:00:00.000Z) for a given "HH:MM"
// UTC time, `dayOffset` days from today. Default offset is -1 (yesterday), so
// links always point at a window that has already produced data.
function isoAt(time, dayOffset) {
  const [h, m] = String(time)
    .split(':')
    .map((n) => parseInt(n, 10));
  const now = new Date();
  const d = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + dayOffset,
      h || 0,
      m || 0,
      0,
      0,
    ),
  );
  return d.toISOString();
}

// A deep link into the user's own Grafana stack.
//   path      - path after the host. May contain "{appId}", filled from the
//               stored app id.
//   from, to  - "HH:MM" UTC window bounds (default whole day)
//   dayOffset - days from today (default -1 = yesterday)
//   params    - extra, already-encoded query string
//   appIdKey  - which stored app id to substitute for "{appId}", e.g. "frontendAppId"
//
// The Frontend Observability app id is created per deployment and can't be
// known by a static site, so links that need it stay inert (with a pointer to
// the Welcome page) until it's provided. The app-list landing page is not a
// usable fallback: it ignores the time range and shows the app as inactive.
export default function EnvLink({
  path = '/',
  from = '00:00',
  to = '23:59',
  dayOffset = -1,
  params,
  appIdKey,
  children,
}) {
  const [envId] = useEnvId();
  const [appId] = useStore(appIdKey || '__unused__');

  const needsAppId = path.includes('{appId}');

  const prompt = (what) => (
    <span className={styles.missing}>
      {children}
      <span className={styles.hint}>
        {' '}
        (set your {what} on the <Link to="/">Welcome page</Link> to activate
        this link)
      </span>
    </span>
  );

  if (!envId) return prompt('environment ID');
  if (needsAppId && !appId) return prompt('Frontend Observability app ID');

  const resolvedPath = needsAppId ? path.replace(/\{appId\}/g, appId) : path;
  const qs = [
    `from=${isoAt(from, dayOffset)}`,
    `to=${isoAt(to, dayOffset)}`,
    'timezone=utc',
    params,
  ]
    .filter(Boolean)
    .join('&');
  const href = `https://${envId}.grafana.net${resolvedPath}?${qs}`;

  return (
    <a
      className={styles.link}
      href={href}
      target="_blank"
      rel="noopener noreferrer">
      {children}
    </a>
  );
}
