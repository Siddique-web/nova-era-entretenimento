import type { Reservation, ReservationStatus } from '../types';
import { normalizePhone } from './format';

/**
 * Camada de dados das reservas.
 * - Com o servidor (server/server.mjs) a correr, tudo é guardado lá: o administrador confirma num
 *   aparelho e o cliente vê "Confirmado" no dele.
 * - Sem servidor (site estático), cai para o armazenamento do navegador: serve para testar,
 *   mas o estado só é visto no mesmo aparelho/navegador.
 */
const API = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';
const LOCAL_KEY = 'ne:reservations';

let remote: boolean | null = null;

export async function isRemote(): Promise<boolean> {
  if (remote !== null) return remote;
  try {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch(`${API}/health`, { signal: ctrl.signal });
    window.clearTimeout(t);
    remote = r.ok && ((await r.json()) as { ok?: boolean }).ok === true;
  } catch {
    remote = false;
  }
  return remote;
}

/* ---------- armazenamento local (modo de teste) ---------- */
const readLocal = (): Reservation[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') as Reservation[];
  } catch {
    return [];
  }
};
const writeLocal = (list: Reservation[]) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
};

const stripProof = (r: Reservation): Reservation => {
  const { proof: _proof, ...rest } = r;
  return rest;
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, init);
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Erro de comunicação com o servidor.');
  return data;
}

export type NewReservation = Omit<Reservation, 'status' | 'createdAt' | 'confirmedAt'>;

export async function createReservation(input: NewReservation): Promise<Reservation> {
  if (await isRemote()) {
    return call<Reservation>('/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  }
  const list = readLocal();
  const r: Reservation = { ...input, status: 'pendente', createdAt: new Date().toISOString() };
  writeLocal([r, ...list]);
  return stripProof(r);
}

export async function lookupReservation(code: string, phone: string): Promise<Reservation | null> {
  const c = code.trim().toUpperCase();
  if (await isRemote()) {
    try {
      return await call<Reservation>(`/reservations/${encodeURIComponent(c)}?phone=${encodeURIComponent(phone)}`);
    } catch {
      return null;
    }
  }
  const found = readLocal().find((r) => r.code === c && normalizePhone(r.phone) === normalizePhone(phone));
  return found ? stripProof(found) : null;
}

/* ---------- administração ---------- */
const LOCAL_ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? 'novaera2026';

export async function adminLogin(password: string): Promise<boolean> {
  if (await isRemote()) {
    try {
      await call<{ ok: boolean }>('/admin/login', { method: 'POST', headers: { 'x-admin-key': password } });
      return true;
    } catch {
      return false;
    }
  }
  return password === LOCAL_ADMIN_PASSWORD;
}

export async function adminList(password: string): Promise<Reservation[]> {
  if (await isRemote()) {
    return call<Reservation[]>('/admin/reservations', { headers: { 'x-admin-key': password } });
  }
  return readLocal();
}

export async function adminSetStatus(password: string, code: string, status: ReservationStatus): Promise<Reservation> {
  if (await isRemote()) {
    return call<Reservation>(`/admin/reservations/${encodeURIComponent(code)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': password },
      body: JSON.stringify({ status }),
    });
  }
  const list = readLocal();
  const i = list.findIndex((r) => r.code === code);
  if (i < 0) throw new Error('Reserva não encontrada.');
  list[i] = { ...list[i], status, confirmedAt: status === 'confirmado' ? new Date().toISOString() : undefined };
  writeLocal(list);
  return list[i];
}
