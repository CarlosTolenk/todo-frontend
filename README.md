# AtomChat Tasks Frontend

Aplicación frontend construida con Angular 17 para autenticación por email y gestión de tareas sobre una API HTTP existente. El proyecto está orientado a una experiencia simple, clara y lista para demostración técnica.

## Resumen

La aplicación permite:

- iniciar sesión con email
- crear usuario si no existe
- cargar tareas asociadas a la sesión actual
- crear, editar, completar y eliminar tareas
- mantener la sesión activa en navegador
- validar calidad mediante lint, tests y build automatizados

## Demo y despliegue

La aplicación está preparada para despliegue automático en Firebase Hosting mediante GitHub Actions al hacer merge a `main`.

## Stack técnico

- Angular 17
- TypeScript con configuración estricta
- Angular Material
- SCSS
- RxJS
- Reactive Forms
- Vitest
- ESLint
- Firebase Hosting
- GitHub Actions

## Arquitectura

El código está organizado por funcionalidades y capas para mantener separación de responsabilidades sin sobre-ingeniería.

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

### Capas

- `domain`: entidades y contratos de repositorio
- `application`: facades y guards
- `infrastructure`: integración HTTP y persistencia de sesión
- `presentation`: páginas, formularios, listas y diálogos
- `core`: piezas técnicas transversales, como el cliente API y modelos de respuesta
- `shared`: componentes reutilizables de UI

## Flujos principales

### Autenticación

1. El usuario ingresa su email.
2. El frontend valida formato antes de consultar la API.
3. Si el usuario existe, se persiste la sesión local y se navega a tareas.
4. Si no existe, se abre un modal de confirmación para crear el usuario.
5. Tras la creación, se guarda la sesión y se redirige a la vista principal.

### Gestión de tareas

1. La ruta de tareas está protegida por sesión.
2. La aplicación obtiene las tareas del usuario autenticado.
3. El usuario puede crear, editar, completar y eliminar tareas.
4. Las acciones reflejan cambios inmediatos en la interfaz y muestran feedback visual.
5. Acciones sensibles como eliminar tarea o cerrar sesión requieren confirmación.

## Calidad de interfaz

Durante la implementación se reforzaron varios detalles de UX:

- formularios con validación alineada al backend
- reseteo limpio tras crear tareas
- feedback de éxito con `snackbar`
- modales de confirmación consistentes
- confirmación explícita para logout y eliminación

## Integración con API

La URL base está centralizada en:

- [`src/environments/environment.ts`](./src/environments/environment.ts)
- [`src/environments/environment.prod.ts`](./src/environments/environment.prod.ts)

Valor actual:

```ts
https://api-gjqb54fxhq-uc.a.run.app
```

Las llamadas HTTP no viven en componentes. Se encapsulan en:

- [`src/app/core/api/api.service.ts`](./src/app/core/api/api.service.ts)
- [`src/app/features/auth/infrastructure/repositories/http-users.repository.ts`](./src/app/features/auth/infrastructure/repositories/http-users.repository.ts)
- [`src/app/features/tasks/infrastructure/repositories/http-tasks.repository.ts`](./src/app/features/tasks/infrastructure/repositories/http-tasks.repository.ts)

## Scripts disponibles

Instalar dependencias:

```bash
npm install
```

Desarrollo local:

```bash
npm start
```

Lint:

```bash
npm run lint
```

Tests:

```bash
npm test -- --watch=false
```

Coverage:

```bash
npm run test:coverage
```

Build:

```bash
npm run build
```

## Testing y calidad

El proyecto incluye:

- tests unitarios de facades y repositorios
- tests funcionales de páginas y componentes clave
- cobertura configurada con Vitest + V8
- validación estática con ESLint
- pipeline de Pull Request con lint, test y build

Cobertura lograda durante esta implementación:

- `Statements`: 97%+
- `Lines`: 98%+
- `Functions`: 94%+

## CI/CD

### Pull Requests

El workflow de validación ejecuta:

- `npm ci`
- `npm run lint`
- `npm test -- --watch=false`
- `npm run build`

### Producción

Al hacer merge a `main`, GitHub Actions despliega automáticamente a Firebase Hosting.

Archivos relevantes:

- [`/.github/workflows/pr-validation.yml`](./.github/workflows/pr-validation.yml)
- [`/.github/workflows/deploy-firebase-hosting.yml`](./.github/workflows/deploy-firebase-hosting.yml)
- [`/firebase.json`](./firebase.json)

## Decisiones de implementación

- `AuthFacade` concentra sesión, búsqueda de usuario y creación de cuenta
- `TasksFacade` encapsula la lógica principal del dominio de tareas
- la UI depende de contratos, no de detalles HTTP
- los errores de backend se traducen a mensajes legibles para usuario final
- la estructura privilegia mantenibilidad y claridad sobre complejidad innecesaria

## Estado del proyecto

Actualmente el frontend:

- compila correctamente
- pasa lint
- pasa la suite de tests
- está integrado con despliegue automático a Firebase Hosting

## Autoría y propósito

Este repositorio está preparado para presentación técnica y demostración funcional, con foco en buenas prácticas de frontend, separación por capas, calidad automatizada y despliegue continuo.
