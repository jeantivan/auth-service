# **Fase 2: Gestión de Cuenta y Vinculación Manual**

**Objetivo Principal:** Crear un panel de configuración donde un usuario autenticado pueda ver qué métodos de acceso tiene activos, vincular nuevos proveedores (Google/GitHub) a su cuenta existente, y desvincularlos si lo desea.

---

## 1. Desarrollo del Backend (Capa de Datos y Lógica)

Necesitamos extender la capacidad del backend para consultar y modificar los proveedores de un usuario específico.

*   [ ] **1.1. Ampliar el Repositorio de Proveedores (`src/repositories/auth-provider.repository.ts`):**
    *   **Función `findProvidersByUserId(client, userId: string)`:** Hace un `SELECT provider_type FROM auth_providers WHERE user_id = $1`. Esto servirá para listar los métodos conectados.
    *   **Función `deleteAuthProvider(client, userId: string, providerType: string)`:** Elimina un registro de la tabla. *Nota de seguridad:* Antes de ejecutar esto, la lógica de negocio debe verificar que el usuario tenga al menos otro método de acceso activo (para no dejar la cuenta "huérfana").
*   [ ] **1.2. Crear el Servicio de Configuración de Usuario (`src/services/user-settings.service.ts`):**
    *   **Función `getUserProviders(userId)`:** Llama al repositorio para obtener la lista de proveedores.
    *   **Función `unlinkProvider(userId, providerType)`:** Verifica si el usuario tiene más de un proveedor. Si es así, elimina el solicitado. Si es el último, lanza un error HTTP 400 (`CANNOT_REMOVE_LAST_PROVIDER`).
    *   **Función `linkOAuthProvider(userId, profile: OAuthProfile)`:** Toma el perfil devuelto por Google/Github, verifica que el `provider_id` no esté siendo usado por *otro* usuario en la DB. Si está libre, lo inserta vinculado al `userId` actual.

---

## 2. Desarrollo del Backend (Rutas y Controladores)

El desafío aquí es que el flujo de vinculación OAuth es distinto al de login, ya que requiere saber *quién* está intentando vincular la cuenta.

*   [ ] **2.1. Crear Controlador de Configuración (`src/controllers/user-settings.controller.ts`):**
    *   **Función `getProviders`:** Devuelve un array de strings (ej. `['local', 'google']`) de la cuenta actual.
    *   **Función `removeProvider`:** Recibe el tipo de proveedor por parámetro y llama a `unlinkProvider`.
*   [ ] **2.2. Definir Rutas de Configuración (`src/routes/protected/settings.ts`):**
    *   *Todas estas rutas deben estar bajo el middleware/hook de autenticación (requieren JWT válido).*
    *   `GET /settings/providers` -> Llama a `getProviders`.
    *   `DELETE /settings/providers/:type` -> Llama a `removeProvider`.
*   [ ] **2.3. Modificar Controlador OAuth para soportar Vinculación (`src/controllers/oauth.controller.ts`):**
    *   **Rutas Especiales:** Necesitas rutas como `GET /auth/link/google` y `GET /auth/link/google/callback`.
    *   A diferencia del login público, **estas rutas requieren que el usuario esté autenticado**.
    *   La lógica en `handleLinkCallback`: En lugar de iniciar una nueva sesión, obtiene el perfil de Google y llama a `linkOAuthProvider(req.user.id, profile)`. Luego redirige al frontend con un mensaje de éxito (ej. `http://localhost:3000/dashboard/settings?link=success`).

---

## 3. Desarrollo del Frontend (Next.js - BFF)

El BFF actuará como puente para que el cliente web consulte sus proveedores de forma segura.

*   [ ] **3.1. Rutas Proxy en Next.js (`app/api/user/providers/route.ts`):**
    *   **`GET`**: Toma el `accessToken` de las cookies, hace un fetch a tu backend (`GET /settings/providers`) y devuelve la lista de proveedores.
    *   **`DELETE`**: Toma el parámetro del proveedor a eliminar, añade el `accessToken` y hace la petición `DELETE` al backend.
*   [ ] **3.2. Manejo de Redirecciones para Vinculación:**
    *   No necesitas un endpoint nuevo aquí. Simplemente, los botones de "Vincular" en el frontend enviarán al usuario directamente al backend (ej. `http://localhost:8080/auth/link/google`), pero tu BFF debe asegurarse de que la cookie de sesión viaje en esa petición, o pasar el token JWT por la URL temporalmente (con cuidado de seguridad).

---

## 4. UI: Componentes y Vistas del Frontend

Aquí es donde el usuario interactúa visualmente con sus integraciones.

*   [ ] **4.1. Crear la Página de Configuración (`app/dashboard/settings/page.tsx`):**
    *   Crear el layout principal de los ajustes de cuenta.
*   [ ] **4.2. Crear Componente de Cuentas Vinculadas (`components/settings/linked-accounts.tsx`):**
    *   Un Client Component (`"use client"`) que al montarse hace un `fetch` a `/api/user/providers` para obtener el estado actual.
    *   **Renderizado:** Una lista o tarjetas pequeñas para "Contraseña", "Google" y "GitHub".
    *   **Lógica Visual:**
        *   Si el usuario tiene "google" en su lista, mostrar el logo de Google con un botón "Desvincular".
        *   Si NO lo tiene, mostrar un botón "Vincular Google".
*   [ ] **4.3. Integrar Alertas y Manejo de Errores (`components/ui/alert-dialog.tsx`):**
    *   Al intentar "Desvincular", mostrar un modal de confirmación (*"¿Estás seguro de que deseas desconectar tu cuenta de Google?"*).
    *   Capturar y mostrar el error si el usuario intenta borrar su único método de acceso (el error `CANNOT_REMOVE_LAST_PROVIDER` que enviará el backend).
    *   Capturar el query param de la URL (`?link=success` o `?link=error`) tras volver del flujo OAuth para mostrar un Toast o mensaje de éxito.

---

## 5. Resumen de Entregables (Archivos impactados)

Al finalizar esta fase, los cambios en tu árbol de directorios serán:

**Backend:**
*   📝 Modificado: `src/repositories/auth-provider.repository.ts`
*   ✨ **Nuevo:** `src/services/user-settings.service.ts`
*   ✨ **Nuevo:** `src/controllers/user-settings.controller.ts`
*   ✨ **Nuevo:** `src/routes/protected/settings.ts` (Rutas protegidas por token)
*   📝 Modificado: `src/controllers/oauth.controller.ts` (Añadidas rutas de link)

**Frontend:**
*   ✨ **Nuevo:** `app/api/user/providers/route.ts` (Endpoint BFF múltiple GET/DELETE)
*   ✨ **Nuevo:** `app/dashboard/settings/page.tsx`
*   ✨ **Nuevo:** `components/settings/linked-accounts.tsx`
