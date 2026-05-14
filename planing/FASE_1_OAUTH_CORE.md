# **Fase 1: Implementación Core de OAuth (Google y GitHub)**

**Objetivo Principal:** Permitir a los usuarios registrarse e iniciar sesión utilizando sus cuentas de Google y GitHub, integrando el flujo correctamente entre Fastify (API) y Next.js (BFF).

---

## 1. Tareas de Preparación y Configuración

Antes de tocar el código, necesitamos preparar el entorno para comunicarse con proveedores externos.

*   [ ] **1.1. Obtener Credenciales de Google:**
    *   Crear un proyecto en Google Cloud Console.
    *   Configurar la pantalla de consentimiento OAuth.
    *   Crear credenciales de "Aplicación Web". Obtener `Client ID` y `Client Secret`.
    *   Configurar URI de redirección autorizada: `http://localhost:3000/api/auth/callback/google` (BFF) o directamente al backend dependiendo de tu arquitectura. Para este plan, haremos que Fastify maneje el callback. URI: `http://localhost:8080/auth/google/callback` (Ajusta los puertos a los tuyos).
*   [ ] **1.2. Obtener Credenciales de GitHub:**
    *   Ir a GitHub Developer Settings -> OAuth Apps.
    *   Crear nueva aplicación. Obtener `Client ID` y `Client Secret`.
    *   Configurar URL de callback: `http://localhost:8080/auth/github/callback`.
*   [ ] **1.3. Actualizar Variables de Entorno:**
    *   Añadir las 4 variables al archivo `.env` del backend y del frontend (si aplica).
    *   Actualizar `docker/backend/src/env.schema.ts` para que requiera `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` y una `OAUTH_REDIRECT_FRONTEND_URL`.

---

## 2. Desarrollo del Backend (Fastify)

El backend será el encargado de validar los códigos de OAuth, obtener el perfil del usuario de Google/GitHub y generar tu JWT/Sesión interna.

*   [ ] **2.1. Instalar dependencias (Opcional pero recomendado):**
    *   Instalar `@fastify/oauth2` o implementar las llamadas `fetch` manualmente.
*   [ ] **2.2. Ampliar el Dominio (`src/domain/auth.types.ts`):**
    *   Asegurar que exista la interfaz `OAuthProfile` (provider, providerId, email, name).
*   [ ] **2.3. Crear la lógica de negocio (`src/services/oauth.service.ts` o añadir a `auth.service.ts`):**
    *   **Función `processOAuthLogin(profile: OAuthProfile, meta: {...}): Promise<LoginResult>`**
        *   *Paso A:* Buscar si ya existe el proveedor con `findAuthProvider()`. Si existe, generar tokens y retornar.
        *   *Paso B:* Si no existe el proveedor, buscar usuario por email con `findUserByEmail()`.
        *   *Paso C:* Si el usuario existe, crear el nuevo proveedor vinculado a ese usuario (Auto-vinculación) usando `createOAuthProvider()`.
        *   *Paso D:* Si el usuario NO existe, crear el usuario (`createUser()`), luego crear el proveedor (`createOAuthProvider()`).
        *   *Paso E:* Generar sesión y retornar tokens (igual que en el login local).
*   [ ] **2.4. Crear el Controlador (`src/controllers/oauth.controller.ts`):**
    *   **Función `redirectToGoogle / redirectToGithub`**: Construye la URL de autorización del proveedor y redirige al usuario. Debe incluir un token de estado (`state`) para prevenir CSRF.
    *   **Función `handleGoogleCallback / handleGithubCallback`**:
        *   Recibe el `code` en la query.
        *   Intercambia el `code` por el `access_token` de Google/Github.
        *   Hace un `fetch` a la API de Google (`https://www.googleapis.com/oauth2/v2/userinfo`) o Github (`https://api.github.com/user` + `/emails`) para obtener el perfil.
        *   Llama al servicio `processOAuthLogin`.
        *   *Importante:* En lugar de devolver un JSON, este endpoint debe hacer un `reply.redirect()` hacia una ruta especial del Frontend (BFF), pasando los tokens (ej. `http://localhost:3000/api/auth/oauth-success?accessToken=...&refreshToken=...`).
*   [ ] **2.5. Definir Rutas (`src/routes/auth/oauth.ts`):**
    *   `GET /auth/google` -> Ejecuta redirección a Google.
    *   `GET /auth/google/callback` -> Maneja la respuesta de Google.
    *   `GET /auth/github` -> Ejecuta redirección a Github.
    *   `GET /auth/github/callback` -> Maneja la respuesta de Github.

---

## 3. Desarrollo del Frontend (Next.js - BFF)

El frontend debe iniciar el flujo y recoger los tokens generados por el backend para guardarlos en las cookies de Next.js (BFF).

*   [ ] **3.1. Rutas BFF para capturar el éxito (`app/api/auth/oauth-success/route.ts`):**
    *   Crear un endpoint `GET` en Next.js.
    *   Leer los parámetros de la URL (`accessToken`, `refreshToken`) enviados por Fastify.
    *   Setear las cookies `HttpOnly` utilizando la configuración de tu BFF.
    *   Redirigir al usuario finalmente a `/dashboard`.
*   [ ] **3.2. Rutas BFF para manejar fallos (`app/api/auth/oauth-error/route.ts`):**
    *   Si algo falla en el backend (ej. cuenta suspendida), Fastify redirigirá aquí.
    *   Limpiar cookies por seguridad.
    *   Redirigir a `/login?error=OAuthFailed`.
*   [ ] **3.3. UI: Actualizar Componentes Visuales:**
    *   Modificar `app/login/page.tsx` y `app/register/page.tsx`.
    *   Añadir botones "Continuar con Google" y "Continuar con GitHub".
    *   Estos botones deben ser etiquetas `<a>` o usar `window.location.href` que apunten directamente a tu backend (`http://localhost:8080/api/v1/auth/google`), no deben ser peticiones AJAX/fetch, ya que requieren redirección de navegación a la página de Google/Github.

---

## 4. Resumen de Entregables (Archivos impactados)

Al finalizar esta fase, tu árbol de proyecto debería haber cambiado de la siguiente manera:

**Backend:**
*   📝 Modificado: `src/env.schema.ts`
*   📝 Modificado: `src/domain/auth.types.ts`
*   📝 Modificado: `src/services/auth.service.ts`
*   ✨ **Nuevo:** `src/controllers/oauth.controller.ts`
*   ✨ **Nuevo:** `src/routes/auth/oauth.ts`
*   📝 Modificado: `src/routes/index.ts` (Para registrar el nuevo plugin de rutas oauth)

**Frontend:**
*   ✨ **Nuevo:** `app/api/auth/oauth-success/route.ts`
*   ✨ **Nuevo:** `app/api/auth/oauth-error/route.ts`
*   📝 Modificado: `app/login/page.tsx`
*   📝 Modificado: `app/register/page.tsx`
*   ✨ **Nuevo:** `components/ui/social-button.tsx` (Recomendado crear un componente reutilizable para los botones)
