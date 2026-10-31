/* ODC «¿Se puede confiar en la IA?» · Universidad de Cundinamarca · CC BY-SA 4.0 */
(function () {
  'use strict';
  var D = window.ODC_DATA, TOTAL = 18, PTS = 6.25;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  /* ---------------- state ---------------- */
  var state = { cur: 1, visited: [], act: {}, ev: {} };
  var userInteracted = false;
  function loadState() {
    var raw = '';
    if (SCORM.init()) raw = SCORM.get('cmi.suspend_data');
    if (!raw) { try { raw = localStorage.getItem('odc_xai_v1') || ''; } catch (e) {} }
    if (raw) { try { var s = JSON.parse(raw); state.cur = s.c || 1; state.visited = s.v || []; state.act = s.a || {}; state.ev = s.e || {}; } catch (e) {} }
    if (SCORM.isActive()) { var loc = parseInt(SCORM.get('cmi.core.lesson_location'), 10); if (loc >= 1 && loc <= TOTAL) state.cur = loc; }
  }
  function modulesScore() { var t = 0; Object.keys(state.act).forEach(function (k) { if (/^m[1-8]$/.test(k)) t += state.act[k] * PTS; }); return t; }
  function evalScore() { var t = 0; Object.keys(state.ev).forEach(function (k) { if (state.ev[k] === 1) t += PTS; }); return t; }
  function total() { return Math.round((modulesScore() + evalScore()) * 100) / 100; }
  function evalDone() { return Object.keys(state.ev).length === 8; }
  function save() {
    var s = JSON.stringify({ c: state.cur, v: state.visited, a: state.act, e: state.ev });
    try { localStorage.setItem('odc_xai_v1', s); } catch (e) {}
    if (SCORM.isActive()) {
      SCORM.set('cmi.suspend_data', s);
      SCORM.set('cmi.core.lesson_location', state.cur);
      SCORM.set('cmi.core.score.raw', total());
      if (evalDone()) SCORM.set('cmi.core.lesson_status', total() >= 70 ? 'passed' : 'failed');
      SCORM.commit();
    }
    $('#scorePill').textContent = (Math.round(total() * 10) / 10).toString().replace('.', ',') + ' / 100';
  }
  function record(key, frac) { if (state.act[key] === undefined) { state.act[key] = frac; save(); } }

  /* ---------------- screens meta ---------------- */
  var TITLES = {1:'Portada',2:'REA y población',3:'Menú',4:'M1 El problema',5:'M2 Del ML al modelo explicable',6:'M3 Confianza calibrada',7:'M4 La evidencia (PRISMA)',8:'M5 Técnicos (1/2)',9:'M5 Cognitivos (2/2)',10:'M6 Diseño (1/2)',11:'M6 Éticos y gobernanza (2/2)',12:'M7 Organizacionales (1/2)',13:'M7 Medición (2/2)',14:'M8 Caso: crédito',15:'Evaluación final',16:'Conclusión',17:'Referencias',18:'Créditos'};

  /* ---------------- modal ---------------- */
  var lastFocus = null;
  function modal(title, html) {
    lastFocus = document.activeElement;
    $('#modalTitle').textContent = title; $('#modalBody').innerHTML = html;
    $('#modal').classList.remove('hide'); $('#modalClose').focus();
  }
  function closeModal() { $('#modal').classList.add('hide'); if (lastFocus) lastFocus.focus(); }
  var INFO = {
    usuario: ['Usuario interno', '<p>Persona dentro de la organización que recibe la predicción del modelo y decide con base en ella (analista, gerente, operador). No es el cliente ni el científico de datos que construyó el modelo.</p>'],
    shap: ['SHAP', '<p>Asigna a cada variable un valor que indica cuánto aportó a la predicción, con base en la teoría de juegos. Permite explicar un caso puntual (local) o el modelo completo (global).</p><p>Documentación abierta: <a href="https://shap.readthedocs.io" target="_blank" rel="noopener">shap.readthedocs.io</a></p>'],
    lime: ['LIME', '<p>Crea un modelo simple alrededor de un caso concreto para explicar esa predicción particular; por ejemplo, resalta las palabras que llevaron a clasificar un correo como spam.</p>'],
    prisma: ['¿Qué es PRISMA?', '<p>PRISMA es una guía internacional para reportar revisiones sistemáticas de forma transparente: documenta cuántos estudios se identificaron, cuántos se descartaron y por qué (Page et al., 2021).</p><p><a href="https://www.prisma-statement.org" target="_blank" rel="noopener">prisma-statement.org</a></p>'],
    ecuacion: ['Ecuación de búsqueda (Scopus)', '<div class="mono">TITLE-ABS-KEY( (trust* W/10 (explainab* OR XAI OR interpretab*)) AND ("machine learning" OR "supervised learning" OR "artificial intelligence" OR AI) AND (employee* OR "internal user*" OR "end user*" OR "decision maker*" OR organization* OR compan* OR firm* OR business* OR enterprise*) ) AND (TITLE("decision making" OR "decision-making" OR "decision support") OR KEY("decision making" OR "decision-making" OR "decision support" OR "decision support system*")) AND PUBYEAR &gt; 2019 AND PUBYEAR &lt; 2027 AND (LIMIT-TO(DOCTYPE, "ar")) AND (LIMIT-TO(SUBJAREA, "BUSI") OR LIMIT-TO(SUBJAREA, "DECI") OR LIMIT-TO(SUBJAREA, "COMP")) AND (LIMIT-TO(LANGUAGE, "English") OR LIMIT-TO(LANGUAGE, "Spanish") OR LIMIT-TO(LANGUAGE, "Portuguese")) AND (LIMIT-TO(OA, "all"))</div>'],
    diagrama: ['Diagrama de flujo PRISMA', '<img src="assets/img/prisma.png" alt="Diagrama de flujo PRISMA: 50 registros identificados en Scopus, 50 cribados, 50 evaluados, 20 excluidos con razones, 30 incluidos en la revisión y 20 seleccionados para el ODC" style="width:100%;max-width:760px"><p style="font-size:11px;color:#5A6B7C">Elaboración propia (CC BY-SA 4.0), con base en el método PRISMA (Page et al., 2021).</p>'],
    automatizacion: ['Sesgo de automatización', '<p>Tendencia a aceptar lo que dice un sistema automático aunque haya señales de que se equivoca. Es una de las causas de la sobreconfianza (Humer et al., 2024).</p>']
  };
  var HELP = '<ol><li><b>Navegar:</b> usa las flechas «Anterior» y «Siguiente», las teclas ← y → del teclado o el botón ☰ Menú para ir a cualquier sección.</li><li><b>Avatar Vera:</b> ▶ reproduce o pausa el audio, ↺ lo reinicia, la barra ajusta el volumen y CC muestra la transcripción.</li><li><b>«+info»:</b> abre ventanas con definiciones, datos y enlaces. En algunas tarjetas, pasa el cursor (o toca) para ver más.</li><li><b>Miniactividades:</b> haz clic en una ficha y luego en su lugar (o arrástrala). Pulsa «Comprobar» para ver la retroalimentación. Se califica el primer intento; puedes reintentar para practicar.</li><li><b>Nota:</b> 8 miniactividades (6,25 puntos cada una = 50) + evaluación final de 8 preguntas (6,25 cada una = 50) = 100 puntos. Se aprueba con 70.</li></ol>';

  /* ---------------- generic placement activity ---------------- */
  // cfg: {key, items:[{t, to, fb}], targets:[{id,label}], single:bool, zoneStyle}
  function placement(root, cfg) {
    var sel = null;
    var pool = $('.pool', root);
    function itemEl(i) { return $('[data-i="' + i + '"]', root); }
    cfg.items.forEach(function (it, i) {
      var b = document.createElement('button'); b.className = 'chip'; b.textContent = it.t; b.draggable = true; b.dataset.i = i;
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        if (b.parentElement !== pool) { pool.appendChild(b); clearMarks(); return; }
        $$('.chip.sel', root).forEach(function (c) { c.classList.remove('sel'); });
        sel = (sel === b) ? null : b; if (sel) b.classList.add('sel');
      });
      b.addEventListener('dragstart', function (e) { e.dataTransfer.setData('text/plain', i); });
      pool.appendChild(b);
    });
    $$('[data-target]', root).forEach(function (z) {
      function drop(b) {
        var box = $('.zin', z) || z;
        if (cfg.single) { var prev = $('.chip', box); if (prev) pool.appendChild(prev); }
        box.appendChild(b); b.classList.remove('sel'); sel = null; clearMarks();
      }
      z.addEventListener('click', function () { if (sel) drop(sel); });
      z.addEventListener('dragover', function (e) { e.preventDefault(); z.classList.add('over'); });
      z.addEventListener('dragleave', function () { z.classList.remove('over'); });
      z.addEventListener('drop', function (e) { e.preventDefault(); z.classList.remove('over'); drop(itemEl(e.dataTransfer.getData('text/plain'))); });
      z.setAttribute('tabindex', '0');
      z.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && sel) { e.preventDefault(); drop(sel); } });
    });
    function clearMarks() { $$('.chip', root).forEach(function (c) { c.classList.remove('ok', 'bad'); }); $('.fbbox', root).innerHTML = ''; }
    $('.do-check', root).addEventListener('click', function () {
      if ($$('.chip', pool).length) { $('.fbbox', root).innerHTML = '<div class="fb info">Ubica todas las fichas antes de comprobar.</div>'; return; }
      var ok = 0, msgs = [];
      cfg.items.forEach(function (it, i) {
        var b = itemEl(i), z = b.closest('[data-target]'), good = z && z.dataset.target === it.to;
        b.classList.add(good ? 'ok' : 'bad'); if (good) ok++; else msgs.push('«' + it.t + '»: ' + it.fb);
      });
      var frac = ok / cfg.items.length;
      if (cfg.key) record(cfg.key, frac);
      var html = ok === cfg.items.length ? '<div class="fb ok">' + (cfg.okMsg || '¡Muy bien! Todas las fichas están en su lugar.') + '</div>'
        : '<div class="fb bad">Aciertos: ' + ok + ' de ' + cfg.items.length + '. Revisa: ' + msgs.join(' · ') + '</div>';
      if (cfg.key) html += '<div class="fb info">Puntaje registrado (primer intento): ' + fmt(state.act[cfg.key] * PTS) + ' de 6,25.</div>';
      $('.fbbox', root).innerHTML = html;
    });
    $('.do-reset', root).addEventListener('click', function () { cfg.items.forEach(function (it, i) { pool.appendChild(itemEl(i)); }); clearMarks(); });
  }
  function fmt(n) { return (Math.round(n * 100) / 100).toString().replace('.', ','); }
  function actButtons() { return '<span class="right"><button class="btn do-check">Comprobar</button> <button class="btn2 do-reset">Reiniciar</button></span>'; }

  /* ---------------- multiple-choice sequence ---------------- */
  // qs: [{q, opts:[{t, ok, fb}]}]
  function mcSeq(root, key, qs, endMsg, cfg) {
    cfg = cfg || {};
    var i = 0, ok = 0, first = state.act[key] === undefined;
    function show() {
      var q = qs[i];
      root.innerHTML = '<div style="font-size:12.5px;margin-bottom:5px"><b>' + (i + 1) + '/' + qs.length + ' ·</b> ' + q.q + '</div><div class="opts ' + (cfg.vertical ? '' : 'row') + '"' + (cfg.vertical ? ' style="display:flex;flex-direction:column;gap:5px"' : '') + '></div><div class="fbbox"></div>' + (cfg.steps ? '<div style="margin-top:5px;font-size:13px;color:var(--teal-d)" aria-label="Paso ' + (i + 1) + ' de ' + qs.length + '">' + qs.map(function (x, j) { return j <= i ? '●' : '○'; }).join(' ') + '</div>' : '');
      var box = $('.opts', root);
      q.opts.forEach(function (o) {
        var b = document.createElement('button'); b.className = 'btn2'; b.innerHTML = o.t; box.appendChild(b);
        b.addEventListener('click', function () {
          $$('button', box).forEach(function (x) { x.disabled = true; });
          b.classList.add(o.ok ? 'ok' : 'bad'); if (o.ok) ok++;
          var nx = i < qs.length - 1 ? ' <button class="btn nextq">' + (cfg.steps ? 'Siguiente paso →' : 'Siguiente →') + '</button>' : ' <button class="btn nextq">Ver resultado</button>';
          $('.fbbox', root).innerHTML = '<div class="fb ' + (o.ok ? 'ok' : 'bad') + '">' + (o.ok ? '✔ ' : '✘ ') + o.fb + nx + '</div>';
          $('.nextq', root).addEventListener('click', function () { i++; if (i < qs.length) show(); else end(); });
        });
      });
    }
    function end() {
      if (first) record(key, ok / qs.length);
      root.innerHTML = '<div class="fb ok">Aciertos: ' + ok + ' de ' + qs.length + '. ' + (endMsg || '') + '</div><div class="fb info">Puntaje registrado (primer intento): ' + fmt(state.act[key] * PTS) + ' de 6,25.</div><button class="btn2 again" style="margin-top:5px">Practicar de nuevo</button>';
      $('.again', root).addEventListener('click', function () { i = 0; ok = 0; first = false; show(); });
    }
    show();
  }

  /* ---------------- relate activity (selects) ---------------- */
  function relate(root, key, pairs, opts) {
    var html = '<div style="display:grid;grid-template-columns:1fr 1.7fr;gap:4px 8px;font-size:11.5px;align-items:center">';
    pairs.forEach(function (p, i) {
      html += '<b>' + p[0] + '</b><select data-i="' + i + '" aria-label="' + p[0] + '"><option value="">— elige —</option>' + opts.map(function (o, j) { return '<option value="' + j + '">' + o + '</option>'; }).join('') + '</select>';
    });
    html += '</div><div class="row" style="margin-top:5px">' + actButtons() + '</div><div class="fbbox"></div>';
    root.innerHTML = html;
    $('.do-check', root).addEventListener('click', function () {
      var sels = $$('select', root), ok = 0, miss = [];
      if (sels.some(function (s) { return s.value === ''; })) { $('.fbbox', root).innerHTML = '<div class="fb info">Relaciona todos los indicadores antes de comprobar.</div>'; return; }
      sels.forEach(function (s, i) { var good = opts[s.value] === pairs[i][1]; s.style.borderColor = good ? '#2E8B57' : '#C8443A'; if (good) ok++; else miss.push(pairs[i][0] + ' → ' + pairs[i][1]); });
      record(key, ok / pairs.length);
      $('.fbbox', root).innerHTML = (ok === pairs.length ? '<div class="fb ok">¡Correcto! Todos los pares están bien relacionados.</div>' : '<div class="fb bad">Aciertos: ' + ok + ' de ' + pairs.length + '. Pista: ' + miss.join(' · ') + '</div>') + '<div class="fb info">Puntaje registrado (primer intento): ' + fmt(state.act[key] * PTS) + ' de 6,25.</div>';
    });
    $('.do-reset', root).addEventListener('click', function () { $$('select', root).forEach(function (s) { s.value = ''; s.style.borderColor = ''; }); $('.fbbox', root).innerHTML = ''; });
  }

  /* ---------------- indicator cards ---------------- */
  var CATS = Object.keys(D.catdesc);
  var CAT_TITLE = {"Técnicos de las explicaciones":"Indicadores técnicos de las explicaciones","Cognitivos y perceptivos":"Indicadores cognitivos y perceptivos","Diseño del sistema XAI":"Indicadores de diseño del sistema XAI","Éticos y de gobernanza":"Indicadores éticos y de gobernanza","Organizacionales y de adopción":"Indicadores organizacionales y de adopción","Medición de la confianza":"Indicadores para medir la confianza"};
  var CAT_SHORT = {"Técnicos de las explicaciones":"⚙ Técnicos (5)","Cognitivos y perceptivos":"💡 Cognitivos (5)","Diseño del sistema XAI":"✎ Diseño (5)","Éticos y de gobernanza":"⚖ Éticos y gobernanza (5)","Organizacionales y de adopción":"🏢 Organizacionales (5)","Medición de la confianza":"📏 Medición (6)"};
  function catScreen(n, mod, cat, part, actHtml) {
    var cards = D.inds.filter(function (i) { return i[0] === cat; }).map(function (i) {
      return '<article class="card icard"><h3>' + i[1] + '</h3><div class="d"><b>¿Qué evalúa?</b> ' + cap(i[2]) + '</div><div class="e"><b>Ejemplo:</b> ' + cap(i[3]) + '</div><div class="c">(' + i[4] + ')</div></article>';
    }).join('');
    return '<div class="kick">' + mod + ' · Pantalla ' + pad(n) + ' ' + part + '</div><h1>' + CAT_TITLE[cat] + '</h1>' +
      '<div class="card" style="padding:6px 12px;margin-bottom:7px;font-size:11.5px;background:var(--teal-l)"><b>' + cat + '.</b> ' + D.catdesc[cat] + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px">' + cards + '</div>' + (actHtml ? '<div class="card" id="actbox" style="margin-top:7px;padding:7px 12px">' + actHtml + '</div>' : '');
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------------- screens ---------------- */
  var S = {};
  S[1] = { html: function () {
    return '<div style="height:100%;display:flex;flex-direction:column;justify-content:center;gap:14px;padding-right:20px">' +
      '<div class="kick">ODC · Universidad de Cundinamarca</div>' +
      '<div style="font-size:50px;font-weight:800;line-height:1.05;color:var(--navy)">¿Se puede confiar<br>en la <span style="color:var(--teal)">IA</span>?</div>' +
      '<div class="p" style="font-size:17px;max-width:720px">Indicadores para evaluar la confianza en modelos de aprendizaje supervisado explicables para decisiones organizacionales</div>' +
      '<div><span class="chip" style="border-style:solid;background:#fff">Especialización en Analítica y Ciencia de Datos</span><span class="chip" style="border-style:solid;background:#fff">Versión 1.0 · 2026</span><span class="chip" style="border-style:solid;background:#fff">18 pantallas interactivas</span></div>' +
      '<div class="p"><b>Oscar Manuel Torres Maldonado · María Lucía Torres Maldonado</b><br><span style="color:var(--muted)">Tutor: Darwin Andrés Díaz Gómez</span></div>' +
      '<div class="row"><button class="btn" id="go" style="font-size:15px;padding:11px 20px">🚀 Iniciar recorrido</button><button class="btn2" id="help2" style="padding:10px 16px">? Ayuda</button></div></div>';
  }, init: function () { $('#go').onclick = function () { go(2); }; $('#help2').onclick = function () { modal('Ayuda', HELP); }; } };

  S[2] = { html: function () {
    return '<div class="kick">Entrada · Pantalla 02</div><h1>Resultado de aprendizaje y población objetivo</h1>' +
      '<div style="display:grid;grid-template-columns:1.35fr 1fr;gap:12px">' +
      '<div class="card hl"><div class="act">🎯 Resultado Esperado de Aprendizaje</div><div class="p"><b>Comprender</b> los indicadores utilizados para evaluar la confianza de los usuarios internos en modelos de aprendizaje supervisado explicables, <b>a partir del aprendizaje basado en casos</b>, <b>para la toma de decisiones en organizaciones empresariales de América Latina.</b></div></div>' +
      '<div class="card"><div class="act">👥 Población objetivo</div><div class="p">Creadores de oportunidades de la Especialización en Analítica y Ciencia de Datos (UdeC) que cursan o cursaron el CADI Aplicación de Machine Learning y conocen los fundamentos del aprendizaje supervisado.</div></div></div>' +
      '<div class="card" id="rea" style="margin-top:12px"><div class="act">🧩 Miniactividad · Arma tu REA (sin nota)</div><div class="pool" style="min-height:34px"></div>' +
      '<div class="row" style="margin-top:4px">' + ['Verbo', 'Objeto', 'Estrategia', 'Contexto'].map(function (t) { return '<div class="slot" data-target="' + t + '" style="min-width:150px;min-height:40px"><div style="font-size:10px">' + t + '</div><div class="zin"></div></div>'; }).join('') + actButtons() + '</div><div class="fbbox"></div></div>';
  }, init: function () {
    placement($('#rea'), { single: true, okMsg: '¡Correcto! Un REA dice qué lograrás (verbo), sobre qué (objeto), cómo lo aprenderás (estrategia) y dónde lo aplicarás (contexto).', items: [
      { t: 'Comprender', to: 'Verbo', fb: 'es la acción que lograrás: el verbo.' },
      { t: 'los indicadores de confianza en modelos de aprendizaje supervisado explicables', to: 'Objeto', fb: 'dice sobre qué aprendes: es el objeto.' },
      { t: 'a partir del aprendizaje basado en casos', to: 'Estrategia', fb: 'dice cómo aprendes: es la estrategia.' },
      { t: 'para la toma de decisiones en organizaciones empresariales de América Latina', to: 'Contexto', fb: 'esa pieza no dice cómo aprendes, sino dónde aplicas lo aprendido: es el contexto.' }] });
  } };

  var MENU = [[1,'🏠','01 Portada','Presentación del ODC'],[2,'🎯','02 REA y población','Resultado de aprendizaje y a quién va dirigido'],[4,'⚠️','M1 El problema','Cifras sobre la confianza en la IA'],[5,'🧠','M2 Del ML al modelo explicable','Machine learning, caja negra y XAI'],[6,'🌡️','M3 Confianza calibrada','Confiar lo justo'],[7,'🔎','M4 La evidencia (PRISMA)','Cómo se obtuvieron los indicadores'],[8,'⚙️','M5 Técnicos y cognitivos (2 pantallas)','10 indicadores con ejemplos'],[10,'⚖️','M6 Diseño, ética y gobernanza (2 pantallas)','10 indicadores con ejemplos'],[12,'🏢','M7 Organizacionales y medición (2 pantallas)','11 indicadores con ejemplos'],[14,'💳','M8 Caso: decisión de crédito','Caso guiado en 3 pasos'],[15,'✅','Evaluación final','8 preguntas · 50 puntos'],[16,'🏁','Conclusión','Cumplimiento del REA y lista de verificación'],[17,'📚','Referencias','Fuentes en APA 7'],[18,'©️','Créditos','Metadatos, créditos y licencia']];
  S[3] = { html: function () {
    var cells = MENU.map(function (m) {
      var seen = state.visited.indexOf(m[0]) >= 0 || (m[0] === 8 && state.visited.indexOf(9) >= 0);
      return '<button class="card" data-go="' + m[0] + '" title="' + m[3] + '"><div style="font-size:19px">' + m[1] + '</div><div style="font-size:12.5px;font-weight:700;margin-top:3px">' + m[2] + '</div><div style="font-size:10.5px;color:var(--muted)">' + m[3] + '</div>' + (seen ? '<div style="font-size:11px;color:var(--green)">✓ visitado</div>' : '') + '</button>';
    }).join('');
    return '<div class="kick">Pantalla 03</div><h1>Ruta de aprendizaje</h1><div class="p" style="margin-bottom:8px">Sigue el orden o salta al tema que quieras. Puedes volver aquí desde ☰ Menú. Los módulos 5, 6 y 7 tienen dos pantallas, una por categoría de indicadores.</div><div class="menu-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:9px">' + cells + '</div>';
  }, init: function () { $$('[data-go]').forEach(function (b) { b.onclick = function () { go(+b.dataset.go); }; }); } };

  S[4] = { html: function () {
    function st(n, t, w) { return '<div class="card stat' + (w ? ' warn' : '') + '"><b>' + n + '</b><span>' + t + '</span></div>'; }
    return '<div class="kick">Módulo 1 · Pantalla 04</div><h1>La IA decide, pero la confianza está en duda</h1>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px">' + st('46%', 'dispuestos a confiar en la IA (47 países)') + st('66%', 'de empleados usa la IA sin verificar', 1) + st('56%', 'cometió errores por culpa de la IA', 1) + st('55% · 51%', 'confían en Brasil y México') + '</div>' +
      '<div style="font-size:10.5px;color:var(--muted);margin:4px 0 7px">Fuente: Gillespie et al. (2025), Universidad de Melbourne y KPMG (más de 48 000 personas).</div>' +
      '<div class="p" style="font-size:12.5px"><b>Propósito:</b> reconocer por qué la confianza en la IA es un problema real en las organizaciones. Pocos dicen confiar, pero muchos usan la IA sin cuestionarla. En la empresa decide un <b>usuario interno</b> <button class="plus" data-info="usuario">+info</button>: si confía de más, repite los errores del modelo; si confía de menos, lo ignora y la inversión se pierde (K et al., 2026; Cao et al., 2026).</div>' +
      '<div class="card" style="margin-top:9px"><div class="act">✔✘ Miniactividad · Verdadero o falso (6,25 puntos)</div><div id="vf"></div></div>' +
      '<div class="ph" style="height:118px;margin-top:9px"><img src="assets/img/persona_duda.svg" alt="Persona de pie, pensativa, frente a una recomendación de IA" style="height:110px"><div class="card" style="font-size:12px;text-align:center"><div style="font-size:10px;color:var(--muted)">Recomendación del modelo</div><b style="color:var(--red)">RECHAZAR</b> <span style="font-size:22px">❓</span></div><div style="font-size:11.5px;color:var(--muted)">🌎 América Latina<br>Brasil 55% · México 51%</div></div>';
  }, init: function () {
    mcSeq($('#vf'), 'm1', [
      { q: 'Menos de la mitad de las personas en el mundo está dispuesta a confiar en la IA.', opts: [{ t: 'V', ok: 1, fb: 'Verdadero: el 46% (Gillespie et al., 2025).' }, { t: 'F', ok: 0, fb: 'Es verdadero: solo el 46% está dispuesto a confiar (Gillespie et al., 2025).' }] },
      { q: 'La mayoría de los empleados verifica siempre la exactitud de lo que le entrega la IA.', opts: [{ t: 'V', ok: 0, fb: 'Es falso: el 66% la usa sin verificar; ese es el riesgo de la confianza excesiva.' }, { t: 'F', ok: 1, fb: 'Falso: el 66% la usa sin verificar; ese es el riesgo de la confianza excesiva.' }] },
      { q: 'En Brasil y México más de la mitad de las personas está dispuesta a confiar en la IA.', opts: [{ t: 'V', ok: 1, fb: 'Verdadero: 55% y 51%. Las economías emergentes tienden a confiar más.' }, { t: 'F', ok: 0, fb: 'Es verdadero: 55% en Brasil y 51% en México.' }] },
      { q: 'Para una empresa siempre es mejor que sus empleados confíen más en la IA.', opts: [{ t: 'V', ok: 0, fb: 'Es falso: confiar de más genera dependencia excesiva (Humer et al., 2024); lo deseable es la confianza calibrada.' }, { t: 'F', ok: 1, fb: 'Falso: confiar de más genera dependencia excesiva (Humer et al., 2024); lo deseable es la confianza calibrada.' }] }
    ], 'Recuerda: no se trata de confiar más, sino de confiar lo justo.');
  } };

  S[5] = { html: function () {
    return '<div class="kick">Módulo 2 · Pantalla 05</div><h1>Del machine learning al modelo explicable</h1>' +
      '<div class="card"><div class="act">① ¿Qué es el machine learning?</div><div class="p" style="font-size:12px">Sistemas que aprenden patrones a partir de datos para predecir o decidir, sin programar cada regla a mano (Sarker, 2021).</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px;font-size:11px"><div class="card hl" style="padding:5px 8px"><b>Supervisado ✔</b><br>Aprende de datos etiquetados. Ej.: predecir si un cliente pagará.</div><div class="card" style="padding:5px 8px"><b>No supervisado</b><br>Agrupa datos sin etiquetas. Ej.: segmentar clientes.</div><div class="card" style="padding:5px 8px"><b>Por refuerzo</b><br>Aprende por recompensas. Ej.: ajustar precios.</div></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px"><div class="card"><div class="act">② Supervisado = caja negra</div><div class="p" style="font-size:11.5px">«Rechazar crédito». Un modelo preciso que no muestra por qué predice.</div></div>' +
      '<div class="card hl"><div class="act">③ + capa XAI = explicable</div><div class="p" style="font-size:11px">Ingresos ▮▮▮▮ − · Historial ▮▮▮ + · Deuda ▮▮ − · explicación local o global (Lin et al., 2026; Li et al., 2024)</div><button class="plus" data-info="shap">+info SHAP</button> <button class="plus" data-info="lime">+info LIME</button></div></div>' +
      '<div class="card" id="cls" style="margin-top:8px"><div class="act">🗂 Miniactividad · Caja negra o explicable (6,25 puntos)</div>' +
      '<div style="display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:8px;font-size:11px"><div class="pool"></div><div class="zone" data-target="cn"><div class="zt">⬛ Caja negra</div><div class="zin"></div></div><div class="zone" data-target="ex"><div class="zt">🔍 Explicable</div><div class="zin"></div></div></div><div class="row">' + actButtons() + '</div><div class="fbbox"></div></div>';
  }, init: function () {
    placement($('#cls'), { key: 'm2', items: [
      { t: 'Aprueba o rechaza sin mostrar razones', to: 'cn', fb: 'solo entrega el resultado: es caja negra.' },
      { t: 'Muestra el aporte de ingresos e historial (SHAP)', to: 'ex', fb: 'es una explicación local: es explicable.' },
      { t: 'Árbol de decisión que se sigue paso a paso', to: 'ex', fb: 'es interpretable por diseño.' },
      { t: 'Red neuronal que solo dice «0,87»', to: 'cn', fb: 'una probabilidad no es una explicación.' },
      { t: 'LIME resalta las palabras de un correo spam', to: 'ex', fb: 'LIME explica esa predicción puntual.' }] });
  } };

  S[6] = { html: function () {
    function hv(t, d, more, hl) { return '<div class="card tip' + (hl ? ' hl' : '') + '" tabindex="0"><div class="act">' + t + '</div><div class="p" style="font-size:11.5px">' + d + '</div><div style="font-size:10px;color:var(--muted);margin-top:3px">ⓘ pasa el cursor para ver más</div><div class="tiptext">' + more + '</div></div>'; }
    return '<div class="kick">Módulo 3 · Pantalla 06</div><h1>Confianza calibrada: confiar lo justo</h1>' +
      '<div class="card" style="margin-bottom:8px"><div class="p" style="font-size:12px"><b>Confianza:</b> disposición a apoyarse en un sistema cuando hay incertidumbre y algo en juego (Lee y See, 2004). Lo que se evalúa es si es <b>adecuada</b>. Quien más sabe del tema suele confiar menos y decidir mejor: <b>escepticismo calibrado</b> (Nunez et al., 2026; Dikmen y Burns, 2022). <button class="plus" data-info="automatizacion">+info</button></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
      hv('Subconfianza', 'Ignora el modelo aunque acierte.', 'Suele aparecer cuando el usuario no entiende el modelo o desconfía de la tecnología; se pierde la inversión.') +
      hv('Calibrada', 'Confía tanto como el modelo lo merece.', 'Se logra cuando el usuario conoce el desempeño del modelo y entiende sus explicaciones (Naiseh et al., 2021, 2023).', 1) +
      hv('Sobreconfianza', 'Acepta los errores del modelo.', 'Las explicaciones «tranquilizadoras» la aumentan y el usuario repite los errores del modelo: dependencia excesiva (Humer et al., 2024).') + '</div>' +
      '<div class="card" style="margin-top:8px;background:var(--amber-l)"><div class="act">💡 Ejemplo: la app de navegación</div><div class="p" style="font-size:11.5px">Si sigues la ruta aunque te mande a una calle cerrada → sobreconfianza. Si nunca la usas aunque casi siempre acierta → subconfianza. Si la sigues y la cuestionas cuando ves algo raro → calibrada.</div></div>' +
      '<div class="card" id="term" style="margin-top:8px"><div class="act">🌡 Miniactividad · El termómetro de la confianza (6,25 puntos)</div><div class="pool"></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:4px"><div class="zone" data-target="sub"><div class="zt">Subconfianza</div><div class="zin"></div></div><div class="zone" data-target="cal"><div class="zt">Calibrada</div><div class="zin"></div></div><div class="zone" data-target="sob"><div class="zt">Sobreconfianza</div><div class="zin"></div></div></div><div class="row">' + actButtons() + '</div><div class="fbbox"></div></div>';
  }, init: function () {
    placement($('#term'), { key: 'm3', items: [
      { t: 'Aprueba todo sin mirar la explicación', to: 'sob', fb: 'acepta incluso los errores: es sobreconfianza (Humer et al., 2024).' },
      { t: '«Las máquinas no entienden el negocio» (aunque acierta el 90%)', to: 'sub', fb: 'desperdicia un sistema confiable: es subconfianza.' },
      { t: 'Sigue el modelo y revisa lo atípico', to: 'cal', fb: 'ajusta su confianza a la evidencia: es calibrada.' },
      { t: 'Experta cuestiona y detecta un error en los datos', to: 'cal', fb: 'es escepticismo calibrado (Dikmen y Burns, 2022).' }] });
  } };

  S[7] = { html: function () {
    var rows = CATS.map(function (c) { return '<tr><td>' + CAT_SHORT[c] + '</td><td>' + D.inds.filter(function (i) { return i[0] === c; }).map(function (i) { return i[1]; }).join(' · ') + '</td></tr>'; }).join('');
    return '<div class="kick">Módulo 4 · Pantalla 07</div><h1>La evidencia: revisión sistemática con PRISMA</h1>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="card" style="font-family:Consolas,monospace;font-size:10px;line-height:1.3">Scopus · TITLE-ABS-KEY((trust* W/10 (explainab* OR XAI …)) … 2020–2026 · acceso abierto <button class="plus" data-info="ecuacion">ver ecuación completa</button></div>' +
      '<div class="p" style="font-size:11.5px"><b>Propósito:</b> conocer de dónde salen los indicadores y cuáles son. 50 identificados → 30 en la matriz → <b>20 seleccionados</b> <button class="plus" data-info="prisma">+info PRISMA</button> <button class="plus" data-info="diagrama">ver diagrama</button></div></div>' +
      '<div class="act" style="margin-top:7px">Resultado: 31 indicadores en 6 categorías · se desarrollan en M5–M7</div><table class="cats">' + rows + '</table>' +
      '<div class="p" style="font-size:10.5px;color:var(--muted);margin-top:4px">La evidencia específica de América Latina es escasa; se usan estudios internacionales aplicables a la región.</div>' +
      '<div class="card" id="ord" style="margin-top:6px;padding:6px 12px"><div class="act">↕ Miniactividad · Ordena el proceso PRISMA (6,25 puntos)</div><div class="row"><div class="pool"></div> → ' + [1, 2, 3, 4].map(function (n) { return '<div class="slot" data-target="' + n + '" style="min-width:105px;min-height:30px"><div style="font-size:10px">' + n + '</div><div class="zin"></div></div>'; }).join('') + actButtons() + '</div><div class="fbbox"></div></div>';
  }, init: function () {
    placement($('#ord'), { key: 'm4', single: true, okMsg: '¡Correcto! Así se garantiza que la selección sea transparente y replicable.', items: [
      { t: 'Inclusión', to: '4', fb: 'es la última fase.' }, { t: 'Identificación', to: '1', fb: 'primero se buscan los artículos.' },
      { t: 'Elegibilidad', to: '3', fb: 'se leen completos después del cribado.' }, { t: 'Cribado', to: '2', fb: 'se filtran por título y resumen tras identificarlos.' }] });
  } };

  var M5 = '<div class="act">⇄ Miniactividad del M5 · Relaciona columnas (6,25 puntos)</div><div id="rel"></div>';
  S[8] = { html: function () { return catScreen(8, 'Módulo 5', 'Técnicos de las explicaciones', '(1 de 2)'); } };
  S[9] = { html: function () { return catScreen(9, 'Módulo 5', 'Cognitivos y perceptivos', '(2 de 2)', M5); }, init: function () {
    relate($('#rel'), 'm5', [['Fidelidad', 'Refleja el comportamiento real del modelo'], ['Valores SHAP como métrica', 'Aporte numérico de cada variable'], ['Comprensibilidad percibida', 'El usuario entiende la explicación'], ['Conocimiento del dominio', 'Experiencia del usuario en el área'], ['Dependencia excesiva', 'Confianza mayor de la que el sistema merece']],
      ['Aporte numérico de cada variable', 'Confianza mayor de la que el sistema merece', 'El usuario entiende la explicación', 'Experiencia del usuario en el área', 'Refleja el comportamiento real del modelo']);
  } };
  S[10] = { html: function () { return catScreen(10, 'Módulo 6', 'Diseño del sistema XAI', '(1 de 2)'); } };
  S[11] = { html: function () { return catScreen(11, 'Módulo 6', 'Éticos y de gobernanza', '(2 de 2)', '<div class="act">◉ Miniactividad del M6 · ¿Qué indicador falla? (3 casos, 6,25 puntos)</div><div id="mc6"></div>'); }, init: function () {
    mcSeq($('#mc6'), 'm6', [
      { q: 'El gerente recibe la misma explicación técnica que el científico de datos y no la entiende.', opts: [{ t: 'Adecuación al rol', ok: 1, fb: 'Cada perfil necesita un nivel de explicación distinto (Behrens et al., 2026).' }, { t: 'Escalabilidad', ok: 0, fb: 'La escalabilidad trata de grandes volúmenes de datos; aquí falla la adecuación al rol.' }, { t: 'Madurez en IA', ok: 0, fb: 'No es un problema de la organización; la explicación no se ajusta al rol del usuario.' }] },
      { q: 'Un modelo preciso rechaza más créditos a mujeres que a hombres con el mismo perfil.', opts: [{ t: 'Fidelidad', ok: 0, fb: 'La explicación puede ser fiel y aun así el modelo ser sesgado: falla la equidad.' }, { t: 'Equidad algorítmica', ok: 1, fb: 'Un sistema sesgado pierde la confianza aunque sea preciso (Assiri, 2026).' }, { t: 'Co-diseño', ok: 0, fb: 'El co-diseño trata de la participación del usuario; aquí hay un sesgo discriminatorio.' }] },
      { q: 'Cuando el modelo se equivoca, nadie en la empresa sabe quién debe responder.', opts: [{ t: 'Satisfacción', ok: 0, fb: 'No se trata de la utilidad percibida, sino de la responsabilidad.' }, { t: 'Señales de seguridad', ok: 0, fb: 'Las señales de seguridad son certificaciones o validaciones; aquí falta un responsable.' }, { t: 'Rendición de cuentas', ok: 1, fb: 'Sin un responsable, la confianza no tiene a quién dirigirse (Cao et al., 2026).' }] }
    ]);
  } };
  S[12] = { html: function () { return catScreen(12, 'Módulo 7', 'Organizacionales y de adopción', '(1 de 2)'); } };
  S[13] = { html: function () {
    return catScreen(13, 'Módulo 7', 'Medición de la confianza', '(2 de 2)', '<div class="act">🗂 Miniactividad del M7 · Arrastra a su grupo (6,25 puntos)</div><div id="grp"><div style="display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:8px"><div class="pool"></div><div class="zone" data-target="org"><div class="zt">🏢 Organizacional</div><div class="zin"></div></div><div class="zone" data-target="med"><div class="zt">📏 Medición</div><div class="zin"></div></div></div><div class="row">' + actButtons() + '</div><div class="fbbox"></div></div>');
  }, init: function () {
    placement($('#grp'), { key: 'm7', items: [
      { t: 'Madurez en IA', to: 'org', fb: 'describe a la organización.' }, { t: 'LEAF', to: 'med', fb: 'es un instrumento de medición.' },
      { t: 'Factores culturales', to: 'org', fb: 'son barreras de la organización.' }, { t: 'Escalas Likert', to: 'med', fb: 'miden la confianza percibida.' },
      { t: 'Alineación sociotécnica', to: 'org', fb: 'trata del encaje con los procesos de la organización.' }, { t: 'Calibración conductual', to: 'med', fb: 'mide la conducta ante los errores.' }] });
  } };

  S[14] = { html: function () {
    return '<div class="kick">Módulo 8 · Pantalla 14</div><h1>Caso: decisión de crédito con IA explicable</h1>' +
      '<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:12px"><div class="card"><div class="act">Contexto (caso ficticio)</div><div class="p" style="font-size:12px"><b>Propósito:</b> aplicar los indicadores en una decisión de negocio. Laura es analista de crédito en una cooperativa financiera colombiana. El modelo (gradient boosting, 92% de precisión) recomienda <b style="color:var(--red)">RECHAZAR</b> el crédito de un emprendedor.</div><div style="font-size:10px;color:var(--muted);margin-top:4px">Caso inspirado en Dikmen y Burns (2022), Assiri (2026) y Humer et al. (2024).</div></div>' +
      '<div class="card"><div class="act">Explicación SHAP</div><div style="font-size:11.5px;line-height:1.6;font-family:Consolas,monospace">Historial de pagos <span style="color:var(--red)">▮▮</span> −<br>Ingresos variables <span style="color:var(--red)">▮▮</span> −<br>Antigüedad del negocio <span style="color:var(--red)">▮</span> −<br><b>Zona de residencia <span style="color:var(--red)">▮▮▮▮▮</span> −</b></div></div></div>' +
      '<div class="card" style="margin-top:10px"><div class="act">🧭 Miniactividad · Caso guiado en 3 pasos (6,25 puntos)</div><div id="caso"></div></div>';
  }, init: function () {
    mcSeq($('#caso'), 'm8', [
      { q: '¿Qué debería hacer Laura?', opts: [{ t: '(a) Rechazar: el modelo tiene 92% de precisión', ok: 0, fb: 'Eso es sobreconfianza: obedecer sin mirar la explicación.' }, { t: '(b) Aprobar por intuición', ok: 0, fb: 'Eso es subconfianza: ignorar el modelo sin evidencia.' }, { t: '(c) Revisar la explicación antes de decidir', ok: 1, fb: 'Confianza calibrada: usar el modelo y revisar su explicación.' }] },
      { q: 'La zona de residencia pesa mucho en el rechazo. ¿Qué indicador se activa?', opts: [{ t: '(a) Escalabilidad', ok: 0, fb: 'No es un problema de volumen de datos.' }, { t: '(b) Equidad algorítmica', ok: 1, fb: 'Puede ser un sesgo que discrimina por territorio (Assiri, 2026).' }, { t: '(c) Madurez en IA', ok: 0, fb: 'El problema está en el modelo, no en la madurez de la organización.' }] },
      { q: '¿Cómo sabría la cooperativa si sus analistas confían de forma adecuada?', opts: [{ t: '(a) Solo con una encuesta', ok: 0, fb: 'La encuesta mide lo que dicen, no lo que hacen.' }, { t: '(b) Observando sus decisiones cuando el modelo falla', ok: 1, fb: 'Es la calibración conductual (Naiseh et al., 2023).' }, { t: '(c) Con la precisión del modelo', ok: 0, fb: 'La precisión habla del modelo, no de la confianza de las personas.' }] }
    ], 'Laura usó tres indicadores: confianza calibrada, equidad algorítmica y calibración conductual.', { vertical: true, steps: true });
  } };

  var EVAL = [
    { m: 'M3', q: '¿Qué indicador mide si la confianza del usuario corresponde a la precisión real del sistema?', type: 'mc', opts: ['Escalabilidad del método XAI', 'Calibración de confianza', 'Madurez en IA', 'Co-diseño'], a: 1, fb: 'La calibración de confianza compara la confianza con lo que el modelo acierta (M3 y M5).' },
    { m: 'M5', q: 'Un sistema muestra explicaciones SHAP que no cambian aunque cambien los datos que supuestamente pesaron. ¿Qué indicador falla?', type: 'mc', opts: ['Fidelidad de las explicaciones', 'Satisfacción con las explicaciones', 'Señales de seguridad', 'Madurez en IA'], a: 0, fb: 'Si la explicación no refleja el comportamiento real del modelo, falla la fidelidad (Amparore et al., 2021).' },
    { m: 'M2', q: 'Que un modelo sea de aprendizaje supervisado garantiza que sea explicable.', type: 'vf', opts: ['Verdadero', 'Falso'], a: 1, fb: 'Falso: muchos modelos supervisados son cajas negras; la XAI es una capa adicional (M2).' },
    { m: 'M1 y M3', q: 'Que pocas personas digan confiar en la IA mientras muchas la usan sin verificar evidencia un problema de calibración de la confianza.', type: 'vf', opts: ['Verdadero', 'Falso'], a: 0, fb: 'Verdadero: no se confía, pero tampoco se verifica (Gillespie et al., 2025).' },
    { m: 'M7', q: '¿Cuál es la forma más exigente de medir la confianza?', type: 'mc', opts: ['Escalas de autorreporte', 'Calibración conductual', 'Precisión del modelo', 'Satisfacción con las explicaciones'], a: 1, fb: 'Observar cómo actúa el usuario cuando el modelo falla (Naiseh et al., 2023).' },
    { m: 'M6 y M8', q: 'En un modelo de crédito, la zona de residencia pesa mucho para negar solicitudes. ¿Qué indicador se activa?', type: 'mc', opts: ['Escalabilidad', 'Equidad algorítmica', 'Comprensibilidad percibida', 'Madurez en IA'], a: 1, fb: 'Posible sesgo territorial: equidad algorítmica (Assiri, 2026).' },
    { m: 'M4', q: 'En PRISMA, el cribado de títulos y resúmenes se hace después de la inclusión de los estudios.', type: 'vf', opts: ['Verdadero', 'Falso'], a: 1, fb: 'Falso: Identificación → Cribado → Elegibilidad → Inclusión (M4).' },
    { m: 'M5 a M7', q: 'Relaciona cada categoría con uno de sus indicadores.', type: 'rel', pairs: [['Técnicos', 'Fidelidad'], ['Cognitivos', 'Conocimiento del dominio'], ['Éticos y de gobernanza', 'Rendición de cuentas'], ['Organizacionales', 'Madurez en IA']], opts: ['Conocimiento del dominio', 'Fidelidad', 'Madurez en IA', 'Rendición de cuentas'], fb: 'Técnicos–Fidelidad · Cognitivos–Conocimiento del dominio · Éticos–Rendición de cuentas · Organizacionales–Madurez en IA.' }
  ];
  var evI = 0;
  S[15] = { html: function () {
    return '<div class="kick">Evaluación final · Pantalla 15</div><h1>Comprueba lo aprendido</h1><div class="p" style="font-size:12.5px;margin-bottom:8px">8 preguntas alineadas al REA · cada ítem 6,25 · miniactividades 50 + evaluación 50 = 100 puntos · se aprueba con 70.</div><div class="qnav" id="qnav" style="margin-bottom:8px"></div><div class="card" id="qbox"></div><div style="display:grid;grid-template-columns:1fr 1.4fr;gap:10px;margin-top:8px"><div class="card" id="resbox" style="font-size:12px"></div><div class="card" style="font-size:12px"><b>Sugerencias de repaso</b> por módulo<div id="repaso" style="margin:4px 0"></div><button class="btn" id="verres">Ver resultado</button> <button class="btn2" id="retry">Reintentar</button></div></div>';
  }, init: function () { evI = Math.min(Object.keys(state.ev).length, 7); renderQ(); renderRes(false);
    $('#verres').onclick = function () { renderRes(true); };
    $('#retry').onclick = function () { state.ev = {}; save(); evI = 0; renderQ(); renderRes(false); };
  } };
  function renderQ() {
    $('#qnav').innerHTML = EVAL.map(function (q, i) { var s = state.ev[i]; return '<span class="' + (i === evI ? 'cur ' : '') + (s === 1 ? 'ok' : s === 0 ? 'bad' : '') + '">' + (i + 1) + '</span>'; }).join('');
    var q = EVAL[evI], done = state.ev[evI] !== undefined, h = '<div class="act">Pregunta ' + (evI + 1) + ' de 8 · ' + (q.type === 'mc' ? 'Opción múltiple' : q.type === 'vf' ? 'Verdadero o falso' : 'Relacionar') + '</div><div style="font-size:14px;margin-bottom:8px">' + q.q + '</div>';
    if (q.type === 'rel') {
      h += '<div style="display:grid;grid-template-columns:1fr 1.4fr;gap:4px 8px;font-size:12px;align-items:center">' + q.pairs.map(function (p, i) { return '<b>' + p[0] + '</b><select data-i="' + i + '"' + (done ? ' disabled' : '') + '><option value="">— elige —</option>' + q.opts.map(function (o) { return '<option' + (done && o === p[1] ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>'; }).join('') + '</div>' + (done ? '' : '<button class="btn" id="relok" style="margin-top:6px">Responder</button>');
    } else {
      h += '<div style="display:flex;flex-direction:column;gap:5px">' + q.opts.map(function (o, i) { return '<button class="btn2" data-o="' + i + '"' + (done ? ' disabled' : '') + '>(' + 'abcd'[i] + ') ' + o + '</button>'; }).join('') + '</div>';
    }
    h += '<div id="qfb"></div><div class="row" style="margin-top:8px"><span class="right"><button class="btn2" id="qprev">← Anterior pregunta</button> <button class="btn" id="qnext">Siguiente pregunta →</button></span></div>';
    $('#qbox').innerHTML = h;
    function answer(ok) { state.ev[evI] = ok ? 1 : 0; save(); renderQ(); renderRes(false); }
    if (done) $('#qfb').innerHTML = '<div class="fb ' + (state.ev[evI] ? 'ok' : 'bad') + '">' + (state.ev[evI] ? '✔ Correcto. ' : '✘ Incorrecto. ') + q.fb + '</div>';
    $$('[data-o]', $('#qbox')).forEach(function (b) { if (done && +b.dataset.o === q.a) b.classList.add('ok'); b.onclick = function () { answer(+b.dataset.o === q.a); }; });
    if ($('#relok')) $('#relok').onclick = function () { var s = $$('select', $('#qbox')); if (s.some(function (x) { return !x.value; })) { $('#qfb').innerHTML = '<div class="fb info">Completa los 4 pares.</div>'; return; } answer(s.every(function (x, i) { return x.value === q.pairs[i][1]; })); };
    $('#qprev').disabled = evI === 0; $('#qnext').disabled = evI === 7;
    $('#qprev').onclick = function () { evI--; renderQ(); }; $('#qnext').onclick = function () { evI++; renderQ(); };
  }
  function renderRes(force) {
    var n = Object.keys(state.ev).length, ms = modulesScore(), es = evalScore(), t = total();
    var pend = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'].filter(function (k) { return state.act[k] === undefined; });
    var h = '<b>Resultado</b><br>Miniactividades: ' + fmt(ms) + ' / 50<br>Evaluación: ' + fmt(es) + ' / 50 (' + n + ' de 8 respondidas)<br><b style="font-size:15px">Total: ' + fmt(t) + ' / 100</b>';
    if (n === 8 || force) h += '<br>' + (t >= 70 ? '<span style="color:var(--green);font-weight:800">✔ Aprobado</span>' : '<span style="color:var(--red);font-weight:800">Aún no alcanzas 70: repasa y reintenta</span>');
    if (pend.length) h += '<div class="fb info">Miniactividades pendientes: ' + pend.map(function (k) { return k.toUpperCase(); }).join(', ') + '.</div>';
    $('#resbox').innerHTML = h;
    var rep = EVAL.filter(function (q, i) { return state.ev[i] === 0; }).map(function (q) { return q.m; });
    $('#repaso').textContent = rep.length ? 'Repasa: ' + rep.filter(function (v, i, a) { return a.indexOf(v) === i; }).join(' · ') : (n ? 'Vas muy bien: sin módulos por repasar.' : 'Responde las preguntas para ver sugerencias.');
  }

  S[16] = { html: function () {
    var items = ['¿La explicación es fiel al modelo?', '¿Se adapta a mi rol y la entiendo?', '¿Mi confianza está calibrada?', '¿El modelo es justo y transparente? ¿Hay un responsable?', '¿La organización está preparada (madurez, cultura)?', '¿Cómo mediremos la confianza?'];
    return '<div class="kick">Conclusión · Pantalla 16</div><h1>Antes de confiar en un modelo…</h1>' +
      '<div class="card hl" style="margin-bottom:10px"><div class="act">🎯 Cumplimiento del REA</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:11.5px"><div><b>Comprendiste</b> (verbo)</div><div><b>los 31 indicadores de confianza</b> en modelos supervisados explicables · M2–M7</div><div><b>a partir de casos</b> y ejemplos · M5–M8</div><div><b>para decisiones organizacionales</b> en América Latina · M1, M8</div></div><div style="font-size:11px;color:var(--muted);margin-top:4px">Lo evidencias con al menos 70 de 100 puntos. Tu puntaje actual: <b>' + fmt(total()) + '</b>.</div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1.15fr;gap:12px"><div class="card"><div class="act">Síntesis</div><div class="p" style="font-size:12.5px">La confianza en un modelo explicable no es un sí o un no: se calibra. Es el puente entre la IA y la decisión.</div><div class="act" style="margin-top:10px">Siguiente paso</div><div class="p" style="font-size:12px">Aplica la lista en tu próximo proyecto de ML.</div></div>' +
      '<div class="card"><div class="act">☑ Lista de verificación</div><div style="font-size:12.5px;line-height:1.8">' + items.map(function (t, i) { return '<label style="display:block"><input type="checkbox"> ' + t + '</label>'; }).join('') + '</div><a class="btn2" href="assets/docs/lista_verificacion.pdf" download target="_blank" rel="noopener" style="text-decoration:none">⬇ Descargar lista (PDF)</a></div></div>';
  } };

  S[17] = { full: true, html: function () {
    return '<div class="kick">Pantalla 17</div><h1>Referencias (APA 7)</h1><div class="card refs" style="column-count:2;column-gap:22px">' + D.refs.map(function (r) { return '<p>' + esc(r).replace(/(https?:\/\/[^\s]+?)(?=[.,]?(\s|$))/g, '<a href="$1" target="_blank" rel="noopener">$1</a>') + '</p>'; }).join('') + '</div>';
  } };
  S[18] = { full: true, html: function () {
    return '<div class="kick">Pantalla 18</div><h1>Créditos y licencia</h1><div style="display:grid;grid-template-columns:1.25fr 1fr;gap:14px"><div class="card"><div class="act">Metadatos</div>' + D.meta.map(function (m) { return '<p style="font-size:12.5px;margin-bottom:5px"><b>' + m[0] + ':</b> ' + esc(m[1] || '') + '</p>'; }).join('') + '</div>' +
      '<div><div class="card"><div class="act">Créditos de recursos (título, autor, fuente, licencia)</div><ul style="font-size:12px;line-height:1.5;padding-left:16px"><li>Avatar «Vera» e ilustraciones · Open Peeps · Pablo Stanley · <a href="https://www.openpeeps.com/" target="_blank" rel="noopener">openpeeps.com</a> (generado con react-peeps, MIT) · CC0</li><li>Voz «daniela» · modelo Piper (Hansen, 2023) entrenado con OpenSLR 61 (Guevara-Rukoz et al., 2020) · CC BY-SA 4.0</li><li>Diagrama PRISMA, íconos y diseño · autores · elaboración propia · CC BY-SA 4.0</li><li>Cifras del Módulo 1 · Gillespie et al. (2025) · Univ. de Melbourne y KPMG · citadas en APA</li></ul></div>' +
      '<div class="card" style="margin-top:10px;display:flex;gap:12px;align-items:center"><a href="https://creativecommons.org/licenses/by-sa/4.0/deed.es" target="_blank" rel="noopener"><img src="assets/img/cc-by-sa.png" alt="Licencia Creative Commons Atribución-CompartirIgual 4.0" width="88" height="31"></a><div style="font-size:12px">Esta obra está bajo una licencia <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.es" target="_blank" rel="noopener">Creative Commons Atribución-CompartirIgual 4.0 Internacional</a>. Voz sintética generada con IA (Piper TTS).</div></div></div></div>';
  } };

  /* ---------------- audio + avatar ---------------- */
  var audio = $('#audio'), raf = null, blinkT = 0;
  function setFace(f) { $('#veraRest').classList.toggle('hide', f !== 'rest'); $('#veraTalk').classList.toggle('hide', f !== 'talk'); $('#veraBlink').classList.toggle('hide', f !== 'blink'); }
  function tick() {
    var env = D.env[state.cur], now = Date.now();
    if (!audio.paused && env) { var v = +env.charAt(Math.floor(audio.currentTime * 20)) || 0; setFace(v >= 3 && (Math.floor(audio.currentTime * 8) % 2 === 0 || v >= 6) ? 'talk' : 'rest'); }
    else if (now - blinkT > 3800) { setFace('blink'); if (now - blinkT > 3950) { blinkT = now; setFace('rest'); } }
    raf = requestAnimationFrame(tick);
  }
  function playBtn() { $('#btnPlay').textContent = audio.paused ? '▶' : '⏸'; $('#btnPlay').setAttribute('aria-label', audio.paused ? 'Reproducir audio' : 'Pausar audio'); }
  audio.addEventListener('play', playBtn); audio.addEventListener('pause', playBtn); audio.addEventListener('ended', function () { playBtn(); setFace('rest'); });

  /* ---------------- navigation ---------------- */
  function go(n) {
    if (n < 1 || n > TOTAL) return;
    state.cur = n; if (state.visited.indexOf(n) < 0) state.visited.push(n);
    var sc = S[n], main = $('#main');
    main.innerHTML = sc.html(); main.classList.toggle('full', !!sc.full); $('#avatar').classList.toggle('hide', !!sc.full);
    main.scrollTop = 0;
    $$('[data-info]', main).forEach(function (b) { b.onclick = function () { var x = INFO[b.dataset.info]; modal(x[0], x[1]); }; });
    if (sc.init) sc.init();
    $('#prog').textContent = 'Pantalla ' + pad(n) + ' / ' + TOTAL + ' · ' + TITLES[n];
    $('#dots').innerHTML = Array.apply(null, Array(TOTAL)).map(function (x, i) { return '<i class="' + (i < n ? 'on' : '') + '"></i>'; }).join('');
    $('#btnPrev').disabled = n === 1; $('#btnNext').disabled = n === TOTAL;
    audio.pause();
    if (!sc.full) {
      audio.src = 'assets/audio/p' + pad(n) + '.mp3';
      $('#transcript').textContent = 'Transcripción · ' + D.scripts[n];
      if (userInteracted) { var p = audio.play(); if (p && p.catch) p.catch(function () {}); }
    }
    playBtn(); save(); main.focus({ preventScroll: true });
  }

  function fit() { var s = Math.min(window.innerWidth / 1280, window.innerHeight / 720); $('#stage').style.transform = 'scale(' + s + ')'; }

  document.addEventListener('DOMContentLoaded', function () {
    loadState(); fit(); window.addEventListener('resize', fit);
    document.addEventListener('click', function () { userInteracted = true; }, true);
    document.addEventListener('keydown', function (e) {
      userInteracted = true;
      if (e.key === 'Escape' && !$('#modal').classList.contains('hide')) { closeModal(); return; }
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (/INPUT|SELECT|TEXTAREA/.test(tag) || !$('#modal').classList.contains('hide')) return;
      if (e.key === 'ArrowRight') go(state.cur + 1); if (e.key === 'ArrowLeft') go(state.cur - 1);
    });
    $('#btnPrev').onclick = function () { go(state.cur - 1); }; $('#btnNext').onclick = function () { go(state.cur + 1); };
    $('#btnMenu').onclick = $('#btnMenu2').onclick = function () { go(3); };
    $('#btnHelp').onclick = function () { modal('Ayuda', HELP); };
    $('#modalClose').onclick = closeModal; $('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') closeModal(); });
    $('#btnPlay').onclick = function () { if (audio.paused) audio.play(); else audio.pause(); };
    $('#btnRestart').onclick = function () { audio.currentTime = 0; audio.play(); };
    $('#vol').oninput = function () { audio.volume = +this.value; }; audio.volume = 0.9;
    $('#btnCC').onclick = function () { var t = $('#transcript'), on = t.classList.toggle('hide'); this.setAttribute('aria-pressed', String(!on)); };
    window.ODC = { go: go };
    go(state.cur); tick();
    window.addEventListener('beforeunload', function () { save(); SCORM.finish(); });
    window.addEventListener('pagehide', function () { SCORM.finish(); });
  });
})();
