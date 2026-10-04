// Servidor das reservas da Nova Era — sem dependências (só Node 18+).
//   npm run build && npm run server      → site + API em http://localhost:3001
//   ADMIN_PASSWORD=... PORT=3001 node server/server.mjs
// Os dados ficam em server/data/reservations.json (faça cópias de segurança).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'novaera2026';
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'reservations.json');
const DIST = path.join(__dirname, '..', 'dist');
const MAX_BODY = 6 * 1024 * 1024; // 6 MB (comprovativo já vem comprimido)

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

const readAll = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writeAll = (list) => {
  const tmp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(list));
  fs.renameSync(tmp, DATA_FILE);
};

const phoneKey = (v) => String(v ?? '').replace(/\D/g, '').slice(-9);
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a ?? ''));
  const y = Buffer.from(String(b ?? ''));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const isAdmin = (req) => safeEqual(req.headers['x-admin-key'], ADMIN_PASSWORD);
const publicView = ({ proof, ...rest }) => rest;

const json = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(new Error('Pedido demasiado grande.'));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Error('JSON inválido.'));
      }
    });
    req.on('error', reject);
  });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

function serveStatic(req, res) {
  if (!fs.existsSync(DIST)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Site ainda não compilado. Corra: npm run build');
    return;
  }
  const url = new URL(req.url, 'http://x');
  let file = path.normalize(path.join(DIST, decodeURIComponent(url.pathname)));
  if (!file.startsWith(DIST)) file = path.join(DIST, 'index.html');
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

const STATUSES = ['pendente', 'confirmado', 'rejeitado'];

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const p = url.pathname;
    if (!p.startsWith('/api/')) return serveStatic(req, res);

    if (p === '/api/health' && req.method === 'GET') return json(res, 200, { ok: true });

    // Criar reserva (público)
    if (p === '/api/reservations' && req.method === 'POST') {
      const b = await readBody(req);
      const items = Array.isArray(b.items) ? b.items : [];
      const bad =
        !/^NE-[A-Z0-9]{6}$/.test(String(b.code ?? '')) ||
        String(b.name ?? '').trim().length < 3 ||
        phoneKey(b.phone).length !== 9 ||
        items.length === 0 ||
        !(Number(b.total) > 0) ||
        !String(b.proof ?? '').startsWith('data:image/');
      if (bad) return json(res, 400, { error: 'Dados da reserva incompletos ou inválidos.' });

      const list = readAll();
      if (list.some((r) => r.code === b.code)) return json(res, 409, { error: 'Código repetido. Tente outra vez.' });
      const r = {
        code: b.code,
        eventId: String(b.eventId ?? ''),
        eventTitle: String(b.eventTitle ?? ''),
        eventCategory: String(b.eventCategory ?? ''),
        eventDate: String(b.eventDate ?? ''),
        eventTime: String(b.eventTime ?? ''),
        eventVenue: String(b.eventVenue ?? ''),
        poster: b.poster ? String(b.poster) : undefined,
        items: items.map((i) => ({
          lotId: String(i.lotId),
          label: String(i.label),
          qty: Math.max(1, Number(i.qty) | 0),
          unitPrice: Number(i.unitPrice) || 0,
        })),
        total: Number(b.total),
        name: String(b.name).trim().slice(0, 120),
        phone: String(b.phone).trim().slice(0, 30),
        method: String(b.method ?? '').slice(0, 60),
        proof: String(b.proof),
        status: 'pendente',
        createdAt: new Date().toISOString(),
      };
      list.unshift(r);
      writeAll(list);
      return json(res, 201, publicView(r));
    }

    // Consultar uma reserva (código + contacto)
    const one = p.match(/^\/api\/reservations\/([A-Z0-9-]+)$/);
    if (one && req.method === 'GET') {
      const r = readAll().find((x) => x.code === one[1]);
      if (!r || phoneKey(r.phone) !== phoneKey(url.searchParams.get('phone'))) return json(res, 404, { error: 'Reserva não encontrada.' });
      return json(res, 200, publicView(r));
    }

    // Administração
    if (p === '/api/admin/login' && req.method === 'POST') {
      return isAdmin(req) ? json(res, 200, { ok: true }) : json(res, 401, { error: 'Palavra-passe incorrecta.' });
    }
    if (p.startsWith('/api/admin/') && !isAdmin(req)) return json(res, 401, { error: 'Sem autorização.' });

    if (p === '/api/admin/reservations' && req.method === 'GET') return json(res, 200, readAll());

    const adm = p.match(/^\/api\/admin\/reservations\/([A-Z0-9-]+)$/);
    if (adm && req.method === 'PATCH') {
      const b = await readBody(req);
      if (!STATUSES.includes(b.status)) return json(res, 400, { error: 'Estado inválido.' });
      const list = readAll();
      const i = list.findIndex((x) => x.code === adm[1]);
      if (i < 0) return json(res, 404, { error: 'Reserva não encontrada.' });
      list[i].status = b.status;
      list[i].confirmedAt = b.status === 'confirmado' ? new Date().toISOString() : undefined;
      writeAll(list);
      return json(res, 200, publicView(list[i]));
    }

    return json(res, 404, { error: 'Não encontrado.' });
  } catch (e) {
    return json(res, 400, { error: e instanceof Error ? e.message : 'Erro.' });
  }
});

server.listen(PORT, () => {
  console.log(`Nova Era: http://localhost:${PORT}  (admin em /#admin)`);
  if (ADMIN_PASSWORD === 'novaera2026') console.log('AVISO: defina ADMIN_PASSWORD antes de publicar.');
});
