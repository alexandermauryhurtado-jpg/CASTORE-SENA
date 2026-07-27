# SGIA — Backend API

[![Estado](https://img.shields.io/badge/estado-activo-success)](.)
[![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-green)](https://nodejs.org/)
[![Licencia](https://img.shields.io/badge/licencia-ISC-blue)](./LICENSE)

API REST del **Sistema de Gestión de Inventario Automotriz (SGIA)** para CA Store. Servidor basado en Node.js, Express y TypeScript que expone endpoints para inventario, movimientos, alertas, usuarios y roles.

---

## 📋 Tabla de contenidos

- [Descripción](#-descripción)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Módulos disponibles](#-módulos-disponibles)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Comandos](#-comandos)
- [Documentación de la API](#-documentación-de-la-api)
- [Formato de respuestas](#-formato-estándar-de-respuestas)
- [Códigos de error](#-códigos-de-error)
- [Credenciales iniciales](#-credenciales-del-usuario-administrador-inicial)
- [Base de datos](#-base-de-datos)
- [Reglas de negocio](#-reglas-de-negocio)
- [Capturas](#-capturas-de-pantalla)
- [Contribución](#-contribución)
- [Contacto y licencia](#-contacto-y-licencia)

---

## 📖 Descripción

El backend de SGIA es el servidor que centraliza la lógica de negocio del sistema. Está pensado para:

- **Quién lo usa:** equipos de operaciones y administración de CA Store que gestionan inventario de partes y repuestos automotrices.
- **Qué problema resuelve:** ofrece una API REST segura y consistente para dar de alta productos, categorías, ubicaciones, proveedores, movimientos de stock y alertas, con control de acceso por roles y permisos (RBAC) y trazabilidad mediante JWT.

---

## 🛠 Stack tecnológico

| Tecnología     | Versión   | Uso                          |
|----------------|-----------|------------------------------|
| Node.js        | 20 LTS    | Runtime                      |
| Express        | ^5.x      | Framework web                |
| TypeScript     | ^5.x      | Tipado estático              |
| MySQL          | 8         | Base de datos                |
| mysql2         | ^3.x      | Driver MySQL (promises)      |
| jsonwebtoken   | ^9.x      | JWT para autenticación       |
| Zod            | ^4.x      | Validación de esquemas       |
| bcryptjs       | ^3.x      | Encriptación de contraseñas  |
| nodemailer     | ^8.x      | Envío de correos             |
| uuid           | ^13.x     | Generación de IDs únicos     |
| helmet         | ^8.x      | Cabeceras de seguridad       |
| cors           | ^2.x      | CORS                         |
| dotenv         | ^17.x     | Variables de entorno         |

- **Arquitectura:** modular por capas (Controller → Service → Repository).
- **Autenticación:** JWT firmado con secret (Bearer token en cabecera `Authorization`).
- **Autorización:** middleware RBAC por módulo y acción (read, create, update, delete).

---

## 🏗 Arquitectura

Se sigue un **patrón de capas** para separar responsabilidades y facilitar pruebas y mantenimiento:

```
┌─────────────────────────────────────────────────────────────┐
│  Routes (auth, rbac) → Controller → Service → Repository    │
└─────────────────────────────────────────────────────────────┘
         │                │              │             │
         │                │              │             └── Acceso a MySQL (query/execute)
         │                │              └── Lógica de negocio, validaciones, reglas
         │                └── Recibe req/res, valida entrada, llama al Service, formatea respuesta
         └── Define rutas HTTP y middlewares (auth + permisos por módulo)
```

- **Controller:** recibe la petición, opcionalmente valida el body/params con Zod, llama al Service y devuelve la respuesta usando `successResponse`, `paginatedResponse` o delega errores al `errorMiddleware`.
- **Service:** contiene la lógica de negocio, usa el Repository para leer/escribir y lanza excepciones tipadas (`NotFoundError`, `ConflictError`, `BusinessError`, etc.) cuando corresponde.
- **Repository:** ejecuta SQL contra MySQL mediante el pool de `config/database.ts` (queries parametrizadas).

Esta separación permite cambiar la base de datos o la forma de exponer la API sin reescribir la lógica de negocio.

---

## 📁 Estructura del proyecto

```
caStore_Back-end/
├── src/
│   ├── config/           # Configuración de la aplicación
│   │   ├── database.ts   # Pool MySQL y helpers query/execute
│   │   └── env.ts        # Validación de variables de entorno (Zod)
│   │
│   ├── modules/          # Módulos de negocio (cada uno con capas)
│   │   ├── auth/         # Login, recuperar/resetear contraseña, GET /me
│   │   ├── users/        # CRUD usuarios, PATCH /me/profile y /me/password
│   │   ├── roles/        # CRUD roles, permisos, clonar rol
│   │   ├── products/     # CRUD productos, stats, estado, imagen
│   │   ├── categories/   # CRUD categorías, árbol (tree)
│   │   ├── locations/    # CRUD ubicaciones, árbol (tree)
│   │   ├── suppliers/    # CRUD proveedores, historial de compras
│   │   ├── movements/    # Registro de movimientos, kardex, resúmenes
│   │   ├── alerts/       # Listado, resumen, resolver/descartar
│   │   └── dashboard/    # KPIs, gráficas, widgets
│   │
│   ├── shared/
│   │   ├── middleware/  # Middlewares globales
│   │   │   ├── auth.middleware.ts   # Verificación del JWT
│   │   │   ├── rbac.middleware.ts   # Permisos por módulo/acción
│   │   │   ├── error.middleware.ts  # Manejo centralizado de errores
│   │   │   └── audit.middleware.ts  # Auditoría (si aplica)
│   │   ├── utils/        # Utilidades compartidas
│   │   │   ├── response.util.ts     # successResponse, paginatedResponse
│   │   │   ├── jwt.util.ts          # Generar y verificar token
│   │   │   └── hash.util.ts         # bcrypt hash/compare
│   │   ├── exceptions/   # Errores tipados (AppError y derivados)
│   │   │   ├── AppError.ts
│   │   │   ├── UnauthorizedError.ts
│   │   │   ├── ForbiddenError.ts
│   │   │   ├── NotFoundError.ts
│   │   │   ├── ConflictError.ts
│   │   │   ├── ValidationError.ts
│   │   │   └── BusinessError.ts
│   │   └── types/        # Tipos compartidos (AuthRequest, PaginatedResult, etc.)
│   │
│   ├── app.ts            # Configuración de Express (middlewares, rutas)
│   └── server.ts         # Arranque del servidor (listen)
│
├── .env.example          # Plantilla de variables de entorno
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📦 Módulos disponibles

| Módulo      | Descripción                                                                 |
|-------------|-----------------------------------------------------------------------------|
| **auth**    | Login, recuperar contraseña, resetear contraseña, obtener usuario actual (`/me`). |
| **users**   | CRUD de usuarios, activar/desactivar, reenviar contraseña; perfil y contraseña del usuario autenticado (`/me/profile`, `/me/password`). |
| **roles**   | CRUD de roles, matriz de permisos, clonar rol.                              |
| **products**| CRUD de productos, listado paginado con filtros, estadísticas, cambio de estado e imagen. |
| **categories** | CRUD de categorías, listado y árbol jerárquico (tree).                  |
| **locations**  | CRUD de ubicaciones, listado y árbol (tree).                             |
| **suppliers**  | CRUD de proveedores, historial de compras por proveedor.                |
| **movements**  | Registro de movimientos de inventario, kardex por producto, resúmenes diarios. |
| **alerts**    | Listado de alertas, resumen, resolver y descartar.                       |
| **dashboard** | KPIs, datos para gráficas y widgets del panel principal.                |

---

## ✅ Requisitos previos

- **Node.js** ≥ 20 (LTS recomendado)
- **npm** ≥ 10
- **MySQL** 8 (servidor y cliente; por ejemplo MySQL Workbench para gestión)
- **Git**

---

## 🚀 Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repositorio> caStore_Back-end
   cd caStore_Back-end
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Copiar la plantilla y ajustar valores (ver sección [Variables de entorno](#-variables-de-entorno)):

   ```bash
   cp .env.example .env
   ```

4. **Crear la base de datos en MySQL**

   En MySQL Workbench o cliente MySQL:

   ```sql
   CREATE DATABASE sgia_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'sgia_user'@'localhost' IDENTIFIED BY 'Sgia@2026!';
   GRANT ALL PRIVILEGES ON sgia_dev.* TO 'sgia_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

5. **Ejecutar el esquema de tablas**

   Ejecutar los scripts SQL que definan las tablas del sistema (según los archivos o migraciones incluidos en el repositorio). Si el proyecto incluye carpeta `scripts/` o `migrations/`, ejecutar esos archivos en el orden indicado.

6. **Datos iniciales (opcional)**

   Si existe un script de seed o datos de prueba, ejecutarlo para tener roles, usuario administrador y datos de ejemplo.

7. **Arrancar en desarrollo**

   ```bash
   npm run dev
   ```

   El servidor quedará disponible en `http://localhost:4000` (o el `PORT` configurado en `.env`). El endpoint de salud es `GET /health`.

---

## 🔐 Variables de entorno

Todas se validan al arrancar mediante `src/config/env.ts` (Zod).

| Variable           | Descripción                          | Obligatoria | Ejemplo                          |
|--------------------|--------------------------------------|-------------|----------------------------------|
| `PORT`             | Puerto del servidor                  | No (default 4000) | `4000`                    |
| `NODE_ENV`         | Entorno (development/production/test)| No          | `development`                    |
| `DB_HOST`          | Host de MySQL                        | Sí          | `127.0.0.1`                     |
| `DB_PORT`          | Puerto de MySQL                      | No (3306)   | `3306`                          |
| `DB_NAME`          | Nombre de la base de datos           | Sí          | `sgia_dev`                      |
| `DB_USER`          | Usuario de MySQL                     | Sí          | `sgia_user`                     |
| `DB_PASSWORD`      | Contraseña de MySQL                  | Sí          | `********`                      |
| `DB_POOL_MIN`      | Mínimo de conexiones en el pool      | No          | `2`                             |
| `DB_POOL_MAX`      | Máximo de conexiones en el pool      | No          | `10`                            |
| `JWT_SECRET`       | Secret para firmar JWT (mín. 64 caracteres) | Sí  | (string largo y seguro)  |
| `JWT_EXPIRES_IN`   | Caducidad del token                  | No (8h)     | `8h`                            |
| `JWT_REFRESH_EXPIRES_IN` | Caducidad del refresh (si aplica) | No   | `7d`                            |
| `BCRYPT_ROUNDS`    | Rounds de bcrypt                     | No (12)     | `12`                            |
| `SMTP_HOST`        | Servidor SMTP                        | Sí          | `smtp.gmail.com`                |
| `SMTP_PORT`        | Puerto SMTP                          | No (587)    | `587`                           |
| `SMTP_USER`        | Usuario SMTP                         | Sí          | `noreply@tudominio.com`         |
| `SMTP_PASS`        | Contraseña o app password SMTP       | Sí          | `********`                      |
| `FRONTEND_URL`     | URL del frontend (CORS)              | Sí          | `http://localhost:3000`         |

---

## 📜 Comandos

| Comando        | Descripción                              |
|----------------|------------------------------------------|
| `npm run dev`  | Servidor en desarrollo (ts-node-dev)     |
| `npm run build`| Compila TypeScript a `dist/`             |
| `npm start`    | Ejecuta `dist/server.js` (producción)    |
| `npm run lint` | Ejecuta ESLint sobre `src/`              |

---

## 📡 Documentación de la API

Base URL: `http://localhost:4000/api/v1` (o la URL configurada). Las rutas protegidas requieren cabecera:

```http
Authorization: Bearer <token>
```

### Auth

| Método | Ruta                 | Descripción              | Auth | Permisos |
|--------|----------------------|--------------------------|------|----------|
| POST   | `/auth/login`        | Inicio de sesión         | No   | —        |
| POST   | `/auth/recover-password` | Solicitar recuperación | No   | —        |
| POST   | `/auth/reset-password`   | Restablecer contraseña | No   | —        |
| GET    | `/auth/me`           | Usuario actual           | Sí   | —        |

### Users

| Método | Ruta                      | Descripción           | Auth | Permisos   |
|--------|---------------------------|-----------------------|------|------------|
| GET    | `/users`                  | Listado paginado      | Sí   | users/read |
| GET    | `/users/:id`             | Detalle de usuario    | Sí   | users/read |
| POST   | `/users`                  | Crear usuario         | Sí   | users/create |
| PATCH  | `/users/:id`             | Actualizar usuario    | Sí   | users/update |
| PATCH  | `/users/:id/status`      | Activar/desactivar    | Sí   | users/update |
| POST   | `/users/:id/resend-password` | Reenviar contraseña | Sí | users/update |
| PATCH  | `/users/me/profile`      | Actualizar mi perfil  | Sí   | —          |
| PATCH  | `/users/me/password`     | Cambiar mi contraseña | Sí   | —          |

### Roles

| Método | Ruta              | Descripción   | Auth | Permisos    |
|--------|-------------------|---------------|------|-------------|
| GET    | `/roles`          | Listado       | Sí   | roles/read  |
| GET    | `/roles/:id`      | Detalle       | Sí   | roles/read  |
| POST   | `/roles`          | Crear         | Sí   | roles/create|
| PATCH  | `/roles/:id`      | Actualizar    | Sí   | roles/update|
| DELETE | `/roles/:id`      | Eliminar      | Sí   | roles/delete|
| POST   | `/roles/:id/clone`| Clonar rol    | Sí   | roles/create|

### Products

| Método | Ruta                  | Descripción        | Auth | Permisos      |
|--------|-----------------------|--------------------|------|---------------|
| GET    | `/products`           | Listado paginado   | Sí   | products/read |
| GET    | `/products/stats`     | Estadísticas       | Sí   | products/read |
| GET    | `/products/:id`       | Detalle            | Sí   | products/read |
| POST   | `/products`           | Crear              | Sí   | products/create |
| PATCH  | `/products/:id`       | Actualizar         | Sí   | products/update |
| PATCH  | `/products/:id/status`| Cambiar estado     | Sí   | products/update |
| PATCH  | `/products/:id/image` | Actualizar imagen  | Sí   | products/update |

### Categories

| Método | Ruta             | Descripción | Auth | Permisos        |
|--------|------------------|-------------|------|-----------------|
| GET    | `/categories`    | Listado     | Sí   | categories/read |
| GET    | `/categories/tree` | Árbol     | Sí   | categories/read |
| GET    | `/categories/:id`| Detalle     | Sí   | categories/read |
| POST   | `/categories`    | Crear       | Sí   | categories/create |
| PATCH  | `/categories/:id`| Actualizar  | Sí   | categories/update |
| DELETE | `/categories/:id`| Eliminar    | Sí   | categories/delete |

### Locations

| Método | Ruta             | Descripción | Auth | Permisos        |
|--------|------------------|-------------|------|-----------------|
| GET    | `/locations`     | Listado     | Sí   | locations/read  |
| GET    | `/locations/tree`| Árbol       | Sí   | locations/read  |
| GET    | `/locations/:id`| Detalle     | Sí   | locations/read  |
| POST   | `/locations`     | Crear       | Sí   | locations/create|
| PATCH  | `/locations/:id`| Actualizar  | Sí   | locations/update|
| DELETE | `/locations/:id`| Eliminar    | Sí   | locations/delete|

### Suppliers

| Método | Ruta                    | Descripción         | Auth | Permisos        |
|--------|-------------------------|---------------------|------|-----------------|
| GET    | `/suppliers`            | Listado             | Sí   | suppliers/read  |
| GET    | `/suppliers/:id`        | Detalle             | Sí   | suppliers/read  |
| GET    | `/suppliers/:id/purchases` | Historial compras | Sí   | suppliers/read  |
| POST   | `/suppliers`            | Crear               | Sí   | suppliers/create|
| PATCH  | `/suppliers/:id`        | Actualizar          | Sí   | suppliers/update|
| DELETE | `/suppliers/:id`        | Eliminar            | Sí   | suppliers/delete|

### Movements

| Método | Ruta                        | Descripción       | Auth | Permisos         |
|--------|-----------------------------|-------------------|------|------------------|
| GET    | `/movements`               | Listado           | Sí   | movements/read   |
| GET    | `/movements/kardex`        | Kardex (producto) | Sí   | movements/read   |
| GET    | `/movements/summary/daily`  | Resumen diario    | Sí   | movements/read   |
| GET    | `/movements/summary/today` | Resumen hoy       | Sí   | movements/read   |
| GET    | `/movements/:id`           | Detalle           | Sí   | movements/read   |
| POST   | `/movements`               | Registrar movimiento | Sí | movements/create |

### Alerts

| Método | Ruta                 | Descripción   | Auth | Permisos      |
|--------|----------------------|---------------|------|---------------|
| GET    | `/alerts`            | Listado       | Sí   | alerts/read   |
| GET    | `/alerts/summary`    | Resumen       | Sí   | alerts/read   |
| GET    | `/alerts/:id`       | Detalle       | Sí   | alerts/read   |
| PATCH  | `/alerts/:id/resolve`| Resolver     | Sí   | alerts/update |
| PATCH  | `/alerts/:id/dismiss`| Descartar    | Sí   | alerts/update |

### Dashboard

| Método | Ruta               | Descripción | Auth | Permisos        |
|--------|--------------------|-------------|------|-----------------|
| GET    | `/dashboard`       | Datos generales | Sí | (según implementación) |
| GET    | `/dashboard/kpis`  | KPIs        | Sí   | —               |
| GET    | `/dashboard/charts`| Datos gráficas | Sí | —             |
| GET    | `/dashboard/widgets`| Widgets   | Sí   | —               |

---

## 📤 Formato estándar de respuestas

### Respuesta exitosa (objeto o lista no paginada)

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... }
}
```

### Respuesta paginada

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null,
    "from": 1,
    "to": 10
  }
}
```

### Respuesta de error

```json
{
  "success": false,
  "message": "Mensaje legible para el usuario",
  "code": "CODIGO_ERROR"
}
```

En errores de validación (422) además se incluye:

```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "code": "VALIDATION_ERROR",
  "errors": { "campo": ["mensaje"] }
}
```

---

## ❌ Códigos de error

| Código HTTP | code en JSON    | Cuándo ocurre                                      |
|-------------|-----------------|----------------------------------------------------|
| 400         | (según uso)     | Petición mal formada (p. ej. JSON inválido).       |
| 401         | UNAUTHORIZED    | Token ausente, inválido o expirado.                |
| 403         | FORBIDDEN       | Sin permiso para la acción (RBAC).                 |
| 404         | NOT_FOUND       | Recurso no encontrado (producto, usuario, etc.).   |
| 409         | CONFLICT        | Conflicto de unicidad (p. ej. email ya existe).    |
| 409         | BUSINESS_ERROR  | Regla de negocio no cumplida.                      |
| 422         | VALIDATION_ERROR| Datos de entrada inválidos (Zod).                  |
| 500         | INTERNAL_ERROR  | Error interno del servidor.                        |

---

## 👤 Credenciales del usuario administrador inicial

Tras ejecutar los scripts de datos iniciales (seeds), suele existir un usuario administrador para pruebas. Consultar en el repositorio el archivo de seed o la documentación interna; un ejemplo típico sería:

- **Correo:** `admin@sgia.com` (o el definido en el seed)
- **Contraseña:** la definida en el script de datos iniciales

**Importante:** cambiar estas credenciales en entornos que no sean de desarrollo.

---

## 🗄 Base de datos

### Conexión con MySQL Workbench

1. Crear una nueva conexión.
2. Host: el valor de `DB_HOST` (p. ej. `127.0.0.1`).
3. Puerto: `DB_PORT` (por defecto 3306).
4. Usuario y contraseña: `DB_USER` y `DB_PASSWORD` del `.env`.

### Tablas principales (referencia)

El sistema utiliza tablas para, entre otros:

- **users** — Usuarios del sistema (email, contraseña hasheada, rol, estado).
- **roles** — Roles y permisos (JSON o tabla de detalle).
- **products** — Productos (SKU, nombre, stock, categoría, ubicación, etc.).
- **categories** — Categorías (jerarquía con parent_id).
- **locations** — Ubicaciones físicas (jerarquía, capacidad).
- **suppliers** — Proveedores.
- **movements** — Movimientos de inventario (entrada/salida, producto, cantidad).
- **alerts** — Alertas (stock bajo, vencimientos, etc.).
- Otras tablas de soporte (tokens de reset, auditoría, etc.) según el diseño real del esquema.

### Diagrama de relaciones (referencia en texto)

```
users ──┬── role_id ──► roles
        └── (soft delete: is_active)

products ──┬── category_id ──► categories ──► parent_id (self)
           ├── location_id ──► locations ──► parent_id (self)
           └── (soft delete, stock >= 0)

movements ──► product_id ──► products
          └── (inmutables, no se editan/borran)

alerts ──► product_id (opcional), user_id (opcional)
```

### Reseteo de datos de prueba

- Ejecutar de nuevo los scripts de seed o truncar tablas en el orden correcto (respetando foreign keys) y volver a ejecutar el seed.
- En desarrollo se puede usar una base de datos dedicada (p. ej. `sgia_dev`) y recrearla cuando haga falta.

---

## 📌 Reglas de negocio

- **Soft delete:** Las entidades principales (usuarios, productos, categorías, ubicaciones, proveedores) suelen usar un campo tipo `is_active`; no se borran filas físicamente para mantener trazabilidad.
- **Stock:** El stock de productos no puede ser negativo; las salidas se validan contra el stock actual.
- **Movimientos:** Los movimientos son inmutables; no se editan ni eliminan una vez registrados.
- **SKU:** El SKU de productos se genera automáticamente en el backend (p. ej. por categoría o secuencia).

---

## 📸 Capturas de pantalla

_(Aquí puedes añadir capturas del flujo de la API, Postman/Insomnia o del panel de administración que consuma este backend.)_

- Ejemplo: Colección de Postman mostrando login y listado de productos.
- Ejemplo: Respuesta de `GET /api/v1/products` en el navegador o cliente HTTP.

---

## 🤝 Contribución

- **Commits:** Mensajes claros en español; formato sugerido: `tipo(ámbito): descripción` (ej. `feat(auth): soporte refresh token`).
- **Ramas:** `main` estable; desarrollo en `develop` o ramas por feature (`feature/nombre`, `fix/nombre`).
- **Pull requests:** Abrir contra `develop` (o la rama base acordada), describir el cambio y asegurar que los tests y el lint pasen.

---

## 📞 Contacto y licencia

- **Proyecto:** SGIA — Sistema de Gestión de Inventario Automotriz  
- **Empresa:** CA Store  

Para soporte o preguntas sobre el backend, contactar al equipo de desarrollo o al responsable del repositorio.

**Licencia:** ISC. Ver archivo [LICENSE](./LICENSE) en la raíz del repositorio.
