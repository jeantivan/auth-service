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
