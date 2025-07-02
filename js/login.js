// Función para alternar visibilidad de contraseña
function togglePassword(fieldId) {
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

// Función para mostrar errores
function showError(fieldId, message) {
  const errorElement = document.getElementById(fieldId + "Error")
  const field = document.getElementById(fieldId)

  if (errorElement && field) {
    errorElement.textContent = message
    errorElement.style.display = "block"
    field.classList.add("error")
  }
}

// Función para limpiar errores
function clearError(fieldId) {
  const errorElement = document.getElementById(fieldId + "Error")
  const field = document.getElementById(fieldId)

  if (errorElement && field) {
    errorElement.textContent = ""
    errorElement.style.display = "none"
    field.classList.remove("error")
  }
}

// Función para validar email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Función para simular autenticación
function authenticateUser(email, password) {
  // Simular usuarios registrados (en un caso real, esto sería una llamada al backend)
  const registeredUsers = [
    { email: "admin@bebidasexpress.com", password: "admin123", nombre: "Administrador" },
    { email: "usuario@test.com", password: "test123", nombre: "Usuario Test" },
  ]

  // Verificar si hay un usuario registrado en localStorage
  const storedUser = localStorage.getItem("bebidasExpressUser")
  if (storedUser) {
    const userData = JSON.parse(storedUser)
    registeredUsers.push({
      email: userData.email,
      password: "password123", // En un caso real, esto estaría hasheado
      nombre: userData.nombre,
    })
  }

  return registeredUsers.find((user) => user.email === email && user.password === password)
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  // Verificar si viene del registro exitoso
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("registered") === "true") {
    const successMessage = document.getElementById("successMessage")
    successMessage.style.display = "flex"

    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
      successMessage.style.display = "none"
    }, 5000)
  }

  // Verificar si el usuario ya está logueado
  const currentUser = localStorage.getItem("bebidasExpressCurrentUser")
  if (currentUser) {
    // Redireccionar al dashboard o página principal
    window.location.href = "index.html"
  }

  // Formulario de login
  const loginForm = document.getElementById("loginForm")
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Limpiar errores previos
    clearError("email")
    clearError("password")

    let isValid = true

    // Validar email
    const email = document.getElementById("email").value.trim()
    if (!email) {
      showError("email", "El email es requerido")
      isValid = false
    } else if (!validateEmail(email)) {
      showError("email", "Por favor ingresa un email válido")
      isValid = false
    }

    // Validar contraseña
    const password = document.getElementById("password").value
    if (!password) {
      showError("password", "La contraseña es requerida")
      isValid = false
    }

    if (isValid) {
      // Mostrar loading
      const btnText = document.querySelector("#btnLogin .btn-text")
      const btnLoading = document.querySelector("#btnLogin .btn-loading")
      const btnLogin = document.getElementById("btnLogin")

      btnText.style.display = "none"
      btnLoading.style.display = "inline-flex"
      btnLogin.disabled = true

      // Simular autenticación
      setTimeout(() => {
        const user = authenticateUser(email, password)

        if (user) {
          // Login exitoso
          const recordarme = document.getElementById("recordarme").checked

          // Guardar sesión
          const sessionData = {
            email: user.email,
            nombre: user.nombre,
            loginTime: new Date().toISOString(),
            recordarme: recordarme,
          }

          if (recordarme) {
            localStorage.setItem("bebidasExpressCurrentUser", JSON.stringify(sessionData))
          } else {
            sessionStorage.setItem("bebidasExpressCurrentUser", JSON.stringify(sessionData))
          }

          alert(`¡Bienvenido ${user.nombre}! Has iniciado sesión correctamente.`)

          // Redireccionar
          window.location.href = "index.html?welcome=true"
        } else {
          // Login fallido
          showError("password", "Email o contraseña incorrectos")

          // Restaurar botón
          btnText.style.display = "inline"
          btnLoading.style.display = "none"
          btnLogin.disabled = false
        }
      }, 1500)
    }
  })

  // Modal de recuperar contraseña
  const forgotPasswordLink = document.getElementById("forgotPasswordLink")
  const forgotPasswordModal = document.getElementById("forgotPasswordModal")
  const closeModal = document.getElementById("closeModal")
  const cancelReset = document.getElementById("cancelReset")

  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault()
    forgotPasswordModal.style.display = "block"
  })

  closeModal.addEventListener("click", () => {
    forgotPasswordModal.style.display = "none"
    clearError("resetEmail")
  })

  cancelReset.addEventListener("click", () => {
    forgotPasswordModal.style.display = "none"
    clearError("resetEmail")
  })

  // Cerrar modal al hacer clic fuera
  window.addEventListener("click", (e) => {
    if (e.target === forgotPasswordModal) {
      forgotPasswordModal.style.display = "none"
      clearError("resetEmail")
    }
  })

  // Formulario de recuperar contraseña
  const forgotPasswordForm = document.getElementById("forgotPasswordForm")
  forgotPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault()

    clearError("resetEmail")

    const resetEmail = document.getElementById("resetEmail").value.trim()

    if (!resetEmail) {
      showError("resetEmail", "El email es requerido")
      return
    }

    if (!validateEmail(resetEmail)) {
      showError("resetEmail", "Por favor ingresa un email válido")
      return
    }

    // Mostrar loading
    const btnText = document.querySelector("#btnReset .btn-text")
    const btnLoading = document.querySelector("#btnReset .btn-loading")
    const btnReset = document.getElementById("btnReset")

    btnText.style.display = "none"
    btnLoading.style.display = "inline-flex"
    btnReset.disabled = true

    // Simular envío de email
    setTimeout(() => {
      alert(`Se ha enviado un enlace de recuperación a ${resetEmail}. Revisa tu bandeja de entrada y spam.`)

      // Cerrar modal
      forgotPasswordModal.style.display = "none"
      document.getElementById("resetEmail").value = ""

      // Restaurar botón
      btnText.style.display = "inline"
      btnLoading.style.display = "none"
      btnReset.disabled = false
    }, 2000)
  })

  // Botones de redes sociales
  document.querySelector(".google-btn").addEventListener("click", () => {
    alert("Inicio de sesión con Google próximamente disponible")
  })

  document.querySelector(".facebook-btn").addEventListener("click", () => {
    alert("Inicio de sesión con Facebook próximamente disponible")
  })

  // Auto-completar email si viene del registro
  const storedUser = localStorage.getItem("bebidasExpressUser")
  if (storedUser && urlParams.get("registered") === "true") {
    const userData = JSON.parse(storedUser)
    document.getElementById("email").value = userData.email
  }
})
