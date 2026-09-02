# 🛡️ AuthCore Boilerplate

Un sistema de autenticación y gestión de sesiones robusto, desacoplado y listo para producción. Construido desde cero para ser reutilizable en múltiples proyectos, eliminando la dependencia de librerías "mágicas" de terceros y garantizando el control absoluto sobre el flujo de seguridad y los datos del usuario.

## 🚀 Arquitectura y Tecnologías

El proyecto sigue una arquitectura de microservicios orientada a la separación de responsabilidades, utilizando Next.js como Back-for-Frontend (BFF) para proteger los tokens.

*   **Frontend & BFF:** Next.js, TypeScript (compatible con Tailwind CSS).
*   **Backend Core:** Node.js, Fastify, TypeScript.
*   **Base de Datos:** PostgreSQL (Driver nativo, sin ORM).
*   **Infraestructura:** Docker y Docker Compose.

## ✨ Características Principales

### 🔐 Autenticación Omnicanal y Vinculación
*   **Multi-Proveedor:** Soporte nativo para inicio de sesión con Email/Contraseña, Google OAuth y GitHub OAuth.
*   **Cuenta Única por Email:** Prevención estricta de cuentas duplicadas. Los usuarios pueden registrarse con un proveedor (ej. Google) y posteriormente configurar una contraseña o vincular su cuenta de GitHub, consolidando todo bajo una única identidad en el sistema.

### 🛡️ Seguridad y Gestión de Sesiones Avanzada
*   **Auditoría de Conexiones:** Registro transaccional en base de datos de cada sesión activa, capturando:
    *   Dirección IP.
    *   Fecha y hora de conexión (Timestamps exactos).
    *   Proveedor utilizado para la autorización.
*   **Control de Dispositivos (Revocación):** Interfaz para visualizar todas las sesiones concurrentes y capacidad para invalidar remotamente sesiones específicas (ej. cerrar sesión en 4 de los 5 dispositivos activos).
*   **Recuperación de Acceso:** Flujo completo y seguro para "Olvidé mi contraseña" y restablecimiento mediante tokens de un solo uso con tiempo de expiración.

### 🔒 Autenticación de Dos Factores (2FA)
*   Protección de acciones sensibles (inicios de sesión desde nuevas IPs, cambios de credenciales) mediante validación de dos pasos.
*   Soporte dual:
    *   Código de un solo uso (OTP) enviado por Email.
    *   Integración algorítmica con aplicaciones TOTP (Google Authenticator, Authy).

## 🐋 Orquestación con Docker

El entorno está completamente dockerizado, dividido en 4 contenedores especializados para garantizar el aislamiento de red, la seguridad y el despliegue replicable:

1.  **`db`**: Contenedor de PostgreSQL. Aislado en una red interna (`backend-network`), sin exposición directa a internet.
2.  **`migrations`**: Contenedor efímero que se levanta previo al backend. Su única función es ejecutar los scripts `.sql` puros para estructurar las tablas, actualizar esquemas y morir al finalizar.
3.  **`backend`**: API de Fastify. Gestiona la lógica dura, validaciones criptográficas, 2FA y conexión exclusiva con la base de datos a través de la red interna.
4.  **`frontend`**: Aplicación Next.js. Renderiza la interfaz de usuario e interactúa como BFF. Empaqueta los tokens emitidos por Fastify en cookies `HttpOnly`, `Secure` y `SameSite=Strict` para el navegador del cliente, mitigando ataques XSS.

## 🏗️ Patrones y Calidad de Código

Este proyecto está construido bajo estrictos estándares de la industria de ingeniería de software:
*   **Arquitectura Limpia & Diseño Orientado a Objetos:** Separación rigurosa entre controladores, servicios y lógica de acceso a datos, facilitando el mantenimiento y la escalabilidad.
*   **Patrón Repositorio:** Abstracción total de las consultas a PostgreSQL. Uso exclusivo de *Prepared Statements* (consultas parametrizadas) para blindar el sistema contra inyección SQL.
*   **Tipado Estricto:** Aprovechamiento al máximo de las interfaces y genéricos de TypeScript para asegurar contratos consistentes entre el Frontend, el BFF y el Backend.
