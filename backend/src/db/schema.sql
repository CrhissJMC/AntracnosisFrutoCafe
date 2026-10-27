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
--  universidad · Datos de la UNTRM (Nosotros) — body = detalle
--  problema, clases, flujo, metricas, tecnologias · Metodología
--  alcance   · Metodología — body = un punto por línea
CREATE TABLE IF NOT EXISTS content_items (
  id         SERIAL PRIMARY KEY,
  section    VARCHAR(30)  NOT NULL
             CHECK (section IN ('sintomas', 'ciclo', 'manejo', 'mision', 'equipo', 'universidad',
                         'problema', 'clases', 'flujo', 'metricas', 'tecnologias', 'alcance')),
  title      VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),
  body       TEXT         NOT NULL DEFAULT '',
  position   INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- Bases de datos creadas con secciones anteriores: se actualiza la regla.
-- (La antigua página Servicios se reemplazó por Metodología.)
ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_section_check;
DELETE FROM content_items WHERE section = 'servicios';
ALTER TABLE content_items ADD CONSTRAINT content_items_section_check
  CHECK (section IN ('sintomas', 'ciclo', 'manejo', 'mision', 'equipo', 'universidad',
                         'problema', 'clases', 'flujo', 'metricas', 'tecnologias', 'alcance'));
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

-- Trazabilidad del proyecto ----------------------------------------------
--  Cada objetivo específico tiene su % de avance y un peso; el avance total
--  es el promedio ponderado. Cada cambio queda registrado en progress_log.
CREATE TABLE IF NOT EXISTS objectives (
  id          SERIAL PRIMARY KEY,
  code        SMALLINT     NOT NULL UNIQUE CHECK (code BETWEEN 1 AND 20),
  title       VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),
  description TEXT         NOT NULL DEFAULT '',
  weight      SMALLINT     NOT NULL DEFAULT 25 CHECK (weight BETWEEN 0 AND 100),
  progress    SMALLINT     NOT NULL DEFAULT 0  CHECK (progress BETWEEN 0 AND 100),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Bitácora: solo se añaden registros (no se editan). objective_id NULL = nota general.
CREATE TABLE IF NOT EXISTS progress_log (
  id                SERIAL PRIMARY KEY,
  objective_id      INTEGER       REFERENCES objectives(id) ON DELETE SET NULL,
  previous_progress SMALLINT      CHECK (previous_progress BETWEEN 0 AND 100),
  new_progress      SMALLINT      CHECK (new_progress BETWEEN 0 AND 100),
  note              VARCHAR(2000) NOT NULL DEFAULT '',
  seci_phase        VARCHAR(20)
                    CHECK (seci_phase IN ('socializacion', 'externalizacion', 'combinacion', 'internalizacion')),
  author_id         INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  author_name       VARCHAR(100)  NOT NULL DEFAULT '',  -- se guarda el nombre por si el usuario se borra
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  -- O es un cambio de avance (ambos valores) o es una nota (ninguno, y con texto)
  CHECK ((previous_progress IS NULL) = (new_progress IS NULL)),
  CHECK (new_progress IS NOT NULL OR length(trim(note)) > 0)
);
CREATE INDEX IF NOT EXISTS progress_log_created_idx   ON progress_log (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS progress_log_objective_idx ON progress_log (objective_id);
