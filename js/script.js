// ------------------------------------------------------------
// 1. Mobile burger menu
// ------------------------------------------------------------
(() => {
  const header = document.getElementById("header");
  const burger = document.getElementById("burger-btn");

  if (!header || !burger) return;

  burger.addEventListener("click", () => {
    const isOpened = header.classList.toggle("header--open");
    burger.setAttribute("aria-expanded", isOpened);
    document.documentElement.classList.toggle("no-scroll", isOpened);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1023 && header.classList.contains("header--open")) {
      header.classList.remove("header--open");
      burger.setAttribute("aria-expanded", "false");
      document.documentElement.classList.remove("no-scroll");
    }
  });
})();

// ------------------------------------------------------------
// 2. Hotspot popup
// ------------------------------------------------------------
(() => {
  const popup = document.getElementById("hotspot-popup");
  const hotspots = document.querySelectorAll(".hotspot[data-hotspot-title]");

  if (!popup || !hotspots.length) return;

  const closeBtn = popup.querySelector(".hotspot-popup__close");
  const titleEl = popup.querySelector(".hotspot-popup__title");
  const priceEl = popup.querySelector(".hotspot-popup__price");
  const linkEl = popup.querySelector(".hotspot-popup__link");

  let activeButton = null;
  let closeTimer = null;
  const popupWidth = 220;

  const positionPopup = (button) => {
    const rect = button.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - popupWidth / 2;
    let top = rect.bottom + 12;

    left = Math.max(12, Math.min(left, window.innerWidth - popupWidth - 12));

    const popupHeight = popup.offsetHeight || 140;

    if (top + popupHeight > window.innerHeight) {
      top = rect.top - popupHeight - 12;
      popup.classList.add("hotspot-popup--above");
    } else {
      popup.classList.remove("hotspot-popup--above");
    }

    popup.style.left = `${left}px`;
    popup.style.top = `${top}px`;
  };

  const openPopup = (button) => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    titleEl.textContent = button.getAttribute("data-hotspot-title") || "";
    priceEl.textContent = button.getAttribute("data-hotspot-price") || "";

    // XSS xavfsizligi tekshiruvi
    const rawLink = button.getAttribute("data-hotspot-link") || "#";
    const safeLink = /^(https?:\/\/|\/|#)/i.test(rawLink) ? rawLink : "#";
    linkEl.setAttribute("href", safeLink);

    popup.hidden = false;
    positionPopup(button);

    requestAnimationFrame(() => {
      popup.classList.add("is-open");
    });

    button.setAttribute("aria-expanded", "true");
    activeButton = button;
  };

  const closePopup = (returnFocus = false) => {
    if (!activeButton) return;

    popup.classList.remove("is-open");
    activeButton.setAttribute("aria-expanded", "false");

    const buttonToFocus = returnFocus ? activeButton : null;
    activeButton = null;

    closeTimer = setTimeout(() => {
      popup.hidden = true;
    }, 150);

    buttonToFocus?.focus();
  };

  hotspots.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      if (activeButton === button) {
        closePopup(false);
        return;
      }

      openPopup(button);
    });
  });

  closeBtn?.addEventListener("click", () => closePopup(true));

  document.addEventListener("click", (event) => {
    if (activeButton && !popup.contains(event.target) && event.target !== activeButton) {
      closePopup(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeButton) {
      closePopup(true);
    }
  });

  window.addEventListener(
    "scroll",
    (event) => {
      if (activeButton && (event.target === document || event.target === window)) {
        closePopup(false);
      }
    },
    true
  );

  window.addEventListener("resize", () => {
    if (activeButton) {
      closePopup(false);
    }
  });
})();

// ------------------------------------------------------------
// 3. Form validation
// ------------------------------------------------------------
(() => {
  const form = document.querySelector(".consult__form");
  if (!form) return;

  const nameInput = form.querySelector("#consult-name");
  const phoneInput = form.querySelector("#consult-phone");
  const phonePattern = /^[+]?[\d\s()-]{10,18}$/;

  const setFieldError = (input, message) => {
    if (!input) return;

    const field = input.closest(".field");
    const ariaDescribedBy = input.getAttribute("aria-describedby");
    const error = ariaDescribedBy ? document.getElementById(ariaDescribedBy) : null;

    if (message) {
      field?.classList.add("field--error");
      input.setAttribute("aria-invalid", "true");
      if (error) {
        error.textContent = message;
        error.hidden = false;
      }
    } else {
      field?.classList.remove("field--error");
      input.setAttribute("aria-invalid", "false");
      if (error) {
        error.textContent = "";
        error.hidden = true;
      }
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isNameValid = nameInput.value.trim().length > 1;
    const isPhoneValid = phonePattern.test(phoneInput.value.trim());

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