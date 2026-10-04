# Nova Era Entretenimento — Site oficial

React 18 + TypeScript + Tailwind CSS + Vite. Paleta equilibrada: vermelho `#F40D0D` (títulos, botões, destaques), branco e cinza-claro (secções arejadas) e preto (hero, linha do tempo, rodapé).

## Como correr

```bash
npm install
npm run dev      # desenvolvimento em http://localhost:5173
npm run build    # produção (pasta dist/)
npm run preview  # testar a build
```

## O que editar

| O quê | Ficheiro |
|---|---|
| Eventos, lotes e preços (Normal, VIP, VVIP) | `src/data/events.ts` |
| WhatsApp, e-mail, redes sociais, pontos de levantamento | `src/data/site.ts` |
| Textos e timeline da história | `src/data/history.ts` |
| Fotos da Galeria (ficheiros em `public/gallery`; mostradas inteiras, com ampliação ao clicar) | `src/data/gallery.ts` |
| Cartazes dos eventos (ficheiro em `public/posters`, campo `poster`) | `src/data/events.ts` |
| Edições anteriores (cartazes antigos) | `src/data/past.ts` |
| Notícias (texto + uma ou mais imagens em `public/posters` ou `public/news`) | `src/data/news.ts` |
| Produtos de merch (campo `colors` = escolha de cor, fotos em `public/merch`) | `src/data/merch.ts` |
| Splash de 2 s com o logotipo 20 Anos | `public/logo-20anos-branco.png`, `src/components/Splash.tsx` |
| Logotipo (extraído da camiseta NË: branco no cabeçalho, rodapé e splash; vermelho em `logo-redmark.png`; ícone `favicon.png`) | `public/logo-white.png`, `public/logo-redmark.png` |
| Ecrã de introdução (duração) | `src/components/Splash.tsx` (`SHOW_MS`) |
| Tempo do carrossel de bilhetes (3 s) | `src/components/TicketCarousel.tsx` (`AUTO_MS`) |
| Tempo de cada slide do hero (4 s) e duração do deslize | `src/components/HeroSlideshow.tsx` (`SLIDE_MS`, `SLIDE_ANIM_MS`) |

| Formas de pagamento (M-Pesa, e-Mola, banco) | `src/data/site.ts` (`PAY_METHODS`) |
| PDF da reserva (design, cores, textos por estado) | `src/lib/ticketPdf.ts` |
| Servidor das reservas e painel admin | `server/server.mjs`, `src/components/AdminPanel.tsx` |

Todos os dados são **simulados**. Troque o número `whatsapp` em `site.ts` pelo real antes de publicar.

## Usar fotos e cartazes reais

- Galeria e merch: coloque as imagens em `public/` e defina `src` (ex.: `"/gallery/chegada.jpg"`).
- Fotos de arquivo da história: defina `src` em cada item de `photos` em `history.ts`.
- Cartazes: hoje são gerados em SVG (`src/components/Poster.tsx`). Para usar cartazes reais, substitua o `<Poster />` por uma `<img>` nos componentes `HeroSlideshow`, `TicketCarousel` e `TicketModal`.

## Comportamentos

- **Splash:** logotipo Nova Era 20 Anos em ecrã inteiro durante 2 segundos, com fade out suave. Aparece sempre que o site é aberto.
- **Hero:** o 1.º slide mostra os próximos eventos (até 7 cartazes, por ordem de data, clicáveis para reservar); a seguir vêm as notícias (`src/data/news.ts`), a mais recente primeiro (campo `publishedAt`, aaaa-mm-dd).

- **Carrossel de bilhetes:** avança sozinho a cada 3 segundos e volta ao início no fim. O utilizador pode deslizar (toque ou arrastar com o rato), usar as setas ou os pontos. O avanço fica em pausa enquanto o rato está por cima, ao tocar ou ao arrastar, e o relógio recomeça quando o bilhete ativo muda.
- **Slideshow do hero:** os slides estão lado a lado e **deslizam com o dedo** (ou arrastando com o rato), acompanhando o gesto e encaixando no seguinte/anterior. Cada slide fica parado **4 segundos, contados a partir do momento em que chegou** (a barra vermelha por baixo enche nesse tempo e mostra o contador 01 / 08). Durante o arrasto o relógio pára e, ao largar, recomeça com os 4 s completos. Também há setas, pontos clicáveis e teclado (← →). Gestos verticais continuam a rolar a página.
- **Reserva (fluxo completo):**
  1. Escolher lotes e quantidades (Normal, VIP, VVIP; máx. 10 por lote) e preencher nome e contacto.
  2. Ver o valor total e os dados de pagamento (M-Pesa, e-Mola ou banco, com botão Copiar).
  3. **Sair do site, pagar e voltar:** tudo o que foi preenchido (lotes, nome, contacto, método e a própria captura, se já anexada) fica guardado no aparelho (14 dias) e reaparece ao reabrir a reserva. Só é apagado ao concluir ou em "Começar de novo".
  4. Anexar a captura do pagamento (obrigatória) e clicar em **Reservar e gerar PDF**.
  5. Sai um **PDF A4** com o design da Nova Era (logotipo, evento, comprador, bilhetes, total, código) com o estado **PENDENTE**.
  6. O administrador abre `/#admin`, confere o comprovativo e clica em **Confirmar**. O cliente abre **Minha reserva** (código + contacto), vê o estado **CONFIRMADO** e descarrega o PDF actualizado (bilhete válido).
- **Administração:** `/#admin`. Lista as reservas (pendentes, confirmadas, recusadas), mostra o comprovativo em grande e permite confirmar, recusar ou voltar a pendente.

## Servidor das reservas (para o estado chegar ao cliente)

O site precisa do servidor incluído para o administrador e o cliente verem o mesmo estado:

```bash
npm install
npm run build
ADMIN_PASSWORD="uma-palavra-passe-forte" npm run server   # site + API em http://localhost:3001
```

- Os dados ficam em `server/data/reservations.json` (faça cópias de segurança). Sem dependências extra: só Node 18+.
- Palavra-passe do admin: variável `ADMIN_PASSWORD` (por omissão `novaera2026`, **mude antes de publicar**).
- Em desenvolvimento: `npm run server` num terminal e `npm run dev` noutro (o Vite encaminha `/api`).
- **Sem servidor** (site só estático, ex.: Netlify), o site entra em *modo de teste*: guarda as reservas no navegador e o admin só vê as do mesmo aparelho. Serve para demonstrar, não para vender de verdade.
- Para outra hospedagem, defina `VITE_API_URL` com o endereço da API antes do build.
- Antes de publicar, troque os números de pagamento simulados em `PAY_METHODS`.
- A conferência do pagamento é sempre manual: o admin compara o comprovativo com o valor e o extracto da carteira/banco.
- **Scroll:** os blocos entram com suavidade (opacidade + deslocamento) ao aparecerem no ecrã (`components/Reveal.tsx`). Desligado automaticamente se o sistema pedir movimento reduzido.

## Estrutura

```
src/
  components/  Header, HeroSlideshow, BrandBlock, TicketCarousel, TicketModal,
               Agenda, History, Gallery, Merch, Footer, Reveal, Splash, Poster, Photo, Logo
  data/        eventos, história, galeria, merch, configurações
  lib/         formatação, reservas (API/local), PDF, compressão de imagem
  hooks/       useDraft (rascunho da reserva), useScrolled
server/        server.mjs (API das reservas + serve o site)
```

## Notas
- `public/arquivo/`: fotos antigas substituídas na galeria (não são usadas no site; podem apagar-se).
