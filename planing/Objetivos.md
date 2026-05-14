# Objetivos

1. Orquestación con Docker (Done, creo): Cada uno de los servicios de estará en un contenedor separado y orquestado por Docker.
2. Diseño de Base de Datos: Todas las tablas, columnas y entidades tienen que ser creadas a traves de migraciones ejecutando archivos .sql usando Postgres
3. Los Usuarios tendrán 3 métodos de login: Email/Password, Google y Github, pero esto podrá ser extendido para agregar mas métodos de login.
4. Si un usuario utiliza un método X para iniciar sesión / crear su cuenta, este podrá registrar los otros métodos restantes para esta cuenta en caso de que sea posible. Ejemplo si se crea un usuario con email/password este puede agregar el login de Google para en un futuro también iniciar sesión con Google y tener acceso a su cuenta.
5. La base de datos será la fuente de la verdad para los usuarios existentes y los nuevos.
6. Para el Backend se desarrollará una API con Fastify + TypeScript siguiendo patrones de diseño efectivos y buenas prácticas, este estará encargado del obtener la información desde la base de datos y reenviarla al destino.
7. El backend estará construido de tal manera que funcione para un Frontend en el Navegador o una App móvil.
8. El Frontend se desarrollará utilizando React y Next.js este ultimo actuará también como un Backend-for-Frontend y será un intermediario entre el Frontend y la Api de Fastify.
9. Bonus: Los usuarios podrán tener varias sesiones iniciadas en distintos dispositivos. Y podrá cerrar estas sesiones desde el dispositivo actual (tendrá algún método de confirmación futuro)
10. Bonus / Opcional: Agregar 2Fa Google Authenticator o similar, esto es un feature que quisiera agregar como bonus

Asumiendo que los ajustes en los repositorios y la base de datos ya están listos, el tablero de juego queda mucho más limpio. Ya tienes el "motor" preparado para manejar múltiples métodos de acceso y sesiones.

---

## Fases faltantes del desarrollo

### **Fase 1: Implementación Core de OAuth (Google y GitHub)**

El objetivo aquí es lograr que un usuario pueda entrar al dashboard usando un servicio de terceros.

* **Backend (Fastify):**
* Crear los endpoints de redirección (`/auth/google`, `/auth/github`).
* Crear los endpoints de *callback*. Aquí va la lógica pesada:
1. Recibir el perfil (email, ID) del proveedor.
2. Consultar si el `provider_id` ya existe (login normal).
3. Si no existe, buscar si el `email` ya está en la tabla `users` (para vincular cuentas automáticamente o avisar al usuario).
4. Si el email no existe, crear un nuevo `user` y su `auth_provider` correspondiente.
5. Generar y devolver los tokens de sesión.


* **BFF (Next.js API):** Crear las rutas proxy correspondientes para manejar los redireccionamientos y recibir las cookies de sesión.
* **Frontend (React):** Añadir los botones de "Continuar con Google" y "Continuar con GitHub" en las páginas de Login y Register.

---

### **Fase 2: Gestión de Cuenta y Vinculación Manual**

Ahora le damos al usuario el poder de gestionar sus métodos de acceso (Objetivo 4).

* **Backend:**
* Crear una ruta protegida (requiere JWT) tipo `POST /auth/link/:provider`.
* La lógica debe asegurar que el usuario autenticado pueda registrar un nuevo proveedor (ej. conectarse a Google) y guardarlo en su cuenta actual, siempre comprobando que ese `provider_id` no pertenezca ya a otra persona.


* **Frontend:**
* Desarrollar una vista de "Configuración de Cuenta" dentro del Dashboard.
* Mostrar una lista de los métodos de acceso activos del usuario.
* Añadir botones para vincular los métodos que le falten.

---

### **Fase 3: Panel de Control de Sesiones Multidispositivo (Bonus 1)**

Aprovechando que tu base de datos ya guarda el `user_agent` y la `ip_address`.

* **Backend:**
* Crear endpoint `GET /sessions` (que llamará a tu función `findSessionsByUserId`).
* Crear endpoint `DELETE /sessions/:id` para revocar una sesión específica.


* **Frontend:**
* Crear una nueva sección en el Dashboard llamada "Dispositivos Activos".
* Diseñar tarjetas o una lista para mostrar cada sesión (ej. "Chrome en Linux", "IP: 192.168.X.X", "Fecha de inicio").
* Añadir un botón rojo de "Revocar acceso" para cada sesión (exceptuando la actual).

---

### **Fase 4: Autenticación de Dos Factores - 2FA (Bonus 2)**

La capa definitiva de seguridad. Esto altera ligeramente el flujo de login de la Fase 1.

* **Backend:**
* Endpoint para generar el secreto TOTP (usando librerías como `otplib`) y devolverlo como un código QR (base64).
* Endpoint para verificar el primer código insertado y marcar `2fa_enabled` como `true` en la DB.
* **Refactor del Login:** Modificar el `loginUser` actual. Si detecta que el usuario tiene 2FA, en lugar de devolver la sesión final, devuelve un "token temporal" indicando que falta un paso.
* Crear un nuevo endpoint `POST /auth/verify-2fa` que canjee ese token temporal + el código del usuario por la sesión final.


* **Frontend:**
* Vista en Settings para "Activar 2FA" mostrando el QR.
* Modificar el flujo de Login: si la API responde que requiere 2FA, mostrar una nueva pantalla pidiendo los 6 dígitos antes de redirigir al Dashboard.
