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
