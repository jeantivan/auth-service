# Fase 4: Autenticación de Dos Factores (TOTP - 2FA)

**Objetivo Principal:** Implementar seguridad de doble factor utilizando aplicaciones tipo Google Authenticator o Authy. Esto implica generar un secreto, mostrar un código QR para activarlo y modificar el flujo de inicio de sesión para interceptar a los usuarios que tengan esta función activada.

---

## 1. Preparación y Repositorios (Backend)

La tabla `user_2fa` ya está en tu archivo `001_init_schema.sql`, así que la base de datos está lista.

*   [ ] **1.1. Instalar dependencias necesarias:**
    *   Instalar `otplib` (para generar y verificar los códigos temporales de 6 dígitos).
    *   Instalar `qrcode` (para generar la imagen base64 del código QR que escaneará el usuario).
*   [ ] **1.2. Crear Repositorio 2FA (`src/repositories/2fa.repository.ts`):**
    *   **Función `create2FASecret(client, userId, secret)`:** Inserta el registro en `user_2fa` con el método 'totp' (aún no habilitado oficialmente).
    *   **Función `enable2FA(client, userId)`:** Actualiza `enabled_at` con la fecha actual, marcando que el usuario confirmó el código correctamente.
    *   **Función `find2FAByUserId(client, userId)`:** Retorna el registro 2FA del usuario para saber si está activo y cuál es su secreto.
    *   **Función `delete2FA(client, userId)`:** Elimina el registro para desactivar la protección.

---

## 2. Configuración del 2FA (Backend - Ajustes de Cuenta)

Endpoints protegidos para que un usuario autenticado pueda activar o desactivar su 2FA.

*   [ ] **2.1. Crear Servicio 2FA (`src/services/2fa.service.ts`):**
    *   **Función `generateSetup(userId, email)`:** Utiliza `otplib.authenticator.generateSecret()` para crear un secreto. Genera una URI de tipo `otpauth://...` usando el email del usuario y el nombre de tu app. Pasa esa URI a la librería `qrcode` para generar una cadena en base64. Guarda el secreto (en estado pendiente) usando el repositorio. Retorna el base64.
    *   **Función `verifyAndEnable(userId, token)`:** Busca el secreto del usuario, usa `otplib.authenticator.check(token, secret)` para validar los 6 dígitos. Si es correcto, llama a `enable2FA` en el repositorio.
*   [ ] **2.2. Crear Controlador 2FA (`src/controllers/2fa.controller.ts`):**
    *   **Función `setup2FA`:** Llama al servicio `generateSetup` y devuelve la imagen QR y el secreto en texto (por si no pueden escanear).
    *   **Función `confirm2FA`:** Recibe el código de 6 dígitos del body, llama a `verifyAndEnable` y devuelve un mensaje de éxito.
*   [ ] **2.3. Definir Rutas (`src/routes/protected/2fa.ts`):**
    *   `POST /2fa/setup` -> Llama a `setup2FA`.
    *   `POST /2fa/confirm` -> Llama a `confirm2FA`.
    *   `DELETE /2fa/disable` -> Desactiva la función.

---



## 3. Refactorización del Flujo de Login (Backend)

Aquí es donde cambiamos la lógica del login tradicional. Si el usuario tiene 2FA, no le damos los tokens de sesión inmediatamente.

*   [ ] **3.1. Modificar `src/services/auth.service.ts` (`loginUser`):**
    *   Después de comprobar que el password es correcto, consultar si el usuario tiene 2FA activo (`find2FAByUserId`).
    *   **Si NO tiene 2FA:** Generar `accessToken` y `refreshToken` (Flujo actual).
    *   **Si SÍ tiene 2FA:** Generar un JWT especial de "corta duración" (ej. 5 minutos) llamado `pending2FAToken` que contenga el `userId`, pero *sin* insertar la sesión en la base de datos.
    *   El retorno de esta función debe cambiar a algo como: `{ requires2FA: boolean, pendingToken?: string, accessToken?: string, ... }`.
*   [ ] **3.2. Crear Nuevo Endpoint de Verificación de Login (`src/controllers/auth.controller.ts`):**
    *   **Función `verify2FALogin`:** Recibe el `pending2FAToken` y el `code` de 6 dígitos.
    *   Verifica la validez del token temporal para extraer el `userId`.
    *   Valida el código de 6 dígitos con el secreto del usuario en la DB usando `otplib`.
    *   Si es correcto, ahora sí, genera la sesión final (`accessToken` y `refreshToken`) llamando a tu lógica de `createSession`.
*   [ ] **3.3. Registrar la nueva ruta en `src/routes/auth/login.ts`:**
    *   Añadir `POST /auth/login/2fa-verify`.

---

## 4. Desarrollo del Frontend (Next.js y UI)

El frontend debe adaptarse para manejar la respuesta intermedia del login y la vista de configuración.

*   [ ] **4.1. Modificar Página de Login (`app/login/page.tsx`):**
    *   Actualizar el estado del componente. Si la respuesta de `POST /api/auth/login` (BFF) indica `requires2FA: true`, ocultar el formulario de Email/Password.
    *   Mostrar un nuevo componente (`<TwoFactorForm />`) que pida los 6 dígitos.
    *   Este nuevo formulario hará un `POST /api/auth/login/2fa-verify`.
*   [ ] **4.2. Rutas del BFF (`app/api/auth/...`):**
    *   Actualizar `app/api/auth/login/route.ts` para que pueda devolver la respuesta condicional sin setear las cookies de sesión finales si requiere 2FA.
    *   Crear `app/api/auth/login/2fa-verify/route.ts`: Este endpoint llamará al backend y, si tiene éxito, seteará las cookies `HttpOnly` definitivas.
*   [ ] **4.3. Vista de Configuración (`components/settings/2fa-setup.tsx`):**
    *   Un componente en la página de Ajustes.
    *   Al darle a "Habilitar 2FA", hace fetch a `/2fa/setup` y muestra la imagen del QR retornada en pantalla.
    *   Muestra un input para introducir el primer código generado por la app del usuario.
    *   Un botón de "Confirmar" que envía el código a `/2fa/confirm`. Si tiene éxito, actualizar el estado visual para mostrar que el 2FA está "Activo".

---

## 5. Resumen de Entregables (Archivos impactados)

**Backend:**
*   ✨ **Nuevo:** `src/repositories/2fa.repository.ts`
*   ✨ **Nuevo:** `src/services/2fa.service.ts`
*   ✨ **Nuevo:** `src/controllers/2fa.controller.ts`
*   ✨ **Nuevo:** `src/routes/protected/2fa.ts`
*   📝 Modificado: `src/services/auth.service.ts` (Modificado el flujo de login)
*   📝 Modificado: `src/controllers/auth.controller.ts` (Añadido `verify2FALogin`)
*   📝 Modificado: `src/routes/auth/login.ts` (Añadida la ruta de verificación)

**Frontend:**
*   📝 Modificado: `app/login/page.tsx` (Lógica de interfaz para dos pasos)
*   📝 Modificado: `app/api/auth/login/route.ts` (Soporte para intercepción 2FA)
*   ✨ **Nuevo:** `app/api/auth/login/2fa-verify/route.ts`
*   ✨ **Nuevo:** `components/auth/2fa-form.tsx`
*   ✨ **Nuevo:** `components/settings/2fa-setup.tsx`
*   📝 Modificado: `app/dashboard/settings/page.tsx` (Ensamblado del componente de configuración)
