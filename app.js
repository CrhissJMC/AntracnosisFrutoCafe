/* ==========================================
   PROYECTO ANTRACNOSIS — app.js
   ========================================== */

'use strict';

// ── Article data ────────────────────────────────────────────
var ARTICLES = [
  {
    id: 0,
    category: 'PREVENCIÓN',
    title: '5 prácticas culturales para un cafetal más sano',
    subtitle: 'Saneamiento, poda y observación: la prevención empieza con el cuidado cotidiano de la parcela.',
    date: '19 de octubre de 2026',
    read: '⏱ 4 min de lectura',
    imgClass: 'blog-img-1',
    imgUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=900&q=80',
    sourceText: 'Investigación sobre prácticas culturales y CBD ↗',
    content: `
      <h2>1. Retirar material afectado</h2>
      <p>Los frutos secos adheridos y las ramas deterioradas pueden albergar microorganismos.
      Retíralos siguiendo las indicaciones del responsable técnico y maneja los residuos sin
      trasladarlos a parcelas sanas. El saneamiento es una parte del manejo integrado, no una
      garantía de control.</p>

      <h2>2. Mantener una poda equilibrada</h2>
      <p>La poda facilita el acceso, la inspección y la circulación del aire. Evita heridas innecesarias
      y mantén limpias las herramientas entre plantas. La intensidad debe ajustarse a la edad
      del cultivo y a las condiciones locales.</p>

      <h2>3. Regular la sombra</h2>
      <p>Una sombra adecuada protege el cafetal, pero una cobertura excesiva puede prolongar la
      humedad. Evalúa la densidad de árboles con asesoría agronómica; eliminar toda la sombra
      tampoco es una solución universal.</p>

      <h2>4. Cuidar suelo y nutrición</h2>
      <p>La nutrición debe basarse en análisis de suelo y necesidades del cultivo. Un programa
      equilibrado contribuye al vigor de las plantas, pero no sustituye el diagnóstico ni controla
      por sí solo una enfermedad.</p>

      <h2>5. Registrar y revisar</h2>
      <p>Anota dónde aparecen las lesiones, cuándo comenzaron y cómo cambian después de
      lluvias. Compara recorridos sucesivos y consulta si el daño progresa. Las prácticas
      culturales investigadas para la enfermedad africana CBD no deben extrapolarse
      automáticamente a toda antracnosis.</p>
    `
  },
  {
    id: 1,
    category: 'CIENCIA',
    title: 'Colletotrichum: conociendo al patógeno',
    subtitle: 'Por qué antracnosis y Coffee Berry Disease no son sinónimos, y cuándo es necesario un diagnóstico.',
    date: '19 de octubre de 2026',
    read: '⏱ 4 min de lectura',
    imgClass: 'blog-img-2',
    imgUrl: 'https://images.unsplash.com/photo-1530092285049-1c42085fd395?w=900&q=80',
    sourceText: 'Literatura sobre Colletotrichum en café ↗',
    content: `
      <h2>1. Un género, diferentes especies</h2>
      <p><em>Colletotrichum</em> es un género amplio. En el café se han identificado varias especies
      con distintos niveles de agresividad. <em>C. gloeosporioides</em> es la más frecuente en América
      Latina, mientras que <em>C. kahawae</em> está restringida principalmente al África subsahariana
      y es considerada la más dañina por su capacidad de infectar frutos verdes.</p>

      <h2>2. La particularidad del CBD</h2>
      <p>El término "Coffee Berry Disease" (CBD) hace referencia a la enfermedad causada por
      <em>C. kahawae</em>. Usar ese nombre para cualquier antracnosis genera confusión y puede
      llevar a decisiones de manejo incorrectas. Antes de calificar una lesión como CBD, se
      requiere identificación de laboratorio.</p>

      <h2>3. Cómo se investiga una lesión</h2>
      <p>El diagnóstico de laboratorio incluye aislamiento en medios de cultivo, observación
      microscópica de estructuras fúngicas y, en casos de mayor precisión, pruebas moleculares.
      Una fotografía sola no reemplaza este proceso.</p>

      <h2>4. Qué hacer ante una sospecha</h2>
      <p>Si observas lesiones circulares, oscuras y deprimidas en cerezas verdes o maduras,
      documenta la ubicación, el porcentaje de frutos afectados y las condiciones climáticas
      recientes. Envía muestras a un laboratorio acreditado y espera el resultado antes de
      aplicar cualquier producto fitosanitario.</p>
    `
  },
  {
    id: 2,
    category: 'CLIMA',
    title: 'Lluvias y antracnosis: cuándo reforzar la observación',
    subtitle: 'La humedad puede favorecer la enfermedad, pero el riesgo también depende del fruto, la variedad y el manejo.',
    date: '19 de octubre de 2026',
    read: '⏱ 3 min de lectura',
    imgClass: 'blog-img-3',
    imgUrl: 'https://images.unsplash.com/photo-1504455583697-3a9b04be6397?w=900&q=80',
    sourceText: 'Estudios de clima y fitopatología del café ↗',
    content: `
      <h2>1. Humedad y dispersión</h2>
      <p>Las esporas de <em>Colletotrichum</em> se dispersan principalmente por salpique de agua.
      Períodos de lluvia frecuente, especialmente con temperaturas entre 20 y 25 °C, crean
      condiciones favorables para que el inóculo presente en frutos momificados alcance frutos
      sanos.</p>

      <h2>2. El contexto importa</h2>
      <p>Un episodio de lluvia intenso no garantiza que habrá una epidemia. La presencia de
      inóculo inicial, el estado fenológico del fruto, la variedad sembrada y las prácticas
      de saneamiento aplicadas son factores que modulan el riesgo real. Evalúa el conjunto,
      no solo el clima.</p>

      <h2>3. Observar después de las lluvias</h2>
      <p>Refuerza los recorridos de monitoreo entre 10 y 14 días después de un período lluvioso
      prolongado. Registra el número de frutos con lesiones nuevas y compara con recorridos
      anteriores. Si la incidencia aumenta significativamente, consulta a un técnico.</p>

      <h2>4. Evitar tratamientos por calendario sin diagnóstico</h2>
      <p>Aplicar fungicidas simplemente porque llovió, sin confirmar presencia activa de la
      enfermedad, aumenta los costos, genera presión de selección sobre el patógeno y puede
      dejar residuos en el fruto. Las aplicaciones preventivas tienen justificación, pero
      deben basarse en umbral de riesgo real y asesoría técnica.</p>
    `
  },
  {
    id: 3,
    category: 'MANEJO',
    title: 'Trichoderma: posibilidades y límites del control biológico',
    subtitle: 'Los resultados prometedores de laboratorio necesitan validación en campo antes de convertirse en recomendaciones.',
    date: '19 de octubre de 2026',
    read: '⏱ 4 min de lectura',
    imgClass: 'blog-img-4',
    imgUrl: 'https://images.unsplash.com/photo-1574263965717-d95abf6a1e62?w=900&q=80',
    sourceText: 'Investigaciones sobre control biológico en café ↗',
    content: `
      <h2>1. Qué es Trichoderma</h2>
      <p><em>Trichoderma</em> es un género de hongos presentes naturalmente en suelos agrícolas.
      Algunas especies producen enzimas y metabolitos que interfieren con el crecimiento de
      hongos patógenos, incluyendo <em>Colletotrichum</em>. Esta interacción ha generado interés
      como alternativa biológica en el manejo integrado.</p>

      <h2>2. Laboratorio no es parcela</h2>
      <p>Los ensayos in vitro muestran inhibición del crecimiento del patógeno, pero las
      condiciones del campo son distintas. La competencia con otros microorganismos del suelo,
      la temperatura, la humedad y el pH pueden reducir la eficacia observada en laboratorio.
      No se debe generalizar resultados de cámara húmeda a recomendaciones de campo.</p>

      <h2>3. Qué evaluar antes de usar un producto</h2>
      <p>Si consideras usar un bioinsumo a base de <em>Trichoderma</em>, verifica que esté registrado
      ante la autoridad sanitaria local, que tenga concentración garantizada de esporas viables
      y que cuente con al menos un ensayo de campo publicado en condiciones similares a las tuyas.</p>

      <h2>4. Una herramienta, no una solución aislada</h2>
      <p>El control biológico es más efectivo como parte de un sistema que incluye saneamiento,
      manejo cultural y, cuando corresponde, uso de fungicidas selectivos. Ningún componente
      por separado controla eficientemente la antracnosis en condiciones de alta presión de
      inóculo.</p>
    `
  },
  {
    id: 4,
    category: 'CALIDAD',
    title: 'Frutos enfermos y calidad del café: qué podemos afirmar',
    subtitle: 'Separar daño en el fruto, pérdidas de cosecha y defectos sensoriales permite interpretar mejor la calidad.',
    date: '19 de octubre de 2026',
    read: '⏱ 3 min de lectura',
    imgClass: 'blog-img-5',
    imgUrl: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=900&q=80',
    sourceText: 'Estudios sobre calidad de taza y enfermedades fúngicas ↗',
    content: `
      <h2>1. Daño visible y rendimiento</h2>
      <p>La antracnosis puede causar caída prematura de frutos y momificación, lo que reduce
      el número de cerezas cosechables. Este impacto en rendimiento es documentable mediante
      comparación de parcelas con distinta incidencia, aunque muchos factores agronómicos
      también influyen en la productividad final.</p>

      <h2>2. La taza tiene múltiples causas</h2>
      <p>Los defectos sensoriales —acidez excesiva, notas fermentadas, granos negros— pueden
      tener distintos orígenes: procesamiento, secado, almacenamiento o enfermedad. Atribuir
      un defecto de taza exclusivamente a la antracnosis sin análisis de la cadena completa
      es una simplificación que puede llevar a conclusiones erróneas.</p>

      <h2>3. Separación y trazabilidad</h2>
      <p>Una práctica útil en cosecha es separar los frutos con lesiones visibles antes del
      despulpado. Esto reduce la probabilidad de mezclar granos dañados con el lote principal.
      La trazabilidad del lote permite correlacionar incidencia de campo con resultados de taza.</p>

      <h2>4. Investigar antes de concluir</h2>
      <p>Si sospechas que la enfermedad está afectando la calidad de tu café, documenta la
      incidencia en campo, separa lotes y solicita catación comparativa. Los resultados
      te permitirán tomar decisiones basadas en evidencia propia, no en supuestos generales.</p>
    `
  },
  {
    id: 5,
    category: 'CAMPO',
    title: 'Cómo observar y registrar frutos con síntomas',
    subtitle: 'Un registro consistente ayuda a evaluar la incidencia aparente sin confundir observación con diagnóstico.',
    date: '19 de octubre de 2026',
    read: '⏱ 4 min de lectura',
    imgClass: 'blog-img-6',
    imgUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80',
    sourceText: 'Protocolos de monitoreo fitosanitario en cafetales ↗',
    content: `
      <h2>1. Preparar el recorrido</h2>
      <p>Define un transecto representativo de la parcela que incluya diferentes zonas:
      bordes, sectores con mayor sombra y áreas más expuestas. Repite el mismo recorrido
      en cada evaluación para que los datos sean comparables entre fechas.</p>

      <h2>2. Contar con un criterio constante</h2>
      <p>Decide de antemano qué considerarás un fruto "con síntoma": solo lesiones con hundimiento
      visible, o también manchas superficiales. Usa el mismo criterio en todos los recorridos.
      La inconsistencia en el criterio de conteo genera datos no comparables.</p>

      <h2>3. Documentar sin contaminar</h2>
      <p>Toma fotografías de las lesiones antes de tocar el fruto. Si recolectas muestras para
      análisis, usa bolsas individuales por árbol y etiquétalas con fecha, sector y número de
      árbol. Evita mezclar muestras de diferentes zonas para no perder información espacial.</p>

      <h2>4. Solicitar diagnóstico</h2>
      <p>Los registros de campo son el punto de partida, no el diagnóstico final. Si la incidencia
      supera el 10 % de los frutos evaluados o si las lesiones tienen características poco habituales,
      lleva muestras a un laboratorio de diagnóstico fitopatológico. El técnico podrá confirmar
      el agente causal y orientar el manejo más adecuado para tu situación.</p>
    `
  }
];

// ── Show Article ────────────────────────────────────────────
function showArticle(idx) {
  var a = ARTICLES[idx];
  if (!a) return;

  // Populate header
  document.getElementById('art-category').textContent = a.category;
  document.getElementById('art-title').textContent = a.title;
  document.getElementById('art-subtitle').textContent = a.subtitle;
  document.getElementById('art-date').textContent = a.date;
  document.getElementById('art-read').textContent = a.read;

  // Hero image
  document.getElementById('art-hero-img').style.backgroundImage = 'url(' + a.imgUrl + ')';

  // Content
  document.getElementById('art-content').innerHTML = a.content;

  // Source link
  document.getElementById('art-source-link').textContent = a.sourceText;

  // Navigate to article page
  showPage('articulo');
}

// ── SPA Navigation ─────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(function(p) {
    p.classList.remove('active');
  });

  var target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  // Update nav active states
  document.querySelectorAll('.nav-link').forEach(function(link) {
    // Mark "Blog" active when reading an article
    var activePage = (pageId === 'articulo') ? 'blog' : pageId;
    link.classList.toggle('active', link.dataset.page === activePage);
  });

  // Close mobile menu
  document.getElementById('navLinks').classList.remove('open');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Mobile toggle ───────────────────────────────────────────
document.getElementById('navToggle').addEventListener('click', function() {
  document.getElementById('navLinks').classList.toggle('open');
});

// ── Contact form ────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  var form = document.getElementById('contactForm');
  var success = document.getElementById('form-success');
  form.querySelectorAll('input, textarea').forEach(function(el) { el.value = ''; });
  success.classList.remove('hidden');
  setTimeout(function() { success.classList.add('hidden'); }, 5000);
}

// ── Navbar scroll shadow ────────────────────────────────────
window.addEventListener('scroll', function() {
  var nav = document.getElementById('navbar');
  nav.style.boxShadow = window.scrollY > 10
    ? '0 2px 12px rgba(0,0,0,.10)'
    : 'none';
});

// ── Init ────────────────────────────────────────────────────
showPage('inicio');
