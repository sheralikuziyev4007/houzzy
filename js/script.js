(function () {
  var header = document.getElementById("header");
  var burger = document.getElementById("burger-btn");

  if (!header || !burger) {
    return;
  }

  burger.addEventListener("click", function () {
    var isOpened = header.classList.toggle("header--open");
    burger.setAttribute("aria-expanded", isOpened ? "true" : "false");
    document.documentElement.classList.toggle("no-scroll", isOpened);
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 1023 && header.classList.contains("header--open")) {
      header.classList.remove("header--open");
      burger.setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("no-scroll");
    }
  });
})();

// ------------------------------------------------------------
// Попап для hotspot-точек (hero и interior).
// Один общий попап в конце body заполняется данными
// из data-атрибутов той кнопки, на которую кликнули.
// ------------------------------------------------------------
(function () {
  var popup = document.getElementById("hotspot-popup");
  var hotspots = document.querySelectorAll(".hotspot[data-hotspot-title]");

  if (!popup || !hotspots.length) {
    return;
  }

  var closeBtn = popup.querySelector(".hotspot-popup__close");
  var titleEl = popup.querySelector(".hotspot-popup__title");
  var priceEl = popup.querySelector(".hotspot-popup__price");
  var linkEl = popup.querySelector(".hotspot-popup__link");
  var activeButton = null;
  var closeTimer = null;
  var popupWidth = 220;

  function positionPopup(button) {
    var rect = button.getBoundingClientRect();
    var left = rect.left + rect.width / 2 - popupWidth / 2;
    var top = rect.bottom + 12;

    left = Math.max(12, Math.min(left, window.innerWidth - popupWidth - 12));

    if (top + 140 > window.innerHeight) {
      top = rect.top - 12;
      popup.classList.add("hotspot-popup--above");
    } else {
      popup.classList.remove("hotspot-popup--above");
    }

    popup.style.left = left + "px";
    popup.style.top = top + "px";
  }

  function openPopup(button) {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    titleEl.textContent = button.getAttribute("data-hotspot-title") || "";
    priceEl.textContent = button.getAttribute("data-hotspot-price") || "";
    linkEl.setAttribute("href", button.getAttribute("data-hotspot-link") || "#");

    popup.hidden = false;
    positionPopup(button);

    requestAnimationFrame(function () {
      popup.classList.add("is-open");
    });

    button.setAttribute("aria-expanded", "true");
    activeButton = button;
  }

  function closePopup(returnFocus) {
    if (!activeButton) {
      return;
    }

    popup.classList.remove("is-open");
    activeButton.setAttribute("aria-expanded", "false");

    var buttonToFocus = returnFocus ? activeButton : null;
    activeButton = null;

    closeTimer = setTimeout(function () {
      popup.hidden = true;
    }, 150);

    if (buttonToFocus) {
      buttonToFocus.focus();
    }
  }

  hotspots.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();

      if (activeButton === button) {
        closePopup(false);
        return;
      }

      openPopup(button);
    });
  });

  closeBtn.addEventListener("click", function () {
    closePopup(true);
  });

  document.addEventListener("click", function (event) {
    if (activeButton && !popup.contains(event.target) && event.target !== activeButton) {
      closePopup(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && activeButton) {
      closePopup(true);
    }
  });

  window.addEventListener(
    "scroll",
    function () {
      if (activeButton) {
        closePopup(false);
      }
    },
    true
  );

  window.addEventListener("resize", function () {
    if (activeButton) {
      closePopup(false);
    }
  });
})();

// ------------------------------------------------------------
// Доступная валидация формы консультации: ошибки связаны
// с полями через aria-describedby, статус — через aria-invalid,
// сообщение об ошибке озвучивается благодаря role="alert".
// ------------------------------------------------------------
(function () {
  var form = document.querySelector(".consult__form");

  if (!form) {
    return;
  }

  var nameInput = form.querySelector("#consult-name");
  var phoneInput = form.querySelector("#consult-phone");
  var phonePattern = /^[+]?[\d\s()-]{10,18}$/;

  function setFieldError(input, message) {
    var field = input.closest(".field");
    var error = document.getElementById(input.getAttribute("aria-describedby"));

    if (message) {
      field.classList.add("field--error");
      input.setAttribute("aria-invalid", "true");
      error.textContent = message;
      error.hidden = false;
    } else {
      field.classList.remove("field--error");
      input.setAttribute("aria-invalid", "false");
      error.textContent = "";
      error.hidden = true;
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var isNameValid = nameInput.value.trim().length > 1;
    var isPhoneValid = phonePattern.test(phoneInput.value.trim());

    setFieldError(nameInput, isNameValid ? "" : "Введите, пожалуйста, ваше имя");
    setFieldError(phoneInput, isPhoneValid ? "" : "Проверьте номер телефона");

    if (!isNameValid) {
      nameInput.focus();
      return;
    }

    if (!isPhoneValid) {
      phoneInput.focus();
      return;
    }

    form.reset();
  });
})();

// ------------------------------------------------------------
// Scroll-reveal: элементы с классом .reveal получают .is-visible,
// когда попадают в область видимости. Уважает prefers-reduced-motion —
// в этом случае просто сразу показывает всё без observer'а.
// ------------------------------------------------------------
(function () {
  var revealItems = document.querySelectorAll(".reveal");

  if (!revealItems.length) {
    return;
  }

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach(function (item) {
    observer.observe(item);
  });
})();

// ------------------------------------------------------------
// Переключение светлой/тёмной темы. Приоритет:
// 1) выбор, сохранённый пользователем ранее (localStorage)
// 2) системная настройка prefers-color-scheme
// 3) светлая тема по умолчанию
// ------------------------------------------------------------
(function () {
  var STORAGE_KEY = "houzzy-theme";
  var toggle = document.getElementById("theme-toggle");
  var root = document.documentElement;

  if (!toggle) {
    return;
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      toggle.setAttribute("aria-pressed", "true");
      toggle.setAttribute("aria-label", "Включить светлую тему");
    } else {
      root.removeAttribute("data-theme");
      toggle.setAttribute("aria-pressed", "false");
      toggle.setAttribute("aria-label", "Включить тёмную тему");
    }
  }

  var stored = null;

  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    stored = null;
  }

  if (stored === "dark" || stored === "light") {
    applyTheme(stored);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }

  toggle.addEventListener("click", function () {
    var isDark = root.getAttribute("data-theme") === "dark";
    var nextTheme = isDark ? "light" : "dark";

    applyTheme(nextTheme);

    try {
      localStorage.setItem(STORAGE_KEY, nextTheme);
    } catch (error) {
      // localStorage недоступен (приватный режим и т.п.) — тема
      // всё равно применится, просто не сохранится между визитами
    }
  });
})();
