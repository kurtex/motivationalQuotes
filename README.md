# Motivational Quotes Generator

Este proyecto es una aplicación web que genera frases motivacionales originales en español utilizando la API de Gemini. Los usuarios pueden autenticarse con Threads, generar nuevas frases y guardar un historial de las frases generadas. El sistema también gestiona y refresca automáticamente los tokens de acceso de Threads.

## Objetivo

El objetivo principal del proyecto es ofrecer a los usuarios frases motivacionales originales en español, evitando repeticiones y permitiendo la asociación de cada frase con el usuario que la generó. Además, el sistema mantiene los tokens de Threads actualizados para garantizar la funcionalidad continua de la integración.

## Requisitos previos

- Node.js 18 o superior
- pnpm (o npm/yarn)
- MongoDB en ejecución (local o remoto)
- Claves de API:
  - `GEMINI_API_KEY` (clave de la API de Gemini)
  - `MONGO_URI` (cadena de conexión a MongoDB)
  - `CRON_SECRET` (secreto para proteger el endpoint de refresco de tokens)

## Configuración

1. Clona el repositorio:
   ```sh
   git clone <url-del-repo>
   cd motivational-quotes
   ```

2. Instala las dependencias:
   ```sh
   pnpm install
   # o npm install
   # o yarn install
   ```

3. Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:
   ```env
   GEMINI_API_KEY=tu_clave_gemini
   MONGO_URI=mongodb://localhost:27017/user_tokens
   CRON_SECRET=tu_secreto_seguro
   ```

4. (Opcional) Configura los certificados SSL si usas HTTPS localmente (ver carpeta `certificates/`).

## Cómo iniciar el proyecto

```sh
pnpm dev
# o npm run dev
# o yarn dev
```

La aplicación estará disponible en http://localhost:3000

## Endpoints y funcionalidades principales

- `/api/gemini-generate` — Genera y guarda una nueva frase motivacional para el usuario autenticado.
- `/api/threads/refresh-tokens` — Refresca los tokens de Threads (protegido por `CRON_SECRET`).

## Notas sobre producción y cronjobs

- El refresco automático de tokens se realiza mediante un endpoint protegido. Debes programar un cron externo (por ejemplo, GitHub Actions, cron de tu servidor, etc.) que haga una petición POST a `/api/threads/refresh-tokens` con el header `x-cron-secret`.
- El cronjob interno con `node-cron` solo funcionará en entornos donde el proceso Node.js esté siempre activo (no serverless).

## Estructura principal del proyecto

- `app/` — Código de la aplicación Next.js, endpoints API y componentes React.
- `app/lib/database/` — Modelos y utilidades para MongoDB/Mongoose.
- `app/lib/threads-api/` — Integración con la API de Threads.
- `app/lib/utils/cronjob/` — Lógica de cronjob para refresco de tokens.

---

Para cualquier duda o contribución, abre un issue o pull request en el repositorio.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
