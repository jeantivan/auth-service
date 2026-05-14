# **Fase 3: Panel de Control de Sesiones Multidispositivo (Bonus 1)**

**Objetivo Principal:** Crear una interfaz donde el usuario pueda ver en qué dispositivos tiene una sesión activa (ej. "Chrome en Windows", "Safari en iPhone"), saber desde qué IP se conectaron, y tener la capacidad de revocar remotamente el acceso de cualquier sesión sospechosa o antigua.

---

## 1. Desarrollo del Backend (Servicios y Controladores)

Ya tienes las funciones básicas en el repositorio de sesiones, ahora hay que darles seguridad y exponerlas a través de la API.

*   [ ] **1.1. Ampliar el Servicio (`src/services/session.service.ts`):**
    *   **Función `revokeSpecificSession(userId: string, sessionId: string)`:**
        *   Buscar la sesión por `sessionId`.
        *   **CRÍTICO:** Verificar que la sesión pertenezca al `userId` que hace la petición (para evitar que un usuario cierre la sesión de otro).
        *   Llamar a `revokeSession(client, sessionId)` de tu repositorio.
    *   **Función `getSessionsByUser(userId: string)` (Actualización):**
        *   Filtrar para no devolver sesiones que ya tengan `revoked_at` o cuyo `expires_at` esté en el pasado. (Solo queremos mostrar sesiones *Activas*).
*   [ ] **1.2. Crear el Controlador (`src/controllers/session.controller.ts`):**
    *   *(Nota: Veo que ya tienes el archivo creado en tu árbol de directorios, solo hay que llenarlo).*
    *   **Función `listSessions`:** Obtiene el `userId` del token JWT actual (`request.user.sub`), llama al servicio `getSessionsByUser` y devuelve un JSON con la lista.
    *   **Función `terminateSession`:** Obtiene el `userId` del JWT y el `sessionId` de los parámetros de la URL (`request.params.id`), llama a `revokeSpecificSession` y devuelve un status `204 No Content`.

---

## 2. Desarrollo del Backend (Rutas)

Exponer los controladores al BFF.

*   [ ] **2.1. Definir Rutas (`src/routes/sessions.ts`):**
    *   *(Nota: Este archivo también existe en tu estructura).*
    *   *Asegúrate de que estas rutas utilicen el hook/middleware de autenticación para requerir un JWT válido.*
    *   `GET /sessions` -> Llama a `listSessions`.
    *   `DELETE /sessions/:id` -> Llama a `terminateSession`.

---

## 3. Desarrollo del Frontend (Next.js - BFF)

El BFF intermediario consumirá las rutas protegidas de Fastify.

*   [ ] **3.1. Crear/Modificar Rutas Proxy (`app/api/auth/sessions/route.ts`):**
    *   *(Nota: Este archivo ya existe, toca implementar los métodos HTTP).*
    *   **`GET`**: Toma el `accessToken` de las cookies de Next.js, hace un `fetch` a `GET /sessions` del backend y devuelve la lista de sesiones al cliente.
    *   **`DELETE`**: Toma el `id` de la sesión (puede venir en el cuerpo de la petición o por query param), inyecta el `accessToken` en los headers, y hace el `fetch` a `DELETE /sessions/:id` en el backend.

---

## 4. UI: Componentes y Utilidades del Frontend

Aquí es donde transformamos los datos crudos en información legible para el usuario.

*   [ ] **4.1. Instalar Utilidad de Parseo (Opcional pero muy recomendado):**
    *   Instalar una librería como `ua-parser-js` en el frontend. Tu base de datos guarda el "User-Agent" en bruto (ej. `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537...`). Esta librería lo convierte en algo amigable como "Chrome en Windows 11".
*   [ ] **4.2. Crear Componente de Sesiones (`components/settings/active-sessions.tsx`):**
    *   Un Client Component (`"use client"`) que haga un fetch a `/api/auth/sessions` al montarse.
    *   **Renderizado:** Iterar sobre el array de sesiones y mostrar tarjetas o filas de tabla.
    *   **Datos a mostrar por sesión:**
        *   Icono (Móvil vs Desktop, basado en el User-Agent parseado).
        *   Navegador y SO ("Firefox on macOS").
        *   Dirección IP.
        *   Fecha de creación (Ej: "Iniciada el 12 de Octubre").
        *   **Distintivo:** Identificar cuál es la "Sesión Actual" (This Device). *(Truco: Puedes lograr esto si el backend marca la sesión en el GET comparando el refresh token de la cookie con los de la BD, o visualmente en el frontend si omites el botón de borrar para la sesión actual).*
*   [ ] **4.3. Lógica del Botón "Revocar":**
    *   Un botón rojo de "Cerrar sesión" en cada tarjeta.
    *   Al hacer clic, llamar al método `DELETE` del BFF.
    *   Usar actualización optimista o un simple re-fetch para desaparecer la tarjeta de la lista una vez revocado el acceso con éxito.
*   [ ] **4.4. Integrar en la Vista de Configuración (`app/dashboard/settings/page.tsx`):**
    *   Importar y colocar el componente `ActiveSessions` debajo del componente de "Cuentas Vinculadas" (desarrollado en la Fase 2).

---

## 5. Resumen de Entregables (Archivos impactados)

Al finalizar esta fase, los cambios en tu proyecto serán:

**Backend:**
*   📝 Modificado: `src/services/session.service.ts` (Implementada la lógica de revocación por ID segura)
*   📝 Modificado: `src/controllers/session.controller.ts` (Controladores listos)
*   📝 Modificado: `src/routes/sessions.ts` (Endpoints registrados y protegidos)

**Frontend:**
*   📝 Modificado: `app/api/auth/sessions/route.ts` (Métodos GET y DELETE listos en el BFF)
*   ✨ **Nuevo:** `components/settings/active-sessions.tsx` (Componente visual de la lista)
*   📝 Modificado: `app/dashboard/settings/page.tsx` (Ensamblado final de la página)
