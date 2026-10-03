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
| Tempo de cada slide do hero (7 s) | `src/components/HeroSlideshow.tsx` (`SLIDE_MS`) |

Todos os dados são **simulados**. Troque o número `whatsapp` em `site.ts` pelo real antes de publicar.

## Usar fotos e cartazes reais

- Galeria e merch: coloque as imagens em `public/` e defina `src` (ex.: `"/gallery/chegada.jpg"`).
- Fotos de arquivo da história: defina `src` em cada item de `photos` em `history.ts`.
- Cartazes: hoje são gerados em SVG (`src/components/Poster.tsx`). Para usar cartazes reais, substitua o `<Poster />` por uma `<img>` nos componentes `HeroSlideshow`, `TicketCarousel` e `TicketModal`.

## Comportamentos

- **Splash:** logotipo Nova Era 20 Anos em ecrã inteiro durante 2 segundos, com fade out suave. Aparece sempre que o site é aberto.
- **Hero:** o 1.º slide mostra os próximos eventos (até 7 cartazes, por ordem de data, clicáveis para reservar); a seguir vêm as notícias (`src/data/news.ts`), a mais recente primeiro (campo `publishedAt`, aaaa-mm-dd). Troca de slide a cada 7 segundos, sem pausar (nem com o rato por cima). Se o utilizador mudar de slide à mão, o relógio de 7 s recomeça nesse slide.

- **Carrossel de bilhetes:** avança sozinho a cada 3 segundos e volta ao início no fim. O utilizador pode deslizar (toque ou arrastar com o rato), usar as setas ou os pontos. O avanço fica em pausa enquanto o rato está por cima, ao tocar ou ao arrastar, e o relógio recomeça quando o bilhete ativo muda.
- **Reserva:** é possível marcar vários lotes (Normal, VIP, VVIP), cada um com a sua quantidade, e desmarcar qualquer um. Máximo de 10 por lote.
- **Scroll:** os blocos entram com suavidade (opacidade + deslocamento) ao aparecerem no ecrã (`components/Reveal.tsx`). Desligado automaticamente se o sistema pedir movimento reduzido.

## Estrutura

```
src/
  components/  Header, HeroSlideshow, BrandBlock, TicketCarousel, TicketModal,
               Agenda, History, Gallery, Merch, Footer, Reveal, Splash, Poster, Photo, Logo
  data/        eventos, história, galeria, merch, configurações
  lib/         formatação de preços, datas, telefone e WhatsApp
```

## Notas
- `public/arquivo/`: fotos antigas substituídas na galeria (não são usadas no site; podem apagar-se).
