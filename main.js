/* Поведение страницы: логируем открытие и нажатия на кнопки связи. */
(function () {
  "use strict";
  var L = window.Logger;
  L.info("Страница открыта", "init", { path: location.pathname, width: window.innerWidth });

  document.querySelectorAll("[data-track]").forEach(function (el) {
    el.addEventListener("click", function () {
      L.info("Нажатие на кнопку", "trackClick", { name: el.getAttribute("data-track") });
    });
  });

  // Если фото фона не загрузилось - логируем, сайт остаётся рабочим (цвет фона запасной)
  ["img/2.jpg", "img/3.jpg", "img/4.jpg", "img/5.jpg", "img/6.jpg"].forEach(function (src) {
    var probe = new Image();
    probe.onerror = function () { L.warn("Фото не загрузилось", "preloadBackground", { src: src }); };
    probe.src = src;
  });
})();
