import { useEffect, useRef, useState } from 'react';
import type { LotId } from '../types';

/** Rascunho da reserva: fica guardado no aparelho enquanto o utilizador sai para pagar e volta. */
export interface Draft {
  picks: Partial<Record<LotId, number>>;
  name: string;
  phone: string;
  method: string;
  proof: string; // data URL JPEG do comprovativo ('' se ainda não anexou)
  proofName: string;
  savedAt: number;
}

const key = (eventId: string) => `ne:draft:${eventId}`;
const MAX_AGE = 1000 * 60 * 60 * 24 * 14; // 14 dias

export function loadDraft(eventId: string): Draft | null {
  try {
    const raw = localStorage.getItem(key(eventId));
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft;
    if (Date.now() - d.savedAt > MAX_AGE) {
      localStorage.removeItem(key(eventId));
      return null;
    }
    return d;
  } catch {
    return null;
  }
}

export const clearDraft = (eventId: string) => {
  try {
    localStorage.removeItem(key(eventId));
  } catch {
    /* ignora */
  }
};

/** Grava o rascunho a cada alteração. Devolve `true` se a foto não coube no armazenamento. */
export function useDraftSaver(eventId: string, draft: Omit<Draft, 'savedAt'>, enabled: boolean): boolean {
  const [proofLost, setProofLost] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (!enabled) return;
    // Não grava um formulário vazio logo ao abrir
    const empty = !draft.name && !draft.phone && !draft.proof && Object.keys(draft.picks).length <= 1;
    if (first.current && empty) {
      first.current = false;
      return;
    }
    first.current = false;
    const value: Draft = { ...draft, savedAt: Date.now() };
    try {
      localStorage.setItem(key(eventId), JSON.stringify(value));
      setProofLost(false);
    } catch {
      try {
        localStorage.setItem(key(eventId), JSON.stringify({ ...value, proof: '', proofName: '' }));
        setProofLost(Boolean(draft.proof));
      } catch {
        /* sem espaço: segue sem guardar */
      }
    }
  }, [eventId, enabled, draft.picks, draft.name, draft.phone, draft.method, draft.proof, draft.proofName]); // eslint-disable-line react-hooks/exhaustive-deps

  return proofLost;
}
