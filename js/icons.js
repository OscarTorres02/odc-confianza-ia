/* Íconos de línea propios (elaboración de los autores, CC BY-SA 4.0). Sin texto. */
(function () {
  var I = {
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    fork: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M6 13c0-3 4-3 6-3h4"/>',
    bars: '<path d="M4 20h16"/><rect x="5" y="12" width="3" height="8"/><rect x="10.5" y="7" width="3" height="13"/><rect x="16" y="10" width="3" height="10"/>',
    cog: '<circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="9" y="9" width="6" height="6"/>',
    gauge: '<path d="M4 16a8 8 0 0 1 16 0"/><path d="M12 16l4-5"/><circle cx="12" cy="16" r="1.3" fill="currentColor"/><path d="M6.5 11.5l1 1M17.5 11.5l-1 1M12 8.5v1.4"/>',
    book: '<path d="M4 5c3-1 5-1 8 1v13c-3-2-5-2-8-1zM20 5c-3-1-5-1-8 1v13c3-2 5-2 8-1z"/>',
    bulb: '<path d="M9 17h6M10 20h4"/><path d="M8.5 14C7 12.8 6 11 6 9a6 6 0 0 1 12 0c0 2-1 3.8-2.5 5z"/>',
    chain: '<rect x="3" y="9" width="9" height="6" rx="3"/><rect x="12" y="9" width="9" height="6" rx="3"/>',
    lens: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="M15 15l5 5"/><path d="M8.5 10.5h4"/>',
    person: '<circle cx="12" cy="7.5" r="3.2"/><path d="M5.5 20c.8-4 3.3-6 6.5-6s5.7 2 6.5 6"/>',
    people: '<circle cx="8" cy="8" r="2.6"/><circle cx="16.5" cy="9" r="2.3"/><path d="M3 19c.6-3.3 2.4-5 5-5s4.4 1.7 5 5M13.5 14.6c.9-.4 1.8-.6 3-.6 2.2 0 3.8 1.5 4.5 4.6"/>',
    alert: '<path d="M12 3.5l9 16H3z"/><path d="M12 10v4.5"/><circle cx="12" cy="17" r=".9" fill="currentColor"/>',
    clip: '<rect x="5" y="4.5" width="14" height="16" rx="2"/><path d="M9 4.5h6v3H9zM8.5 11.5h7M8.5 15h5"/>',
    star: '<path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.7 6.9 19.4l1-5.6-4.1-4 5.7-.8z"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    scale: '<path d="M12 4v16M7 20h10M5 7h14"/><path d="M5 7l-2.5 6a2.5 2.5 0 0 0 5 0zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0z"/>',
    flag: '<path d="M6 21V4M6 4.5h11l-2.5 4 2.5 4H6"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z"/><path d="M8.7 12.2l2.3 2.3 4.4-4.6"/>',
    heart: '<path d="M12 20s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/>',
    hub: '<circle cx="12" cy="12" r="2.6"/><circle cx="4.5" cy="6" r="1.8"/><circle cx="19.5" cy="6" r="1.8"/><circle cx="12" cy="20.5" r="1.8"/><path d="M6 7.2l4 3M18 7.2l-4 3M12 14.6v4.1"/>',
    puzzle: '<path d="M4 4h6v2.2a1.8 1.8 0 1 0 3.6 0V4H20v6h-2.2a1.8 1.8 0 1 0 0 3.6H20V20h-6v-2.2a1.8 1.8 0 1 0-3.6 0V20H4z"/>',
    stairs: '<path d="M3 20h5v-4.5h4.5V11H17V6.5h4"/><path d="M3 20h18"/>',
    up: '<circle cx="12" cy="12" r="8.5"/><path d="M12 16.5v-9M8.3 11l3.7-3.7 3.7 3.7"/>',
    leaf: '<path d="M5 19C5 10 10 5 19.5 4.5 19 14 14 19 5 19z"/><path d="M5 19l8.5-8.5"/>',
    layers: '<path d="M12 4l9 4.5-9 4.5-9-4.5z"/><path d="M3 13l9 4.5 9-4.5"/><path d="M3 17l9 4.5 9-4.5" opacity=".55"/>',
    net: '<circle cx="5" cy="6" r="1.7"/><circle cx="5" cy="18" r="1.7"/><circle cx="12" cy="9" r="1.7"/><circle cx="12" cy="15" r="1.7"/><circle cx="19" cy="12" r="1.7"/><path d="M6.6 6.6l3.8 1.8M6.6 6.9l3.9 7.2M6.6 17.1l3.9-7.2M6.6 17.4l3.8-1.8M13.6 9.6l3.8 1.8M13.6 14.4l3.8-1.8"/>',
    likert: '<circle cx="4.5" cy="12" r="1.8"/><circle cx="9.5" cy="12" r="1.8"/><circle cx="14.5" cy="12" r="2.6" fill="currentColor"/><circle cx="19.5" cy="12" r="1.8"/><path d="M4 18h16" opacity=".5"/>'
  };
  var MAP = {
    'Fidelidad de las explicaciones': 'target', 'Tipo de explicación': 'fork', 'Métricas cuantificadas de explicabilidad': 'bars', 'Método XAI empleado': 'cog', 'Escalabilidad del método XAI': 'expand',
    'Calibración de confianza': 'gauge', 'Conocimiento del dominio': 'book', 'Comprensibilidad percibida': 'bulb', 'Dependencia excesiva': 'chain', 'Escepticismo calibrado': 'lens',
    'Adecuación al rol del usuario': 'person', 'Participación del usuario (co-diseño)': 'people', 'Honestidad sobre sus limitaciones': 'alert', 'Elicitación de requisitos XAI': 'clip', 'Satisfacción con las explicaciones': 'star',
    'Transparencia algorítmica': 'eye', 'Equidad algorítmica': 'scale', 'Rendición de cuentas': 'flag', 'Señales de seguridad': 'shield', 'Ética en IA': 'heart',
    'Confianza como factor mediador': 'hub', 'Factores culturales y organizacionales': 'people', 'Alineación sociotécnica': 'puzzle', 'Madurez en IA': 'stairs', 'Explicabilidad como factor de adopción': 'up',
    'Framework LEAF': 'leaf', 'Valores SHAP como métrica': 'bars', 'Framework multidimensional': 'layers', 'Modelado SEM-ANN': 'net', 'Escalas de autorreporte': 'likert', 'Calibración conductual': 'gauge'
  };
  window.ODC_ICON = function (name, cls) {
    var k = I[name] ? name : (I[MAP[name]] ? MAP[name] : 'target');
    return '<svg class="' + (cls || 'ico') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + I[k] + '</svg>';
  };
})();
