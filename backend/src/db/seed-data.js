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
    RF08: 'Mostrar indicadores de incidencia por parcela, zona y periodo.',
    RF10: 'Asignar perfiles del módulo (productor, técnico, agrónomo, gerencia) y registrar parcelas.',
    RNF01: 'Recall de al menos 85 % en la clase de infección incipiente, medido en el conjunto de prueba.',
    RNF03: 'El sistema se ejecuta en contenedores Docker en la PC del equipo, sin servicios de nube pagados.',
    RNF05: 'Resultado con semáforo: verde (sano), amarillo (incipiente) y rojo (avanzado).',
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
  ['flujo', 'Datos', 'Conjuntos públicos de imágenes: Coffee berry disease (646 fotos de frutos sanos y con antracnosis) como fuente principal, y Croppie y Coffee Fruit Maturity para sumar frutos sanos. Se recorta cada fruto, se unifican las etiquetas en sano y antracnosis, y se eliminan duplicados y fotos borrosas.'],
  ['flujo', 'Preprocesamiento', 'Recorte, redimensionamiento a 224 × 224 píxeles y normalización. El aumento de datos (rotaciones, volteos, brillo y contraste) se aplica solo al entrenamiento.'],
  ['flujo', 'Modelos', 'EfficientNet-B0 como modelo principal y MobileNetV2 como alternativa más ligera, ambos preentrenados y ajustados con transferencia de aprendizaje.'],
  ['flujo', 'Entrenamiento', 'Transferencia de aprendizaje en dos fases con Adam, pesos por clase y parada temprana según el recall. Una neurona sigmoide entrega la probabilidad de antracnosis y dos umbrales la convierten en sano, revisar o antracnosis.'],
  ['flujo', 'Evaluación', 'Matriz de confusión, recall, precisión y F1, porcentaje de casos «revisar» y mapas Grad-CAM en el conjunto de prueba, y una prueba local con al menos 100 fotos de frutos tomadas en la finca.'],
  // Métricas
  ['metricas', 'Recall (sensibilidad)', 'De los frutos realmente enfermos, cuántos detecta el modelo. Es la métrica prioritaria.'],
  ['metricas', 'Precisión', 'De los frutos que el modelo marca como enfermos, cuántos lo están de verdad.'],
  ['metricas', 'F1-score', 'Equilibrio entre precisión y recall en una sola cifra.'],
  ['metricas', 'Exactitud', 'Aciertos totales. Puede ser engañosa si las clases están desbalanceadas, por eso no se usa sola.'],
  // Tecnologías
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
  // Alcance (un punto por línea)
  ['alcance', 'Incluye', 'Clasificación de frutos individuales en sano o antracnosis, con el estado «revisar» para los casos dudosos\nEntrenamiento y comparación de EfficientNet-B0 y MobileNetV2 con transferencia de aprendizaje\nMódulo web de diagnóstico, validación experta y tablero de incidencia para productor, propietario, especialista y administrador\nPrueba local con fotos de la finca y prueba de usabilidad (SUS), de octubre a diciembre de 2026'],
  ['alcance', 'No incluye', 'Análisis de hojas, ramas o plantas completas\nEstimación de la severidad (infección incipiente o avanzada)\nSensores de temperatura y humedad (trabajo futuro)\nReemplazo del diagnóstico de laboratorio\nServicios de nube pagados: el sistema se ejecuta en la PC del equipo'],
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

// Versiones anteriores de la Metodología. Una sección se actualiza solo si sigue igual a alguna.
// v2 (tercer avance) incluía una CNN entrenada desde cero como línea base, que se descartó.
export const LEGACY_METHOD_VERSIONS = [
  LEGACY_METHOD_ITEMS,
  METHOD_ITEMS_V3,
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
  ['RF05', 'Registro de capturas', 'Guardar la foto con su diagnóstico, fecha, hora, coordenadas, parcela y versión del modelo.', 4, 'Nuevo diagnóstico · Historial', 'CP05', 'Alta', 'disenado'],
  ['RF06', 'Validación experta', 'Permitir que el especialista confirme o corrija un diagnóstico y lo comente.', 4, 'Validación', 'CP06', 'Alta', 'disenado'],
  ['RF07', 'Base de conocimiento', 'Publicar en el blog fichas de manejo vinculadas a cada categoría, y consultarlas y comentarlas.', 4, 'Blog', 'CP07', 'Media', 'disenado'],
  ['RF08', 'Tablero de incidencia', 'Mostrar indicadores de incidencia por parcela y periodo.', 4, 'Tablero', 'CP08', 'Media', 'disenado'],
  ['RF09', 'Reentrenamiento y versionado', 'Reentrenar el modelo con imágenes validadas y registrar sus métricas por versión.', 2, 'Panel · Modelo de diagnóstico', 'CP09', 'Media', 'disenado'],
  ['RF10', 'Gestión de usuarios y parcelas', 'Asignar perfiles del módulo (productor, propietario o especialista) y registrar las parcelas.', 4, 'Panel · Usuarios', 'CP10', 'Alta', 'disenado'],
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
