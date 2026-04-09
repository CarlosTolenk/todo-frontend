# AtomChat Tasks Frontend

Frontend en Angular 17 para autenticación simple por email y gestión de tareas sobre un backend HTTP existente.

## Stack

- Angular 17
- TypeScript estricto
- Angular Material
- SCSS
- Reactive Forms
- HttpClient
- RxJS

## Arquitectura

```text
src/app
├── core
│   ├── api
│   ├── guards
│   ├── models
│   └── services
├── shared
│   └── components
└── features
    ├── auth
    └── tasks
```

## Flujo

### Login

1. El usuario ingresa su email.
2. La app llama `GET /users/by-email/:email`.
3. Si la API devuelve `data` con usuario, se guarda en `sessionStorage` y navega a `/tasks`.
4. Si la API devuelve `data: null`, se abre un diálogo de confirmación.
5. Si el usuario confirma, la app llama `POST /users` con `{ email }`, guarda sesión y navega a `/tasks`.

### Tasks

1. La ruta `/tasks` está protegida por `sessionGuard`.
2. La app toma el usuario actual desde `sessionStorage`.
3. Carga tareas con `GET /tasks?userId=...`.
4. Las operaciones de crear, editar, completar y eliminar actualizan la UI sin recargar la aplicación.

## API

La URL base está centralizada en:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Valor configurado:

```ts
https://api-gjqb54fxhq-uc.a.run.app
```

Los componentes no contienen llamadas HTTP directas. Toda la integración vive en:

- `src/app/core/api/api.service.ts`
- `src/app/core/services/users-api.service.ts`
- `src/app/core/services/tasks-api.service.ts`

## Desarrollo local

Instalar dependencias:

```bash
npm install
```

Levantar la app:

```bash
npm start
```

Build de producción:

```bash
npm run build
```

Tests:

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Nota: en este entorno los tests se validaron usando Brave como binario Chromium-compatible:

```bash
CHROME_BIN="/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" npm test -- --watch=false --browsers=ChromeHeadless
```

## Decisiones de implementación

- `SessionService` encapsula persistencia local del usuario actual.
- `AuthService` resuelve el flujo de login/creación de usuario sin estado global adicional.
- `TasksPageComponent` mantiene el estado de pantalla con `BehaviorSubject` y actualizaciones locales de la colección.
- `TasksListComponent` usa `trackBy` por `id`.
- Los formularios usan `Reactive Forms` con validaciones claras.
- Los estados de loading, empty y error están resueltos con componentes y mensajes explícitos.

## Tests incluidos

- `AuthService`: persiste usuario creado y limpia sesión en logout.
- `sessionGuard`: permite acceso con sesión y redirige a `/login` cuando no existe usuario.
