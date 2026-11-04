/* Логгер: уровни debug/info/warn/error, JSON-формат, маскирование персональных данных.
   Сейчас пишет в консоль браузера. Чтобы отправлять во внешнюю систему (Sentry, ELK),
   достаточно добавить функцию в Logger.sinks. */
(function () {
  var LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
  var minLevel = "debug";
  var requestId = "req_" + Math.random().toString(16).slice(2, 8);

  // Прячем телефоны и email в данных лога
  function mask(value) {
    if (typeof value !== "string") return value;
    return value
      .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, function (m) { return m[0] + "***@***"; })
      .replace(/\+?\d[\d\s().-]{8,}\d/g, function (m) { return m.slice(0, 3) + "*******"; });
  }
  function maskParams(params) {
    var out = {};
    Object.keys(params || {}).forEach(function (k) { out[k] = mask(params[k]); });
    return out;
  }
  function serializeError(err) {
    if (!err) return undefined;
    return { name: err.name, message: err.message, stack: err.stack };
  }

  var Logger = {
    sinks: [function (record) {
      var fn = record.level === "error" ? "error" : record.level === "warn" ? "warn" : "log";
      console[fn](JSON.stringify(record));
    }],
    log: function (level, message, fnName, params, err) {
      if (LEVELS[level] < LEVELS[minLevel]) return;
      var record = {
        timestamp: new Date().toISOString(),
        level: level,
        message: message,
        requestId: requestId,
        function: fnName || "-",
        params: maskParams(params),
        error: serializeError(err)
      };
      Logger.sinks.forEach(function (sink) {
        try { sink(record); } catch (e) { /* логгер не должен ронять сайт */ }
      });
    },
    debug: function (m, f, p) { Logger.log("debug", m, f, p); },
    info: function (m, f, p) { Logger.log("info", m, f, p); },
    warn: function (m, f, p) { Logger.log("warn", m, f, p); },
    error: function (m, f, p, e) { Logger.log("error", m, f, p, e); }
  };

  window.Logger = Logger;
  window.addEventListener("error", function (ev) {
    Logger.error("Необработанная ошибка", "window.onerror", { file: ev.filename, line: ev.lineno }, ev.error);
  });
  window.addEventListener("unhandledrejection", function (ev) {
    Logger.error("Необработанный promise", "unhandledrejection", {}, ev.reason instanceof Error ? ev.reason : new Error(String(ev.reason)));
  });
})();
