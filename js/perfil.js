// ===== GESTIÓN DE PERFIL DE USUARIO =====

document.addEventListener("DOMContentLoaded", () => {
  // Verificar autenticación
  if (window.requireAuth && !window.requireAuth()) {
    return
  }

  // Variables globales
  const currentUser = window.getCurrentUser ? window.getCurrentUser() : null
  let originalData = {}

  // Elementos del DOM
  const navItems = document.querySelectorAll(".nav-item")
  const contentSections = document.querySelectorAll(".content-section")
  const forms = document.querySelectorAll(".perfil-form")
  const modal = document.getElementById("confirm-modal")
  const closeModal = document.getElementById("close-confirm-modal")
  const cancelAction = document.getElementById("cancel-action")
  const confirmAction = document.getElementById("confirm-action")

  // Inicializar
  init()

  // Función de inicialización
  function init() {
    if (!currentUser) {
      showNotification("Error: No se pudo cargar la información del usuario", "error")
      return
    }

    loadUserData()
    setupNavigation()
    setupForms()
    setupPasswordToggle()
    setupAvatarUpload()
    setupRangeInput()
    loadUserStats()
    loadUserSessions()
    setupDangerZone()
  }

  // Cargar datos del usuario
  function loadUserData() {
    // Cargar datos básicos
    document.getElementById("nombre").value = currentUser.nombre || ""
    document.getElementById("email").value = currentUser.email || ""

    // Cargar datos adicionales del localStorage
    const userProfile = getUserProfile()
    if (userProfile) {
      // Información personal
      document.getElementById("telefono").value = userProfile.telefono || ""
      document.getElementById("fecha-nacimiento").value = userProfile.fechaNacimiento || ""
      document.getElementById("direccion").value = userProfile.direccion || ""
      document.getElementById("ciudad").value = userProfile.ciudad || ""
      document.getElementById("codigo-postal").value = userProfile.codigoPostal || ""

      // Preferencias
      if (userProfile.categorias) {
        userProfile.categorias.forEach((categoria) => {
          const checkbox = document.querySelector(`input[name="categorias"][value="${categoria}"]`)
          if (checkbox) checkbox.checked = true
        })
      }

      if (userProfile.precioMaximo) {
        document.getElementById("precio-maximo").value = userProfile.precioMaximo
        document.getElementById("precio-value").textContent = userProfile.precioMaximo
      }

      if (userProfile.horarioPreferido) {
        document.getElementById("horario-preferido").value = userProfile.horarioPreferido
      }

      if (userProfile.entregaRapida) {
        document.getElementById("entrega-rapida").checked = userProfile.entregaRapida
      }

      // Notificaciones
      if (userProfile.notificaciones) {
        Object.keys(userProfile.notificaciones).forEach((key) => {
          const input = document.querySelector(`input[name="${key}"]`)
          if (input) input.checked = userProfile.notificaciones[key]
        })
      }
    }

    // Guardar datos originales para comparación
    originalData = { ...userProfile }
  }

  // Obtener perfil del usuario
  function getUserProfile() {
    return JSON.parse(localStorage.getItem(`perfil_${currentUser.email}`)) || {}
  }

  // Guardar perfil del usuario
  function saveUserProfile(data) {
    const currentProfile = getUserProfile()
    const updatedProfile = { ...currentProfile, ...data }
    localStorage.setItem(`perfil_${currentUser.email}`, JSON.stringify(updatedProfile))
  }

  // Configurar navegación
  function setupNavigation() {
    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        const section = item.getAttribute("data-section")
        showSection(section)

        // Actualizar navegación activa
        navItems.forEach((nav) => nav.classList.remove("active"))
        item.classList.add("active")
      })
    })
  }

  // Mostrar sección
  function showSection(sectionId) {
    contentSections.forEach((section) => {
      section.classList.remove("active")
    })

    const targetSection = document.getElementById(sectionId)
    if (targetSection) {
      targetSection.classList.add("active")
    }
  }

  // Configurar formularios
  function setupForms() {
    // Formulario de información personal
    const infoForm = document.getElementById("info-form")
    infoForm.addEventListener("submit", handleInfoSubmit)

    // Formulario de contraseña
    const passwordForm = document.getElementById("password-form")
    passwordForm.addEventListener("submit", handlePasswordSubmit)

    // Formulario de preferencias
    const preferencesForm = document.getElementById("preferences-form")
    preferencesForm.addEventListener("submit", handlePreferencesSubmit)

    // Formulario de notificaciones
    const notificationsForm = document.getElementById("notifications-form")
    notificationsForm.addEventListener("submit", handleNotificationsSubmit)

    // Botones de cancelar
    document.getElementById("cancel-info").addEventListener("click", () => {
      loadUserData()
      showNotification("Cambios cancelados", "info")
    })
  }

  // Manejar envío de información personal
  async function handleInfoSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    // Validaciones
    if (!validatePersonalInfo(data)) return

    // Mostrar loading
    showFormLoading("save-info", true)

    try {
      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Guardar datos
      saveUserProfile(data)

      // Actualizar usuario actual si es necesario
      if (data.nombre !== currentUser.nombre) {
        currentUser.nombre = data.nombre
        updateCurrentUser(currentUser)
      }

      showNotification("Información actualizada correctamente", "success")
    } catch (error) {
      showNotification("Error al actualizar la información", "error")
    } finally {
      showFormLoading("save-info", false)
    }
  }

  // Manejar cambio de contraseña
  async function handlePasswordSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData)

    // Validaciones
    if (!validatePasswordChange(data)) return

    // Mostrar loading
    showFormLoading("password-form", true)

    try {
      // Simular cambio de contraseña
      await new Promise((resolve) => setTimeout(resolve, 2000))

      showNotification("Contraseña cambiada correctamente", "success")
      e.target.reset()
    } catch (error) {
      showNotification("Error al cambiar la contraseña", "error")
    } finally {
      showFormLoading("password-form", false)
    }
  }

  // Manejar preferencias
  async function handlePreferencesSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.target)

    // Procesar categorías
    const categorias = formData.getAll("categorias")
    const precioMaximo = formData.get("precioMaximo")
    const horarioPreferido = formData.get("horarioPreferido")
    const entregaRapida = formData.has("entregaRapida")

    const preferences = {
      categorias,
      precioMaximo,
      horarioPreferido,
      entregaRapida,
    }

    // Mostrar loading
    showFormLoading("preferences-form", true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      saveUserProfile(preferences)
      showNotification("Preferencias guardadas correctamente", "success")
    } catch (error) {
      showNotification("Error al guardar las preferencias", "error")
    } finally {
      showFormLoading("preferences-form", false)
    }
  }

  // Manejar notificaciones
  async function handleNotificationsSubmit(e) {
    e.preventDefault()

    const formData = new FormData(e.target)
    const notificaciones = {}

    // Procesar todas las notificaciones
    const notificationInputs = e.target.querySelectorAll('input[type="checkbox"]')
    notificationInputs.forEach((input) => {
      notificaciones[input.name] = input.checked
    })

    // Mostrar loading
    showFormLoading("notifications-form", true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      saveUserProfile({ notificaciones })
      showNotification("Configuración de notificaciones guardada", "success")
    } catch (error) {
      showNotification("Error al guardar la configuración", "error")
    } finally {
      showFormLoading("notifications-form", false)
    }
  }

  // Validar información personal
  function validatePersonalInfo(data) {
    clearAllErrors()

    let isValid = true

    if (!data.nombre || data.nombre.trim().length < 2) {
      showError("nombre", "El nombre debe tener al menos 2 caracteres")
      isValid = false
    }

    if (data.telefono && !validatePhone(data.telefono)) {
      showError("telefono", "Formato de teléfono inválido")
      isValid = false
    }

    return isValid
  }

  // Validar cambio de contraseña
  function validatePasswordChange(data) {
    clearAllErrors()

    let isValid = true

    if (!data.currentPassword) {
      showError("currentPassword", "La contraseña actual es requerida")
      isValid = false
    }

    if (!data.newPassword) {
      showError("newPassword", "La nueva contraseña es requerida")
      isValid = false
    } else if (!checkPasswordStrength(data.newPassword)) {
      showError("newPassword", "La contraseña debe ser más fuerte")
      isValid = false
    }

    if (data.newPassword !== data.confirmPassword) {
      showError("confirmPassword", "Las contraseñas no coinciden")
      isValid = false
    }

    return isValid
  }

  // Configurar toggle de contraseña
  function setupPasswordToggle() {
    window.togglePasswordField = (fieldId) => {
      const field = document.getElementById(fieldId)
      const icon = document.getElementById(fieldId + "Icon")

      if (field.type === "password") {
        field.type = "text"
        icon.classList.remove("fa-eye")
        icon.classList.add("fa-eye-slash")
      } else {
        field.type = "password"
        icon.classList.remove("fa-eye-slash")
        icon.classList.add("fa-eye")
      }
    }

    // Validación de fuerza de contraseña
    const newPasswordField = document.getElementById("new-password")
    if (newPasswordField) {
      newPasswordField.addEventListener("input", function () {
        checkPasswordStrength(this.value, "newPasswordStrength")
      })
    }
  }

  // Configurar subida de avatar
  function setupAvatarUpload() {
    const changeAvatarBtn = document.getElementById("change-avatar-btn")
    const avatarInput = document.getElementById("avatar-input")
    const userAvatar = document.getElementById("user-avatar")

    changeAvatarBtn.addEventListener("click", () => {
      avatarInput.click()
    })

    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          showNotification("La imagen debe ser menor a 5MB", "error")
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const img = document.createElement("img")
          img.src = e.target.result
          img.alt = "Avatar del usuario"

          userAvatar.innerHTML = ""
          userAvatar.appendChild(img)

          // Guardar avatar en localStorage
          saveUserProfile({ avatar: e.target.result })
          showNotification("Avatar actualizado correctamente", "success")
        }
        reader.readAsDataURL(file)
      }
    })

    // Cargar avatar existente
    const userProfile = getUserProfile()
    if (userProfile.avatar) {
      const img = document.createElement("img")
      img.src = userProfile.avatar
      img.alt = "Avatar del usuario"
      userAvatar.innerHTML = ""
      userAvatar.appendChild(img)
    }
  }

  // Configurar input de rango
  function setupRangeInput() {
    const rangeInput = document.getElementById("precio-maximo")
    const rangeValue = document.getElementById("precio-value")

    rangeInput.addEventListener("input", () => {
      rangeValue.textContent = rangeInput.value
    })
  }

  // Cargar estadísticas del usuario
  function loadUserStats() {
    const pedidos = JSON.parse(localStorage.getItem(`pedidos_${currentUser.email}`)) || []

    // Total de pedidos
    document.getElementById("total-pedidos").textContent = pedidos.length

    // Total gastado
    const totalGastado = pedidos.reduce((sum, pedido) => sum + pedido.total, 0)
    document.getElementById("total-gastado").textContent = `S/ ${totalGastado.toFixed(2)}`

    // Producto favorito
    const productCounts = {}
    pedidos.forEach((pedido) => {
      pedido.items.forEach((item) => {
        productCounts[item.product] = (productCounts[item.product] || 0) + item.quantity
      })
    })

    const productoFavorito = Object.keys(productCounts).reduce(
      (a, b) => (productCounts[a] > productCounts[b] ? a : b),
      "-",
    )
    document.getElementById("producto-favorito").textContent = productoFavorito

    // Miembro desde
    const fechaRegistro = currentUser.fechaRegistro || new Date().toISOString()
    const fecha = new Date(fechaRegistro)
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    document.getElementById("miembro-desde").textContent = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`
  }

  // Cargar sesiones del usuario
  function loadUserSessions() {
    const sessionsList = document.getElementById("sessions-list")
    const sessions = [
      {
        device: "Chrome en Windows",
        location: "Santiago, Chile",
        lastActive: "Ahora",
        current: true,
      },
      {
        device: "Safari en iPhone",
        location: "Santiago, Chile",
        lastActive: "Hace 2 horas",
        current: false,
      },
    ]

    sessionsList.innerHTML = ""

    sessions.forEach((session, index) => {
      const sessionItem = document.createElement("div")
      sessionItem.className = `session-item ${session.current ? "session-current" : ""}`

      sessionItem.innerHTML = `
        <div class="session-info">
          <h4>${session.device}</h4>
          <p>${session.location} • ${session.lastActive}</p>
        </div>
        ${
          !session.current
            ? `<button class="btn-revoke" onclick="revokeSession(${index})">Cerrar sesión</button>`
            : '<span class="current-badge">Sesión actual</span>'
        }
      `

      sessionsList.appendChild(sessionItem)
    })
  }

  // Revocar sesión
  window.revokeSession = (sessionIndex) => {
    if (confirm("¿Estás seguro de que quieres cerrar esta sesión?")) {
      showNotification("Sesión cerrada correctamente", "success")
      loadUserSessions() // Recargar lista
    }
  }

  // Configurar zona de peligro
  function setupDangerZone() {
    const deleteAccountBtn = document.getElementById("delete-account-btn")
    deleteAccountBtn.addEventListener("click", () => {
      showConfirmModal(
        "Eliminar Cuenta",
        "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer y perderás todos tus datos.",
        () => {
          // Simular eliminación de cuenta
          alert("Funcionalidad de eliminación de cuenta no implementada en la demo")
        },
      )
    })
  }

  // Mostrar modal de confirmación
  function showConfirmModal(title, message, onConfirm) {
    document.getElementById("modal-title").textContent = title
    document.getElementById("modal-message").textContent = message

    modal.style.display = "block"

    const confirmBtn = document.getElementById("confirm-action")
    confirmBtn.onclick = () => {
      modal.style.display = "none"
      onConfirm()
    }
  }

  // Cerrar modal
  closeModal.addEventListener("click", () => {
    modal.style.display = "none"
  })

  cancelAction.addEventListener("click", () => {
    modal.style.display = "none"
  })

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none"
    }
  })

  // Funciones de utilidad
  function showFormLoading(formId, show) {
    const form = document.getElementById(formId)
    const btnText = form.querySelector(".btn-text")
    const btnLoading = form.querySelector(".btn-loading")
    const submitBtn = form.querySelector('button[type="submit"]')

    if (btnText && btnLoading && submitBtn) {
      if (show) {
        btnText.style.display = "none"
        btnLoading.style.display = "inline-flex"
        submitBtn.disabled = true
      } else {
        btnText.style.display = "inline"
        btnLoading.style.display = "none"
        submitBtn.disabled = false
      }
    }
  }

  function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + "Error")
    const field = document.getElementById(fieldId)

    if (errorElement && field) {
      errorElement.textContent = message
      errorElement.style.display = "block"
      field.classList.add("error")
    }
  }

  function clearError(fieldId) {
    const errorElement = document.getElementById(fieldId + "Error")
    const field = document.getElementById(fieldId)

    if (errorElement && field) {
      errorElement.textContent = ""
      errorElement.style.display = "none"
      field.classList.remove("error")
    }
  }

  function clearAllErrors() {
    const errorElements = document.querySelectorAll(".error-message")
    const fields = document.querySelectorAll(".form-group input, .form-group select, .form-group textarea")

    errorElements.forEach((el) => {
      el.textContent = ""
      el.style.display = "none"
    })

    fields.forEach((field) => field.classList.remove("error"))
  }

  function validatePhone(phone) {
    if (!phone) return true
    const phoneRegex = /^(\+56|56)?[2-9]\d{8}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  function checkPasswordStrength(password, containerId = null) {
    if (!containerId) return password.length >= 8

    const strengthIndicator = document.getElementById(containerId)
    if (!strengthIndicator) return false

    let strength = 0
    const feedback = []

    if (password.length >= 8) strength++
    else feedback.push("Mínimo 8 caracteres")

    if (/[a-z]/.test(password)) strength++
    else feedback.push("Una letra minúscula")

    if (/[A-Z]/.test(password)) strength++
    else feedback.push("Una letra mayúscula")

    if (/[0-9]/.test(password)) strength++
    else feedback.push("Un número")

    if (/[^A-Za-z0-9]/.test(password)) strength++
    else feedback.push("Un carácter especial")

    strengthIndicator.innerHTML = ""

    if (password.length > 0) {
      const strengthBar = document.createElement("div")
      strengthBar.className = "strength-bar"

      const strengthFill = document.createElement("div")
      strengthFill.className = "strength-fill"

      let strengthClass = ""
      let strengthText = ""

      if (strength <= 2) {
        strengthClass = "weak"
        strengthText = "Débil"
      } else if (strength <= 3) {
        strengthClass = "medium"
        strengthText = "Media"
      } else if (strength <= 4) {
        strengthClass = "strong"
        strengthText = "Fuerte"
      } else {
        strengthClass = "very-strong"
        strengthText = "Muy fuerte"
      }

      strengthFill.className += ` ${strengthClass}`
      strengthFill.style.width = `${(strength / 5) * 100}%`

      strengthBar.appendChild(strengthFill)
      strengthIndicator.appendChild(strengthBar)

      const strengthLabel = document.createElement("span")
      strengthLabel.className = `strength-label ${strengthClass}`
      strengthLabel.textContent = strengthText
      strengthIndicator.appendChild(strengthLabel)

      if (feedback.length > 0 && strength < 4) {
        const feedbackDiv = document.createElement("div")
        feedbackDiv.className = "password-feedback"
        feedbackDiv.innerHTML = `<small>Falta: ${feedback.join(", ")}</small>`
        strengthIndicator.appendChild(feedbackDiv)
      }
    }

    return strength >= 3
  }

  function updateCurrentUser(userData) {
    const sessionUser = sessionStorage.getItem("bebidasExpressCurrentUser")
    const localUser = localStorage.getItem("bebidasExpressCurrentUser")

    if (sessionUser) {
      const data = JSON.parse(sessionUser)
      data.nombre = userData.nombre
      sessionStorage.setItem("bebidasExpressCurrentUser", JSON.stringify(data))
    }

    if (localUser) {
      const data = JSON.parse(localUser)
      data.nombre = userData.nombre
      localStorage.setItem("bebidasExpressCurrentUser", JSON.stringify(data))
    }
  }

  function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
      <i class="fas ${getNotificationIcon(type)}"></i>
      <span>${message}</span>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("show")
    }, 100)

    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 4000)
  }

  function getNotificationIcon(type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    }
    return icons[type] || icons.info
  }
})

// Estilos para notificaciones
const notificationStyles = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 10001;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 400px;
    border-left: 4px solid #3498db;
  }

  .notification.show {
    transform: translateX(0);
  }

  .notification.success {
    border-left-color: #27ae60;
    color: #27ae60;
  }

  .notification.error {
    border-left-color: #e74c3c;
    color: #e74c3c;
  }

  .notification.warning {
    border-left-color: #f39c12;
    color: #f39c12;
  }

  .notification.info {
    border-left-color: #3498db;
    color: #3498db;
  }

  .notification i {
    font-size: 1.2rem;
  }

  .notification span {
    color: #333;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .notification {
      right: 10px;
      left: 10px;
      max-width: none;
    }
  }
`

// Agregar estilos al documento
const styleSheet = document.createElement("style")
styleSheet.textContent = notificationStyles
document.head.appendChild(styleSheet)
