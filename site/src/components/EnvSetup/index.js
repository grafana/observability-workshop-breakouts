import React from 'react';
import useEnvId, {useStore, extractAppId} from '../useEnvId';
import styles from './styles.module.css';

export default function EnvSetup() {
  const [envId, setEnvId] = useEnvId();
  const [frontendAppId, setFrontendAppId] = useStore('frontendAppId');

  // When the user pastes a full Frontend Observability URL, capture both the
  // stack subdomain and the numeric app id in one go.
  const onEnvChange = (e) => {
    const raw = e.target.value;
    setEnvId(raw);
    const id = extractAppId(raw);
    if (id) setFrontendAppId(id);
  };

  const frontendHref = envId
    ? `https://${envId}.grafana.net/a/grafana-kowalski-app`
    : null;

  return (
    <div className={styles.envSetup}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="workshop-env-id">
          Your Grafana Cloud environment ID
        </label>
        <input
          id="workshop-env-id"
          className={styles.input}
          type="text"
          value={envId}
          placeholder="e.g. devadfe87appenv"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={onEnvChange}
        />
        <p className={styles.help}>
          The part of your stack URL before <code>.grafana.net</code>. Tip:
          paste a whole Grafana URL and we'll pull out both the environment ID
          and the app ID below.
        </p>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="workshop-frontend-app-id">
          Frontend Observability app ID
        </label>
        <input
          id="workshop-frontend-app-id"
          className={styles.input}
          type="text"
          inputMode="numeric"
          value={frontendAppId}
          placeholder="e.g. 1775"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setFrontendAppId(e.target.value.replace(/\D/g, ''))}
        />
        <p className={styles.help}>
          Assigned per deployment, so we can't fill it in for you. Easiest way
          to get it:{' '}
          {frontendHref ? (
            <a href={frontendHref} target="_blank" rel="noopener noreferrer">
              open Frontend Observability in your stack
            </a>
          ) : (
            <>open Frontend Observability in your stack (enter your environment ID above first)</>
          )}
          , click the <code>ecommerce</code> app, then paste that browser URL
          back into the environment field above - we'll read the ID out of{' '}
          <code>/apps/<strong>1775</strong></code>. Or type it here. Your
          facilitator can also share it.
        </p>
      </div>

      <p className={styles.status}>
        {envId ? (
          <>
            Saved. The "Open in Grafana" links in the labs now point to{' '}
            <code>
              https://{envId}.grafana.net
            </code>{' '}
            with the correct time range applied.
          </>
        ) : (
          <>Stored only in this browser - it personalizes every "Open in Grafana" link in the labs.</>
        )}
      </p>
    </div>
  );
}
