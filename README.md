# Generador de Frases Motivacionales

[![Estado del Workflow](https://github.com/tu_usuario/tu_repositorio/actions/workflows/refresh_tokens.yml/badge.svg)](https://github.com/tu_usuario/tu_repositorio/actions/workflows/refresh_tokens.yml)

Una aplicación web moderna construida con Next.js que genera frases motivacionales únicas en español utilizando la API de Google Gemini. Incluye autenticación de usuarios a través de la API de Threads y un sistema automatizado para la gestión de tokens.

## ✨ Características Principales

- **Generación de Contenido con IA:** Crea frases motivacionales originales y de alta calidad.
- **Autenticación Social:** Integración segura con la API de Threads para el registro y login de usuarios.
- **Base de Datos Persistente:** Almacena usuarios y frases generadas en MongoDB.
- **Gestión Automatizada de Tokens:** Un sistema robusto que refresca automáticamente los tokens de la API de Threads para mantener la sesión del usuario activa.
- **Despliegue Sencillo:** Optimizado para un despliegue fácil en plataformas como Vercel.

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos:** [MongoDB](https://www.mongodb.com/) con [Mongoose](https://mongoosejs.com/)
- **APIs Externas:**
  - [Google Gemini API](https://ai.google.dev/)
  - [Threads API](https://developers.facebook.com/docs/threads)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Pruebas:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)
- **Automatización:** [GitHub Actions](https://github.com/features/actions)

---

## 🚀 Empezando

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior)
- [pnpm](https://pnpm.io/) (recomendado), npm o yarn
- Una instancia de [MongoDB](https://www.mongodb.com/try/download/community) (local o en la nube)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu_usuario/tu_repositorio.git
cd motivational-quotes
```

### 2. Instalar Dependencias

```bash
pnpm install
```

### 3. Configurar Variables de Entorno

Crea un fichero `.env` en la raíz del proyecto y añade las siguientes variables. Puedes usar el fichero `.env.example` como guía si existe.

```env
# Clave de la API de Google Gemini
GEMINI_API_KEY="TU_CLAVE_DE_GEMINI"

# URI de conexión a tu base de datos MongoDB
MONGO_URI="mongodb://localhost:27017/database_name"

# Secreto para proteger el endpoint del cron job
CRON_SECRET="UN_SECRETO_FUERTE_Y_ALEATORIO"
```

### 4. Ejecutar la Aplicación

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## ⚙️ Tareas Automatizadas (Cron Job)

La aplicación utiliza un sistema de cron job para refrescar automáticamente los tokens de acceso de la API de Threads, que caducan cada 60 días.

Este proceso es gestionado por una **GitHub Action** definida en `.github/workflows/refresh_tokens.yml`.

La GitHub Action se ejecuta diariamente y llama de forma segura al endpoint `POST /api/threads/refresh-tokens` para refrescar los tokens que estén a punto de expirar.

### Configuración para Producción

Para que la GitHub Action funcione correctamente en tu repositorio, debes configurar los siguientes **Secrets** en la sección `Settings > Secrets and variables > Actions` de tu repositorio:

- `PRODUCTION_URL`: La URL base de tu aplicación en producción (ej. `https://mi-app.vercel.app`).
- `CRON_SECRET`: El mismo valor que usaste en tu fichero `.env`.

---

## 🚢 Despliegue

La forma más sencilla de desplegar esta aplicación es utilizando la [plataforma Vercel](https://vercel.com/new), de los creadores de Next.js.

[![Desplegar con Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftu_usuario%2Ftu_repositorio)

No olvides configurar las variables de entorno en tu proyecto de Vercel antes de desplegar.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si tienes alguna idea o encuentras un error, por favor abre un *issue* o envía un *pull request*.
