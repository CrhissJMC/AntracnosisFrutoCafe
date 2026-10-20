# Proyecto Antracnosis — sitio web con base de datos

Sitio del proyecto sobre la antracnosis en el fruto del café. La aplicación tiene:

- **Base de datos PostgreSQL**, donde vive todo el contenido de la página (textos, síntomas, ciclo, manejo, equipo, servicios y artículos).
- **Registro e inicio de sesión** con dos roles:
  - **Administrador:** gestiona los artículos del blog, el contenido de cada página, los textos generales, los comentarios, los mensajes de contacto y los usuarios.
  - **Usuario:** se registra y comenta en los artículos del blog. Puede borrar sus propios comentarios.
- **Frontend en React con diseño atómico**, responsivo en móvil, tablet y escritorio.
- **Docker**, para que funcione igual en cualquier computadora.

---

## 1. Cómo ejecutarlo

### Requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y abierto.

### Pasos
1. Abre una terminal (PowerShell) en esta carpeta.
2. Crea tu archivo de configuración a partir del ejemplo:
   ```powershell
   copy .env.example .env
   notepad .env
   ```
   Cambia `POSTGRES_PASSWORD` (solo letras y números), `JWT_SECRET` (32 caracteres o más) y el correo y la contraseña del administrador. No subas `.env` a GitHub; ya está en `.gitignore`.
3. Levanta todo:
   ```powershell
   docker compose up -d --build
   ```
   La primera vez tarda unos minutos porque descarga las imágenes e instala las dependencias.
4. Abre **http://localhost:8080**.

### Cuenta de administrador
Usa el `ADMIN_EMAIL` y el `ADMIN_PASSWORD` del archivo `.env`. Al entrar llegas al panel en **/admin**.
> El administrador se crea **solo la primera vez** que arranca la base de datos. Si después cambias la contraseña en `.env`, no se actualiza. Para empezar de cero, consulta la sección 4.

### Comandos útiles
| Acción | Comando |
|---|---|
| Ver si todo está corriendo | `docker compose ps` |
| Ver los registros de la API | `docker compose logs -f api` |
| Detener | `docker compose down` |
| Detener y **borrar la base de datos** | `docker compose down -v` |
| Reconstruir tras cambiar código | `docker compose up -d --build` |
| Compartir por internet (túnel Cloudflare) | `docker compose --profile tunnel up -d` |
| Ver la URL pública del túnel | `docker compose logs tunnel` (busca `trycloudflare.com`) |
| Cerrar el túnel | `docker compose stop tunnel` |

> El túnel es temporal: la URL cambia cada vez que se reinicia y solo funciona mientras tu PC y Docker estén encendidos. Con el túnel, pon `TRUST_PROXY_HOPS=2` en `.env`.

Para ver la base de datos con pgAdmin o DBeaver, conéctate a `localhost:5433` con el usuario, la contraseña y la base de datos definidos en `.env`.

---

## 2. Arquitectura

```
Navegador ──► web (nginx :8080) ──► /api/* ──► api (Node + Express :4000) ──► db (PostgreSQL 16)
                 └─ sirve la app React compilada
```

| Servicio | Carpeta | Tecnología |
|---|---|---|
| `web` | `frontend/` | React 18 + Vite, servido con nginx |
| `api` | `backend/` | Node 20, Express, `pg`, JWT en cookie httpOnly, validación con zod |
| `db` | — | PostgreSQL 16 con volumen persistente `db-data` |

Al arrancar, la API crea las tablas (`backend/src/db/schema.sql`) y carga el contenido original de la página (`backend/src/db/seed-data.js`) **solo si las tablas están vacías**. Nunca sobrescribe lo que el administrador haya editado.

### Base de datos
| Tabla | Qué guarda |
|---|---|
| `users` | Cuentas, con rol `admin` o `user` (correo único sin distinguir mayúsculas) |
| `articles` | Artículos del blog (contenido en Markdown sencillo, publicado o borrador) |
| `comments` | Comentarios: artículo + usuario. Se borran en cascada con el artículo o el usuario |
| `content_items` | Bloques de las páginas: `sintomas`, `ciclo`, `manejo`, `mision`, `equipo`, `servicios` |
| `settings` | Textos generales (hero, "¿Qué es?", contacto, pie de página…) |
| `contact_messages` | Mensajes del formulario de contacto |

### Seguridad
- Contraseñas guardadas con bcrypt. La sesión va en una cookie `httpOnly` con `SameSite=Lax`.
- El rol se lee de la base de datos en cada petición, así que quitarle el rol de admin a alguien surte efecto de inmediato.
- Todas las entradas se validan en el servidor y se rechazan campos desconocidos, por ejemplo un `role` enviado al registrarse.
- Hay límites de intentos en login y registro, comentarios y formulario de contacto. El formulario además tiene un campo trampa contra bots.
- El contenido se dibuja sin `innerHTML` y los enlaces solo aceptan `http(s)`, lo que evita XSS.
- Un administrador no puede quitarse su propio rol ni borrar su propia cuenta.

---

## 3. Diseño atómico (frontend)

```
frontend/src/
├── styles/tokens.css        ← design tokens: colores, tipografía, espaciado, capas
├── components/
│   ├── atoms/               ← Button, Input, Textarea, Select, Heading, Text, Tag, Badge, Icon, Avatar, Logo, Link, Spinner
│   ├── molecules/           ← FormField, Alert, InfoCard, StepItem, ListColumn, BlogCard, CommentItem,
│   │                          ConfirmButton, ContactItem, StatCard, NavItem, EmptyState
│   ├── organisms/           ← Navbar, Footer, Hero, PageHero, Section/Grid, secciones de Inicio, TeamSection,
│   │                          BlogGrid, CommentSection, ContactForm, AuthForm, AdminSidebar, DataTable,
│   │                          ArticleForm, ContentEditor
│   └── templates/           ← MainLayout, AuthLayout, AdminLayout (+ AdminGuard)
├── pages/                   ← páginas = plantillas + datos reales de la API
│   └── admin/
├── context/                 ← sesión (AuthContext) y contenido del sitio (SiteContext)
├── hooks/                   ← useAsync, useForm
└── lib/                     ← cliente de la API, enrutador, Markdown seguro, formatos
```

Cada nivel solo usa los niveles inferiores: los átomos usan tokens, las moléculas usan átomos, y así hacia arriba. Cada componente tiene su propio `.css` al lado.

**Responsivo:** las rejillas se adaptan solas (`auto-fill/minmax`). En móvil hay menú desplegable, las tablas del panel se convierten en tarjetas y el panel tiene una barra lateral deslizable. Los botones miden al menos 44px, los campos usan 16px para que el iPhone no haga zoom, el hover solo se aplica en dispositivos con mouse y se respeta la opción de "reducir movimiento".

---

## 4. Rutas

**Sitio público:** `/`, `/nosotros`, `/servicios`, `/blog`, `/blog/:slug`, `/contacto`, `/login`, `/registro`

**Panel (solo admin):** `/admin`, `/admin/articulos`, `/admin/articulos/nuevo`, `/admin/articulos/:id`, `/admin/comentarios`, `/admin/contenido`, `/admin/textos`, `/admin/mensajes`, `/admin/usuarios`

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
| `GET /health` | público (estado de la API y la base de datos) |

---

## 5. Desarrollo sin Docker (opcional)

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

## 6. Problemas comunes
- **"port is already allocated":** cambia `WEB_PORT` o `DB_PORT` en `.env`.
- **No puedo entrar como admin:** el admin se creó con la contraseña que tenía `.env` la primera vez. Ejecuta `docker compose down -v` para borrar la base de datos y vuelve a levantar.
- **Cambié el código y no se ve:** usa `docker compose up -d --build`.
- **Las imágenes no cargan:** las imágenes de ejemplo vienen de Unsplash y necesitan internet. Puedes cambiarlas desde el panel.

Los archivos `index.html`, `style.css` y `app.js` de la raíz son la versión original en HTML puro. Ya no se usan y puedes archivarlos.
