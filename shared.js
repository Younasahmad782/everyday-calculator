// Shared behaviour: theme toggle + mobile nav. Loaded on every page.
(function () {
  var root = document.documentElement;
  var stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") {
    root.setAttribute("data-theme", stored);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var themeBtn = document.getElementById("theme-toggle");
    function currentIsDark() {
      var attr = root.getAttribute("data-theme");
      if (attr) return attr === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    function updateLabel() {
      if (!themeBtn) return;
      themeBtn.textContent = currentIsDark() ? "Light mode" : "Dark mode";
    }
    updateLabel();
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        var next = currentIsDark() ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
        updateLabel();
      });
    }

    var navToggle = document.getElementById("nav-toggle");
    var siteNav = document.getElementById("site-nav");
    if (navToggle && siteNav) {
      navToggle.addEventListener("click", function () {
        var open = siteNav.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
  });
})();
