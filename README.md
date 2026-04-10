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

La app quedó organizada por bounded contexts y capas:

```text
src/app
├── core
│   ├── api
│   └── http
├── shared
│   └── components
└── features
    ├── auth
    │   ├── domain
    │   ├── application
    │   ├── infrastructure
    │   └── presentation
    └── tasks
        ├── domain
        ├── application
        ├── infrastructure
        └── presentation
```

### Criterio usado

- `domain`: entidades y contratos de repositorio.
- `application`: facades y guards que orquestan casos de uso.
- `infrastructure`: implementación HTTP y persistencia de sesión.
- `presentation`: páginas y componentes Angular.
- `core`: piezas técnicas transversales, como el cliente HTTP y contratos de respuesta.

Es DDD pragmático, no académico: separa responsabilidades sin meter factories, aggregates o eventos que aquí no aportan valor.

## Flujo

### Login

1. El usuario ingresa su email.
2. El formulario valida formato antes de llamar al backend.
3. La app llama `GET /users/by-email/:email`.
4. Si la API devuelve un usuario, guarda sesión y navega a `/tasks`.
5. Si la API devuelve `data: null`, abre un diálogo de confirmación.
6. Solo si el usuario confirma, llama `POST /users`, guarda sesión y navega a `/tasks`.

### Tasks

1. La ruta `/tasks` está protegida por `sessionGuard`.
2. La app toma el usuario actual desde sesión local.
3. Carga tareas con `GET /tasks?userId=...`.
4. Crear, editar, completar y eliminar actualizan la UI sin recargar la aplicación.

## API

La URL base está centralizada en:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Valor configurado:

```ts
https://api-gjqb54fxhq-uc.a.run.app
```

Los componentes no contienen llamadas HTTP directas. La integración vive en infraestructura:

- `src/app/core/api/api.service.ts`
- `src/app/features/auth/infrastructure/repositories/http-users.repository.ts`
- `src/app/features/tasks/infrastructure/repositories/http-tasks.repository.ts`

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

## Decisiones clave

- `AuthFacade` concentra login, creación de usuario y sesión.
- `TasksFacade` encapsula operaciones del dominio de tareas.
- Los repositorios del dominio se inyectan por contrato y se resuelven con implementaciones HTTP/browser en infraestructura.
- `presentation` quedó desacoplada de detalles HTTP.
- Los mensajes de error se traducen a textos legibles en el cliente API.

## Tests incluidos

- `AuthFacade`: persiste usuario creado y limpia sesión en logout.
- `sessionGuard`: permite acceso con sesión y redirige a `/login` cuando no existe usuario.
