// Variables globales
const passwordVisible = false
const confirmPasswordVisible = false

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

// Función para validar la fuerza de la contraseña
function checkPasswordStrength(password) {
  const strengthIndicator = document.getElementById("passwordStrength")
  let strength = 0
  const feedback = []

  // Criterios de validación
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

  // Mostrar indicador de fuerza
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

// Función para validar edad
function validateAge(birthDate) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age >= 18
}

// Función para mostrar errores
function showError(fieldId, message) {
  const errorElement = document.getElementById(fieldId + "Error")
  const field = document.getElementById(fieldId)

  errorElement.textContent = message
  errorElement.style.display = "block"
  field.classList.add("error")
}

// Función para limpiar errores
function clearError(fieldId) {
  const errorElement = document.getElementById(fieldId + "Error")
  const field = document.getElementById(fieldId)

  errorElement.textContent = ""
  errorElement.style.display = "none"
  field.classList.remove("error")
}

// Función para validar email
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Función para validar teléfono chileno
function validatePhone(phone) {
  if (!phone) return true // Campo opcional
  const phoneRegex = /^(\+56|56)?[2-9]\d{8}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registroForm")
  const passwordField = document.getElementById("password")
  const confirmPasswordField = document.getElementById("confirmPassword")

  // Validación en tiempo real de la contraseña
  passwordField.addEventListener("input", function () {
    const password = this.value
    checkPasswordStrength(password)

    if (password.length > 0) {
      clearError("password")
    }

    // Validar confirmación de contraseña si ya tiene contenido
    const confirmPassword = confirmPasswordField.value
    if (confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        showError("confirmPassword", "Las contraseñas no coinciden")
      } else {
        clearError("confirmPassword")
      }
    }
  })

  // Validación de confirmación de contraseña
  confirmPasswordField.addEventListener("input", function () {
    const password = passwordField.value
    const confirmPassword = this.value

    if (confirmPassword.length > 0) {
      if (password !== confirmPassword) {
        showError("confirmPassword", "Las contraseñas no coinciden")
      } else {
        clearError("confirmPassword")
      }
    }
  })

  // Validación de email en tiempo real
  document.getElementById("email").addEventListener("blur", function () {
    const email = this.value
    if (email && !validateEmail(email)) {
      showError("email", "Por favor ingresa un email válido")
    } else {
      clearError("email")
    }
  })

  // Validación de teléfono
  document.getElementById("telefono").addEventListener("blur", function () {
    const phone = this.value
    if (phone && !validatePhone(phone)) {
      showError("telefono", "Por favor ingresa un teléfono válido (+56 9 1234 5678)")
    } else {
      clearError("telefono")
    }
  })

  // Validación de fecha de nacimiento
  document.getElementById("fechaNacimiento").addEventListener("change", function () {
    const birthDate = this.value
    if (birthDate && !validateAge(birthDate)) {
      showError("fechaNacimiento", "Debes ser mayor de 18 años para registrarte")
    } else {
      clearError("fechaNacimiento")
    }
  })

  // Envío del formulario
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    // Limpiar errores previos
    const errorElements = document.querySelectorAll(".error-message")
    errorElements.forEach((el) => (el.style.display = "none"))

    const fields = document.querySelectorAll(".form-group input, .form-group select")
    fields.forEach((field) => field.classList.remove("error"))

    let isValid = true

    // Validar nombre
    const nombre = document.getElementById("nombre").value.trim()
    if (!nombre) {
      showError("nombre", "El nombre es requerido")
      isValid = false
    } else if (nombre.length < 2) {
      showError("nombre", "El nombre debe tener al menos 2 caracteres")
      isValid = false
    }

    // Validar email
    const email = document.getElementById("email").value.trim()
    if (!email) {
      showError("email", "El email es requerido")
      isValid = false
    } else if (!validateEmail(email)) {
      showError("email", "Por favor ingresa un email válido")
      isValid = false
    }

    // Validar teléfono
    const telefono = document.getElementById("telefono").value.trim()
    if (telefono && !validatePhone(telefono)) {
      showError("telefono", "Por favor ingresa un teléfono válido")
      isValid = false
    }

    // Validar contraseña
    const password = document.getElementById("password").value
    if (!password) {
      showError("password", "La contraseña es requerida")
      isValid = false
    } else if (!checkPasswordStrength(password)) {
      showError("password", "La contraseña debe ser más fuerte")
      isValid = false
    }

    // Validar confirmación de contraseña
    const confirmPassword = document.getElementById("confirmPassword").value
    if (!confirmPassword) {
      showError("confirmPassword", "Debes confirmar tu contraseña")
      isValid = false
    } else if (password !== confirmPassword) {
      showError("confirmPassword", "Las contraseñas no coinciden")
      isValid = false
    }

    // Validar fecha de nacimiento
    const fechaNacimiento = document.getElementById("fechaNacimiento").value
    if (!fechaNacimiento) {
      showError("fechaNacimiento", "La fecha de nacimiento es requerida")
      isValid = false
    } else if (!validateAge(fechaNacimiento)) {
      showError("fechaNacimiento", "Debes ser mayor de 18 años para registrarte")
      isValid = false
    }

    // Validar términos y condiciones
    const terminos = document.getElementById("terminos").checked
    if (!terminos) {
      showError("terminos", "Debes aceptar los términos y condiciones")
      isValid = false
    }

    if (isValid) {
      // Mostrar loading
      const btnText = document.querySelector(".btn-text")
      const btnLoading = document.querySelector(".btn-loading")
      const btnRegistro = document.getElementById("btnRegistro")

      btnText.style.display = "none"
      btnLoading.style.display = "inline-flex"
      btnRegistro.disabled = true

      // Simular registro (aquí iría la llamada al backend)
      setTimeout(() => {
        // Simular éxito
        alert("¡Cuenta creada exitosamente! Te hemos enviado un email de confirmación.")

        // Guardar datos en localStorage (simulación)
        const userData = {
          nombre: nombre,
          email: email,
          telefono: telefono,
          fechaNacimiento: fechaNacimiento,
          newsletter: document.getElementById("newsletter").checked,
          fechaRegistro: new Date().toISOString(),
        }

        localStorage.setItem("bebidasExpressUser", JSON.stringify(userData))

        // Redireccionar al login
        window.location.href = "login.html?registered=true"
      }, 2000)
    }
  })

  // Botones de redes sociales
  document.querySelector(".google-btn").addEventListener("click", () => {
    alert("Registro con Google próximamente disponible")
  })

  document.querySelector(".facebook-btn").addEventListener("click", () => {
    alert("Registro con Facebook próximamente disponible")
  })
})
