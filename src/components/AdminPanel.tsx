import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Clock, Loader2, LogOut, RefreshCw, X } from 'lucide-react';
import StatusBadge from './StatusBadge';
import type { Reservation, ReservationStatus } from '../types';
import { formatDateTime, formatLongDate, formatPrice } from '../lib/format';
import { adminList, adminLogin, adminSetStatus, isRemote } from '../lib/reservations';

const SESSION_KEY = 'ne:admin';
type Filter = 'todas' | ReservationStatus;

export default function AdminPanel() {
  const [pass, setPass] = useState(() => sessionStorage.getItem(SESSION_KEY) ?? '');
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [list, setList] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<Filter>('pendente');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Reservation | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [remote, setRemote] = useState<boolean | null>(null);

  const load = useCallback(
    async (password: string) => {
      setBusy(true);
      setError('');
      try {
        setList(await adminList(password));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Não foi possível carregar as reservas.');
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  useEffect(() => {
    void isRemote().then(setRemote);
    if (pass) {
      void adminLogin(pass).then((ok) => {
        if (ok) {
          setAuthed(true);
          void load(pass);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
          setPass('');
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (await adminLogin(input)) {
      sessionStorage.setItem(SESSION_KEY, input);
      setPass(input);
      setAuthed(true);
      void load(input);
    } else setLoginError('Palavra-passe incorrecta.');
  };

  const setStatus = async (r: Reservation, status: ReservationStatus) => {
    setBusy(true);
    setError('');
    try {
      const updated = await adminSetStatus(pass, r.code, status);
      setList((l) => l.map((x) => (x.code === r.code ? { ...x, ...updated, proof: x.proof } : x)));
      setOpen((o) => (o && o.code === r.code ? { ...o, ...updated, proof: o.proof } : o));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível actualizar.');
    } finally {
      setBusy(false);
    }
  };

  const counts = useMemo(
    () => ({
      todas: list.length,
      pendente: list.filter((r) => r.status === 'pendente').length,
      confirmado: list.filter((r) => r.status === 'confirmado').length,
      rejeitado: list.filter((r) => r.status === 'rejeitado').length,
    }),
    [list],
  );

  const shown = list
    .filter((r) => filter === 'todas' || r.status === filter)
    .filter((r) => {
      const q = query.trim().toLowerCase();
      return !q || [r.code, r.name, r.phone, r.eventTitle].some((v) => v.toLowerCase().includes(q));
    });

  const shell = 'min-h-screen bg-paper text-black';

  if (!authed) {
    return (
      <main className={`${shell} flex items-center justify-center px-4`}>
        <form onSubmit={login} className="w-full max-w-sm border-t-4 border-brand bg-white p-7 shadow-xl">
          <h1 className="display text-3xl text-brand">Administração</h1>
          <p className="mt-2 text-sm text-black/65">Nova Era Entretenimento · confirmação de pagamentos</p>
          <label htmlFor="adm-pass" className="mt-6 block text-sm font-bold uppercase tracking-wider">
            Palavra-passe
          </label>
          <input
            id="adm-pass"
            type="password"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-1.5 w-full border-2 border-black/20 px-4 py-3 focus:border-black focus:outline-none"
          />
          {loginError && <p className="mt-2 text-sm font-semibold text-brand">{loginError}</p>}
          <button type="submit" className="btn btn-red mt-5 w-full">
            Entrar
          </button>
          <a href="#inicio" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-black/60 hover:text-brand">
            <ArrowLeft size={14} aria-hidden="true" /> Voltar ao site
          </a>
        </form>
      </main>
    );
  }

  return (
    <main className={shell}>
      <header className="border-b-4 border-brand bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="display text-2xl">Reservas</h1>
            <p className="text-xs text-white/60">
              {remote === false
                ? 'Modo de teste: dados só neste navegador (sem servidor).'
                : 'Ligado ao servidor da Nova Era.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-outline-light !px-4 !py-2.5" onClick={() => void load(pass)} disabled={busy}>
              {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <RefreshCw size={16} aria-hidden="true" />}
              Actualizar
            </button>
            <button
              type="button"
              className="btn btn-outline-light !px-4 !py-2.5"
              onClick={() => {
                sessionStorage.removeItem(SESSION_KEY);
                setAuthed(false);
                setPass('');
              }}
            >
              <LogOut size={16} aria-hidden="true" /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filtrar por estado">
          {(['pendente', 'confirmado', 'rejeitado', 'todas'] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`border-2 px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all duration-300 ${
                filter === f ? 'border-brand bg-brand text-white' : 'border-black/20 bg-white hover:border-black'
              }`}
            >
              {f === 'rejeitado' ? 'recusadas' : f === 'todas' ? 'todas' : `${f}s`} · {counts[f]}
            </button>
          ))}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Procurar nome, contacto ou código"
            aria-label="Procurar reservas"
            className="ml-auto min-w-[14rem] flex-1 border-2 border-black/20 bg-white px-4 py-2.5 text-sm focus:border-black focus:outline-none sm:flex-none sm:w-80"
          />
        </div>

        {error && <p role="alert" className="mt-4 text-sm font-semibold text-brand">{error}</p>}

        {shown.length === 0 ? (
          <p className="mt-10 text-center text-black/60">Nenhuma reserva nesta lista.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {shown.map((r) => (
              <li key={r.code} className="grid gap-4 border-l-8 border-brand bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-display text-xl tracking-wider">{r.code}</span>
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-black/55">{formatDateTime(r.createdAt)}</span>
                  </div>
                  <p className="mt-1 font-semibold">
                    {r.name} · {r.phone}
                  </p>
                  <p className="text-sm text-black/65">
                    {r.eventTitle} · {r.items.map((i) => `${i.qty}× ${i.label}`).join(' + ')} · via {r.method}
                  </p>
                  <p className="font-display text-lg text-brand">{formatPrice(r.total)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn btn-outline !px-4 !py-2.5" onClick={() => setOpen(r)}>
                    Ver comprovativo
                  </button>
                  {r.status !== 'confirmado' && (
                    <button type="button" className="btn !bg-[#13A750] !px-4 !py-2.5 text-white" disabled={busy} onClick={() => void setStatus(r, 'confirmado')}>
                      <Check size={16} aria-hidden="true" /> Confirmar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Comprovativo ${open.code}`}>
          <div className="absolute inset-0 bg-black/85" onClick={() => setOpen(null)} aria-hidden="true" />
          <div className="relative flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden bg-white sm:flex-row">
            <button
              type="button"
              aria-label="Fechar"
              onClick={() => setOpen(null)}
              className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center bg-black text-white hover:bg-brand"
            >
              <X size={20} />
            </button>
            <div className="flex min-h-[40svh] flex-1 items-center justify-center overflow-auto bg-black">
              {open.proof ? (
                <img src={open.proof} alt={`Comprovativo de ${open.name}`} className="max-h-[92svh] w-auto max-w-full object-contain" />
              ) : (
                <p className="p-6 text-white/70">Sem imagem.</p>
              )}
            </div>
            <div className="w-full shrink-0 space-y-3 overflow-y-auto p-5 sm:w-72">
              <StatusBadge status={open.status} large />
              <p className="font-display text-2xl tracking-wider">{open.code}</p>
              <p className="text-sm">
                <strong>{open.name}</strong>
                <br />
                {open.phone}
              </p>
              <p className="text-sm text-black/70">
                {open.eventTitle}
                <br />
                {formatLongDate(open.eventDate)}
              </p>
              <p className="text-sm">{open.items.map((i) => `${i.qty}× ${i.label}`).join(' + ')}</p>
              <p className="text-sm font-bold uppercase tracking-wide text-black/55">Valor a conferir</p>
              <p className="font-display text-3xl text-brand">{formatPrice(open.total)}</p>
              <div className="flex flex-col gap-2 pt-2">
                <button type="button" disabled={busy} onClick={() => void setStatus(open, 'confirmado')} className="btn !bg-[#13A750] text-white">
                  <Check size={16} aria-hidden="true" /> Confirmar pagamento
                </button>
                <button type="button" disabled={busy} onClick={() => void setStatus(open, 'rejeitado')} className="btn btn-black">
                  <X size={16} aria-hidden="true" /> Recusar
                </button>
                <button type="button" disabled={busy} onClick={() => void setStatus(open, 'pendente')} className="btn btn-outline">
                  <Clock size={16} aria-hidden="true" /> Voltar a pendente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
