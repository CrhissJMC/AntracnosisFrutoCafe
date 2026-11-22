// Contenido inicial: el mismo que tenía la página HTML original.
// Se inserta solo cuando la tabla correspondiente está vacía.

export const SETTINGS = {
  site_name: 'Proyecto Antracnosis',
  hero_label: 'FITOPATOLOGÍA DEL CAFÉ',
  hero_title: 'Antracnosis en el fruto del café',
  hero_desc:
    'Causada por hongos del género *Colletotrichum*, es una de las enfermedades que más pérdidas provoca en la cereza. Aprende a reconocerla y manejarla.',
  hero_image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&q=80',
  que_es:
    'La antracnosis es una enfermedad fúngica producida principalmente por *Colletotrichum gloeosporioides* y, en África, por *C. kahawae* (CBD, "Coffee Berry Disease"), la forma más agresiva.\n\nAtaca flores, frutos verdes y maduros, afectando el rendimiento y la calidad de taza al generar granos negros o vinagres.',
  nosotros_title: 'Un proyecto del curso de Gestión del Conocimiento',
  nosotros_desc:
    'Somos estudiantes de Ingeniería de Sistemas de la UNTRM. Este sitio reúne el proyecto que desarrollamos para el curso de Gestión del Conocimiento: un modelo de Deep Learning que detecta antracnosis en frutos de café a partir de imágenes.',
  docente: 'Mg. FUENTES MAZA FRANS',
  univ_title: 'Universidad Nacional Toribio Rodríguez de Mendoza de Amazonas',
  univ_desc:
    'La UNTRM es una universidad pública con sede en Chachapoyas, Amazonas. Formamos parte de su Escuela Profesional de Ingeniería de Sistemas, y este proyecto nace en el curso de Gestión del Conocimiento: une el análisis de datos y el Deep Learning con la sanidad del café, un cultivo clave para la región.',
  metodo_title: 'Cómo desarrollamos el proyecto',
  metodo_desc:
    'Del problema al modelo: datos, arquitectura, entrenamiento y evaluación de una red neuronal convolucional que detecta antracnosis en frutos de café.',
  metodo_propuesta:
    'Proponemos DiagnostiCafé, un sistema web de gestión del conocimiento con cinco componentes: la captura de la foto del fruto, el diagnóstico automático con una red neuronal convolucional (sano, revisar o antracnosis), la memoria institucional de cada captura, una red de conocimiento en la que un especialista valida los diagnósticos y publica fichas de manejo, y un tablero de incidencia por parcela.',
  metodo_flujo_nota:
    'División estratificada de 70 % para entrenamiento, 15 % para validación y 15 % para prueba, con semilla fija. Los recortes de una misma foto quedan siempre en el mismo conjunto y el conjunto de prueba solo se usa en la evaluación final.',
  metodo_metricas_nota:
    'Meta: recall de al menos 85 % en la clase antracnosis, porque un fruto enfermo clasificado como sano cuesta más que una falsa alarma. También se mide el tiempo de respuesta (máximo 3 segundos) y se generan mapas Grad-CAM para comprobar que el modelo se fije en las lesiones y no en el fondo.',
  blog_label: 'CUADERNO DE CAMPO · 2026',
  blog_title: 'Ciencia que cuida el café',
  blog_desc:
    'Artículos sobre sanidad vegetal, prevención y cuidado del fruto. Del conocimiento a la parcela.',
  contact_email: 'nfransa19@gmail.com',
  contact_location: 'Bagua, Amazonas, Perú',
  contact_hours: '8:00 a. m. – 5:00 p. m.',
  footer_tagline:
    'Investigación y conocimiento para el cuidado del fruto del café y la sanidad del cafetal.',
  footer_note: 'La información no sustituye la asesoría agronómica profesional.',
  metodo_repo_title: '¿Quieres más detalles del proyecto?',
  metodo_repo_text:
    'Todo el código del sitio, el esquema de la base de datos, la configuración de Docker y la documentación técnica están disponibles en el repositorio del proyecto en GitHub.',
  metodo_repo_url: 'https://github.com/CrhissJMC/AntracnosisFrutoCafe',
  traz_title: 'Del botón floral al grano tostado',
  traz_desc:
    'Seguimiento del avance del proyecto: cada etapa del ciclo del café representa un 5 % de lo realizado, y cada cambio queda registrado en la bitácora.',
  traz_general:
    'Desarrollar un sistema web de gestión del conocimiento que utilice un modelo de deep learning para detectar la antracnosis en frutos de café mediante imágenes digitales, y que permita registrar, validar y compartir el conocimiento técnico sobre la enfermedad en la empresa cafetalera El Alizal, del distrito de Shipasbamba (Bongará, Amazonas).',
  // Clima y riesgo (datos de Open-Meteo, sin sensores). Coordenadas aproximadas del distrito de
  // Shipasbamba; se ajustan en el panel a la finca. La regla de riesgo es conocimiento experto, no ML.
  clima_nombre: 'Shipasbamba (Bongará, Amazonas)',
  clima_lat: '-5.9069',
  clima_lon: '-78.0431',
  riesgo_temp_min: '18',
  riesgo_temp_max: '26',
  riesgo_lluvia_mm: '2',
  riesgo_hr: '90',
  riesgo_dias_medio: '3',
  riesgo_dias_alto: '5',
};

// Datos de la universidad (Nosotros). [título, detalle]
export const UNIVERSITY_ITEMS = [
  ['Creación', 'Creada por Ley N.º 27347 el 18 de septiembre de 2000; inició sus actividades académicas en 2001.'],
  ['Licenciamiento', 'Primera universidad licenciada por la SUNEDU, que verifica las condiciones básicas de calidad.'],
  ['Facultad y escuela', 'Facultad de Ingeniería de Sistemas y Mecánica Eléctrica (FISME) · Escuela Profesional de Ingeniería de Sistemas.'],
  ['Curso', 'Gestión del Conocimiento · décimo ciclo · 2026.'],
];

// Valores por defecto anteriores: si siguen sin editarse, se actualizan al arrancar.
export const LEGACY_DEFAULTS = {
  // clave → valores anteriores que se reemplazan por el actual de SETTINGS
  settings: {
    docente: ['Dr. FUENTES MAZA FRANS'],
    traz_general: [
      'Desarrollar y evaluar un modelo de Deep Learning basado en redes neuronales convolucionales para detectar antracnosis en frutos de café mediante el análisis de imágenes digitales.',
      'Desarrollar un sistema de gestión del conocimiento que utilice un modelo de deep learning para detectar la antracnosis en frutos de café mediante imágenes digitales, y que permita registrar, validar y compartir el conocimiento técnico sobre la enfermedad.',
    ],
    metodo_propuesta: [
      'Proponemos un modelo CNN que clasifique imágenes de frutos como sanos o con antracnosis, como apoyo a la identificación fitosanitaria.',
      'Proponemos un sistema de gestión del conocimiento que combina una red neuronal convolucional, que clasifica cada fruto como sano, con infección incipiente o con infección avanzada, con la validación de un experto y la difusión de recomendaciones de manejo.',
    ],
    metodo_flujo_nota: [
      'Las fotos del mismo fruto o de la misma sesión no se reparten entre subconjuntos, para que el modelo no se evalúe con imágenes que ya "vio".',
      'División estratificada de 70 % para entrenamiento, 15 % para validación y 15 % para prueba, con semilla fija. Las imágenes casi idénticas no quedan en conjuntos distintos y el conjunto de prueba solo se usa en la evaluación final.',
    ],
    metodo_metricas_nota: [
      'Se analiza la matriz de confusión con atención especial a los falsos negativos: frutos afectados clasificados como sanos. No se fija un porcentaje objetivo; el resultado se obtiene de los experimentos.',
      'Meta: recall de al menos 85 % en la clase de infección incipiente, porque un fruto enfermo clasificado como sano cuesta más que una falsa alarma. También se mide el tiempo de respuesta (máximo 3 segundos) y se generan mapas Grad-CAM para comprobar que el modelo se fije en las lesiones y no en el fondo.',
    ],
    nosotros_title: ['Un equipo comprometido con el café'],
    nosotros_desc: [
      'Somos estudiantes que investigan cómo prevenir y manejar la antracnosis en el fruto del café.',
      'Somos estudiantes de Ingeniería de Sistemas de la Universidad Nacional Toribio Rodríguez de Mendoza de Amazonas (UNTRM) que aplicamos la tecnología al estudio de la antracnosis en el fruto del café.',
    ],
  },
  teamRole: { from: 'Integrante del proyecto', to: 'Estudiante de Ingeniería de Sistemas' },
  // Objetivos anteriores (presentación inicial): se reemplazan si siguen sin cambios.
  objectiveTitles: ['Recopilar y preparar las imágenes', 'Implementar la arquitectura CNN', 'Entrenar y validar el modelo', 'Determinar el desempeño'],
  // Descripciones anteriores de los objetivos (código → texto): se actualizan si siguen sin editarse.
  objectiveDescriptions: {
    1: 'Depurar, verificar y dividir las imágenes de frutos de café proporcionadas por el docente, clasificadas en sano, con infección incipiente y con infección avanzada.',
    2: 'Entrenar y comparar redes neuronales convolucionales mediante transferencia de aprendizaje para reconocer los patrones visuales de la enfermedad en la piel del fruto.',
    3: 'Ajustar los hiperparámetros y el umbral de decisión del modelo para alcanzar un recall mínimo de 85 % en frutos con infección incipiente.',
    4: 'Desarrollar la validación experta, la base de recomendaciones y el tablero de incidencia, integrados con el clasificador en la aplicación web.',
    5: 'Evaluar el desempeño del modelo con imágenes tomadas en campo y la usabilidad del sistema con técnicos y productores.',
  },
  // Descripciones anteriores de la matriz de requisitos (código → texto): igual que los objetivos.
  requirementDescriptions: {
    RF03: 'Clasificar el fruto como sano, con infección incipiente o con infección avanzada (EfficientNet-B0 o MobileNetV2).',
    RF04: 'Mostrar la categoría, el nivel de confianza, el semáforo y la recomendación asociada.',
    RF06: 'Permitir que el agrónomo confirme o corrija un diagnóstico y lo comente.',
    RF05: 'Guardar la foto con su diagnóstico, fecha, hora, coordenadas, parcela y versión del modelo.',
    RF08: ['Mostrar indicadores de incidencia por parcela, zona y periodo.', 'Mostrar indicadores de incidencia por parcela y periodo.'],
    RF10: ['Asignar perfiles del módulo (productor, técnico, agrónomo, gerencia) y registrar parcelas.', 'Asignar perfiles del módulo (productor, propietario o especialista) y registrar las parcelas.'],
    RNF01: 'Recall de al menos 85 % en la clase de infección incipiente, medido en el conjunto de prueba.',
    RNF03: 'El sistema se ejecuta en contenedores Docker en la PC del equipo, sin servicios de nube pagados.',
    RNF05: 'Resultado con semáforo: verde (sano), amarillo (incipiente) y rojo (avanzado).',
  },
  // Títulos anteriores de requisitos (código → texto o lista)
  requirementTitles: {
    RF10: 'Gestión de usuarios y parcelas',
  },
};

// Objetivos específicos (tercer avance, sección 1.4.2). [código, título, descripción]
export const OBJECTIVES = [
  [1, 'Preparar el conjunto de datos', 'Reunir, depurar y dividir imágenes digitales de frutos de café sanos y con antracnosis procedentes de conjuntos de datos públicos.'],
  [2, 'Entrenar el modelo de deep learning', 'Entrenar y comparar dos redes neuronales convolucionales preentrenadas, EfficientNet-B0 y MobileNetV2, mediante transferencia de aprendizaje para reconocer los patrones visuales de la enfermedad en la piel del fruto.'],
  [3, 'Maximizar la sensibilidad del diagnóstico', 'Ajustar los hiperparámetros y los umbrales de decisión del modelo para alcanzar un recall mínimo de 85 % en frutos con antracnosis.'],
  [4, 'Implementar los módulos de gestión del conocimiento', 'Desarrollar la validación experta, la base de conocimiento y el tablero de incidencia, integrados con el clasificador en el sitio web del proyecto.'],
  [5, 'Validar el sistema', 'Evaluar el desempeño del modelo con un conjunto de prueba independiente y con fotos de la finca, y la usabilidad del sistema con estudiantes y docentes de la UNTRM.'],
];

export const CONTENT_ITEMS = [
  // Síntomas
  ['sintomas', 'Manchas hundidas', 'Lesiones circulares, oscuras y deprimidas sobre la cereza verde o madura.'],
  ['sintomas', 'Fruto momificado', 'Las cerezas afectadas se secan, ennegrecen y quedan adheridas a la rama.'],
  ['sintomas', 'Masas rosadas', 'Con humedad alta aparecen esporas color salmón sobre las lesiones.'],
  ['sintomas', 'Caída prematura', 'Los frutos jóvenes se desprenden antes de madurar, reduciendo la cosecha.'],
  // Ciclo
  ['ciclo', 'Inóculo', 'Esporas sobreviven en frutos momificados, ramas secas y hojas.'],
  ['ciclo', 'Dispersión', 'La lluvia y el salpique transportan los conidios a frutos sanos.'],
  ['ciclo', 'Infección', 'Con 20–25 °C y alta humedad, el hongo penetra la cutícula.'],
  ['ciclo', 'Lesión', 'En 1–2 semanas aparecen manchas y nuevas esporas reinician el ciclo.'],
  // Manejo integrado (una práctica por línea)
  ['manejo', 'Cultural', 'Retirar frutos momificados y ramas secas\nPodas para mejorar aireación\nRegular la sombra\nNutrición balanceada (K, Ca)'],
  ['manejo', 'Genético', 'Sembrar variedades tolerantes\nRenovar cafetales envejecidos\nUsar semilla certificada'],
  ['manejo', 'Biológico', 'Trichoderma spp.\nBacillus subtilis\nFomentar microbiota del suelo'],
  ['manejo', 'Químico', 'Fungicidas cúpricos preventivos\nRotar modos de acción\nAplicar según asesoría técnica y etiqueta'],
  // Misión / visión / método
  ['mision', 'Misión', 'Difundir conocimiento científico sobre la antracnosis para apoyar a productores de café.'],
  ['mision', 'Visión', 'Ser un referente académico en sanidad vegetal del cultivo de café.'],
  ['mision', 'Método', 'Revisión bibliográfica, observación de campo y análisis de casos reales.'],
  // Equipo
  ['equipo', 'ARVILDO JULCA ENITH FIORELA', 'Estudiante de Ingeniería de Sistemas'],
  ['equipo', 'CARUAJULCA SALAZAR DALMER ASUNCION', 'Estudiante de Ingeniería de Sistemas'],
  ['equipo', 'MAGALLAN CULQUI CRISTHIAN JEFRYE', 'Estudiante de Ingeniería de Sistemas'],
  ['equipo', 'SILVA AVELLANEDA FRANS NORBERT', 'Estudiante de Ingeniería de Sistemas'],
];

// Página Metodología (contenido de la presentación del proyecto). [sección, título, texto]
// Se carga por sección: solo las secciones que aún no tienen bloques.
// Metodología · «Qué estamos haciendo ahora» (15/11/2026). Al cambiar, mover esta versión a una
// lista anterior en LEGACY_METHOD_VERSIONS para que la página se actualice si nadie la editó.
const ESTADO_ITEMS_V1 = [
  ['estado', 'Datos reunidos y depurados', 'Hecho. 3 840 imágenes de un fruto cada una (768 con antracnosis y 3 072 sanas) de tres conjuntos públicos, divididas en 70 % entrenamiento, 15 % validación y 15 % prueba sin repartir una misma foto entre conjuntos.'],
  ['estado', 'Modelos preliminares (v0) entrenados', 'Hecho. EfficientNet-B0 y MobileNetV2 se entrenaron con la GPU de la PC del equipo y ya se usan en la página Diagnóstico. En el conjunto de prueba ambos alcanzan una AUC de 0,96 (sin entrenar: 0,23 y 0,41), con recall de 0,82 y 0,89 y precisión de 0,73 y 0,68 en la clase antracnosis; la diferencia con el entrenamiento es pequeña, así que no memorizaron las fotos.'],
  ['estado', 'Revisión de lo que aprendió el modelo', 'En curso. Ambos reconocen bien los frutos fotografiados en el cafetal, pero casi ningún fruto sano fotografiado sobre fondo claro sale como «sano», y los mapas Grad-CAM muestran que a veces se fijan en el fondo. Por eso la v0 es solo preliminar.'],
  ['estado', 'Revisión de etiquetas con un especialista', 'Pendiente. Confirmar o corregir las 559 imágenes de antracnosis de la fuente principal y sumar frutos sanos sobre fondo claro antes de entrenar la versión v1.'],
  ['estado', 'Módulos y validación en campo', 'Pendiente. Registro de capturas, historial, validación experta y tablero de incidencia; prueba con al menos 100 fotos de la finca, casos de prueba y encuesta de usabilidad (SUS).'],
];

// v2 (15/11/2026): se detalló la validación experta y se mencionó la alternativa a la prueba en la finca.
const ESTADO_VALIDACION = ['estado', 'Validación del sistema', 'Pendiente. El plan es probar el sistema con al menos 100 fotos de la finca, los casos de prueba y una encuesta de usabilidad (SUS). Como alternativa, si no es posible: validar el modelo solo con el conjunto de prueba y hacer una prueba de usabilidad corta con compañeros del curso, que también sirve para la SUS.'];
const ESTADO_ITEMS_V2 = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'Pendiente. Registro de capturas, historial, tablero de incidencia y validación experta. Solo los usuarios con perfil de especialista podrán validar un diagnóstico; el administrador también podrá corregirlo, y cada validación quedará registrada con quién la hizo y con qué perfil, sin borrar las anteriores.'],
  ESTADO_VALIDACION,
];

// v3 (15/11/2026): registro de capturas con parcela obligatoria.
const ESTADO_ITEMS_V3 = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'En curso. Hecho: base de datos del módulo y registro de capturas (cada análisis guarda la foto, la parcela, la fecha, la ubicación si se autoriza, el resultado y la versión del modelo). Pendiente: historial, validación experta y tablero de incidencia. Solo los especialistas y el administrador podrán validar; cada validación queda registrada con quién la hizo y con qué perfil, sin borrar las anteriores (la base de datos ya lo exige).'],
  ESTADO_VALIDACION,
];

// v4 (15/11/2026): la parcela era opcional.
const ESTADO_ITEMS_V4 = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'En curso. Hecho: base de datos del módulo y registro de capturas (cada análisis guarda la foto, la fecha, el resultado y la versión del modelo, y opcionalmente la parcela y la ubicación). Pendiente: historial, validación experta y tablero de incidencia. Solo los especialistas y el administrador podrán validar; cada validación queda registrada con quién la hizo y con qué perfil, sin borrar las anteriores (la base de datos ya lo exige).'],
  ESTADO_VALIDACION,
];

// v5 (15/11/2026): sin parcelas.
const ESTADO_ITEMS_V5 = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'En curso. Hecho: base de datos del módulo y registro de capturas (cada análisis guarda la foto, la fecha, el autor, el resultado y la versión del modelo, y la ubicación solo si se autoriza). Pendiente: historial, validación experta y tablero de incidencia. Solo los especialistas y el administrador podrán validar; cada validación queda registrada con quién la hizo y con qué perfil, sin borrar las anteriores (la base de datos ya lo exige).'],
  ESTADO_VALIDACION,
];

// v6 (15/11/2026): validación experta implementada.
const ESTADO_ITEMS_V6 = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'En curso. Hecho: registro de capturas (cada análisis guarda la foto, la fecha, el autor, el resultado y la versión del modelo, y la ubicación solo si se autoriza) y validación experta: los especialistas, a quienes el administrador asigna ese perfil, y el administrador confirman o corrigen la clase del fruto; cada validación queda en un historial con quién la hizo y con qué perfil, y vale la más reciente. Pendiente: historial de capturas y tablero de incidencia.'],
  ESTADO_VALIDACION,
];

// v7 (15/11/2026): historial de capturas implementado.
const ESTADO_ITEMS_V7 = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'En curso. Hecho: registro de capturas (foto, fecha, autor, resultado, versión del modelo y, si se autoriza, ubicación), validación experta con historial de quién validó y con qué perfil, e historial de capturas con filtros por periodo, clase y validación y exportación en CSV. Cada usuario ve sus capturas; el propietario, el especialista y el administrador ven todas. Pendiente: tablero de incidencia.'],
  ESTADO_VALIDACION,
];

// v8 (15/11/2026): tablero de incidencia implementado.
const ESTADO_ITEMS_V8 = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'Casi listo. Hecho: registro de capturas, validación experta con historial de quién validó y con qué perfil, historial de capturas con exportación en CSV y tablero de incidencia (frutos analizados, incidencia de antracnosis, pendientes de validar y coincidencia del modelo con el especialista, por periodo). Pendiente: la pantalla del modelo de diagnóstico en el panel (versiones, métricas y umbrales).'],
  ESTADO_VALIDACION,
];

// v9 (15/11/2026): módulo de gestión del conocimiento completo.
const ESTADO_ITEMS_V9 = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'Hecho. Registro de capturas; validación experta con historial de quién validó y con qué perfil; historial de capturas con exportación en CSV; tablero de incidencia por periodo; y, en el panel, el modelo de diagnóstico: versiones con sus métricas, versión activa y descarga de las fotos validadas para reentrenar. Pendiente: reflejar estos cambios en el informe.'],
  ESTADO_VALIDACION,
];

// 15/11/2026: revisión general; las fichas del blog aún no se vinculaban a cada resultado.
const ESTADO_ITEMS_V10 = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'Casi listo. Hecho: registro de capturas; validación experta con historial de quién validó y con qué perfil; historial de capturas con exportación en CSV; tablero de incidencia por periodo; y, en el panel, el modelo de diagnóstico con sus versiones, la versión activa y la descarga de las fotos validadas para reentrenar. Probado: tiempo de respuesta (menos de 3 s en 60 análisis), permisos por perfil y diseño adaptable. Pendiente: vincular las fichas del blog a cada resultado del diagnóstico y reflejar los cambios en el informe.'],
  ESTADO_VALIDACION,
];

// 21/11/2026: base de conocimiento con fichas de manejo vinculadas a cada resultado.
const ESTADO_ITEMS_V11 = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'Hecho. Registro de capturas; validación experta con historial de quién validó y con qué perfil; historial de capturas con exportación en CSV; tablero de incidencia por periodo; base de conocimiento, con fichas de manejo y artículos del blog vinculados a cada resultado (sano, revisar y antracnosis) que se muestran junto al diagnóstico y en cada captura; y, en el panel, el modelo de diagnóstico con sus versiones, la versión activa y la descarga de las fotos validadas para reentrenar. Probado: tiempo de respuesta (menos de 3 s en 60 análisis), permisos por perfil y diseño adaptable. Pendiente: reflejar los cambios en el informe.'],
  ESTADO_VALIDACION,
];

// 21/11/2026: base de conocimiento con fichas de manejo y productos de apoyo por resultado.
const ESTADO_ITEMS_V12 = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'Hecho. Registro de capturas; validación experta con historial de quién validó y con qué perfil; historial de capturas con exportación en CSV; tablero de incidencia por periodo; base de conocimiento, con fichas de manejo, artículos del blog y productos de apoyo (fungicidas, abonos y bioinsumos, sin dosis) para cada resultado (sano, revisar y antracnosis), que se muestran junto al diagnóstico y en cada captura; y, en el panel, el modelo de diagnóstico con sus versiones, la versión activa y la descarga de las fotos validadas para reentrenar. Probado: tiempo de respuesta (menos de 3 s en 60 análisis), permisos por perfil y diseño adaptable. Pendiente: reflejar los cambios en el informe.'],
  ESTADO_VALIDACION,
];

// Versión vigente (21/11/2026): clima de la finca y riesgo de antracnosis, sin sensores.
const ESTADO_ITEMS = [
  ...ESTADO_ITEMS_V1.slice(0, 4),
  ['estado', 'Módulos de gestión del conocimiento', 'Hecho. Registro de capturas; validación experta con historial de quién validó y con qué perfil; historial de capturas con exportación en CSV; tablero de incidencia por periodo, con la lluvia de cada mes; base de conocimiento, con fichas de manejo, artículos del blog y productos de apoyo (fungicidas, abonos y bioinsumos, sin dosis) para cada resultado; riesgo de antracnosis por el clima de los próximos 7 días (datos de Open-Meteo, sin sensores) y clima de los días previos a cada captura; y, en el panel, el modelo de diagnóstico con sus versiones, la versión activa y la descarga de las fotos validadas para reentrenar. Probado: tiempo de respuesta (menos de 3 s en 60 análisis), permisos por perfil y diseño adaptable. Pendiente: reflejar los cambios en el informe.'],
  ESTADO_VALIDACION,
];

// Productos y abonos de apoyo según el resultado del diagnóstico (se muestran junto al resultado y
// se editan en el panel → Contenido → Productos de apoyo). Título = resultado; una recomendación por línea,
// con el formato «Tipo: detalle». Sin dosis: la dosis la fija la etiqueta registrada y el técnico.
export const PRODUCT_ITEMS = [
  ['productos', 'Sano', [
    'Abonamiento: plan de nitrógeno, fósforo y potasio según el análisis de suelo, repartido en dos o tres aplicaciones al año.',
    'Encalado: cal agrícola o dolomita si el suelo es ácido (pH menor que 5); también aporta calcio y magnesio.',
    'Abono orgánico: compost o pulpa de café bien descompuesta, nunca preparada con frutos enfermos.',
    'Bioinsumo preventivo (opcional): Trichoderma registrado como bioinsumo, aplicado al suelo o a la materia orgánica según su etiqueta.',
    'Fungicida: no hace falta sin síntomas. En zonas con antecedentes de antracnosis, el técnico puede indicar un fungicida a base de cobre preventivo en la floración y el fruto pequeño, antes de las lluvias.',
    'Insecticida: no previene la antracnosis; úsalo solo si se confirma otra plaga.',
  ].join('\n')],
  ['productos', 'Revisar', [
    'Antes de aplicar: no uses ningún producto hasta confirmar el diagnóstico; un producto equivocado no sirve y cuesta.',
    'Si se confirma antracnosis: sigue las recomendaciones del resultado «antracnosis».',
    'Si es broca (agujero pequeño en la corona del fruto): trampas con atrayente de alcohol, el hongo Beauveria bassiana como control biológico y recojo de frutos caídos; el insecticida, solo con indicación técnica.',
    'Si es quemadura de sol o falta de nutrientes: regula la sombra y corrige el abonamiento según el análisis de suelo o de hojas.',
  ].join('\n')],
  ['productos', 'Antracnosis', [
    'Fungicida protectante a base de cobre: oxicloruro de cobre, hidróxido de cobre u óxido cuproso. Es el más usado contra la antracnosis del fruto: protege los frutos sanos, no cura los enfermos. Aplícalo antes de las lluvias.',
    'Fungicida sistémico (con asesoría técnica): estrobilurinas como la azoxistrobina, o mezclas de estrobilurina con triazol. Alterna grupos de fungicidas para que el hongo no se vuelva resistente.',
    'Bioinsumo: Trichoderma como complemento; cepas nativas inhibieron al hongo de la antracnosis del café en laboratorio, pero en campo el efecto es variable.',
    'Abonamiento: potasio y calcio equilibrados según el análisis de suelo, sin excesos de nitrógeno.',
    'Insecticida: no sirve contra la antracnosis, porque la causa un hongo.',
    'Seguridad: usa solo productos registrados ante SENASA para café, en la dosis de la etiqueta, con equipo de protección, respetando el periodo de carencia antes de cosechar y con triple lavado de los envases.',
  ].join('\n')],
];

// Metodología antes del módulo de clima (21/11/2026): tecnologías y limitaciones.
const TECNOLOGIAS_LIMITACIONES_V1 = [
  ['tecnologias', 'Python', 'Entrenamiento e inferencia del modelo.'],
  ['tecnologias', 'TensorFlow · Keras', 'Construcción y entrenamiento de la CNN.'],
  ['tecnologias', 'Docker · CUDA', 'Entrenamiento con la GPU RTX 4060 de la PC del equipo, en un contenedor con TensorFlow y cuDNN.'],
  ['tecnologias', 'NumPy', 'Matriz de confusión, recall, precisión, F1, AUC y detección de fotos borrosas y duplicadas.'],
  ['tecnologias', 'Pillow', 'Recorte de cada fruto, redimensionado y lectura de las imágenes.'],
  ['tecnologias', 'FastAPI', 'Servicio interno que ejecuta el modelo y Grad-CAM.'],
  ['tecnologias', 'React · Vite', 'Sitio del proyecto y pantallas del módulo de diagnóstico.'],
  ['tecnologias', 'Node.js · Express', 'API del sitio: sesión, perfiles y datos.'],
  ['tecnologias', 'PostgreSQL', 'Base de datos del sitio y del módulo.'],
  ['tecnologias', 'Docker', 'Levanta la base de datos, la API, el modelo y la web.'],
  ['tecnologias', 'nginx', 'Sirve la interfaz y reenvía /api a la API.'],
  ['tecnologias', 'Cloudflare Tunnel', 'URL pública HTTPS sin abrir puertos.'],
  ['tecnologias', 'Git · GitHub', 'Control de versiones del código y de los scripts de la base de datos.'],
  ['limitaciones', 'Etiquetas sin verificar', 'La principal fuente con antracnosis (Coffee berry disease, Roboflow) reutiliza las fotos de un conjunto colombiano de madurez de Zenodo, etiquetadas por un usuario anónimo como Colletotrichum kahawae, especie reportada solo en África; algunos frutos marcados como enfermos figuran como secos o sobremaduros. Un especialista debe revisar esas 559 imágenes antes del modelo final.'],
  ['limitaciones', 'Pocos frutos enfermos', 'Solo 768 de las 3 840 imágenes tienen antracnosis y vienen de dos fuentes. Se compensa con pesos por clase y aumento de datos, pero el modelo puede no reconocer síntomas poco representados.'],
  ['limitaciones', 'Datos de otras regiones', 'No hay fotos de frutos de Amazonas en el entrenamiento y en el Perú la antracnosis la causan otras especies de Colletotrichum. El desempeño real se medirá con al menos 100 fotos de la finca revisadas por un especialista.'],
  ['limitaciones', 'El modelo se guía en parte por el fondo', 'Cada fuente tiene su propio fondo, cámara e iluminación, y casi todos los frutos enfermos vienen de fotos sobre fondo claro. En la versión v0, ningún fruto sano de ese tipo de foto sale como «sano» y los mapas Grad-CAM muestran atención en el fondo: el resultado es fiable en fotos del cafetal pero no en fotos sobre fondo claro. Se corregirá con más frutos sanos sobre fondo claro y revisando las etiquetas.'],
  ['limitaciones', 'Sin severidad ni planta completa', 'El modelo clasifica un fruto por foto en sano o antracnosis. No estima la severidad ni analiza ramas completas: en las fotos de rama solo se usaron frutos de al menos 40 píxeles.'],
  ['limitaciones', 'Modelo preliminar', 'La versión v0 se entrenó antes de la revisión experta de las etiquetas: sus métricas son orientativas, EfficientNet-B0 aún no alcanza el recall de 85 % en el conjunto de prueba (0,82) y el sistema no reemplaza el diagnóstico de un especialista ni de laboratorio.'],
  ['limitaciones', 'Un solo equipo de cómputo', 'El entrenamiento se hace en la PC del equipo (GPU RTX 4060 de 8 GB): se usan lotes pequeños y no se hizo una búsqueda amplia de hiperparámetros.'],
];

export const METHOD_ITEMS = [
  // El problema
  ['problema', 'El café importa', 'Es una actividad productiva clave para muchas comunidades rurales; las enfermedades afectan el rendimiento y la calidad de la cosecha.'],
  ['problema', 'Antracnosis', 'Enfermedad causada por hongos del género Colletotrichum: produce lesiones oscuras y hundidas que pueden necrosar, tumbar o momificar la cereza.'],
  ['problema', 'Detección tardía', 'Las primeras lesiones son pequeñas y suelen pasar inadvertidas; cuando el daño es evidente, el hongo ya avanzó y el control llega tarde.'],
  ['problema', 'Conocimiento concentrado', 'Reconocer una infección temprana depende del criterio de pocos especialistas, y ese conocimiento no se registra de forma sistemática.'],
  // Estado sanitario del fruto (criterio visual · acción sugerida)
  ['clases', 'Fruto sano', 'Piel de color uniforme según su madurez, sin manchas ni hundimientos. Acción: continuar con el monitoreo regular.'],
  ['clases', 'Revisar', 'No es una clase: la probabilidad de antracnosis queda entre los dos umbrales y el modelo no está seguro. Acción: tomar otra foto y esperar la validación del especialista.'],
  ['clases', 'Fruto con antracnosis', 'Una o más lesiones oscuras, hundidas o necróticas; frutos deformados o momificados. Acción: retirar los frutos afectados y aplicar el manejo de la ficha del blog.'],
  // Arquitectura experimental (pasos)
  ['flujo', 'Datos', 'Tres conjuntos públicos (CC BY 4.0): Coffee berry disease y coffee cherry 20251206 de Roboflow, con frutos sanos y con lesiones, y Cherry Coffee Bean de Zenodo, con frutos sanos en cinco estados de madurez. Se recorta un fruto por imagen, se unifican las etiquetas en sano y antracnosis, se descartan frutos pequeños, fotos borrosas y duplicados, y se limitan los sanos a cuatro por cada fruto con antracnosis: 3 840 imágenes (768 con antracnosis).'],
  ['flujo', 'Preprocesamiento', 'Recorte, redimensionamiento a 224 × 224 píxeles y normalización. El aumento de datos (rotaciones, volteos, brillo y contraste) se aplica solo al entrenamiento.'],
  ['flujo', 'Modelos', 'EfficientNet-B0 como modelo principal y MobileNetV2 como alternativa más ligera, ambos preentrenados y ajustados con transferencia de aprendizaje.'],
  ['flujo', 'Entrenamiento', 'Transferencia de aprendizaje en dos fases con Adam (primero solo la cabeza y luego las últimas capas de la red), pesos por clase y parada temprana según la AUC de validación, con la GPU RTX 4060 de la PC del equipo. Una neurona sigmoide entrega la probabilidad de antracnosis y dos umbrales, elegidos con validación, la convierten en sano, revisar o antracnosis.'],
  ['flujo', 'Evaluación', 'Matriz de confusión, recall, precisión, F1, AUC y porcentaje de casos «revisar» en el conjunto de prueba, comparados con la línea base de las redes sin entrenar para comprobar que el modelo aprendió, y la diferencia entre entrenamiento y prueba para descartar que haya memorizado. Luego, mapas Grad-CAM y una prueba local con al menos 100 fotos de frutos tomadas en la finca.'],
  // Métricas
  ['metricas', 'Recall (sensibilidad)', 'De los frutos realmente enfermos, cuántos detecta el modelo. Es la métrica prioritaria.'],
  ['metricas', 'Precisión', 'De los frutos que el modelo marca como enfermos, cuántos lo están de verdad.'],
  ['metricas', 'F1-score', 'Equilibrio entre precisión y recall en una sola cifra.'],
  ['metricas', 'Exactitud', 'Aciertos totales. Puede ser engañosa si las clases están desbalanceadas, por eso no se usa sola.'],
  // Tecnologías
  ['tecnologias', 'Python', 'Entrenamiento e inferencia del modelo.'],
  ['tecnologias', 'TensorFlow · Keras', 'Construcción y entrenamiento de la CNN.'],
  ['tecnologias', 'Docker · CUDA', 'Entrenamiento con la GPU RTX 4060 de la PC del equipo, en un contenedor con TensorFlow y cuDNN.'],
  ['tecnologias', 'NumPy', 'Matriz de confusión, recall, precisión, F1, AUC y detección de fotos borrosas y duplicadas.'],
  ['tecnologias', 'Pillow', 'Recorte de cada fruto, redimensionado y lectura de las imágenes.'],
  ['tecnologias', 'FastAPI', 'Servicio interno que ejecuta el modelo y Grad-CAM.'],
  ['tecnologias', 'React · Vite', 'Sitio del proyecto y pantallas del módulo de diagnóstico.'],
  ['tecnologias', 'Node.js · Express', 'API del sitio: sesión, perfiles y datos.'],
  ['tecnologias', 'PostgreSQL', 'Base de datos del sitio y del módulo.'],
  ['tecnologias', 'Docker', 'Levanta la base de datos, la API, el modelo y la web.'],
  ['tecnologias', 'nginx', 'Sirve la interfaz y reenvía /api a la API.'],
  ['tecnologias', 'Cloudflare Tunnel', 'URL pública HTTPS sin abrir puertos.'],
  ['tecnologias', 'Git · GitHub', 'Control de versiones del código y de los scripts de la base de datos.'],
  ['tecnologias', 'Open-Meteo', 'Clima diario de la finca (lluvia, humedad y temperatura) sin sensores, gratuito y sin clave.'],
  // Alcance (un punto por línea)
  ['alcance', 'Incluye', 'Clasificación de frutos individuales en sano o antracnosis, con el estado «revisar» para los casos dudosos\nEntrenamiento y comparación de EfficientNet-B0 y MobileNetV2 con transferencia de aprendizaje\nMódulo web de diagnóstico, validación experta y tablero de incidencia para productor, propietario, especialista y administrador\nPrueba local con fotos de la finca y prueba de usabilidad (SUS), de octubre a diciembre de 2026'],
  ['alcance', 'No incluye', 'Análisis de hojas, ramas o plantas completas\nEstimación de la severidad (infección incipiente o avanzada)\nSensores de temperatura y humedad (trabajo futuro)\nReemplazo del diagnóstico de laboratorio\nServicios de nube pagados: el sistema se ejecuta en la PC del equipo'],
  // Qué estamos haciendo ahora (pasos, en orden)
  ...ESTADO_ITEMS,
  // Productos de apoyo según el resultado (pantalla de diagnóstico)
  ...PRODUCT_ITEMS,
  // Limitaciones
  ['limitaciones', 'Etiquetas sin verificar', 'La principal fuente con antracnosis (Coffee berry disease, Roboflow) reutiliza las fotos de un conjunto colombiano de madurez de Zenodo, etiquetadas por un usuario anónimo como Colletotrichum kahawae, especie reportada solo en África; algunos frutos marcados como enfermos figuran como secos o sobremaduros. Un especialista debe revisar esas 559 imágenes antes del modelo final.'],
  ['limitaciones', 'Pocos frutos enfermos', 'Solo 768 de las 3 840 imágenes tienen antracnosis y vienen de dos fuentes. Se compensa con pesos por clase y aumento de datos, pero el modelo puede no reconocer síntomas poco representados.'],
  ['limitaciones', 'Datos de otras regiones', 'No hay fotos de frutos de Amazonas en el entrenamiento y en el Perú la antracnosis la causan otras especies de Colletotrichum. El desempeño real se medirá con al menos 100 fotos de la finca revisadas por un especialista.'],
  ['limitaciones', 'El modelo se guía en parte por el fondo', 'Cada fuente tiene su propio fondo, cámara e iluminación, y casi todos los frutos enfermos vienen de fotos sobre fondo claro. En la versión v0, ningún fruto sano de ese tipo de foto sale como «sano» y los mapas Grad-CAM muestran atención en el fondo: el resultado es fiable en fotos del cafetal pero no en fotos sobre fondo claro. Se corregirá con más frutos sanos sobre fondo claro y revisando las etiquetas.'],
  ['limitaciones', 'Sin severidad ni planta completa', 'El modelo clasifica un fruto por foto en sano o antracnosis. No estima la severidad ni analiza ramas completas: en las fotos de rama solo se usaron frutos de al menos 40 píxeles.'],
  ['limitaciones', 'Modelo preliminar', 'La versión v0 se entrenó antes de la revisión experta de las etiquetas: sus métricas son orientativas, EfficientNet-B0 aún no alcanza el recall de 85 % en el conjunto de prueba (0,82) y el sistema no reemplaza el diagnóstico de un especialista ni de laboratorio.'],
  ['limitaciones', 'Un solo equipo de cómputo', 'El entrenamiento se hace en la PC del equipo (GPU RTX 4060 de 8 GB): se usan lotes pequeños y no se hizo una búsqueda amplia de hiperparámetros.'],
  ['limitaciones', 'Clima estimado, no medido', 'El riesgo climático usa datos de Open-Meteo calculados por modelos meteorológicos para una zona de algunos kilómetros, no medidos en la parcela; en la montaña el clima cambia en poca distancia. La regla de riesgo es conocimiento experto con umbrales editables, no un modelo entrenado, y no entra al modelo de las fotos.'],
];

// v4: Metodología del tercer avance antes de reunir y depurar los datos (Croppie y Coffee Fruit Maturity, WSL2).
// Solo las secciones que cambiaron: se actualizan si nadie las editó desde el panel.
const METHOD_ITEMS_V4 = [
  ['flujo', 'Datos', 'Conjuntos públicos de imágenes: Coffee berry disease (646 fotos de frutos sanos y con antracnosis) como fuente principal, y Croppie y Coffee Fruit Maturity para sumar frutos sanos. Se recorta cada fruto, se unifican las etiquetas en sano y antracnosis, y se eliminan duplicados y fotos borrosas.'],
  ['flujo', 'Preprocesamiento', 'Recorte, redimensionamiento a 224 × 224 píxeles y normalización. El aumento de datos (rotaciones, volteos, brillo y contraste) se aplica solo al entrenamiento.'],
  ['flujo', 'Modelos', 'EfficientNet-B0 como modelo principal y MobileNetV2 como alternativa más ligera, ambos preentrenados y ajustados con transferencia de aprendizaje.'],
  ['flujo', 'Entrenamiento', 'Transferencia de aprendizaje en dos fases con Adam, pesos por clase y parada temprana según el recall. Una neurona sigmoide entrega la probabilidad de antracnosis y dos umbrales la convierten en sano, revisar o antracnosis.'],
  ['flujo', 'Evaluación', 'Matriz de confusión, recall, precisión y F1, porcentaje de casos «revisar» y mapas Grad-CAM en el conjunto de prueba, y una prueba local con al menos 100 fotos de frutos tomadas en la finca.'],
  ['tecnologias', 'Python', 'Entrenamiento e inferencia del modelo.'],
  ['tecnologias', 'TensorFlow · Keras', 'Construcción y entrenamiento de la CNN.'],
  ['tecnologias', 'WSL2 · CUDA', 'Entrenamiento con la GPU RTX 4060 de la PC del equipo.'],
  ['tecnologias', 'scikit-learn', 'Matriz de confusión, recall, precisión y F1.'],
  ['tecnologias', 'OpenCV', 'Recorte, redimensionado y normalización de imágenes.'],
  ['tecnologias', 'Pandas · NumPy', 'Análisis exploratorio y gestión de metadatos.'],
  ['tecnologias', 'FastAPI', 'Servicio interno que ejecuta el modelo y Grad-CAM.'],
  ['tecnologias', 'React · Vite', 'Sitio del proyecto y pantallas del módulo de diagnóstico.'],
  ['tecnologias', 'Node.js · Express', 'API del sitio: sesión, perfiles y datos.'],
  ['tecnologias', 'PostgreSQL', 'Base de datos del sitio y del módulo.'],
  ['tecnologias', 'Docker', 'Levanta la base de datos, la API, el modelo y la web.'],
  ['tecnologias', 'nginx', 'Sirve la interfaz y reenvía /api a la API.'],
  ['tecnologias', 'Cloudflare Tunnel', 'URL pública HTTPS sin abrir puertos.'],
  ['tecnologias', 'Git · GitHub', 'Control de versiones del código y de los scripts de la base de datos.'],
];

// v3: versión anterior de las secciones que cambiaron con la entrega final del tercer avance
// (tres clases, datos del docente y Google Colab). Solo se guardan las secciones que cambiaron.
const METHOD_ITEMS_V3 = [
  ['clases', 'Fruto sano', 'Piel de color uniforme según su madurez, sin manchas ni hundimientos. Acción: continuar con el monitoreo regular.'],
  ['clases', 'Infección incipiente', 'Una o pocas manchas pequeñas, oscuras o ligeramente hundidas. Acción: avisar al técnico y aplicar el manejo de forma focalizada.'],
  ['clases', 'Infección avanzada', 'Lesiones necróticas extensas y hundidas, deformación o momificación. Acción: retirar los frutos afectados y aplicar el control indicado por el agrónomo.'],
  ['flujo', 'Datos', 'Imágenes de frutos proporcionadas por el docente: inventario por categoría, eliminación de duplicados y fotos borrosas, y revisión de etiquetas.'],
  ['flujo', 'Preprocesamiento', 'Recorte, redimensionamiento a 224 × 224 píxeles y normalización. El aumento de datos (rotaciones, volteos, brillo y contraste) se aplica solo al entrenamiento.'],
  ['flujo', 'Modelos', 'EfficientNet-B0 como modelo principal y MobileNetV2 como alternativa más ligera, ambos preentrenados y ajustados con transferencia de aprendizaje.'],
  ['flujo', 'Entrenamiento', 'Transferencia de aprendizaje en dos fases con Adam, pesos por clase y parada temprana según el recall; luego se ajusta el umbral de decisión para reducir los falsos negativos.'],
  ['flujo', 'Evaluación', 'Matriz de confusión, métricas por clase y mapas Grad-CAM en el conjunto de prueba, y una prueba final con fotos tomadas en campo.'],
  ['tecnologias', 'Python', 'Entrenamiento e inferencia del modelo.'],
  ['tecnologias', 'TensorFlow · Keras', 'Construcción y entrenamiento de la CNN.'],
  ['tecnologias', 'Google Colab', 'GPU gratuita para entrenar y reentrenar.'],
  ['tecnologias', 'scikit-learn', 'Matriz de confusión, recall, precisión y F1.'],
  ['tecnologias', 'OpenCV', 'Recorte, redimensionado y normalización de imágenes.'],
  ['tecnologias', 'Pandas · NumPy', 'Análisis exploratorio y gestión de metadatos.'],
  ['tecnologias', 'FastAPI', 'Servicio interno que ejecuta el modelo y Grad-CAM.'],
  ['tecnologias', 'React · Vite', 'Sitio del proyecto y pantallas del módulo de diagnóstico.'],
  ['tecnologias', 'Node.js · Express', 'API del sitio: sesión, perfiles y datos.'],
  ['tecnologias', 'PostgreSQL', 'Base de datos del sitio y del módulo.'],
  ['tecnologias', 'Docker', 'Levanta la base de datos, la API, el modelo y la web.'],
  ['tecnologias', 'Cloudflare Tunnel', 'URL pública HTTPS sin abrir puertos.'],
  ['alcance', 'Incluye', 'Clasificación de imágenes de frutos individuales en tres categorías\nEntrenamiento y comparación de CNN con transferencia de aprendizaje\nMódulo web de diagnóstico, validación experta y tablero de incidencia\nPruebas con fotos tomadas en campo y pruebas de usabilidad'],
  ['alcance', 'No incluye', 'Análisis de hojas, ramas o plantas completas\nSensores de temperatura y humedad (trabajo futuro)\nReemplazo del diagnóstico de laboratorio\nServicios de nube pagados: el sistema se ejecuta en la PC del equipo'],
];

// Versión anterior de la Metodología: una sección se reemplaza solo si sigue igual a esta.
export const LEGACY_METHOD_ITEMS = [
  // El problema
  ['problema', 'El café importa', 'Es una actividad productiva clave para muchas comunidades rurales; las enfermedades afectan el rendimiento y la calidad.'],
  ['problema', 'Antracnosis', 'Enfermedad asociada a hongos del género Colletotrichum que causa lesiones necróticas en los tejidos del fruto.'],
  ['problema', 'Inspección visual', 'Requiere tiempo y experiencia, y distintos daños pueden verse muy parecidos.'],
  // Arquitectura experimental (pasos)
  ['flujo', 'Datos', 'Imágenes de frutos sanos y con antracnosis de fuentes académicas y repositorios confiables, con etiquetas y procedencia. Se revisan duplicados, imágenes dañadas e inconsistencias.'],
  ['flujo', 'Preprocesamiento', 'Redimensionamiento, normalización y conversión de formato. El aumento de datos se aplica solo al entrenamiento, después de separar los conjuntos.'],
  ['flujo', 'Modelo CNN', 'Red convolucional para clasificación binaria, con alternativa de transferencia de aprendizaje (MobileNetV2, EfficientNetB0) cuando hay pocos datos.'],
  ['flujo', 'Entrenamiento y validación', 'Optimizador Adam por lotes y épocas; ajuste de tasa de aprendizaje, tamaño de lote y regularización, con Early Stopping contra el sobreajuste.'],
  ['flujo', 'Evaluación', 'El conjunto de prueba se reserva para la evaluación final: no se usa para elegir el modelo.'],
  // Métricas
  ['metricas', 'Accuracy', 'Aciertos totales sobre todas las imágenes.'],
  ['metricas', 'Precision', 'Fiabilidad de los positivos: cuántos frutos marcados como enfermos lo están.'],
  ['metricas', 'Recall', 'Casos reales detectados: cuántos frutos enfermos encuentra el modelo.'],
  ['metricas', 'F1-score', 'Equilibrio entre precision y recall.'],
  // Tecnologías
  ['tecnologias', 'Python', 'Lenguaje de programación.'],
  ['tecnologias', 'TensorFlow · Keras', 'Construcción y entrenamiento de la CNN.'],
  ['tecnologias', 'OpenCV', 'Procesamiento de imágenes.'],
  ['tecnologias', 'NumPy', 'Matrices y operaciones numéricas.'],
  ['tecnologias', 'Pandas', 'Etiquetas y registros.'],
  ['tecnologias', 'Scikit-learn', 'Métricas de clasificación.'],
  ['tecnologias', 'Matplotlib', 'Curvas y gráficos.'],
  ['tecnologias', 'Google Colab', 'Entorno de ejecución.'],
  // Alcance (un punto por línea)
  ['alcance', 'Incluye', 'Recopilación y organización del dataset\nPreprocesamiento de imágenes\nDiseño o adaptación de una CNN\nEntrenamiento, validación y evaluación'],
  ['alcance', 'No incluye', 'Sensores IoT ni monitoreo ambiental\nAplicaciones móviles ni plataformas empresariales\nProcedimientos de intervención agrícola\nMedición de la reducción de pérdidas de rendimiento'],
];

// Claves de textos que ya no se usan (se borran al arrancar).
export const REMOVED_SETTINGS = ['servicios_title', 'servicios_desc'];

const PUBLISHED_AT = '2026-10-19T12:00:00-05:00';

export const ARTICLES = [
  {
    slug: 'practicas-culturales-cafetal-sano',
    category: 'PREVENCIÓN',
    title: '5 prácticas culturales para un cafetal más sano',
    subtitle: 'Saneamiento, poda y observación: la prevención empieza con el cuidado cotidiano de la parcela.',
    read_minutes: 4,
    image_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&q=80',
    source_text: 'Investigación sobre prácticas culturales y CBD',
    content: `## 1. Retirar material afectado

Los frutos secos adheridos y las ramas deterioradas pueden albergar microorganismos. Retíralos siguiendo las indicaciones del responsable técnico y maneja los residuos sin trasladarlos a parcelas sanas. El saneamiento es una parte del manejo integrado, no una garantía de control.

## 2. Mantener una poda equilibrada

La poda facilita el acceso, la inspección y la circulación del aire. Evita heridas innecesarias y mantén limpias las herramientas entre plantas. La intensidad debe ajustarse a la edad del cultivo y a las condiciones locales.

## 3. Regular la sombra

Una sombra adecuada protege el cafetal, pero una cobertura excesiva puede prolongar la humedad. Evalúa la densidad de árboles con asesoría agronómica; eliminar toda la sombra tampoco es una solución universal.

## 4. Cuidar suelo y nutrición

La nutrición debe basarse en análisis de suelo y necesidades del cultivo. Un programa equilibrado contribuye al vigor de las plantas, pero no sustituye el diagnóstico ni controla por sí solo una enfermedad.

## 5. Registrar y revisar

Anota dónde aparecen las lesiones, cuándo comenzaron y cómo cambian después de lluvias. Compara recorridos sucesivos y consulta si el daño progresa. Las prácticas culturales investigadas para la enfermedad africana CBD no deben extrapolarse automáticamente a toda antracnosis.`,
  },
  {
    slug: 'colletotrichum-conociendo-al-patogeno',
    category: 'CIENCIA',
    title: 'Colletotrichum: conociendo al patógeno',
    subtitle: 'Por qué antracnosis y Coffee Berry Disease no son sinónimos, y cuándo es necesario un diagnóstico.',
    read_minutes: 4,
    image_url: 'https://images.unsplash.com/photo-1791728214841-a55960d9f9ec?w=1200&q=80',
    source_text: 'Literatura sobre Colletotrichum en café',
    content: `## 1. Un género, diferentes especies

*Colletotrichum* es un género amplio. En el café se han identificado varias especies con distintos niveles de agresividad. *C. gloeosporioides* es la más frecuente en América Latina, mientras que *C. kahawae* está restringida principalmente al África subsahariana y es considerada la más dañina por su capacidad de infectar frutos verdes.

## 2. La particularidad del CBD

El término "Coffee Berry Disease" (CBD) hace referencia a la enfermedad causada por *C. kahawae*. Usar ese nombre para cualquier antracnosis genera confusión y puede llevar a decisiones de manejo incorrectas. Antes de calificar una lesión como CBD, se requiere identificación de laboratorio.

## 3. Cómo se investiga una lesión

El diagnóstico de laboratorio incluye aislamiento en medios de cultivo, observación microscópica de estructuras fúngicas y, en casos de mayor precisión, pruebas moleculares. Una fotografía sola no reemplaza este proceso.

## 4. Qué hacer ante una sospecha

Si observas lesiones circulares, oscuras y deprimidas en cerezas verdes o maduras, documenta la ubicación, el porcentaje de frutos afectados y las condiciones climáticas recientes. Envía muestras a un laboratorio acreditado y espera el resultado antes de aplicar cualquier producto fitosanitario.`,
  },
  {
    slug: 'lluvias-y-antracnosis',
    category: 'CLIMA',
    title: 'Lluvias y antracnosis: cuándo reforzar la observación',
    subtitle: 'La humedad puede favorecer la enfermedad, pero el riesgo también depende del fruto, la variedad y el manejo.',
    read_minutes: 3,
    image_url: 'https://images.unsplash.com/photo-1695781398648-61682bb523ba?w=1200&q=80',
    source_text: 'Estudios de clima y fitopatología del café',
    content: `## 1. Humedad y dispersión

Las esporas de *Colletotrichum* se dispersan principalmente por salpique de agua. Períodos de lluvia frecuente, especialmente con temperaturas entre 20 y 25 °C, crean condiciones favorables para que el inóculo presente en frutos momificados alcance frutos sanos.

## 2. El contexto importa

Un episodio de lluvia intenso no garantiza que habrá una epidemia. La presencia de inóculo inicial, el estado fenológico del fruto, la variedad sembrada y las prácticas de saneamiento aplicadas son factores que modulan el riesgo real. Evalúa el conjunto, no solo el clima.

## 3. Observar después de las lluvias

Refuerza los recorridos de monitoreo entre 10 y 14 días después de un período lluvioso prolongado. Registra el número de frutos con lesiones nuevas y compara con recorridos anteriores. Si la incidencia aumenta significativamente, consulta a un técnico.

## 4. Evitar tratamientos por calendario sin diagnóstico

Aplicar fungicidas simplemente porque llovió, sin confirmar presencia activa de la enfermedad, aumenta los costos, genera presión de selección sobre el patógeno y puede dejar residuos en el fruto. Las aplicaciones preventivas tienen justificación, pero deben basarse en umbral de riesgo real y asesoría técnica.`,
  },
  {
    slug: 'trichoderma-control-biologico',
    category: 'MANEJO',
    title: 'Trichoderma: posibilidades y límites del control biológico',
    subtitle: 'Los resultados prometedores de laboratorio necesitan validación en campo antes de convertirse en recomendaciones.',
    read_minutes: 4,
    image_url: 'https://images.unsplash.com/photo-1760861715390-d85bd4eb617e?w=1200&q=80',
    source_text: 'Investigaciones sobre control biológico en café',
    content: `## 1. Qué es Trichoderma

*Trichoderma* es un género de hongos presentes naturalmente en suelos agrícolas. Algunas especies producen enzimas y metabolitos que interfieren con el crecimiento de hongos patógenos, incluyendo *Colletotrichum*. Esta interacción ha generado interés como alternativa biológica en el manejo integrado.

## 2. Laboratorio no es parcela

Los ensayos in vitro muestran inhibición del crecimiento del patógeno, pero las condiciones del campo son distintas. La competencia con otros microorganismos del suelo, la temperatura, la humedad y el pH pueden reducir la eficacia observada en laboratorio. No se debe generalizar resultados de cámara húmeda a recomendaciones de campo.

## 3. Qué evaluar antes de usar un producto

Si consideras usar un bioinsumo a base de *Trichoderma*, verifica que esté registrado ante la autoridad sanitaria local, que tenga concentración garantizada de esporas viables y que cuente con al menos un ensayo de campo publicado en condiciones similares a las tuyas.

## 4. Una herramienta, no una solución aislada

El control biológico es más efectivo como parte de un sistema que incluye saneamiento, manejo cultural y, cuando corresponde, uso de fungicidas selectivos. Ningún componente por separado controla eficientemente la antracnosis en condiciones de alta presión de inóculo.`,
  },
  {
    slug: 'frutos-enfermos-y-calidad-del-cafe',
    category: 'CALIDAD',
    title: 'Frutos enfermos y calidad del café: qué podemos afirmar',
    subtitle: 'Separar daño en el fruto, pérdidas de cosecha y defectos sensoriales permite interpretar mejor la calidad.',
    read_minutes: 3,
    image_url: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=1200&q=80',
    source_text: 'Estudios sobre calidad de taza y enfermedades fúngicas',
    content: `## 1. Daño visible y rendimiento

La antracnosis puede causar caída prematura de frutos y momificación, lo que reduce el número de cerezas cosechables. Este impacto en rendimiento es documentable mediante comparación de parcelas con distinta incidencia, aunque muchos factores agronómicos también influyen en la productividad final.

## 2. La taza tiene múltiples causas

Los defectos sensoriales —acidez excesiva, notas fermentadas, granos negros— pueden tener distintos orígenes: procesamiento, secado, almacenamiento o enfermedad. Atribuir un defecto de taza exclusivamente a la antracnosis sin análisis de la cadena completa es una simplificación que puede llevar a conclusiones erróneas.

## 3. Separación y trazabilidad

Una práctica útil en cosecha es separar los frutos con lesiones visibles antes del despulpado. Esto reduce la probabilidad de mezclar granos dañados con el lote principal. La trazabilidad del lote permite correlacionar incidencia de campo con resultados de taza.

## 4. Investigar antes de concluir

Si sospechas que la enfermedad está afectando la calidad de tu café, documenta la incidencia en campo, separa lotes y solicita catación comparativa. Los resultados te permitirán tomar decisiones basadas en evidencia propia, no en supuestos generales.`,
  },
  {
    slug: 'observar-y-registrar-frutos-con-sintomas',
    category: 'CAMPO',
    title: 'Cómo observar y registrar frutos con síntomas',
    subtitle: 'Un registro consistente ayuda a evaluar la incidencia aparente sin confundir observación con diagnóstico.',
    read_minutes: 4,
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80',
    source_text: 'Protocolos de monitoreo fitosanitario en cafetales',
    content: `## 1. Preparar el recorrido

Define un transecto representativo de la parcela que incluya diferentes zonas: bordes, sectores con mayor sombra y áreas más expuestas. Repite el mismo recorrido en cada evaluación para que los datos sean comparables entre fechas.

## 2. Contar con un criterio constante

Decide de antemano qué considerarás un fruto "con síntoma": solo lesiones con hundimiento visible, o también manchas superficiales. Usa el mismo criterio en todos los recorridos. La inconsistencia en el criterio de conteo genera datos no comparables.

## 3. Documentar sin contaminar

Toma fotografías de las lesiones antes de tocar el fruto. Si recolectas muestras para análisis, usa bolsas individuales por árbol y etiquétalas con fecha, sector y número de árbol. Evita mezclar muestras de diferentes zonas para no perder información espacial.

## 4. Solicitar diagnóstico

Los registros de campo son el punto de partida, no el diagnóstico final. Si la incidencia supera el 10 % de los frutos evaluados o si las lesiones tienen características poco habituales, lleva muestras a un laboratorio de diagnóstico fitopatológico. El técnico podrá confirmar el agente causal y orientar el manejo más adecuado para tu situación.`,
  },
].map((a) => ({ ...a, published_at: PUBLISHED_AT }));

// ── Base de conocimiento (RF07) ─────────────────────────────────────────
// Cada artículo puede vincularse a un resultado del diagnóstico (clase_relacionada). La pantalla del
// resultado muestra primero la ficha de manejo de esa clase y después los demás artículos vinculados.
export const FICHA_CATEGORY = 'FICHA DE MANEJO';
const FOTO_FUENTE = 'Foto: coffee cherry 20251206, Roboflow Universe (CC BY 4.0)';
const FOTO_URL = 'https://universe.roboflow.com/1-hqah6/coffee-cherry-20251206';
const PUBLISHED_FICHAS = '2026-11-21T12:00:00-05:00';

export const KNOWLEDGE_ARTICLES = [
  {
    slug: 'ficha-fruto-sano-prevencion-y-vigilancia',
    category: FICHA_CATEGORY,
    clase_relacionada: 'sano',
    title: 'Fruto sano: prevención y vigilancia',
    subtitle: 'El resultado «sano» no es el final del trabajo: cuidar la parcela y seguir observando evita que la antracnosis llegue sin aviso.',
    image_url: '/img/fichas/fruto-sano.jpg',
    source_text: FOTO_FUENTE,
    source_url: FOTO_URL,
    content: `## Qué significa el resultado

El modelo no encontró señales de antracnosis en **este fruto**. Eso no garantiza que toda la planta o la parcela estén sanas: una foto representa a un solo fruto y el modelo puede equivocarse. Úsalo como un dato más de tu recorrido, no como un certificado.

## Qué hacer ahora

- Registra el resultado: el sistema ya lo guardó en tu historial con la fecha y la versión del modelo.
- Si en la misma rama ves frutos con manchas, fotografíalos también: la enfermedad suele empezar en pocos frutos.
- Mantén el recorrido de vigilancia de la parcela, con más frecuencia en las semanas de lluvia.

## Prevención en la parcela

- **Saneamiento:** retira los frutos secos o momificados que quedan en las ramas y en el suelo; son la principal fuente de esporas para la siguiente campaña.
- **Poda y sombra:** una copa aireada y una sombra regulada reducen el tiempo que el fruto permanece mojado.
- **Nutrición equilibrada:** una planta bien nutrida, según el análisis de suelo, tolera mejor las enfermedades.
- **Herramientas limpias:** desinfecta tijeras y machetes al pasar de una planta con síntomas a otra.
- **Cosecha oportuna:** los frutos sobremaduros que quedan en la planta se dañan con más facilidad.

## Cuándo volver a revisar

Repite la observación después de lluvias seguidas, cuando el fruto cambia de verde a pintón y antes de cada pase de cosecha. Si en un recorrido encuentras más frutos con manchas que la vez anterior, avisa al especialista.

## Recuerda

El sistema apoya la vigilancia, pero no reemplaza el criterio del técnico de campo ni el análisis de laboratorio.`,
  },
  {
    slug: 'recorridos-de-vigilancia-en-el-cafetal',
    category: 'CAMPO',
    clase_relacionada: 'sano',
    title: 'Recorridos de vigilancia: cómo detectar la antracnosis a tiempo',
    subtitle: 'Un recorrido corto y constante, con fotos de los frutos dudosos, permite actuar antes de que la enfermedad se extienda.',
    image_url: '/img/fichas/vigilancia-cafetal.jpg',
    source_text: FOTO_FUENTE,
    source_url: FOTO_URL,
    content: `## Por qué vigilar aunque el fruto se vea sano

La antracnosis empieza con lesiones pequeñas que pasan desapercibidas. Detectarlas cuando afectan a pocos frutos da tiempo para retirar el material enfermo y consultar al especialista antes de que se pierda parte de la cosecha.

## Cómo organizar el recorrido

- Elige un camino fijo que pase por bordes, zonas con más sombra, zonas más expuestas y partes bajas donde se acumula humedad.
- Marca de 10 a 20 plantas de referencia y revísalas siempre en el mismo orden.
- En cada planta mira al menos tres ramas: una baja, una media y una alta.
- Hazlo cada una o dos semanas, y con más frecuencia en temporada de lluvias o durante el llenado del fruto.

## Qué observar

- Manchas oscuras y hundidas en la cáscara, con borde definido.
- Frutos que se secan, ennegrecen y quedan pegados a la rama.
- Polvo o masas de color rosado sobre las lesiones cuando hay mucha humedad.
- Caída de frutos jóvenes sin causa aparente.

## Cómo usar el sistema en el recorrido

Fotografía con el teléfono cada fruto dudoso siguiendo la guía de captura y analízalo en **Nuevo diagnóstico**. Cada análisis queda en el **Historial**, y el **Tablero** muestra cómo cambia la incidencia mes a mes. Así el recorrido deja de depender de la memoria de una sola persona.

## Cuándo pedir ayuda

Consulta al especialista si los frutos con síntomas aumentan entre dos recorridos, si aparecen en varias zonas de la parcela o si el sistema devuelve varios resultados «revisar» o «antracnosis» en la misma zona.`,
  },
  {
    slug: 'ficha-resultado-revisar',
    category: FICHA_CATEGORY,
    clase_relacionada: 'revisar',
    title: 'Resultado «revisar»: qué hacer cuando el modelo no está seguro',
    subtitle: 'Cómo tomar otra foto, qué observar en el fruto y cuándo consultar al especialista.',
    image_url: '/img/fichas/fruto-revisar.jpg',
    source_text: FOTO_FUENTE,
    source_url: FOTO_URL,
    content: `## Qué significa el resultado

La probabilidad de antracnosis quedó entre los dos umbrales del modelo: no es lo bastante baja para decir «sano» ni lo bastante alta para decir «antracnosis». Puede deberse a una foto poco clara, a un daño distinto de la antracnosis (golpe, insecto, quemadura de sol, fruto sobremaduro) o a una lesión muy inicial. Por eso el caso queda **pendiente para que lo revise un especialista**.

## 1. Toma otra foto

- Un solo fruto, centrado y ocupando la mayor parte de la imagen.
- A 10–20 cm de distancia, con el fruto enfocado.
- Luz natural pareja, sin sol directo ni contraluz, y sin flash.
- Si puedes, fotografía también el otro lado del fruto.
- Fondo uniforme: la rama o las hojas del propio cafetal funcionan bien.

Si la nueva foto da «sano» o «antracnosis» con claridad, sigue la ficha de ese resultado. Si vuelve a salir «revisar», no repitas muchas veces: pasa al punto 2.

## 2. Observa el fruto con atención

- **¿La mancha está hundida y es oscura, con borde definido?** Es más compatible con antracnosis.
- **¿Hay polvo o masas rosadas sobre la lesión?** Con humedad, también es una señal de antracnosis.
- **¿Hay un agujero pequeño en la corona del fruto?** Puede ser broca, no antracnosis.
- **¿La mancha es clara, seca y en el lado expuesto al sol?** Puede ser quemadura de sol.
- **¿Hay otros frutos con el mismo síntoma en la rama?** Fotografíalos también.

## 3. Cuándo consultar al especialista

- Si el resultado se repite como «revisar» con buenas fotos.
- Si en la misma planta o zona hay varios frutos con lesiones.
- Si la lesión no se parece a ninguna de las descritas.

El especialista verá tu caso en **Validación**, con la foto y el mapa Grad-CAM, y registrará si es sano, antracnosis u otro daño. Su respuesta queda en tu **Historial** y ayuda a mejorar el modelo en la siguiente versión.

## Mientras tanto

Separa los frutos dudosos de la cosecha sana y no los dejes en el suelo de la parcela hasta tener una respuesta.`,
  },
  {
    slug: 'como-tomar-la-foto-del-fruto',
    category: 'CAMPO',
    clase_relacionada: 'revisar',
    title: 'Cómo tomar la foto de un fruto para el diagnóstico',
    subtitle: 'La calidad de la foto pesa tanto como el modelo: cinco reglas para obtener un resultado confiable.',
    image_url: '/img/fichas/foto-del-fruto.jpg',
    source_text: FOTO_FUENTE,
    source_url: FOTO_URL,
    content: `## Por qué importa la foto

El modelo aprendió con fotos de frutos individuales, bien enfocados y tomados en el cafetal. Cuanto más se parezca tu foto a esas condiciones, más confiable es el resultado. Muchas respuestas «revisar» se resuelven solo con una mejor foto.

## Las cinco reglas

- **Un solo fruto:** acércate hasta que el fruto ocupe la mayor parte de la imagen. Si hay varios, el modelo no sabe cuál evaluar.
- **Enfocado:** toca la pantalla sobre el fruto para enfocar y espera un segundo antes de tomar la foto.
- **A 10–20 cm:** más cerca, la cámara no enfoca; más lejos, se pierden los detalles de la lesión.
- **Luz pareja:** busca sombra clara. Evita el sol directo, el contraluz y el flash, que borran el color de las manchas.
- **Fondo natural:** fotografía el fruto en la rama, con las hojas detrás. Evita fondos de papel o mesas de colores muy distintos.

## Errores frecuentes

- Fotos movidas por el viento: sujeta la rama con la otra mano.
- Fruto cortado en el borde de la imagen.
- Gotas de agua que reflejan la luz y parecen manchas.
- Fotos de la pantalla de otro teléfono o fotos de fotos.

## Privacidad

El sistema reduce el tamaño de la foto y elimina sus metadatos (incluida la ubicación GPS) antes de enviarla. La ubicación solo se guarda si marcas la casilla correspondiente.`,
  },
  {
    slug: 'ficha-fruto-con-antracnosis',
    category: FICHA_CATEGORY,
    clase_relacionada: 'antracnosis',
    title: 'Fruto con antracnosis: qué hacer con los frutos y la parcela',
    subtitle: 'Pasos inmediatos para frenar la diseminación y por qué conviene confirmar el diagnóstico con un especialista.',
    image_url: '/img/fichas/fruto-antracnosis.jpg',
    source_text: FOTO_FUENTE,
    source_url: FOTO_URL,
    content: `## Qué significa el resultado

El modelo encontró en el fruto un patrón compatible con antracnosis: manchas oscuras y hundidas causadas por hongos del género *Colletotrichum*. Es una **alerta temprana**, no un diagnóstico de laboratorio: el especialista revisará el caso en **Validación** y su respuesta quedará en tu **Historial**.

## Qué hacer con los frutos

- Retira de la planta los frutos con lesiones y los que estén secos o momificados.
- No los dejes en el suelo ni los mezcles con la cosecha sana: recógelos en un saco aparte.
- Elimínalos lejos del cafetal, enterrándolos o según la indicación del técnico; no los uses como abono dentro de la parcela.
- Lávate las manos y limpia las herramientas antes de pasar a plantas sanas.

## Qué hacer en la parcela

- **Mira las plantas vecinas:** fotografía los frutos dudosos para saber si es un caso aislado o un foco.
- **Marca la zona** en tu registro para volver a revisarla en una o dos semanas.
- **Mejora la aireación:** poda las ramas improductivas y regula la sombra para que el fruto se seque más rápido después de la lluvia.
- **Evita mover material** (frutos, ramas, sacos) desde la zona afectada hacia zonas sanas.
- **Cosecha a tiempo** los frutos maduros de la zona afectada y procésalos por separado si tienen daño.

## Cuándo consultar al especialista

Siempre que el resultado se repita en varias plantas, y antes de aplicar cualquier producto. El control químico solo debe usarse con productos registrados ante SENASA, en la dosis y el momento que indique un ingeniero agrónomo; aplicarlos sin diagnóstico puede ser inútil y costoso.

## Más información

Lee la guía de **manejo integrado** para ver cómo combinar las medidas culturales, biológicas y químicas en la siguiente campaña.`,
  },
  {
    slug: 'manejo-integrado-de-la-antracnosis-del-fruto',
    category: 'MANEJO',
    clase_relacionada: 'antracnosis',
    title: 'Manejo integrado de la antracnosis del fruto',
    subtitle: 'Ninguna medida funciona sola: prevención, saneamiento, control biológico y químico con asesoría, y seguimiento.',
    image_url: '/img/fichas/manejo-integrado.jpg',
    source_text: FOTO_FUENTE,
    source_url: FOTO_URL,
    content: `## Qué es el manejo integrado

Es combinar varias medidas que se refuerzan entre sí, en lugar de depender de una sola. Para la antracnosis del fruto, el objetivo es reducir la cantidad de esporas en la parcela, evitar las condiciones que favorecen la infección y actuar a tiempo cuando aparecen los primeros frutos afectados.

## 1. Medidas culturales (la base)

- Retirar frutos momificados y ramas secas después de la cosecha y antes de la floración.
- Podar para airear la copa y regular la sombra.
- Mantener una nutrición equilibrada basada en el análisis de suelo.
- Controlar las malezas alrededor de la planta para reducir la humedad.
- Cosechar a tiempo y no dejar frutos sobremaduros en la planta.

## 2. Vigilancia

Recorridos fijos cada una o dos semanas, con fotos de los frutos dudosos en el sistema. El **Tablero** muestra la incidencia por mes y ayuda a decidir cuándo intensificar las medidas.

## 3. Control biológico

Algunos hongos benéficos, como *Trichoderma*, inhiben a *Colletotrichum* en ensayos de laboratorio. En campo sus resultados son variables, por lo que deben usarse como complemento y con productos de calidad comprobada.

## 4. Control químico, solo con asesoría

Puede ser necesario cuando la incidencia es alta y las condiciones son muy favorables a la enfermedad. Debe decidirlo un ingeniero agrónomo, con productos registrados ante SENASA, respetando la dosis, el momento de aplicación, el periodo de carencia antes de la cosecha y el equipo de protección. Alternar productos evita que el hongo se vuelva resistente.

## 5. Registro y aprendizaje

Anota qué medidas aplicaste, cuándo y qué pasó después. Con el historial de capturas, las validaciones del especialista y el tablero, la finca construye su propio conocimiento sobre cómo se comporta la enfermedad en sus parcelas.

## Recuerda

Las recomendaciones de este artículo son generales. Las especies de *Colletotrichum* presentes en el Perú y las condiciones de cada finca son distintas: confirma el diagnóstico y el plan de manejo con un especialista.`,
  },
].map((a) => ({ ...a, published_at: PUBLISHED_FICHAS }));

// Segunda carga (21/11/2026): productos, abonos y bioinsumos de apoyo.
export const KNOWLEDGE_ARTICLES_V2 = [
  {
    slug: 'fungicidas-abonos-y-bioinsumos-contra-la-antracnosis',
    category: 'MANEJO',
    clase_relacionada: 'antracnosis',
    title: 'Fungicidas, abonos y bioinsumos frente a la antracnosis del café',
    subtitle: 'Qué productos se usan, para qué sirve cada uno y cómo aplicarlos con seguridad. Sin dosis: la dosis la fijan la etiqueta y el técnico.',
    image_url: '/img/fichas/productos-apoyo.jpg',
    source_text: 'Foto: coffee cherry 20251206, Roboflow Universe (CC BY 4.0). Referencias en el texto.',
    source_url: 'https://universe.roboflow.com/1-hqah6/coffee-cherry-20251206',
    content: `## Antes de comprar un producto

La antracnosis la causa un **hongo** (*Colletotrichum*). Por eso los insecticidas no la controlan, y los fungicidas solo ayudan si se aplican en el momento correcto y junto con el manejo cultural: retirar frutos enfermos, podar y regular la sombra. Confirma el diagnóstico con el especialista antes de aplicar: si el daño es broca o quemadura de sol, el fungicida no sirve.

## 1. Fungicidas protectantes a base de cobre

- **Ejemplos de ingrediente activo:** oxicloruro de cobre, hidróxido de cobre, óxido cuproso.
- **Para qué sirven:** forman una capa sobre el fruto que impide que la espora germine. Son los más usados contra las enfermedades del fruto del café causadas por *Colletotrichum*, como la Coffee Berry Disease en África.
- **Cuándo:** de forma preventiva, en floración y fruto pequeño, y antes de periodos de lluvia. No curan los frutos que ya tienen lesión.
- **Cuidado:** la lluvia los lava; aplicarlos muchas veces encarece el manejo y acumula cobre en el suelo.

## 2. Fungicidas sistémicos

- **Ejemplos:** estrobilurinas como la azoxistrobina o la piraclostrobina, y mezclas de estrobilurina con un triazol.
- **Para qué sirven:** entran en el tejido y protegen por más tiempo. En ensayos con café, las plantas tratadas con azoxistrobina contra la Coffee Berry Disease duplicaron la cosecha en Camerún, y una mezcla de estrobilurina y triazol redujo la antracnosis en Hawái.
- **Cuidado:** el hongo se vuelve resistente si se repite siempre el mismo grupo. Alterna grupos y respeta el número máximo de aplicaciones por campaña que indica la etiqueta.

## 3. Bioinsumos

- **Trichoderma:** hongo benéfico que compite con *Colletotrichum*. Cepas nativas inhibieron al hongo de la antracnosis del café en laboratorio ([estudio en México, 2025](https://www.scielo.org.mx/scielo.php?pid=S0185-33092025000200007&script=sci_arttext)). En campo el efecto es variable: úsalo como complemento, no como único control.
- **Beauveria bassiana:** no actúa sobre la antracnosis; sirve para la broca del café, una plaga que a veces se confunde con la enfermedad.

## 4. Abonos y enmiendas

- **Análisis de suelo primero:** el plan de nitrógeno, fósforo y potasio debe salir del análisis, no de una receta general.
- **Potasio y calcio:** una planta bien nutrida forma tejidos más resistentes; en otros cultivos, el equilibrio de potasio y calcio redujo la severidad de la antracnosis.
- **Cal agrícola o dolomita:** corrige la acidez del suelo cuando el pH es menor que 5 y aporta calcio y magnesio.
- **Sin excesos de nitrógeno:** el exceso produce brotes tiernos y follaje denso que retiene humedad.
- **Abono orgánico:** compost o pulpa bien descompuesta, nunca preparada con frutos enfermos.

## 5. Seguridad y normas

- Usa solo productos **registrados ante SENASA para el cultivo de café** y verifica el registro en la etiqueta.
- Aplica la **dosis de la etiqueta**: más producto no controla mejor y aumenta los residuos.
- Usa **equipo de protección**: guantes, mascarilla, lentes y ropa de manga larga.
- Respeta el **periodo de carencia** (días entre la última aplicación y la cosecha).
- No mezcles productos sin indicación técnica, y haz el **triple lavado** de los envases vacíos antes de entregarlos al punto de acopio.

## Referencias

- [Revisión de los hongos del café (Pathogens, 2022)](https://www.doi.org/10.3390/pathogens11040411).
- [Fungicidas convencionales y biológicos contra la roya y la antracnosis del café en Hawái](https://scholarspace.manoa.hawaii.edu/items/0effc41a-e509-4d86-93ae-69bbe8ab9409/full).
- [Manejo integrado de plagas y enfermedades del café, Anacafé](https://www.anacafe.org/uploads/file/9ca51328e6734c6b8e0d88f604266591/09_Manejo_integrado_de_plagas.pdf).

Las recomendaciones son generales y no reemplazan la indicación de un ingeniero agrónomo.`,
  },
].map((a) => ({ ...a, published_at: '2026-11-21T18:00:00-05:00' }));

// Artículos existentes que se vinculan a un resultado (solo si nadie les asignó otro).
export const ARTICLE_CLASS_LINKS = {
  'practicas-culturales-cafetal-sano': 'sano',
  'lluvias-y-antracnosis': 'sano',
  'observar-y-registrar-frutos-con-sintomas': 'revisar',
  'colletotrichum-conociendo-al-patogeno': 'antracnosis',
  'trichoderma-control-biologico': 'antracnosis',
  'frutos-enfermos-y-calidad-del-cafe': 'antracnosis',
};

// Versiones anteriores de la Metodología. Una sección se actualiza solo si sigue igual a alguna.
// v2 (tercer avance) incluía una CNN entrenada desde cero como línea base, que se descartó.
export const LEGACY_METHOD_VERSIONS = [
  LEGACY_METHOD_ITEMS,
  METHOD_ITEMS_V3,
  METHOD_ITEMS_V4,
  ESTADO_ITEMS_V1,
  ESTADO_ITEMS_V2,
  ESTADO_ITEMS_V3,
  ESTADO_ITEMS_V4,
  ESTADO_ITEMS_V5,
  ESTADO_ITEMS_V6,
  ESTADO_ITEMS_V7,
  ESTADO_ITEMS_V8,
  ESTADO_ITEMS_V9,
  ESTADO_ITEMS_V10,
  ESTADO_ITEMS_V11,
  ESTADO_ITEMS_V12,
  TECNOLOGIAS_LIMITACIONES_V1,
  METHOD_ITEMS_V3.map((i) =>
    i[0] === 'flujo' && i[1] === 'Modelos' ? [i[0], i[1], 'EfficientNet-B0 como modelo principal, MobileNetV2 como alternativa ligera y una CNN sencilla entrenada desde cero como línea base.'] : i,
  ),
];

// Matriz de trazabilidad de requisitos (tercer avance, Tablas 8, 9, 13 y 18).
// [código, requisito, descripción, objetivo, módulo, caso de prueba, prioridad, estado]
// Estado: pendiente · disenado (prototipo o especificación) · implementado · probado
export const REQUIREMENTS = [
  ['RF01', 'Ingesta de imagen del fruto', 'Cargar desde la PC o tomar con el teléfono una fotografía centrada en un fruto individual.', 4, 'Nuevo diagnóstico', 'CP01', 'Alta', 'disenado'],
  ['RF02', 'Preprocesamiento', 'Recortar, redimensionar a 224 × 224 píxeles y normalizar el color y el contraste de la imagen.', 2, 'Servicio del modelo', 'CP02', 'Alta', 'disenado'],
  ['RF03', 'Clasificación con CNN', 'Clasificar el fruto como sano o con antracnosis (EfficientNet-B0 o MobileNetV2) y marcar como «revisar» los casos de baja confianza.', 2, 'Servicio del modelo', 'CP03', 'Alta', 'disenado'],
  ['RF04', 'Diagnóstico visual inmediato', 'Mostrar el resultado, la probabilidad, el semáforo y la ficha de manejo asociada.', 4, 'Nuevo diagnóstico', 'CP04', 'Alta', 'disenado'],
  ['RF05', 'Registro de capturas', 'Guardar la foto con su diagnóstico, fecha, hora, autor, ubicación (si se autoriza) y versión del modelo.', 4, 'Nuevo diagnóstico · Historial', 'CP05', 'Alta', 'disenado'],
  ['RF06', 'Validación experta', 'Permitir que el especialista confirme o corrija un diagnóstico y lo comente.', 4, 'Validación', 'CP06', 'Alta', 'disenado'],
  ['RF07', 'Base de conocimiento', 'Publicar en el blog fichas de manejo vinculadas a cada categoría, y consultarlas y comentarlas.', 4, 'Blog', 'CP07', 'Media', 'disenado'],
  ['RF08', 'Tablero de incidencia', 'Mostrar indicadores de incidencia por periodo.', 4, 'Tablero', 'CP08', 'Media', 'disenado'],
  ['RF09', 'Reentrenamiento y versionado', 'Reentrenar el modelo con imágenes validadas y registrar sus métricas por versión.', 2, 'Panel · Modelo de diagnóstico', 'CP09', 'Media', 'disenado'],
  ['RF10', 'Gestión de usuarios y perfiles', 'Asignar perfiles del módulo (productor, propietario o especialista) a los usuarios.', 4, 'Panel · Usuarios', 'CP10', 'Alta', 'disenado'],
  ['RNF01', 'Sensibilidad del modelo', 'Recall de al menos 85 % en la clase antracnosis, medido en el conjunto de prueba.', 3, 'Modelo', 'Evaluación en el conjunto de prueba', null, 'pendiente'],
  ['RNF02', 'Tiempo de respuesta', 'El diagnóstico tarda como máximo 3 segundos desde el envío de la foto.', 4, 'Servicio del modelo', 'Prueba de rendimiento (30 imágenes)', null, 'pendiente'],
  ['RNF03', 'Ejecución local', 'El sistema se ejecuta en contenedores Docker y el modelo se entrena con la GPU de la PC del equipo, sin servicios de nube pagados.', 4, 'Infraestructura', 'Despliegue con Docker Compose', null, 'implementado'],
  ['RNF04', 'Tolerancia a la iluminación', 'El recall en fotos de campo con sombra o sol directo no baja más de 10 puntos respecto del conjunto de prueba.', 5, 'Modelo', 'Prueba con fotos de campo', null, 'pendiente'],
  ['RNF05', 'Interfaz simplificada', 'Resultado con semáforo: verde (sano), ámbar (revisar: el modelo no está seguro) y rojo (antracnosis).', 4, 'Nuevo diagnóstico', 'CP04', null, 'disenado'],
  ['RNF06', 'Seguridad', 'Acceso con usuario y contraseña cifrada; permisos según rol y perfil.', 4, 'Sitio y API', 'Prueba de permisos por rol', null, 'implementado'],
  ['RNF07', 'Mantenibilidad', 'Código modular, documentado y versionado en GitHub.', 4, 'Repositorio', 'Revisión del repositorio', null, 'implementado'],
  ['RNF08', 'Trazabilidad del diagnóstico', 'Cada diagnóstico registra la versión del modelo que lo generó.', 4, 'Base de datos', 'CP05', null, 'disenado'],
  ['RNF09', 'Diseño adaptable', 'Las pantallas se usan sin desplazamiento horizontal de 360 a 1440 px y conservan el estilo del sitio.', 4, 'Sitio', 'Prueba en 360, 768 y 1280 px', null, 'implementado'],
];

// Módulo de diagnóstico ------------------------------------------------------
// Versiones de los modelos que trae el repositorio (ml/modelos/). Métricas del conjunto de prueba
// (datos/evaluaciones/*_v0-preliminar.json). Al entrenar una nueva versión, agregarla aquí.
export const MODEL_VERSIONS = [
  {
    modelo: 'efficientnet_b0', version: 'v0-preliminar', archivo: 'ml/modelos/efficientnet_b0.keras',
    umbral_inferior: 0.04, umbral_superior: 0.8, auc: 0.96, recall: 0.8224, precision: 0.7333, f1: 0.7753,
    num_imagenes: 2703, entrenado_en: '2026-11-15T14:54:00-05:00',
    notas: 'Versión preliminar, entrenada antes de la revisión experta de las etiquetas. Se guía en parte por el fondo de la foto.',
  },
  {
    modelo: 'mobilenet_v2', version: 'v0-preliminar', archivo: 'ml/modelos/mobilenet_v2.keras',
    umbral_inferior: 0.07, umbral_superior: 0.74, auc: 0.9602, recall: 0.8879, precision: 0.6786, f1: 0.7692,
    num_imagenes: 2703, entrenado_en: '2026-11-15T14:48:00-05:00',
    notas: 'Versión preliminar, entrenada antes de la revisión experta de las etiquetas. Se guía en parte por el fondo de la foto.',
  },
];
