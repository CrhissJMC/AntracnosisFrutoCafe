# Proyecto Antracnosis

**Gestión del conocimiento utilizando un modelo de deep learning para la detección de antracnosis en frutos de café mediante imágenes digitales.**

Sitio web y sistema del trabajo final del curso **Gestión del Conocimiento** — Programa de Estudios de Ingeniería de Sistemas, Facultad de Ingeniería de Sistemas y Mecánica Eléctrica (FISME), **Universidad Nacional Toribio Rodríguez de Mendoza de Amazonas (UNTRM)**, 2026.

| Equipo | Docente |
|---|---|
| Arvildo Julca, Enith Fiorela · Caruajulca Salazar, Dalmer Asunción · Magallán Culqui, Cristhian Jefrye · Silva Avellaneda, Frans Norbert | Mg. Fuentes Maza, Frans |

El repositorio contiene el sitio del proyecto (React + Node.js + PostgreSQL), el **módulo de diagnóstico** que clasifica fotos de frutos de café con redes neuronales convolucionales y la **trazabilidad** del avance según el modelo SECI. Todo se ejecuta con Docker en la PC del equipo y se puede publicar con un túnel HTTPS de Cloudflare.

---

## Contenido

1. [Qué hace el sistema](#1-qué-hace-el-sistema)
2. [Relación con el informe](#2-relación-con-el-informe)
3. [Cómo ejecutarlo](#3-cómo-ejecutarlo)
4. [Módulo de diagnóstico y modelos](#4-módulo-de-diagnóstico-y-modelos)
5. [Trazabilidad del proyecto](#5-trazabilidad-del-proyecto)
6. [Arquitectura](#6-arquitectura)
7. [Base de datos](#7-base-de-datos)
8. [Diseño atómico del frontend](#8-diseño-atómico-del-frontend)
9. [Rutas y API](#9-rutas-y-api)
10. [Seguridad](#10-seguridad)
11. [Estado del proyecto y pendientes](#11-estado-del-proyecto-y-pendientes)
12. [Desarrollo sin Docker y problemas comunes](#12-desarrollo-sin-docker-y-problemas-comunes)

---

## 1. Qué hace el sistema

### Páginas públicas

| Página | Ruta | Contenido |
|---|---|---|
| Inicio | `/` | Qué es la antracnosis, síntomas en el fruto, ciclo de la enfermedad y manejo integrado |
| Nosotros | `/nosotros` | El proyecto como trabajo del curso, la UNTRM (creación, licenciamiento, FISME, curso), equipo y docente |
| Metodología | `/metodologia` | El problema, estado sanitario del fruto (semáforo), arquitectura experimental, evaluación, tecnologías, alcance y enlace a este repositorio |
| Blog | `/blog` | Artículos sobre sanidad del café; los usuarios registrados comentan (base de conocimiento) |
| **Diagnóstico** | `/diagnostico` | Tomar o subir la foto de un fruto, elegir el modelo y ver el resultado con semáforo (sano, revisar o antracnosis), probabilidad, Grad-CAM y recomendación |
| **Trazabilidad** | `/trazabilidad` | Avance del proyecto: anillo del ciclo del café, objetivos, bitácora con fases SECI y matriz de requisitos |
| Contacto | `/contacto` | Formulario de contacto |

### Roles

- **Administrador:** gestiona artículos, comentarios, contenido de las páginas, textos del sitio, mensajes, usuarios y la **trazabilidad** (avance de objetivos, notas de bitácora y estado de cada requisito).
- **Usuario registrado:** comenta en el blog, borra sus propios comentarios y **usa el diagnóstico**.

Todo el contenido vive en la base de datos y se edita desde el panel (`/admin`), sin tocar el código.

---

## 2. Relación con el informe

Esta sección vincula cada parte del informe del **tercer avance** con lo que ya existe en el repositorio.

### Objetivos específicos → página Trazabilidad

| # | Objetivo (informe, 1.4.2) | Dónde se sigue |
|---|---|---|
| 1 | Preparar el conjunto de datos | Trazabilidad · tramo «Floración» del ciclo |
| 2 | Entrenar el modelo de deep learning | Trazabilidad · tramo «Fruto verde» |
| 3 | Maximizar la sensibilidad (recall ≥ 85 % en la clase antracnosis) | Trazabilidad · tramo «Maduración» |
| 4 | Implementar los módulos de gestión del conocimiento | Trazabilidad · tramo «Cosecha y beneficio» |
| 5 | Validar el sistema | Trazabilidad · tramo «Grano y tostado» |

El avance de cada objetivo se actualiza desde el panel y cada cambio queda en la bitácora con su evidencia y su fase SECI.

### Secciones del informe → implementación

| Informe | Implementación en el repositorio | Estado |
|---|---|---|
| 1.3 Propuesta · captura y diagnóstico automático | Página `/diagnostico` + servicio `ml/` | ✅ Implementado (falta el modelo entrenado) |
| 1.3 Propuesta · memoria institucional (registro de capturas) | Tablas `capturas`, `diagnosticos` | ⏳ Pendiente |
| 1.3 Propuesta · red de conocimiento | Blog con comentarios; validación experta | 🟡 Blog listo, validación pendiente |
| 1.3 Propuesta · tablero de incidencia | Pestaña Tablero | ⏳ Pendiente |
| 2.2.1 Modelo SECI | Bitácora de Trazabilidad: cada registro lleva su fase SECI | ✅ Implementado |
| 2.7.2 Transferencia de aprendizaje (EfficientNet-B0, MobileNetV2) | `ml/app.py` carga ambos modelos; selector en `/diagnostico` | ✅ Integración lista |
| 2.7.4 Métricas (recall, precisión, F1) | Metodología → Evaluación; `ml/` devuelve probabilidades por clase | ✅ |
| 2.7.5 Explicabilidad (Grad-CAM) | `ml/app.py` genera el mapa Grad-CAM de cada predicción | ✅ |
| 3.4 TIC (React, Node, PostgreSQL, Docker, Cloudflare) | Toda la arquitectura (sección 6) | ✅ |
| 3.5 IA y deep learning (FastAPI + TensorFlow) | Servicio `ml/` (perfil `ml` de Docker) | ✅ |
| 4.1.3 y 4.1.4 Requerimientos (RF01–RF10, RNF01–RNF09) | Matriz de trazabilidad de requisitos (sección 5) | ✅ |
| 4.2.1 Arquitectura lógica en capas | `web` → `api` → `ml` y `db` (sección 6) | ✅ |
| 4.2.3 Modelo de datos (Anexo 5) | Tablas del sitio, de trazabilidad y de requisitos; las del módulo, pendientes (sección 7) | 🟡 Parcial |
| 4.3.4 Pantalla «Nuevo diagnóstico» (Figura 6) | `/diagnostico` | ✅ |
| 4.3.4 Historial, Validación, Tablero y Modelo (Figuras 7–10) | — | ⏳ Pendiente |
| 4.3.6 Estructura del repositorio (Tabla 16) | `ml/`, `ml/modelos/` fuera de Git, servicio `ml` en `docker-compose.yml` | ✅ · `cuadernos/` pendiente |
| 4.4 Publicación con túnel de Cloudflare | `docker compose --profile tunnel up -d` | ✅ |

### Diferencias con el informe

| En el informe | En el repositorio | Motivo |
|---|---|---|
| Tres modelos: EfficientNet-B0, MobileNetV2 y una CNN desde cero (línea base) | Solo EfficientNet-B0 y MobileNetV2 | Se descartó la CNN desde cero por alcance |
| Redes, asociaciones de base y parcelas de una organización | Parcela y zona, sin datos de ninguna organización | El sitio no usa datos de terceros |
| `POST /api/diagnosticos` (Tabla 17) | `POST /api/diagnostico/analizar` | El registro de capturas aún no existe; la ruta actual solo analiza |
| Pantallas en `frontend/src/pages/diagnostico/` | `frontend/src/pages/DiagnosisPage.jsx` | Por ahora es una sola pantalla |

> **Al actualizar el informe**, revisar también: la sección 4.3.2 y la Tabla 22 mencionan la CNN desde cero.

---

## 3. Cómo ejecutarlo

### Requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y abierto.

### Pasos
1. Abre una terminal (PowerShell) **en esta carpeta**.
2. Crea tu archivo de configuración a partir del ejemplo:
   ```powershell
   copy .env.example .env
   notepad .env
   ```
   Cambia `POSTGRES_PASSWORD` (solo letras y números), `JWT_SECRET` (32 caracteres o más) y el correo y la contraseña del administrador. **No subas `.env` a GitHub**; ya está en `.gitignore`.
3. Levanta el sitio:
   ```powershell
   docker compose up -d --build
   ```
   La primera vez tarda unos minutos porque descarga las imágenes e instala las dependencias.
4. Abre **http://localhost:8080**.

El servicio de los modelos y el túnel son opcionales y tienen su propio perfil (ver la tabla de comandos).

### Cuenta de administrador
Usa el `ADMIN_EMAIL` y el `ADMIN_PASSWORD` del archivo `.env`. Al entrar llegas al panel en **/admin**.
> El administrador se crea **solo la primera vez** que arranca la base de datos. Si después cambias la contraseña en `.env`, no se actualiza. Para empezar de cero, ver la sección 12.

### Comandos útiles
| Acción | Comando |
|---|---|
| Levantar el sitio | `docker compose up -d --build` |
| Levantar el sitio **con el servicio de los modelos** | `docker compose --profile ml up -d --build` |
| Compartir por internet (túnel de Cloudflare) | `docker compose --profile tunnel up -d` |
| Ver la URL pública del túnel | `docker compose logs tunnel` (busca `trycloudflare.com`) |
| Cerrar el túnel | `docker compose stop tunnel` |
| Ver si todo está corriendo | `docker compose ps` |
| Ver los registros de la API o del modelo | `docker compose logs -f api` · `docker compose logs -f ml` |
| Reconstruir tras cambiar código | `docker compose up -d --build` |
| Detener | `docker compose down` |
| Detener y **borrar la base de datos** | `docker compose down -v` |

> **El túnel es temporal:** la URL cambia cada vez que se reinicia y solo funciona mientras la PC y Docker estén encendidos. Con el túnel, pon `TRUST_PROXY_HOPS=2` en `.env`. Antes de compartir el enlace, usa contraseñas seguras en las cuentas de administrador.

Para ver la base de datos con pgAdmin o DBeaver, conéctate a `localhost:5433` con el usuario, la contraseña y la base de datos definidos en `.env`.

---

## 4. Módulo de diagnóstico y modelos

### La pantalla (`/diagnostico`)
1. **Fotografía del fruto:** guía de captura (un solo fruto, fondo uniforme, 10–20 cm, sin contraluz), arrastrar y soltar, **Tomar foto** (abre la cámara del teléfono) y **Subir foto**. Antes de enviarla, la foto se reduce a 1024 px y se le quitan los metadatos, incluida la ubicación GPS.
2. **Modelo** (siempre visible): **EfficientNet-B0** por defecto, **MobileNetV2** (más rápido) o **Comparar ambos**.
3. **Resultado:** semáforo verde (sano), ámbar (revisar) o rojo (antracnosis), probabilidad de antracnosis con los umbrales de la versión, foto junto al mapa **Grad-CAM** y la descripción «qué se observa / qué hacer», tomada de Metodología → Estado sanitario del fruto. «Revisar» no es una clase: aparece cuando la probabilidad queda entre los dos umbrales, y pide otra foto y la revisión de un especialista. Con «Comparar ambos» se muestran los dos resultados y si coinciden.

Analizar requiere iniciar sesión.

### El servicio de los modelos (`ml/`)
- Python 3.11 + FastAPI + TensorFlow (CPU). Solo lo llama la API del sitio por la red interna de Docker; **no se expone a internet**.
- Se enciende con `docker compose --profile ml up -d --build`. Sin él, la página avisa que el servicio no está activo.
- **Agregar los modelos entrenados:** copiar `efficientnet_b0.keras` y `mobilenet_v2.keras` en `ml/modelos/`. Se cargan solos en el primer análisis, sin reiniciar nada. Mientras no existan, la página indica «Aún no entrenado».
- Configuración opcional por modelo (`<modelo>.json`): versión, orden de clases, preprocesamiento, **umbrales inferior y superior** sobre la probabilidad de antracnosis (sano, revisar o antracnosis; RNF01 y RNF05) y capa de Grad-CAM. El modelo puede terminar en una neurona sigmoide o en una softmax con las clases sano y antracnosis.
- Los archivos `.keras` **no se suben a Git**.

La guía completa, con un ejemplo de exportación del modelo, está en **[ml/README.md](ml/README.md)**.

### Datos
La búsqueda de datasets (37 conjuntos evaluados por relevancia, acceso y tamaño) está documentada en el archivo de avances del equipo. Solo un conjunto de libre acceso tiene antracnosis confirmada en fruto de café y ninguno separa la infección incipiente de la avanzada. Por eso el modelo usa dos clases (sano y antracnosis) y no estima la severidad (informe, 1.6 y 4.3.1).

---

## 5. Trazabilidad del proyecto

La página `/trazabilidad` muestra:

- **Anillo del ciclo del café:** 20 etapas, del botón floral al grano tostado, y cada una vale 5 % del avance total. El anillo exterior muestra el avance de cada objetivo según su peso.
- **Objetivos específicos** con su barra de avance y el objetivo en curso resaltado.
- **Bitácora:** cada cambio de avance o nota queda registrado con fecha, autor y **fase SECI** (socialización, externalización, combinación, internalización). Los registros no se editan, solo se agregan.
- **Matriz de trazabilidad de requisitos:** los 19 requisitos del informe (10 funcionales y 9 no funcionales), cada uno con su objetivo, el módulo que lo atiende, su caso de prueba (CP01–CP10) y su estado: **pendiente → diseñado → implementado → probado**. Al cambiar un estado desde el panel, el cambio se registra en la bitácora del objetivo.

Desde el panel (`/admin/trazabilidad`) se actualiza el avance de cada objetivo, se agregan notas y se cambia el estado de cada requisito.

---

## 6. Arquitectura

```
Navegador ──► web (nginx :8080) ──► /api/* ──► api (Node + Express :4000) ──► db (PostgreSQL 16)
                 │                                     └──► ml (Python + TensorFlow :8000, interno)
                 └─ sirve la app React compilada
Internet ──► tunnel (Cloudflare, opcional) ──► web
```

| Servicio | Carpeta | Tecnología |
|---|---|---|
| `web` | `frontend/` | React 18 + Vite con diseño atómico, servido con nginx |
| `api` | `backend/` | Node 20, Express, `pg`, JWT en cookie httpOnly, validación con zod |
| `db` | — | PostgreSQL 16 con volumen persistente `db-data` |
| `ml` | `ml/` | Python 3.11, FastAPI, TensorFlow y Pillow: ejecuta los modelos y calcula Grad-CAM (perfil `ml`) |
| `tunnel` | — | Cloudflare Tunnel: URL pública HTTPS temporal sin abrir puertos (perfil `tunnel`) |

Al arrancar, la API crea o actualiza las tablas (`backend/src/db/schema.sql`) y carga el contenido inicial (`backend/src/db/seed-data.js`) **solo donde falta**. Cuando un texto inicial cambia de versión, se actualiza **solo si nadie lo editó** desde el panel.

---

## 7. Base de datos

### Tablas actuales
| Tabla | Qué guarda |
|---|---|
| `users` | Cuentas, con rol `admin` o `user` (correo único sin distinguir mayúsculas) |
| `articles` | Artículos del blog (Markdown sencillo, publicado o borrador, tiempo de lectura calculado) |
| `comments` | Comentarios: artículo + usuario; se borran en cascada con el artículo o el usuario |
| `content_items` | Bloques de las páginas: `sintomas`, `ciclo`, `manejo`, `mision`, `equipo`, `universidad`, `problema`, `clases`, `flujo`, `metricas`, `tecnologias`, `alcance` |
| `settings` | Textos generales: portada, Nosotros, Metodología, Trazabilidad, contacto, pie de página |
| `contact_messages` | Mensajes del formulario de contacto |
| `objectives` | Objetivos específicos con su peso y avance (0–100 %) |
| `progress_log` | Bitácora: cambio de avance (anterior → nuevo) o nota, con fase SECI y autor |
| `requirements` | Matriz de requisitos: RF/RNF, objetivo, módulo, caso de prueba, prioridad y estado |

Las reglas críticas se aseguran en la propia base de datos: valores permitidos, rangos de 0 a 100, claves foráneas y que cada registro de la bitácora sea un cambio o una nota con texto.

### Tablas del módulo (pendientes, Anexo 5 del informe)
`capturas`, `diagnosticos` y `validaciones`, con las vistas `v_diagnostico_final`, `v_incidencia_mensual` y `v_dataset_reentrenamiento`, más `modelo_versiones` y `parcelas`. Permitirán guardar cada foto con su diagnóstico (RF05), la validación del experto (RF06), el tablero (RF08) y el reentrenamiento (RF09).

---

## 8. Diseño atómico del frontend

Cada pieza se define **una sola vez** y se reutiliza donde haga falta.

```
frontend/src/
├── styles/tokens.css        ← design tokens: colores, tipografía, espaciado, capas
├── components/
│   ├── atoms/               ← Button, Input, Textarea, Select, Checkbox, Range, Heading, Text, Eyebrow,
│   │                          Tag, Badge, Dot, Icon, Avatar, Logo, Link, Spinner,
│   │                          ProgressBar, NumberBadge, CycleStage (figuras SVG del ciclo del café)
│   ├── molecules/           ← FormField, FormActions, Alert, Callout, Panel, InfoCard, StepItem, ListColumn,
│   │                          BlogCard, CommentItem, ConfirmButton, ContactItem, StatCard, NavItem, EmptyState,
│   │                          ObjectiveItem, LogEntry, LegendItem, SeciSelect, RequirementStatusSelect,
│   │                          ChipList, ModelOption, HealthLight, ProbabilityList, ImageFrame
│   ├── organisms/           ← Navbar, Footer, Hero, PageHero, Section/Grid, WhatIsSection,
│   │                          CardGridSection, StepsSection, ListColumnsSection, TeamSection, UniversitySection,
│   │                          CallToAction, BlogGrid, CommentSection, ContactForm, AuthForm, AdminSidebar,
│   │                          DataTable, ArticleForm, ContentEditor,
│   │                          CoffeeCycleRing, ObjectiveList, ProgressTimeline, CycleLegend, RequirementMatrix,
│   │                          TraceabilitySummary, ObjectiveEditor, ProgressNoteForm,
│   │                          ImageCapture, ModelPicker, DiagnosisResult, DiagnosisPanel
│   └── templates/           ← MainLayout, AuthLayout, AdminLayout (+ AdminGuard), TraceabilityLayout, DiagnosisLayout
├── pages/                   ← páginas = plantillas + datos reales de la API
│   └── admin/
├── context/                 ← sesión (AuthContext) y contenido del sitio (SiteContext)
├── hooks/                   ← useAsync, useForm
└── lib/                     ← cliente de la API, enrutador, Markdown seguro, formatos, trazabilidad, diagnóstico
```

Cada nivel solo usa los niveles inferiores (átomos → moléculas → organismos → plantillas → páginas), y cada componente tiene su propio `.css` al lado.

**Responsivo:** las pantallas se usan sin desplazamiento horizontal de 360 a 1440 px (RNF09). En el teléfono hay menú desplegable, las tablas se convierten en tarjetas y las columnas se apilan. El panel de Trazabilidad aprovecha las pantallas anchas. Los botones miden al menos 44 px, el hover solo se aplica con mouse y se respeta la opción de «reducir movimiento».

---

## 9. Rutas y API

**Sitio público:** `/`, `/nosotros`, `/metodologia`, `/blog`, `/blog/:slug`, `/diagnostico`, `/trazabilidad`, `/contacto`, `/login`, `/registro` (`/servicios` redirige a Metodología).

**Panel (solo admin):** `/admin`, `/admin/articulos`, `/admin/articulos/nuevo`, `/admin/articulos/:id`, `/admin/comentarios`, `/admin/trazabilidad`, `/admin/contenido`, `/admin/textos`, `/admin/mensajes`, `/admin/usuarios`

### API REST (`/api`)
| Método y ruta | Acceso |
|---|---|
| `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | público |
| `GET /articles`, `GET /articles/:slug`, `GET /articles/:id/comments` | público |
| `POST /articles/:id/comments`, `DELETE /comments/:id` (propio) | usuario registrado |
| `POST/PUT/DELETE /articles`, `GET /comments`, `DELETE /comments/:id` (cualquiera) | admin |
| `GET /content`, `GET /settings`, `POST /messages` | público |
| `POST/PUT/DELETE /content`, `PUT /settings`, `GET/PATCH/DELETE /messages` | admin |
| `GET /admin/stats`, `GET/PATCH/DELETE /admin/users` | admin |
| `GET /traceability` (objetivos, avance total, bitácora y matriz de requisitos) | público |
| `PATCH /traceability/objectives/:id`, `PATCH /traceability/requirements/:id`, `POST /traceability/log`, `DELETE /traceability/log/:id` | admin |
| `GET /diagnostico/modelos` (modelos y disponibilidad) | público |
| `POST /diagnostico/analizar` (`{ image, model }`, con `model` = `efficientnet_b0`, `mobilenet_v2` o `ambos`) | usuario registrado |
| `GET /health` | público (estado de la API y la base de datos) |

El servicio `ml` expone `GET /health` y `POST /predict` **solo en la red interna** (ver [ml/README.md](ml/README.md)).

---

## 10. Seguridad

- Contraseñas guardadas con bcrypt. La sesión va en una cookie `httpOnly` con `SameSite=Lax`.
- El rol se lee de la base de datos en cada petición: quitarle el rol de admin a alguien surte efecto de inmediato.
- Todas las entradas se validan en el servidor y se rechazan los campos desconocidos.
- Límites de intentos en login y registro, comentarios, contacto y análisis de imágenes. El formulario de contacto tiene además un campo trampa contra bots.
- El contenido se dibuja sin `innerHTML`, y los enlaces y las imágenes de los textos del sitio solo aceptan `http(s)`, lo que evita XSS.
- Las fotos del diagnóstico solo se aceptan como JPG o PNG de hasta 8 MB, se procesan en el servicio interno y no se guardan todavía.
- Un administrador no puede quitarse su propio rol ni borrar su propia cuenta.
- `.env` (credenciales) y `ml/modelos/` (modelos) están excluidos de Git.

---

## 11. Estado del proyecto y pendientes

| Hecho | Pendiente |
|---|---|
| Sitio con blog, panel y contenido editable | Descargar, filtrar y dividir el dataset (70/15/15) |
| Trazabilidad con SECI y matriz de requisitos | Entrenar EfficientNet-B0 y MobileNetV2 con la GPU de la PC en WSL2 (`cuadernos/`) |
| Pantalla «Nuevo diagnóstico» con selector y comparación de modelos | Tablas del módulo: registro de capturas, validación, versiones del modelo |
| Servicio `ml/` con Grad-CAM y dos umbrales (sano, revisar, antracnosis) | Pantallas Historial, Validación, Tablero y Modelo |
| Publicación con Docker y túnel de Cloudflare | Perfiles del módulo (productor, propietario, especialista) |
| | Pruebas: casos CP01–CP10, rendimiento, usabilidad (SUS) y fotos de campo |

### Historial de cambios
| Fecha | Cambio |
|---|---|
| 20/10/2026 | Sitio inicial con Docker; imágenes del blog corregidas |
| 24/10/2026 | Página de Trazabilidad con anillo del ciclo del café y bitácora SECI |
| 25/10/2026 | Panel de Trazabilidad a pantalla completa; UNTRM en Nosotros; Servicios reemplazado por Metodología |
| 26/10/2026 | Contenido alineado con el tercer avance; enlace al repositorio; módulo de diagnóstico; matriz de requisitos |
| 27/10/2026 | Versión final del tercer avance: diagnóstico con sano, revisar y antracnosis; datasets públicos; objetivos, requisitos, tecnologías y alcance actualizados |

---

## 12. Desarrollo sin Docker y problemas comunes

### Desarrollo sin Docker (opcional)
Necesitas Node 20+ y un PostgreSQL local.

```powershell
# Terminal 1 — API
cd backend
npm install
$env:DATABASE_URL="postgresql://usuario:clave@localhost:5432/antracnosis"
$env:JWT_SECRET="una-cadena-de-al-menos-32-caracteres-123456"
$env:ADMIN_EMAIL="admin@antracnosis.pe"; $env:ADMIN_PASSWORD="Admin12345"
npm run dev

# Terminal 2 — Frontend (http://localhost:5173, reenvía /api al puerto 4000)
cd frontend
npm install
npm run dev
```

### Problemas comunes
- **«no configuration file provided»:** el comando se ejecutó fuera de esta carpeta. Entra primero a la carpeta del proyecto.
- **«port is already allocated»:** cambia `WEB_PORT` o `DB_PORT` en `.env`.
- **No puedo entrar como admin:** el admin se creó con la contraseña que tenía `.env` la primera vez. Ejecuta `docker compose down -v` para borrar la base de datos y vuelve a levantar.
- **El diagnóstico dice que el servicio no está activo:** levanta con `docker compose --profile ml up -d --build`.
- **El diagnóstico dice «Aún no entrenado»:** faltan los archivos `.keras` en `ml/modelos/` (ver [ml/README.md](ml/README.md)).
- **Cambié el código y no se ve:** usa `docker compose up -d --build`.
- **Las imágenes no cargan:** las imágenes de ejemplo vienen de Unsplash y necesitan internet. Puedes cambiarlas desde el panel.

Los archivos `index.html`, `style.css` y `app.js` de la raíz son la versión original en HTML puro. Ya no se usan y se conservan como referencia.
