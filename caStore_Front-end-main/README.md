# SGIA — Frontend

[![Estado](https://img.shields.io/badge/estado-activo-success)](.)
[![Next.js](https://img.shields.io/badge/Next.js-15%2B%20App%20Router-black)](https://nextjs.org/)
[![Licencia](https://img.shields.io/badge/licencia-ISC-blue)](./LICENSE)

Aplicación web del **Sistema de Gestión de Inventario Automotriz (SGIA)** para CA Store. SPA construida con Next.js (App Router) que consume la API REST del backend SGIA y ofrece la interfaz para inventario, movimientos, alertas, usuarios, roles y perfil.

---

## 📋 Tabla de contenidos

- [Descripción](#-descripción)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Módulos del sistema](#-módulos-del-sistema)
- [Componentes UI](#-componentes-ui-disponibles)
- [Requisitos previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Variables de entorno](#-variables-de-entorno)
- [Comandos](#-comandos)
- [Autenticación](#-sistema-de-autenticación)
- [Sistema de diseño](#-sistema-de-diseño)
- [Convenciones de código](#-convenciones-de-código)
- [Flujo de datos](#-flujo-de-datos)
- [Modo demostración](#-modo-demostración)
- [Capturas](#-capturas-de-pantalla)
- [Contribución](#-contribución)
- [Contacto y licencia](#-contacto-y-licencia)

---

## 📖 Descripción

El frontend de SGIA es una **SPA** (Single Page Application) construida con **Next.js 15+ (App Router)** que consume la API REST del backend SGIA. Proporciona:

- **Pantallas** para login, recuperación de contraseña, dashboard, productos, categorías, ubicaciones, proveedores, movimientos, alertas, usuarios, roles y perfil del usuario.
- **Estado global** (Zustand) para autenticación y **cache del servidor** (React Query) para datos de la API.
- **Estilos** con CSS Modules y variables CSS (sin Tailwind), alineados con la marca CA Store.
- **Permisos por rol:** botones y rutas se muestran u ocultan según los permisos del usuario autenticado.

---

## 🛠 Stack tecnológico

| Tecnología        | Versión   | Uso                          |
|-------------------|-----------|------------------------------|
| Next.js           | 15+ / 16  | Framework (App Router)       |
| React             | 19.x      | UI                           |
| TypeScript        | 5.x       | Tipado estático              |
| CSS Modules       | —         | Estilos (sin Tailwind)       |
| React Hook Form   | ^7.x      | Formularios                  |
| Zod               | ^4.x      | Validación de schemas        |
| Zustand           | ^5.x      | Estado global (auth)         |
| TanStack React Query | ^5.x   | Cache y estado servidor      |
| Axios             | ^1.x      | Peticiones HTTP              |
| Recharts          | ^3.x      | Gráficas (dashboard)         |
| Lucide React      | ^0.5.x    | Íconos                       |
| clsx              | ^2.x      | Clases CSS condicionales     |

---

## 🏗 Arquitectura

Se sigue una **arquitectura tipo Feature-Sliced** adaptada:

- **Capas:**
  - **app:** rutas (Next.js App Router), layouts y páginas que orquestan.
  - **features:** módulos de negocio (auth, dashboard, products, users, etc.) con sus componentes, hooks, tipos y schemas.
  - **components:** UI reutilizable (`ui/`, `layout/`, `tables/`, `common/`).
  - **services:** clientes HTTP por dominio (auth, users, products, etc.) que llaman al backend.
  - **hooks:** hooks globales (useAuth, useDebounce, useModal, etc.).
  - **store:** estado global (Zustand), sobre todo auth.
  - **lib / utils:** configuración de Axios, auth (token, persistencia), formateo (fechas, COP).

- **Patrón por módulo:** cada feature suele tener `components/`, `hooks/`, `types/`, `schemas/` y opcionalmente `mockData.ts` para fallback cuando la API no responde.

- **Comunicación con el backend:** los componentes usan hooks que a su vez usan servicios (Axios); React Query cachea respuestas y maneja loading/error.

```
┌─────────────────────────────────────────────────────────────────┐
│  Page (app) → Feature Component → Hook (useX) → Service (Axios)  │
│       │              │                  │              │         │
│       │              │                  │              └── API REST
│       │              │                  └── React Query (cache)
│       │              └── UI + permisos (useAuth)
│       └── Layout, protección de ruta (middleware)
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del proyecto

```
caStore_Front-end/
├── app/                        # Next.js 15 App Router
│   ├── (auth)/                 # Rutas de autenticación (login, recover, reset, change-password)
│   │   ├── login/
│   │   ├── recover-password/
│   │   ├── reset-password/[token]/
│   │   └── change-password/
│   ├── (dashboard)/            # Rutas privadas del sistema
│   │   ├── dashboard/
│   │   ├── products/           # Listado, nuevo, editar [id]
│   │   ├── categories/
│   │   ├── locations/
│   │   ├── suppliers/          # Listado, nuevo, perfil [id], editar
│   │   ├── movements/          # Listado, nuevo, kardex [id]
│   │   ├── alerts/              # Listado, detalle [id], config
│   │   ├── users/               # Listado, nuevo, editar [id]
│   │   ├── roles/               # Listado, nuevo, editar [id], clonar
│   │   └── profile/             # Mi perfil (sin permiso de módulo)
│   ├── globals.css             # Variables CSS globales (tokens de diseño)
│   ├── layout.tsx
│   └── page.tsx                # Redirección a dashboard o login
│
├── src/
│   ├── components/
│   │   ├── ui/                 # Componentes base reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Switch.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   └── CustomCheckbox.tsx
│   │   ├── layout/             # Layout de la aplicación
│   │   │   ├── PageWrapper.tsx
│   │   │   ├── Sidebar/
│   │   │   └── Topbar/
│   │   ├── tables/             # Tablas y paginación
│   │   │   ├── DataTable.tsx
│   │   │   └── Pagination.tsx
│   │   └── common/             # Componentes comunes
│   │       ├── EmptyState/
│   │       ├── MockWarning/
│   │       └── Skeleton/
│   │
│   ├── features/               # Módulos de negocio
│   │   ├── auth/               # Login, recuperar/resetear contraseña, ProtectedPage
│   │   ├── dashboard/          # KPIs, gráficas, widgets
│   │   ├── products/           # Listado, formulario, hooks, tipos, mock
│   │   ├── categories/         # Gestión de categorías, árbol
│   │   ├── locations/          # Mapa, listado, formulario
│   │   ├── suppliers/          # Listado, perfil, formulario
│   │   ├── movements/          # Listado, registro, kardex
│   │   ├── alerts/             # Listado, detalle, config
│   │   ├── users/              # Listado, formulario, roles
│   │   ├── roles/              # Listado, formulario, permisos
│   │   └── profile/            # Mi perfil (datos, seguridad, sesiones)
│   │
│   ├── services/               # Clientes HTTP por dominio
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── products.service.ts
│   │   ├── categories.service.ts
│   │   ├── locations.service.ts
│   │   ├── suppliers.service.ts
│   │   ├── movements.service.ts
│   │   └── ...
│   │
│   ├── hooks/                  # Hooks globales reutilizables
│   │   ├── useAuth.ts          # Permisos (canRead, canCreate, etc.)
│   │   ├── useDebounce.ts
│   │   ├── useModal.ts
│   │   └── useApiData.ts       # Patrón fallback a mock
│   │
│   ├── store/                  # Estado global (Zustand)
│   │   └── auth.store.ts       # user, token, login, logout, refreshUser
│   │
│   ├── lib/                    # Configuración y utilidades de infra
│   │   ├── api.ts              # Instancia de Axios (baseURL, interceptors)
│   │   └── auth.ts             # Token: guardar, leer, cookie, parseJwt
│   │
│   ├── utils/                  # Helpers de formato
│   │   └── format.ts           # formatCOP, formatDate, parseJwt
│   │
│   └── middleware.ts           # Protección de rutas (token, redirección a login)
│
├── .env.local.example           # Plantilla de variables (si existe)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📦 Módulos del sistema

| Módulo       | Descripción                                              |
|--------------|----------------------------------------------------------|
| **auth**     | Login, recuperar contraseña, resetear, cambiar primera contraseña, ProtectedPage. |
| **dashboard**| Panel principal con KPIs, gráficas y widgets.            |
| **products** | Listado (filtros, paginación), crear/editar, estadísticas. |
| **categories** | Gestión de categorías (árbol, CRUD).                  |
| **locations**  | Mapa del almacén, listado, CRUD ubicaciones.         |
| **suppliers**  | Listado, perfil de proveedor, crear/editar.           |
| **movements**  | Listado de movimientos, registro, kardex por producto. |
| **alerts**    | Listado de alertas, detalle, configuración.            |
| **users**     | Listado de usuarios, crear/editar, resumen por estado.  |
| **roles**     | Listado de roles, crear/editar/clonar, matriz de permisos. |
| **profile**   | Mi perfil: datos personales (solo nombre editable), seguridad (contraseña), notificaciones, sesiones. |

---

## 🧩 Componentes UI disponibles

| Componente      | Descripción                                              |
|-----------------|----------------------------------------------------------|
| **Button**      | Botón con variantes (primary, secondary, danger), loading. |
| **Input**       | Campo de texto/número, label, error, hint, icon, prefix.   |
| **Select**      | Desplegable con label, error, hint.                      |
| **Textarea**    | Área de texto con label y error.                         |
| **Switch**      | Interruptor on/off.                                      |
| **Modal**       | Diálogo con variantes (default, warning, danger, success). |
| **Badge**       | Etiqueta con variantes (active, inactive, warning).       |
| **Toast**       | Notificaciones temporales (éxito, error).                |
| **ImageUpload** | Subida de imagen (preview, validación tipo/tamaño).       |
| **CustomCheckbox** | Casilla de verificación personalizada.                |

Todos se estilizan con **CSS Modules** y variables de `globals.css` (sin Tailwind).

---

## ✅ Requisitos previos

- **Node.js** ≥ 20 (LTS recomendado)
- **npm** ≥ 10
- **Backend SGIA** corriendo y accesible (p. ej. `http://localhost:4000/api/v1`)

---

## 🚀 Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repositorio> caStore_Front-end
   cd caStore_Front-end
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crear `.env.local` (o el archivo que use el proyecto) con al menos:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
   ```

4. **Asegurarse de que el backend está corriendo**

   El frontend consume la API; sin backend, las pantallas pueden usar datos mock y mostrar el aviso de “Modo Offline / Mocks activos”.

5. **Arrancar en desarrollo**

   ```bash
   npm run dev
   ```

   La aplicación quedará disponible en `http://localhost:3000` (o el puerto que indique Next.js).

---

## 🔐 Variables de entorno

| Variable              | Descripción                          | Ejemplo                                |
|-----------------------|--------------------------------------|----------------------------------------|
| `NEXT_PUBLIC_API_URL` | URL base de la API del backend SGIA  | `http://localhost:4000/api/v1`         |

Solo variables con prefijo `NEXT_PUBLIC_` están disponibles en el navegador.

---

## 📜 Comandos

| Comando        | Descripción                    |
|----------------|--------------------------------|
| `npm run dev`  | Servidor de desarrollo         |
| `npm run build`| Build de producción            |
| `npm start`    | Servir build de producción     |
| `npm run lint` | Ejecutar ESLint                |

---

## 🔑 Sistema de autenticación

- **JWT en el frontend:** Tras el login, el backend devuelve un token JWT. El frontend lo guarda en **localStorage** (clave `sgia_token`) y también en una **cookie** (`sgia_token`) para que el middleware de Next.js pueda comprobar la sesión sin ejecutar lógica en el cliente.
- **Uso del token:** La instancia de Axios (`src/lib/api.ts`) añade en cada petición la cabecera `Authorization: Bearer <token>`. Si el servidor responde 401, se limpia la sesión y se redirige a login.
- **Protección de rutas:** El **middleware** (`src/middleware.ts`) comprueba la presencia (y opcionalmente la expiración) del token en la cookie. Si no hay token en una ruta privada, redirige a `/login` con `redirect` en query. Si hay token y el usuario intenta acceder a login/recover/reset, redirige a `/dashboard`.
- **Permisos por rol:** El store de auth guarda el usuario y los permisos decodificados del JWT. El hook **useAuth** expone `canRead(module)`, `canCreate(module)`, etc. Los componentes y las páginas protegidas (p. ej. `ProtectedPage`) usan estas funciones para mostrar u ocultar botones y secciones.

---

## 🎨 Sistema de diseño

Definido en **`app/globals.css`** mediante variables CSS.

### Colores

| Variable              | Uso       | Ejemplo (hex) |
|-----------------------|-----------|----------------|
| `--color-primary`     | Marca     | #F8623A       |
| `--color-primary-soft`| Fondo suave| #FEE9E3      |
| `--color-dark`        | Texto principal | #1E293B  |
| `--color-mid`         | Texto secundario | #64748B |
| `--color-success`     | Éxito     | #16A34A       |
| `--color-error`       | Error     | #DC2626       |
| `--color-warning`     | Advertencia | #D97706    |
| `--color-info`        | Info      | #2563EB       |
| `--color-surface`     | Fondo de tarjetas | #FFFFFF |
| `--color-border`      | Bordes    | #E2E8F0       |

### Tipografía

- **Display:** `--font-display` (DM Serif Display)
- **Cuerpo:** `--font-body` (DM Sans)
- **Mono:** `--font-mono` (DM Mono)

Tamaños: `--text-xs` (11px) hasta `--text-3xl` (36px).

### Espaciado y bordes

- Espaciado: `--space-1` (4px) hasta `--space-12` (48px).
- Radios: `--radius-sm` (6px), `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`.
- Sombras: `--shadow-sm`, `--shadow-md`, `--shadow-lg`.
- Transiciones: `--transition-fast`, `--transition-normal`.

Los componentes usan estas variables con `var(...)` en sus CSS Modules.

---

## 📐 Convenciones de código

- **Sin Tailwind:** solo **CSS Modules** y variables de `globals.css`. No usar clases de Tailwind.
- **Nombres de archivos:** PascalCase para componentes (`.tsx`), camelCase para hooks/utilidades. CSS Modules: `Nombre.module.css`.
- **Imports:** Orden sugerido: React/Next → librerías externas → componentes internos → hooks/store → tipos → estilos. Alias `@/src` para la raíz de `src`.
- **Nuevo módulo:** Crear carpeta bajo `src/features/nombreModulo` con `components/`, `hooks/`, `types/`, `schemas/` y opcionalmente `mockData.ts`. Añadir servicio en `src/services/` y rutas bajo `app/(dashboard)/nombre-modulo/`.

---

## 🔄 Flujo de datos

1. **Usuario interactúa** (p. ej. abre listado de productos).
2. **Página** renderiza un componente del feature (p. ej. `ProductList`).
3. **Componente** usa un hook (p. ej. `useProductsList`) que usa **React Query** para llamar a `productsService.getProducts(params)`.
4. **Servicio** usa la instancia de **Axios** (`src/lib/api.ts`), que añade el token y envía la petición al backend.
5. **Backend** responde; React Query guarda el resultado en cache y actualiza el estado.
6. **Componente** muestra datos, loading o error. Si la petición falla (red o 5xx), algunos hooks tienen **fallback a mock** y muestran `MockWarning`.

- **Zustand** se usa para estado global de **autenticación** (user, token, login, logout). El resto de datos servidor se delegan a **React Query** (cache, refetch, invalidación).

---

## ⚠ Modo demostración

- **MockWarning:** Componente que muestra un aviso cuando la aplicación está usando **datos de demostración** porque no pudo conectar con el servidor (timeout, caída, etc.).
- **Cuándo aparece:** En módulos que implementan fallback a mock (p. ej. listado de productos o estadísticas). Si la API devuelve error o no responde, el hook rellena con `mockData` y marca `isUsingMock`, y la UI muestra el banner.
- **Objetivo:** Permitir probar la interfaz y el flujo aunque el backend no esté disponible, dejando claro que los datos no son reales.

---

## 📸 Capturas de pantalla

_(Aquí puedes añadir capturas del login, dashboard, listado de productos, formularios y perfil.)_

- Ejemplo: Login y dashboard.
- Ejemplo: Listado de productos con filtros y tarjetas KPI.
- Ejemplo: Perfil de usuario (información personal y seguridad).

---

## 🤝 Contribución

- **Commits:** Mensajes claros en español; formato sugerido: `tipo(ámbito): descripción` (ej. `feat(products): filtro por categoría`).
- **Ramas:** `main` estable; desarrollo en `develop` o ramas por feature/fix.
- **Pull requests:** Abrir contra la rama base acordada, describir el cambio y asegurar que el lint pase. Mantener las mismas convenciones que el backend (español, sin Tailwind, CSS Modules).

---

## 📞 Contacto y licencia

- **Proyecto:** SGIA — Sistema de Gestión de Inventario Automotriz  
- **Empresa:** CA Store  

Para soporte o preguntas sobre el frontend, contactar al equipo de desarrollo o al responsable del repositorio.

**Licencia:** ISC. Ver archivo [LICENSE](./LICENSE) en la raíz del repositorio si existe.
