fetch("header.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("header").innerHTML = html;

    // ⚡ Dark Mode Logic (unchanged)
    window.toggleDarkMode = function () {
      const htmlEl = document.documentElement;
      const isDark = htmlEl.getAttribute("data-theme") === "dark";
      if (isDark) {
        htmlEl.removeAttribute("data-theme");
        try { localStorage.setItem("theme", "light"); } catch (e) {}
      } else {
        htmlEl.setAttribute("data-theme", "dark");
        try { localStorage.setItem("theme", "dark"); } catch (e) {}
      }
    };

    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch (e) {}

    // ⭐ Hamburger menu toggle
    window.toggleMenu = function () {
      const sidebar = document.getElementById("sbSidebar");
      const overlay = document.getElementById("sbOverlay");
      const btn = document.querySelector(".sb-menu-btn");

      sidebar.classList.toggle("open");
      overlay.classList.toggle("show");
      btn.classList.toggle("active");

      document.body.classList.toggle("sb-menu-open");
    };

    // ⚡ Sidebar open/close functions
    window.openSidebar = function () {
      document.getElementById("sbSidebar").classList.add("active");
    };
    window.closeSidebar = function () {
      document.getElementById("sbSidebar").classList.remove("active");
    };

    // ⚡ Dropdown toggle inside sidebar
    document.querySelectorAll(".sb-dropdown > span").forEach(drop => {
      drop.addEventListener("click", () => {
        drop.parentElement.classList.toggle("open");
      });
    });

  })
  .catch(err => console.error("Header load error:", err));
