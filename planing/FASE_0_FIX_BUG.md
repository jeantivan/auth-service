
# Fase 0: Corrección de Bugs y Preparación del Entorno

**Objetivo Principal:** Corregir un error de sintaxis SQL en el repositorio de sesiones y preparar las funciones base en los repositorios para soportar la arquitectura multi-login que se construirá en la Fase 1.

---

## 1. Corrección del Bug Silencioso (Sesiones)

**Problema:** En la función `findSessionsByUserId`, la consulta SQL está utilizando comillas simples (`'`) para los nombres de las columnas en el `SELECT`. En PostgreSQL, esto provoca que la consulta devuelva cadenas de texto literales (es decir, la palabra "id" en lugar del valor real del ID) para todas las filas encontradas.

**Archivo a modificar:** `docker/backend/src/repositories/session.repository.ts`

**Acción:** Reemplazar la función actual por la siguiente, eliminando las comillas simples y añadiendo un `ORDER BY` para que las sesiones más recientes aparezcan primero:

```typescript
export async function findSessionsByUserId(
	client: PoolClient,
	userId: string
) {
	const result = await client.query(`
		SELECT id, user_id, created_at, user_agent, ip_address, expires_at, revoked_at
		FROM sessions
		WHERE user_id = $1
		ORDER BY created_at DESC
	`, [userId]);

	return result.rows;
}

```

---

## 2. Extensión del Repositorio de Proveedores de Autenticación

**Problema:** Actualmente solo existe lógica para crear y buscar proveedores locales (Email/Password). Necesitamos funciones genéricas para manejar Google y GitHub.

**Archivo a modificar:** `docker/backend/src/repositories/auth-provider.repository.ts`

**Acción:** Añadir las siguientes dos funciones al final del archivo:

```typescript
export async function createOAuthProvider(
	client: PoolClient,
	userId: string,
	providerType: 'google' | 'github',
	providerId: string
) {
	const result = await client.query(
		`INSERT INTO auth_providers
		(user_id, provider_type, provider_id)
		VALUES ($1, $2, $3)
		RETURNING id, user_id, provider_type, provider_id`,
		[userId, providerType, providerId],
	);
	return result.rows[0];
}

export async function findAuthProvider(
	client: PoolClient,
	providerType: 'google' | 'github',
	providerId: string
) {
	const result = await client.query(`
		SELECT ap.user_id, u.is_active, u.email
		FROM auth_providers ap
		JOIN users u ON ap.user_id = u.id
		WHERE ap.provider_type = $1
		AND ap.provider_id = $2
	`, [providerType, providerId]);

	return result.rows[0] ?? null;
}

```

---

## 3. Mejora en el Repositorio de Usuarios

**Problema:** En el flujo de OAuth, si un usuario se loguea con Google, necesitamos verificar si su correo ya existe en nuestra base de datos para vincular la cuenta. La función actual `findUserByEmail` solo devuelve el `id`, pero necesitaremos el `email` y su estado `is_active` para la lógica de negocio.

**Archivo a modificar:** `docker/backend/src/repositories/user.repository.ts`

**Acción:** Actualizar el `SELECT` de la función `findUserByEmail`:

```typescript
export async function findUserByEmail(
	client: PoolClient,
	email: string,
) {
	const result = await client.query(
		'SELECT id, email, is_active FROM users WHERE email = $1',
		[email],
	);

	return result.rows[0] ?? null;
}

```

---

## 4. Actualización de Tipos de Dominio

**Problema:** TypeScript necesita conocer la estructura de los datos que devolverán Google y GitHub para mantener el tipado estricto en el servicio de autenticación.

**Archivo a modificar:** `docker/backend/src/domain/auth.types.ts`

**Acción:** Añadir la siguiente interfaz al final del archivo:

```typescript
export type OAuthProfile = {
	provider: 'google' | 'github';
	providerId: string;
	email: string;
	name?: string;
}

```

