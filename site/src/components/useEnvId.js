import {useCallback, useEffect, useState} from 'react';

const PREFIX = 'workshop.';
const EVENT = 'workshop-store-change';

// Turn whatever the user pastes into a bare stack id:
//   "https://devadfe87appenv.grafana.net/a/..." -> "devadfe87appenv"
//   "devadfe87appenv.grafana.net"               -> "devadfe87appenv"
//   "  DevAdfe87appenv "                         -> "devadfe87appenv"
export function normalizeEnvId(raw) {
  if (!raw) return '';
  let v = String(raw).trim().toLowerCase();
  v = v.replace(/^https?:\/\//, '');
  v = v.replace(/\/.*$/, '');
  v = v.replace(/\.grafana\.net$/, '');
  return v.trim();
}

// Pull the numeric app id out of a pasted Grafana URL, e.g.
//   ".../a/grafana-kowalski-app/apps/1775?from=..." -> "1775"
export function extractAppId(raw) {
  if (!raw) return '';
  const m = String(raw).match(/\/apps\/(\d+)/);
  return m ? m[1] : '';
}

function readKey(key) {
  try {
    return window.localStorage.getItem(PREFIX + key) || '';
  } catch (e) {
    return '';
  }
}

function writeKey(key, val) {
  try {
    window.localStorage.setItem(PREFIX + key, val);
  } catch (e) {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

// Generic keyed store backed by localStorage. Returns [value, setValue].
// Updates live across every component on the page (custom event) and across
// browser tabs (storage event). SSR-safe: starts empty on the server and the
// first client render, then hydrates in useEffect.
export function useStore(key) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const read = () => setValue(readKey(key));
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener('storage', read);
    };
  }, [key]);

  const set = useCallback(
    (val) => {
      writeKey(key, val);
      setValue(val);
    },
    [key],
  );

  return [value, set];
}

// The stack subdomain (e.g. "devadfe87appenv"), normalized on save.
export default function useEnvId() {
  const [envId, setRaw] = useStore('envId');
  const setEnvId = useCallback((raw) => setRaw(normalizeEnvId(raw)), [setRaw]);
  return [envId, setEnvId];
}
