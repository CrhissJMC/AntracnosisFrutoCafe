-- =========================================================
--  Proyecto Antracnosis — esquema de base de datos
--  Idempotente: se puede ejecutar en cada arranque.
-- =========================================================

-- Usuarios y roles ------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL CHECK (length(trim(name)) > 0),
  email         VARCHAR(160) NOT NULL,
  password_hash TEXT         NOT NULL,
  role          VARCHAR(10)  NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- El correo es único sin importar mayúsculas/minúsculas.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_uq ON users (lower(email));

-- Artículos del blog -----------------------------------------------------
CREATE TABLE IF NOT EXISTS articles (
  id           SERIAL PRIMARY KEY,
  slug         VARCHAR(160) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category     VARCHAR(40)  NOT NULL,
  title        VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),
  subtitle     VARCHAR(400) NOT NULL DEFAULT '',
  content      TEXT         NOT NULL DEFAULT '',            -- Markdown sencillo
  image_url    TEXT,
  read_minutes SMALLINT     NOT NULL DEFAULT 3 CHECK (read_minutes BETWEEN 1 AND 120),
  source_text  VARCHAR(200),
  source_url   TEXT,
  published    BOOLEAN      NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles (published, published_at DESC);

-- Comentarios (solo usuarios registrados) --------------------------------
CREATE TABLE IF NOT EXISTS comments (
  id         SERIAL PRIMARY KEY,
  article_id INTEGER       NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id    INTEGER       NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  body       VARCHAR(2000) NOT NULL CHECK (length(trim(body)) > 0),
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS comments_article_idx ON comments (article_id, created_at);
CREATE INDEX IF NOT EXISTS comments_user_idx    ON comments (user_id);

-- Bloques de contenido de las páginas -------------------------------------
--  sintomas  · Síntomas en el fruto (Inicio)
--  ciclo     · Ciclo de la enfermedad (Inicio)
--  manejo    · Manejo integrado (Inicio) — body = una práctica por línea
--  mision    · Misión / Visión / Método (Nosotros)
--  equipo    · Integrantes (Nosotros)  — body = rol
--  servicios · Servicios
CREATE TABLE IF NOT EXISTS content_items (
  id         SERIAL PRIMARY KEY,
  section    VARCHAR(30)  NOT NULL
             CHECK (section IN ('sintomas', 'ciclo', 'manejo', 'mision', 'equipo', 'servicios')),
  title      VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),
  body       TEXT         NOT NULL DEFAULT '',
  position   INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS content_items_section_idx ON content_items (section, position, id);

-- Textos generales del sitio (hero, contacto, pie de página…) -------------
CREATE TABLE IF NOT EXISTS settings (
  key        VARCHAR(60) PRIMARY KEY,
  value      TEXT        NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mensajes del formulario de contacto -----------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(160)  NOT NULL,
  message    VARCHAR(4000) NOT NULL,
  is_read    BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC);
