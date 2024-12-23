const menuToggle = document.getElementById("menu-toggle");
const menuClose = document.getElementById("menu-close");
const sideMenu = document.getElementById("side-menu");
const btnLogout = document.getElementById("btnLogout");

// Abrir el menú
menuToggle.addEventListener("click", () => {
  sideMenu.classList.remove("-translate-x-full");
});

// Cerrar el menú
menuClose.addEventListener("click", () => {
  sideMenu.classList.add("-translate-x-full");
});
