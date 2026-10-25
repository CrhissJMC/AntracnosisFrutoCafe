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
  docente: 'Dr. FUENTES MAZA FRANS',
  univ_title: 'Universidad Nacional Toribio Rodríguez de Mendoza de Amazonas',
  univ_desc:
    'La UNTRM es una universidad pública con sede en Chachapoyas, Amazonas. Formamos parte de su Escuela Profesional de Ingeniería de Sistemas, y este proyecto nace en el curso de Gestión del Conocimiento: une el análisis de datos y el Deep Learning con la sanidad del café, un cultivo clave para la región.',
  metodo_title: 'Cómo desarrollamos el proyecto',
  metodo_desc:
    'Del problema al modelo: datos, arquitectura, entrenamiento y evaluación de una red neuronal convolucional que detecta antracnosis en frutos de café.',
  metodo_propuesta:
    'Proponemos un modelo CNN que clasifique imágenes de frutos como sanos o con antracnosis, como apoyo a la identificación fitosanitaria.',
  metodo_flujo_nota:
    'Las fotos del mismo fruto o de la misma sesión no se reparten entre subconjuntos, para que el modelo no se evalúe con imágenes que ya "vio".',
  metodo_metricas_nota:
    'Se analiza la matriz de confusión con atención especial a los falsos negativos: frutos afectados clasificados como sanos. No se fija un porcentaje objetivo; el resultado se obtiene de los experimentos.',
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
  traz_title: 'Del botón floral al grano tostado',
  traz_desc:
    'Seguimiento del avance del proyecto: cada etapa del ciclo del café representa un 5 % de lo realizado, y cada cambio queda registrado en la bitácora.',
  traz_general:
    'Desarrollar y evaluar un modelo de Deep Learning basado en redes neuronales convolucionales para detectar antracnosis en frutos de café mediante el análisis de imágenes digitales.',
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
    nosotros_title: ['Un equipo comprometido con el café'],
    nosotros_desc: [
      'Somos estudiantes que investigan cómo prevenir y manejar la antracnosis en el fruto del café.',
      'Somos estudiantes de Ingeniería de Sistemas de la Universidad Nacional Toribio Rodríguez de Mendoza de Amazonas (UNTRM) que aplicamos la tecnología al estudio de la antracnosis en el fruto del café.',
    ],
  },
  teamRole: { from: 'Integrante del proyecto', to: 'Estudiante de Ingeniería de Sistemas' },
};

// Objetivos específicos (presentación del proyecto). [código, título, descripción]
export const OBJECTIVES = [
  [1, 'Recopilar y preparar las imágenes', 'Dataset de frutos sanos y con antracnosis: fuentes confiables, revisión de duplicados, redimensionamiento, normalización y partición.'],
  [2, 'Implementar la arquitectura CNN', 'Diseño o adaptación de una red convolucional para clasificación binaria, con alternativa de transferencia de aprendizaje (MobileNetV2, EfficientNetB0).'],
  [3, 'Entrenar y validar el modelo', 'Entrenamiento con Adam por lotes y épocas, ajuste de hiperparámetros y control del sobreajuste con Early Stopping en conjuntos independientes.'],
  [4, 'Determinar el desempeño', 'Evaluación final con accuracy, precision, recall, F1-score y matriz de confusión, con atención a los falsos negativos.'],
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
