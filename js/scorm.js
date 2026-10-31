/* SCORM 1.2 wrapper. Works standalone (GitHub Pages) when no LMS API is found. */
(function () {
  var api = null, active = false;
  function findAPI(win) {
    var tries = 0;
    while (win && !win.API && win.parent && win.parent !== win && tries < 10) { win = win.parent; tries++; }
    return win && win.API ? win.API : null;
  }
  function locate() {
    var a = findAPI(window);
    if (!a && window.opener) a = findAPI(window.opener);
    return a;
  }
  var SCORM = {
    init: function () {
      try {
        api = locate();
        if (api && String(api.LMSInitialize('')) === 'true') {
          active = true;
          var st = this.get('cmi.core.lesson_status');
          if (!st || st === 'not attempted') this.set('cmi.core.lesson_status', 'incomplete');
          this.set('cmi.core.score.min', '0');
          this.set('cmi.core.score.max', '100');
          this.commit();
        }
      } catch (e) { active = false; }
      return active;
    },
    isActive: function () { return active; },
    get: function (k) { try { return active ? String(api.LMSGetValue(k)) : ''; } catch (e) { return ''; } },
    set: function (k, v) { try { if (active) api.LMSSetValue(k, String(v)); } catch (e) {} },
    commit: function () { try { if (active) api.LMSCommit(''); } catch (e) {} },
    finish: function () { try { if (active) { api.LMSCommit(''); api.LMSFinish(''); active = false; } } catch (e) {} }
  };
  window.SCORM = SCORM;
})();
