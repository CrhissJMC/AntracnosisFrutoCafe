-- =============================================================================
--  Módulo de diagnóstico (informe, 4.2.3 y Anexo 4). Se ejecuta después de
--  schema.sql en cada arranque de la API y no duplica nada.
--
--  Cambios respecto al Anexo 4 (decisiones del equipo, 15/11/2026):
--   - La validación es de la captura (el fruto), no de cada diagnóstico: con «comparar
--     ambos» una foto tiene dos diagnósticos, pero el fruto tiene una sola clase real.
--   - Las validaciones son un historial: nunca se editan ni se reemplazan. Vale la
--     más reciente, y cada una guarda quién la hizo y con qué perfil (especialista o
--     administrador). Solo pueden validar esos dos perfiles: lo verifica la API y
--     además un disparador de la base de datos.
--   - Hay una versión activa por arquitectura (EfficientNet-B0 y MobileNetV2), porque
--     el sitio permite elegir el modelo o comparar ambos.
-- =============================================================================

-- Perfil del módulo (lo asigna solo el administrador) -----------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS perfil VARCHAR(12)
  CHECK (perfil IN ('productor', 'propietario', 'especialista'));

-- Fichas de manejo del blog vinculadas a un resultado (RF07) -----------------
ALTER TABLE articles ADD COLUMN IF NOT EXISTS clase_relacionada VARCHAR(12)
  CHECK (clase_relacionada IN ('sano', 'revisar', 'antracnosis'));
CREATE INDEX IF NOT EXISTS articles_clase_idx ON articles (clase_relacionada)
  WHERE clase_relacionada IS NOT NULL;

-- Parcelas de la finca -------------------------------------------------------
CREATE TABLE IF NOT EXISTS parcelas (
  id             SERIAL PRIMARY KEY,
  propietario_id INTEGER      NOT NULL REFERENCES users(id),
  nombre         VARCHAR(80)  NOT NULL CHECK (length(trim(nombre)) > 0),
  sector         VARCHAR(80),
  variedad       VARCHAR(60),
  altitud_msnm   INTEGER      CHECK (altitud_msnm BETWEEN 0 AND 4000),
  es_ejemplo     BOOLEAN      NOT NULL DEFAULT FALSE,   -- datos ficticios para demostrar el sistema
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (propietario_id, nombre)
);
CREATE INDEX IF NOT EXISTS parcelas_propietario_idx ON parcelas (propietario_id);

-- Versiones del modelo (RF09, RNF08) -----------------------------------------
--   p < umbral_inferior -> 'sano'; p >= umbral_superior -> 'antracnosis'; entre ambos -> 'revisar'
CREATE TABLE IF NOT EXISTS modelo_versiones (
  id                    SERIAL PRIMARY KEY,
  modelo                VARCHAR(20)  NOT NULL CHECK (modelo IN ('efficientnet_b0', 'mobilenet_v2')),
  version               VARCHAR(40)  NOT NULL CHECK (length(trim(version)) > 0),
  archivo               VARCHAR(255) NOT NULL,              -- p. ej. ml/modelos/efficientnet_b0.keras
  umbral_inferior       NUMERIC(4,3) NOT NULL,
  umbral_superior       NUMERIC(4,3) NOT NULL,
  auc                   NUMERIC(5,4) CHECK (auc BETWEEN 0 AND 1),
  recall_antracnosis    NUMERIC(5,4) CHECK (recall_antracnosis BETWEEN 0 AND 1),
  precision_antracnosis NUMERIC(5,4) CHECK (precision_antracnosis BETWEEN 0 AND 1),
  f1_antracnosis        NUMERIC(5,4) CHECK (f1_antracnosis BETWEEN 0 AND 1),
  num_imagenes          INTEGER      CHECK (num_imagenes > 0),  -- imágenes de entrenamiento
  entrenado_en          TIMESTAMPTZ,
  notas                 VARCHAR(1000) NOT NULL DEFAULT '',
  activo                BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (modelo, version),
  CHECK (umbral_inferior > 0 AND umbral_inferior < umbral_superior AND umbral_superior < 1)
);
-- Una sola versión activa por arquitectura
CREATE UNIQUE INDEX IF NOT EXISTS modelo_versiones_activo_uq ON modelo_versiones (modelo) WHERE activo;

-- Capturas y diagnósticos (RF05) ---------------------------------------------
CREATE TABLE IF NOT EXISTS capturas (
  id         SERIAL PRIMARY KEY,
  parcela_id INTEGER      NOT NULL REFERENCES parcelas(id),
  autor_id   INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  imagen     VARCHAR(255) NOT NULL UNIQUE,                  -- nombre del archivo en el volumen de capturas
  latitud    NUMERIC(9,6) CHECK (latitud BETWEEN -90 AND 90),
  longitud   NUMERIC(9,6) CHECK (longitud BETWEEN -180 AND 180),
  tomada_en  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CHECK ((latitud IS NULL) = (longitud IS NULL))
);
CREATE INDEX IF NOT EXISTS capturas_parcela_idx ON capturas (parcela_id, tomada_en DESC);
CREATE INDEX IF NOT EXISTS capturas_autor_idx   ON capturas (autor_id);

CREATE TABLE IF NOT EXISTS diagnosticos (
  id               SERIAL PRIMARY KEY,
  captura_id       INTEGER      NOT NULL REFERENCES capturas(id) ON DELETE CASCADE,
  modelo_id        INTEGER      NOT NULL REFERENCES modelo_versiones(id),
  prob_antracnosis NUMERIC(5,4) NOT NULL CHECK (prob_antracnosis BETWEEN 0 AND 1),
  resultado        VARCHAR(12)  NOT NULL CHECK (resultado IN ('sano', 'revisar', 'antracnosis')),
  tiempo_ms        INTEGER      NOT NULL CHECK (tiempo_ms >= 0),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (captura_id, modelo_id)
);
CREATE INDEX IF NOT EXISTS diagnosticos_modelo_idx    ON diagnosticos (modelo_id);
CREATE INDEX IF NOT EXISTS diagnosticos_resultado_idx ON diagnosticos (resultado);

-- Validaciones (RF06): historial; vale la más reciente ----------------------
-- 'otro_dano' permite registrar daños que no son antracnosis (p. ej., broca)
CREATE TABLE IF NOT EXISTS validaciones (
  id               SERIAL PRIMARY KEY,
  captura_id       INTEGER       NOT NULL REFERENCES capturas(id) ON DELETE CASCADE,
  validador_id     INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  validador_nombre VARCHAR(100)  NOT NULL,                  -- se conserva si el usuario se borra
  perfil_validador VARCHAR(12)   NOT NULL CHECK (perfil_validador IN ('especialista', 'admin')),
  clase_confirmada VARCHAR(12)   NOT NULL CHECK (clase_confirmada IN ('sano', 'antracnosis', 'otro_dano')),
  comentario       VARCHAR(2000) NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS validaciones_captura_idx ON validaciones (captura_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS validaciones_validador_idx ON validaciones (validador_id);

-- Solo un especialista o un administrador puede validar, y con su perfil real.
CREATE OR REPLACE FUNCTION validaciones_verificar_perfil() RETURNS trigger AS $$
DECLARE
  u RECORD;
BEGIN
  SELECT role, perfil, name INTO u FROM users WHERE id = NEW.validador_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'El validador no existe' USING ERRCODE = 'check_violation';
  END IF;
  -- COALESCE: con perfil NULL la comparación daría NULL y el IF no rechazaría.
  IF NOT COALESCE((NEW.perfil_validador = 'admin' AND u.role = 'admin')
               OR (NEW.perfil_validador = 'especialista' AND u.perfil = 'especialista'), FALSE) THEN
    RAISE EXCEPTION 'Solo un especialista o un administrador puede validar un diagnóstico' USING ERRCODE = 'check_violation';
  END IF;
  NEW.validador_nombre := u.name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validaciones_verificar_perfil ON validaciones;
CREATE TRIGGER validaciones_verificar_perfil BEFORE INSERT ON validaciones
  FOR EACH ROW EXECUTE FUNCTION validaciones_verificar_perfil();

-- Las validaciones no se editan: una corrección es una validación nueva.
CREATE OR REPLACE FUNCTION validaciones_sin_cambios() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Las validaciones no se modifican: registra una nueva' USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validaciones_sin_cambios ON validaciones;
CREATE TRIGGER validaciones_sin_cambios BEFORE UPDATE ON validaciones
  FOR EACH ROW EXECUTE FUNCTION validaciones_sin_cambios();

-- Vistas (se recrean en cada arranque) ----------------------------------------
DROP VIEW IF EXISTS v_dataset_reentrenamiento, v_incidencia_mensual, v_diagnostico_final, v_validacion_vigente CASCADE;

-- Validación vigente de cada captura: la más reciente.
CREATE VIEW v_validacion_vigente AS
SELECT DISTINCT ON (captura_id)
       captura_id, id AS validacion_id, clase_confirmada, perfil_validador, validador_id, validador_nombre,
       comentario, created_at AS validada_en
FROM validaciones
ORDER BY captura_id, created_at DESC, id DESC;

-- Estado de cada captura: la clase validada prevalece sobre el resultado del modelo.
-- Si se compararon ambos modelos, se toma el primer diagnóstico registrado.
CREATE VIEW v_diagnostico_final AS
SELECT DISTINCT ON (c.id)
       c.id AS captura_id, c.parcela_id, c.autor_id, c.tomada_en,
       d.id AS diagnostico_id, d.modelo_id, d.prob_antracnosis, d.resultado,
       v.clase_confirmada, v.perfil_validador, v.validador_nombre, v.validada_en,
       COALESCE(v.clase_confirmada, d.resultado) AS clase_final,
       (v.validacion_id IS NOT NULL) AS validado
FROM capturas c
JOIN diagnosticos d ON d.captura_id = c.id
LEFT JOIN v_validacion_vigente v ON v.captura_id = c.id
ORDER BY c.id, d.id;

-- Tablero de incidencia por parcela y mes (RF08)
CREATE VIEW v_incidencia_mensual AS
SELECT p.id AS parcela_id, p.nombre AS parcela,
       date_trunc('month', f.tomada_en)::date AS mes,
       COUNT(*) AS total_capturas,
       COUNT(*) FILTER (WHERE f.clase_final = 'antracnosis') AS antracnosis,
       COUNT(*) FILTER (WHERE f.clase_final = 'revisar')     AS por_revisar,
       ROUND(100.0 * COUNT(*) FILTER (WHERE f.clase_final = 'antracnosis') / COUNT(*), 1) AS incidencia_pct
FROM v_diagnostico_final f
JOIN parcelas p ON p.id = f.parcela_id
GROUP BY p.id, p.nombre, date_trunc('month', f.tomada_en);

-- Imágenes validadas para reentrenar (RF09): solo sano y antracnosis.
CREATE VIEW v_dataset_reentrenamiento AS
SELECT c.id AS captura_id, c.imagen, v.clase_confirmada AS clase, v.perfil_validador, v.validador_nombre, v.validada_en
FROM capturas c
JOIN v_validacion_vigente v ON v.captura_id = c.id
WHERE v.clase_confirmada IN ('sano', 'antracnosis');
