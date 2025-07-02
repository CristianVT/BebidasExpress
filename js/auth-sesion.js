// ===== GESTIÓN DE SESIÓN Y AUTENTICACIÓN =====

// Función para verificar si el usuario está logueado
function isUserLoggedIn() {
  const sessionUser = sessionStorage.getItem("bebidasExpressCurrentUser")
  const localUser = localStorage.getItem("bebidasExpressCurrentUser")
  return sessionUser || localUser
}

// Función para obtener datos del usuario actual
function getCurrentUser() {
  const sessionUser = sessionStorage.getItem("bebidasExpressCurrentUser")
  const localUser = localStorage.getItem("bebidasExpressCurrentUser")

  if (sessionUser) {
    return JSON.parse(sessionUser)
  } else if (localUser) {
    return JSON.parse(localUser)
  }
  return null
}

// Función para cerrar sesión
function logout() {
  // Mostrar confirmación
  if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
    // Limpiar datos de sesión
    sessionStorage.removeItem("bebidasExpressCurrentUser")
    localStorage.removeItem("bebidasExpressCurrentUser")

    // Mostrar mensaje de despedida
    alert("Has cerrado sesión correctamente. ¡Hasta pronto!")

    // Redireccionar al inicio
    window.location.href = "index.html"
  }
}

// Función para actualizar el header según el estado de login
function updateHeaderForUser() {
  const user = getCurrentUser()
  const userIcon = document.querySelector(".user-icon")

  if (userIcon) {
    // Reemplazar el icono simple con el dropdown
    const userDropdown = document.createElement("div")
    userDropdown.className = "user-dropdown-container"

    if (user) {
      // Usuario logueado - mostrar nombre y opciones de usuario
      userDropdown.innerHTML = `
        <a href="#" class="user-dropdown-toggle" aria-label="Menú de usuario">
          <i class="fas fa-user-circle"></i>
          <span class="user-name">${user.nombre}</span>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </a>
        <div class="user-dropdown-menu">
          <a href="perfil.html" class="dropdown-item">
            <i class="fas fa-user"></i>
            Mi Perfil
          </a>
          <a href="pedidos.html" class="dropdown-item">
            <i class="fas fa-shopping-bag"></i>
            Mis Pedidos
          </a>
          <div class="dropdown-divider"></div>
          <a href="#" class="dropdown-item logout-btn" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </a>
        </div>
      `
    } else {
      // Usuario no logueado - mostrar opciones de autenticación
      userDropdown.innerHTML = `
        <a href="#" class="user-dropdown-toggle" aria-label="Opciones de cuenta">
          <i class="fas fa-user"></i>
          <span class="auth-text">Cuenta</span>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </a>
        <div class="user-dropdown-menu">
          <a href="login.html" class="dropdown-item">
            <i class="fas fa-sign-in-alt"></i>
            Iniciar Sesión
          </a>
          <a href="registrar.html" class="dropdown-item">
            <i class="fas fa-user-plus"></i>
            Registrarse
          </a>
        </div>
      `
    }

    // Reemplazar el elemento existente
    userIcon.parentElement.replaceChild(userDropdown, userIcon)

    // Agregar funcionalidad al dropdown
    const dropdownToggle = userDropdown.querySelector(".user-dropdown-toggle")
    const dropdownMenu = userDropdown.querySelector(".user-dropdown-menu")

    dropdownToggle.addEventListener("click", (e) => {
      e.preventDefault()
      dropdownMenu.classList.toggle("show")
      dropdownToggle.classList.toggle("active")
    })

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (!userDropdown.contains(e.target)) {
        dropdownMenu.classList.remove("show")
        dropdownToggle.classList.remove("active")
      }
    })
  }
}

// Función para proteger páginas que requieren autenticación
function requireAuth() {
  if (!isUserLoggedIn()) {
    alert("Debes iniciar sesión para acceder a esta página")
    window.location.href = "login.html"
    return false
  }
  return true
}

// Función para redireccionar usuarios ya logueados
function redirectIfLoggedIn() {
  if (isUserLoggedIn()) {
    window.location.href = "index.html"
  }
}

// Inicializar cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  // Actualizar header en todas las páginas
  updateHeaderForUser()

  // Verificar si estamos en páginas de auth y el usuario ya está logueado
  const currentPage = window.location.pathname.split("/").pop()
  if (currentPage === "login.html" || currentPage === "registrar.html") {
    redirectIfLoggedIn()
  }
})

// Función para mostrar mensaje de bienvenida (opcional)
function showWelcomeMessage() {
  const user = getCurrentUser()
  if (user) {
    const welcomeDiv = document.createElement("div")
    welcomeDiv.className = "welcome-message"
    welcomeDiv.innerHTML = `
      <div class="welcome-content">
        <i class="fas fa-user-check"></i>
        <span>¡Bienvenido, ${user.nombre}!</span>
        <button class="close-welcome" onclick="this.parentElement.parentElement.remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `

    // Insertar al inicio del body
    document.body.insertBefore(welcomeDiv, document.body.firstChild)

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      if (welcomeDiv.parentElement) {
        welcomeDiv.remove()
      }
    }, 5000)
  }
}

// Exportar funciones para uso global
window.logout = logout
window.isUserLoggedIn = isUserLoggedIn
window.getCurrentUser = getCurrentUser
window.requireAuth = requireAuth
window.showWelcomeMessage = showWelcomeMessage
