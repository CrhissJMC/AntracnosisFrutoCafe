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
| Blog | `/blog` | Base de conocimiento: artículos sobre sanidad del café y **fichas de manejo** vinculadas a cada resultado del diagnóstico (sano, revisar, antracnosis); los usuarios registrados comentan |
| **Diagnóstico** | `/diagnostico` | Tomar o subir la foto de un fruto, elegir el modelo y ver el resultado con semáforo (sano, revisar o antracnosis), probabilidad, Grad-CAM y recomendación |
| **Trazabilidad** | `/trazabilidad` | Avance del proyecto: anillo del ciclo del café, objetivos, bitácora con fases SECI y matriz de requisitos |
| Contacto | `/contacto` | Formulario de contacto |

### Roles

- **Administrador:** gestiona artículos, comentarios, contenido de las páginas, textos del sitio, mensajes, usuarios y la **trazabilidad** (avance de objetivos, notas de bitácora y estado de cada requisito).
- **Usuario registrado:** comenta en el blog, borra sus propios comentarios y **usa el diagnóstico** (cada análisis queda registrado).
- **Especialista** (perfil del módulo, lo asigna el administrador en `/admin/usuarios`): **valida los diagnósticos** en `/validacion`. El administrador también puede validar; cada validación guarda quién la hizo y con qué perfil.
- **Notificaciones** (campana en la barra superior, con sesión): cuando una captura queda en «revisar» o los dos modelos no coinciden, se avisa a los especialistas (si no hay ninguno, al administrador) y al autor de la foto. Cuando un especialista o el administrador valida la captura, el autor recibe el resultado y el aviso del especialista queda atendido. Cada aviso lleva al caso: el especialista va a Validación y el autor, a su captura en el Historial. Se actualizan cada minuto y al volver a la pestaña. Son avisos dentro del sitio: no se envían correos.
- **Historial** (`/historial`): cada usuario ve sus capturas; el propietario, el especialista y el administrador ven todas. Se filtra por periodo, clase vigente y validación, y se exporta en CSV (separado por «;» para Excel).
- **Tablero** (`/tablero`, propietario, especialista y administrador): frutos analizados, incidencia de antracnosis, pendientes de validar y coincidencia del modelo con el especialista; frutos por mes y clase, incidencia mensual y distribución por clase, con una tabla de los datos. Cuenta la clase validada cuando existe; si no, el resultado del modelo. Los gráficos son SVG propios y su paleta se validó para daltonismo.

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
| 1.3 Propuesta · captura y diagnóstico automático | Página `/diagnostico` + servicio `ml/` | ✅ Implementado (modelos v0 preliminares) |
| 1.3 Propuesta · memoria institucional (registro de capturas) | Tablas `capturas` y `diagnosticos`; cada análisis queda registrado | ✅ Implementado |
| 1.3 Propuesta · red de conocimiento | Blog con comentarios y fichas de manejo vinculadas a cada resultado (RF07); validación experta en `/validacion` | ✅ Implementado |
| 1.3 Propuesta · tablero de incidencia | `/tablero`: indicadores, incidencia mensual y distribución por clase | ✅ Implementado |
| 2.2.1 Modelo SECI | Bitácora de Trazabilidad: cada registro lleva su fase SECI | ✅ Implementado |
| 2.7.2 Transferencia de aprendizaje (EfficientNet-B0, MobileNetV2) | `ml/entrenamiento/modelos.py` define ambas redes; `ml/app.py` las carga; selector en `/diagnostico` | ✅ Implementado (sin entrenar) |
| 2.7.4 Métricas (recall, precisión, F1) | Metodología → Evaluación; `ml/` devuelve probabilidades por clase | ✅ |
| 2.7.5 Explicabilidad (Grad-CAM) | `ml/app.py` genera el mapa Grad-CAM de cada predicción | ✅ |
| 3.4 TIC (React, Node, PostgreSQL, Docker, Cloudflare) | Toda la arquitectura (sección 6) | ✅ |
| 3.5 IA y deep learning (FastAPI + TensorFlow) | Servicio `ml/` (perfil `ml` de Docker) | ✅ |
| 4.1.3 y 4.1.4 Requerimientos (RF01–RF10, RNF01–RNF09) | Matriz de trazabilidad de requisitos (sección 5) | ✅ |
| 4.2.1 Arquitectura lógica en capas | `web` → `api` → `ml` y `db` (sección 6) | ✅ |
| 4.2.3 Modelo de datos (Anexo 5) | Tablas del sitio, de trazabilidad, de requisitos y del módulo de diagnóstico (sección 7) | ✅ |
| 4.3.4 Pantalla «Nuevo diagnóstico» (Figura 6) | `/diagnostico` | ✅ |
| 4.3.4 Validación (Figura 8) | `/validacion` | ✅ |
| 4.3.4 Historial (Figura 7) | `/historial`: filtros por periodo, clase y validación; exportación en CSV | ✅ |
| 4.3.4 Tablero (Figura 9) | `/tablero` | ✅ |
| 4.3.4 Modelo de diagnóstico (Figura 10) | `/admin/modelo`: versiones, métricas, versión activa y ZIP de reentrenamiento | ✅ |
| 4.3.6 Estructura del repositorio (Tabla 16) | `ml/`, `ml/modelos/` fuera de Git, servicio `ml` en `docker-compose.yml` | ✅ · entrenamiento en `ml/entrenamiento/` |
| 4.4 Publicación con túnel de Cloudflare | `docker compose --profile tunnel up -d` | ✅ |

### Diferencias con el informe

| En el informe | En el repositorio | Motivo |
|---|---|---|
| Tres modelos: EfficientNet-B0, MobileNetV2 y una CNN desde cero (línea base) | Solo EfficientNet-B0 y MobileNetV2 | Se descartó la CNN desde cero por alcance |
| Redes, asociaciones de base y parcelas de una organización | Sin parcelas ni datos de ninguna organización: las capturas guardan fecha, autor y ubicación opcional | El sitio no usa datos de terceros |
| `POST /api/diagnosticos` (Tabla 17) | `POST /api/diagnostico/analizar` | La misma ruta analiza y registra la captura con sus diagnósticos |
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
2. **Modelo** (siempre visible): **MobileNetV2** por defecto y recomendado, porque es el que cumple el recall de 85 % en el conjunto de prueba (RNF01); también **EfficientNet-B0** (menos falsas alarmas) o **Comparar ambos**.
3. **Condiciones del lugar** (opcional, en un panel que se despliega): altitud (m s. n. m.), temperatura (°C), humedad relativa (%) y lluvia de las últimas 24 horas (mm). Ninguna es obligatoria, porque no todos los productores conocen esos datos con exactitud. Se acepta coma decimal y se validan los rangos en la pantalla, la API y la base de datos. No cambian el resultado de la foto: se guardan con la captura, aparecen en su detalle (Historial y Validación) y en el CSV, junto al clima estimado de la zona. Los valores se conservan para la siguiente foto de la misma parcela.
4. **Resultado:** semáforo verde (sano), ámbar (revisar) o rojo (antracnosis), probabilidad de antracnosis con los umbrales de la versión, foto junto al mapa **Grad-CAM** y la descripción «qué se observa / qué hacer», tomada de Metodología → Estado sanitario del fruto. «Revisar» no es una clase: aparece cuando la probabilidad queda entre los dos umbrales, y pide otra foto y la revisión de un especialista. Con «Comparar ambos» se muestran los dos resultados y si coinciden.
5. **Fichas de manejo** (base de conocimiento, RF07): debajo del resultado aparecen la ficha de manejo de ese resultado y hasta dos lecturas relacionadas del blog, que se pueden abrir y comentar, y el botón «Ver fichas de manejo para este resultado» abre el blog filtrado por esa clase (`/blog?clase=…`), con un filtro que se puede quitar. Con «Comparar ambos» manda el resultado más grave, y si los modelos no coinciden, el de «revisar». El detalle de cada captura en Historial y Validación muestra las mismas fichas según la validación vigente o, si no la hay, según el modelo.

Analizar requiere iniciar sesión.

### Base de conocimiento (RF07)
- Cada artículo del blog puede vincularse a un resultado (`sano`, `revisar` o `antracnosis`) desde el panel (**Vincular al resultado del diagnóstico**). Los de la categoría **FICHA DE MANEJO** aparecen primero.
- Vienen tres fichas de manejo, una por resultado, y tres artículos nuevos («Recorridos de vigilancia», «Cómo tomar la foto del fruto» y «Manejo integrado de la antracnosis del fruto»). Además, seis artículos existentes quedan vinculados a un resultado.
- Las fotos de los artículos nuevos están en `frontend/public/img/fichas/` y salen del conjunto coffee cherry 20251206 (Roboflow Universe, CC BY 4.0), citado en cada artículo.
- **Productos y abonos de apoyo:** junto al resultado (y en el detalle de cada captura) aparece un bloque con los fungicidas, abonos, bioinsumos y precauciones de ese resultado.
  - Para «antracnosis»: cobre como protectante, estrobilurinas o mezclas con triazol con asesoría, Trichoderma, potasio y calcio.
  - Para «revisar»: confirmar antes de aplicar, y qué hacer si es broca o quemadura de sol.
  - Para «sano»: abonamiento según análisis de suelo, encalado y prevención.

  No incluye dosis a propósito: la dosis la fija la etiqueta del producto registrado ante SENASA y el plan, un ingeniero agrónomo. El texto se edita en el panel → Contenido → **Productos de apoyo** (una recomendación por línea, «Tipo: detalle»). El artículo «Fungicidas, abonos y bioinsumos frente a la antracnosis del café» lo explica con más detalle y referencias.
- Se cargan una sola vez (tabla `migraciones_aplicadas`): lo que el administrador borre o edite después no vuelve a aparecer al reiniciar.

### Clima de la finca y riesgo de antracnosis (sin sensores)
- **Datos:** [Open-Meteo](https://open-meteo.com/), gratuito y sin clave. Da lluvia diaria, humedad relativa media y temperatura media para las coordenadas de la finca, configuradas en el panel → Textos → **Clima y riesgo de antracnosis**. Por defecto son las del distrito de Shipasbamba. Son datos estimados por modelos meteorológicos para una zona de algunos kilómetros, **no medidos en la parcela**.
- **Privacidad:** solo se envían las coordenadas de la finca, nunca la ubicación de los usuarios ni de las capturas.
- **Caché y conexión:** se guardan en la tabla `clima_diario`. El pronóstico se renueva como máximo cada 3 horas y el historial (hasta 2 años) se pide al archivo de Open-Meteo solo para los días que faltan. Sin conexión, el sitio sigue funcionando con lo guardado y la tarjeta lo avisa.
- **Riesgo (regla de conocimiento experto, no ML):**
  - Un día es **favorable** a la antracnosis si la temperatura media está entre 18 y 26 °C y llueve al menos 2 mm o la humedad media llega al 90 %.
  - El nivel de los próximos 7 días es **alto** con 5 o más días favorables, **medio** con 3 o 4, y **bajo** con menos.
  - Todos los umbrales se editan en el panel.
- **Dónde aparece:**
  - en **Nuevo diagnóstico** y en el **Tablero**, la tarjeta de riesgo con el pronóstico de 7 días;
  - en el detalle de cada captura (Historial y Validación), el clima de los 7 días previos;
  - en el Tablero, la **lluvia por mes** junto a la incidencia, en gráficos separados, y en la tabla de datos.
- **Por qué no entra al modelo de las fotos:** el modelo clasifica lo que se ve en el fruto. Las fotos públicas de entrenamiento no tienen datos de clima, y no hay suficientes datos de la finca para aprender esa relación.

### El servicio de los modelos (`ml/`)
- Python 3.11 + FastAPI + TensorFlow (CPU). Solo lo llama la API del sitio por la red interna de Docker; **no se expone a internet**.
- Se enciende con `docker compose --profile ml up -d --build`. Sin él, la página avisa que el servicio no está activo.
- **Modelos:** `ml/modelos/` trae **MobileNetV2 v1-aumento** (entrenada con aumento de datos, la versión activa y recomendada) y **EfficientNet-B0 v0-preliminar**. MobileNetV2 v0 queda archivada en `ml/modelos/v0-preliminar/`. La comparación está en [datos/evaluaciones/LEEME.md](datos/evaluaciones/LEEME.md) y la guía, en [ml/README.md](ml/README.md). Al reemplazar un `.keras` por otro entrenado, se carga solo en el siguiente análisis, sin reiniciar nada.
- Configuración opcional por modelo (`<modelo>.json`): versión, orden de clases, preprocesamiento, **umbrales inferior y superior** sobre la probabilidad de antracnosis (sano, revisar o antracnosis; RNF01 y RNF05) y capa de Grad-CAM. El modelo puede terminar en una neurona sigmoide o en una softmax con las clases sano y antracnosis.
- Los modelos y el conjunto de datos preparado (`datos/`) se versionan en Git para que quien clone tenga el mismo sistema.

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
| `articles` | Artículos del blog (Markdown sencillo, publicado o borrador, tiempo de lectura calculado) y el resultado del diagnóstico al que están vinculados (`clase_relacionada`) |
| `comments` | Comentarios: artículo + usuario; se borran en cascada con el artículo o el usuario |
| `content_items` | Bloques de las páginas: `sintomas`, `ciclo`, `manejo`, `mision`, `equipo`, `universidad`, `problema`, `clases`, `flujo`, `metricas`, `tecnologias`, `alcance`, `estado`, `limitaciones` y `productos` (productos de apoyo por resultado del diagnóstico) |
| `settings` | Textos generales: portada, Nosotros, Metodología, Trazabilidad, contacto, pie de página |
| `contact_messages` | Mensajes del formulario de contacto |
| `objectives` | Objetivos específicos con su peso y avance (0–100 %) |
| `progress_log` | Bitácora: cambio de avance (anterior → nuevo) o nota, con fase SECI y autor |
| `requirements` | Matriz de requisitos: RF/RNF, objetivo, módulo, caso de prueba, prioridad y estado |

Las reglas críticas se aseguran en la propia base de datos: valores permitidos, rangos de 0 a 100, claves foráneas y que cada registro de la bitácora sea un cambio o una nota con texto.

### Tablas del módulo de diagnóstico (`backend/src/db/02_modulo_diagnostico.sql`)
Se ejecuta después de `schema.sql` en cada arranque, sin duplicar nada (informe, Anexo 4).

| Tabla / vista | Qué guarda |
|---|---|
| `users.perfil` | Perfil del módulo: `productor`, `propietario` o `especialista` (lo asigna el administrador) |
| `modelo_versiones` | Cada versión de cada modelo con umbrales y métricas; una activa por arquitectura (RF09) |
| `capturas` | Foto (archivo en el volumen `capturas-data`), autor, fecha, ubicación si se autoriza (RF05) y, opcionales, las condiciones del lugar que indica el productor: `altitud_m`, `temperatura_c`, `humedad_pct` y `precipitacion_mm` |
| `diagnosticos` | Resultado de cada modelo para la captura, con la versión que lo generó (RNF08) |
| `validaciones` | Historial de validaciones de la captura: clase confirmada, comentario, quién y con qué perfil (RF06) |
| `v_validacion_vigente`, `v_diagnostico_final` | La validación más reciente prevalece sobre el resultado del modelo |
| `v_incidencia_mensual` | Incidencia por mes, para el tablero (RF08) |
| `v_dataset_reentrenamiento` | Imágenes validadas como sano o antracnosis, para reentrenar (RF09) |
| `clima_diario` | Clima diario de la finca (lluvia, humedad y temperatura de Open-Meteo), como caché; marca los días de pronóstico |
| `migraciones_aplicadas` | Cargas de contenido que se aplican una sola vez (fichas de manejo, artículos) |
| `notificaciones` | Avisos dentro del sitio: tipo (`caso_revisar`, `caso_en_revision`, `validacion`), destinatario, captura, mensaje y si se leyó |

**Validación experta** (decisión del equipo): solo validan los usuarios con perfil `especialista` y el administrador. Las validaciones no se editan ni se borran; una corrección es una validación nueva y vale la más reciente. Un disparador de la base de datos rechaza a cualquier otro usuario, impide editar una validación y toma el nombre del validador de su cuenta, así no se puede falsificar.

**Diferencias con el Anexo 4:** la validación es de la captura (no de cada diagnóstico, porque con «comparar ambos» una foto tiene dos), se guarda un historial en vez de una sola validación, hay una versión activa por arquitectura y no se registran parcelas: el tablero muestra la incidencia por periodo.

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

**Sitio público:** `/`, `/nosotros`, `/metodologia`, `/blog`, `/blog/:slug`, `/diagnostico`, `/historial` (con sesión), `/validacion` (especialista o admin), `/tablero` (propietario, especialista o admin), `/trazabilidad`, `/contacto`, `/login`, `/registro` (`/servicios` redirige a Metodología).

**Panel (solo admin):** `/admin`, `/admin/articulos`, `/admin/articulos/nuevo`, `/admin/articulos/:id`, `/admin/comentarios`, `/admin/trazabilidad`, `/admin/contenido`, `/admin/textos`, `/admin/mensajes`, `/admin/usuarios`, `/admin/modelo`

### API REST (`/api`)
| Método y ruta | Acceso |
|---|---|
| `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | público |
| `GET /articles` (`clase` = `sano`, `revisar` o `antracnosis`: artículos vinculados a ese resultado, con las fichas de manejo primero), `GET /articles/:slug`, `GET /articles/:id/comments` | público |
| `POST /articles/:id/comments`, `DELETE /comments/:id` (propio) | usuario registrado |
| `POST/PUT/DELETE /articles`, `GET /comments`, `DELETE /comments/:id` (cualquiera) | admin |
| `GET /content`, `GET /settings`, `POST /messages` | público |
| `POST/PUT/DELETE /content`, `PUT /settings`, `GET/PATCH/DELETE /messages` | admin |
| `GET /admin/stats`, `GET/PATCH/DELETE /admin/users` | admin |
| `GET /traceability` (objetivos, avance total, bitácora y matriz de requisitos) | público |
| `PATCH /traceability/objectives/:id`, `PATCH /traceability/requirements/:id`, `POST /traceability/log`, `DELETE /traceability/log/:id` | admin |
| `GET /diagnostico/modelos` (modelos y disponibilidad) | público |
| `POST /diagnostico/analizar` (`{ image, model, latitud?, longitud? }`, con `model` = `efficientnet_b0`, `mobilenet_v2` o `ambos`): analiza y registra la captura | usuario registrado |
| `GET /diagnostico/capturas/:id/imagen`, `POST /diagnostico/capturas/:id/gradcam` | autor de la captura, especialista o admin |
| `GET /validacion/casos` (`estado` = `pendientes`, `validados` o `todos`), `GET /validacion/casos/:id`, `POST /validacion/casos/:id` (`{ clase_confirmada, comentario }`) | especialista o admin |
| `GET /historial` (`desde`, `hasta`, `clase`, `estado`, `limit`, `offset`), `GET /historial/:id`, `GET /historial/exportar` (CSV con los mismos filtros) | con sesión: cada usuario ve sus capturas; propietario, especialista y admin, todas |
| `GET /tablero` (`desde`, `hasta`): resumen, incidencia por mes, lluvia y días favorables por mes, y distribución por clase | propietario, especialista o admin |
| `GET /clima`: últimos 7 días, pronóstico de 7 días y nivel de riesgo de antracnosis | público |
| `GET /notificaciones` (las 20 más recientes y cuántas no se leyeron), `POST /notificaciones/leer` (`{ id }` o todas) | con sesión: cada usuario, solo las suyas |
| `GET /admin/modelos`, `PATCH /admin/modelos/:id` (`{ activo: true }` o `{ notas }`), `GET /admin/modelos/reentrenamiento` (ZIP con `sano/`, `antracnosis/` y `manifiesto.csv`) | admin |
| `GET /health` | público (estado de la API y la base de datos) |

El servicio `ml` expone `GET /health` y `POST /predict` **solo en la red interna** (ver [ml/README.md](ml/README.md)).

---

## 10. Seguridad

- Contraseñas guardadas con bcrypt. La sesión va en una cookie `httpOnly` con `SameSite=Lax`.
- El rol se lee de la base de datos en cada petición: quitarle el rol de admin a alguien surte efecto de inmediato.
- Todas las entradas se validan en el servidor y se rechazan los campos desconocidos.
- Límites de intentos en login y registro, comentarios, contacto y análisis de imágenes. El formulario de contacto tiene además un campo trampa contra bots.
- El contenido se dibuja sin `innerHTML`, y los enlaces y las imágenes de los textos del sitio solo aceptan `http(s)`, lo que evita XSS.
- Las fotos del diagnóstico solo se aceptan como JPG o PNG de hasta 8 MB, sin metadatos. Se guardan en el volumen `capturas-data` (no en Git) y solo las ven quien tomó la foto, el propietario, los especialistas y el administrador.
- Un administrador no puede quitarse su propio rol ni borrar su propia cuenta.
- `.env` (credenciales) y las fotos de las capturas están excluidos de Git.
- Solo los especialistas y el administrador validan, y solo el administrador asigna perfiles. La base de datos lo vuelve a comprobar con un disparador y no permite editar una validación.

---

## 11. Estado del proyecto y pendientes

| Hecho | Pendiente |
|---|---|
| Sitio con blog, panel y contenido editable | Fotos de campo para medir el recall real y RNF04 |
| Trazabilidad con SECI y matriz de requisitos | Que EfficientNet-B0 alcance el recall de 85 % |
| Modelos entrenados con la GPU de la PC: MobileNetV2 v1 con aumento de datos (recomendado, cumple RNF01) y EfficientNet-B0 v0 | Reflejar en el informe (4.3 y Anexo 4) los cambios del módulo |
| Módulos de diagnóstico, validación, historial, tablero y modelo de diagnóstico | Pruebas: usabilidad (SUS) y fotos de campo (RNF04) |
| Base de conocimiento: fichas de manejo vinculadas a cada resultado (RF07) | |
| Clima de la finca y riesgo de antracnosis (Open-Meteo, sin sensores) | |
| Casos de prueba CP01–CP10: los diez aprobados, con actas y evidencia en [`pruebas/`](pruebas/LEEME.md) | |
| Publicación con Docker y túnel de Cloudflare | |

### Historial de cambios
| Fecha | Cambio |
|---|---|
| 20/10/2026 | Sitio inicial con Docker; imágenes del blog corregidas |
| 24/10/2026 | Página de Trazabilidad con anillo del ciclo del café y bitácora SECI |
| 25/10/2026 | Panel de Trazabilidad a pantalla completa; UNTRM en Nosotros; Servicios reemplazado por Metodología |
| 26/10/2026 | Contenido alineado con el tercer avance; enlace al repositorio; módulo de diagnóstico; matriz de requisitos |
| 27/10/2026 | Versión final del tercer avance: diagnóstico con sano, revisar y antracnosis; datasets públicos; objetivos, requisitos, tecnologías y alcance actualizados |
| 15/11/2026 | Definición de EfficientNet-B0 y MobileNetV2, script de entrenamiento (división 70/15/15 por grupo, dos fases, umbrales con validación) y exportación de las redes sin entrenar para probar el sistema |
| 15/11/2026 | Preparación de datos con `ml/entrenamiento/preparar_datos.py`: recorte de un fruto por imagen, etiquetas sano y antracnosis, limpieza de frutos pequeños, borrosos y duplicados, balance de clases y división 70/15/15 por grupo |
| 15/11/2026 | Evaluación de los modelos con `ml/entrenamiento/evaluar.py` (AUC, pérdida, recall, precisión, F1 y brecha entre entrenamiento y prueba) y línea base de las dos redes sin entrenar |
| 15/11/2026 | Versión preliminar v0 de EfficientNet-B0 y MobileNetV2 entrenada con la GPU (AUC 0,96 en prueba); Metodología con las secciones «Qué estamos haciendo ahora» y «Limitaciones» |
| 15/11/2026 | Los modelos v0, el conjunto de datos preparado (`datos/`) y el avance de Trazabilidad se versionan: quien clona el repositorio tiene el mismo sistema |
| 15/11/2026 | Base de datos del módulo de diagnóstico y registro de capturas: cada análisis guarda la foto, la fecha, el autor, el resultado, la versión del modelo y, si se autoriza, la ubicación; validaciones con historial y control de perfiles en la base de datos |
| 15/11/2026 | Pantalla Validación (`/validacion`) para especialistas y administrador, con historial de validaciones y Grad-CAM de la captura; perfil del módulo asignable desde el panel de usuarios |
| 15/11/2026 | Pantalla Historial (`/historial`) con filtros por periodo, clase vigente y validación, detalle de cada captura y exportación en CSV; desde el historial se abre el caso en Validación |
| 15/11/2026 | Tablero de incidencia (`/tablero`) con indicadores, frutos por mes y clase, incidencia mensual, distribución por clase y tabla de datos, filtrable por periodo |
| 15/11/2026 | Pantalla Modelo de diagnóstico en el panel (`/admin/modelo`): versiones con umbrales y métricas, versión activa por modelo, aviso si el servicio tiene cargada otra versión y descarga en ZIP de las fotos validadas para reentrenar |
| 21/11/2026 | Base de conocimiento (RF07): artículos vinculados a cada resultado desde el panel; tres fichas de manejo y tres artículos nuevos; las fichas aparecen junto al resultado del diagnóstico y en el detalle de cada captura |
| 21/11/2026 | Productos y abonos de apoyo por resultado (fungicidas, abonos, bioinsumos y precauciones, sin dosis), editables en el panel, y artículo sobre fungicidas, abonos y bioinsumos |
| 21/11/2026 | Clima de la finca y riesgo de antracnosis sin sensores (Open-Meteo): tarjeta de riesgo de 7 días en el diagnóstico y el tablero, clima de los días previos a cada captura, lluvia por mes en el tablero y umbrales editables en el panel |
| 21/11/2026 | MobileNetV2 pasa a ser el modelo recomendado y elegido por defecto (cumple RNF01). Casos de prueba CP01–CP10 ejecutados y aprobados, con script, imágenes y evidencia en `pruebas/`. El resultado del diagnóstico enlaza al blog filtrado por su clase (`/blog?clase=…`), con un filtro que se puede quitar |
| 24/11/2026 | Condiciones del lugar opcionales en Nuevo diagnóstico (altitud, temperatura, humedad y lluvia): se guardan con la captura, se ven en su detalle y se exportan en el CSV |
| 24/11/2026 | Versión v1 de los modelos con aumento de datos (4 variantes por foto de entrenamiento). MobileNetV2 v1 pasa a ser la activa (AUC 0,972, menos falsas alarmas y menos sesgo de fondo); EfficientNet-B0 sigue en v0. Objetivo 1 cerrado sin revisión experta de las etiquetas |
| 24/11/2026 | Notificaciones en el sitio: el especialista recibe los casos «revisar» y el autor de la foto recibe el aviso de revisión y el resultado de la validación (campana en la barra superior) |

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
