// Importar funciones de autenticación
document.addEventListener("DOMContentLoaded", () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || []

  // Menú hamburguesa
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    // Cerrar menú al hacer clic en un enlace
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })
  }

  // Lista de productos para paginación
  const productos = [
    { product: "Heineken", price: 5.5, image: "img/CervezaHeineken.png", description: "Cerveza - Lata 330ml" },
    { product: "Corona", price: 5.0, image: "img/Corona.png", description: "Cerveza - Botella 330ml" },
    { product: "Cusqueña Dorada", price: 5.5, image: "img/Cusquenadorada.jpg", description: "Cerveza - Botella 330ml" },
    {
      product: "Johnnie Walker Red Label",
      price: 52.9,
      image: "img/JohnnieWalkerRedLabel.png",
      description: "Whisky - Botella 750ml",
    },
    { product: "Pilsen Callao", price: 6.0, image: "img/PilsenCallao.jpg", description: "Cerveza - Botella 620ml" },
    { product: "Pilsen Trujillo", price: 6.2, image: "img/PilsenTrujillo.jpg", description: "Cerveza - Botella 620ml" },
    {
      product: "Cuatro Gallos",
      price: 84.9,
      image: "img/PiscoCuatroGallos.png",
      description: "Pisco - Quebranta 700ml",
    },
    {
      product: "Tabernero Borgoña Semi-Seco",
      price: 16.5,
      image: "img/TaberneroBorgonaSemi-Seco.png",
      description: "Vino - Botella 750ml",
    },
    { product: "Absolut Vodka", price: 44.9, image: "img/VodkaAbsolut.png", description: "Vodka - Botella 700ml" },
    { product: "Smirnoff Vodka", price: 59.9, image: "img/VodkaSmirnoff.png", description: "Vodka - Botella 700ml" },
  ]

  // Función para generar ID único de pedido
  function generateOrderId() {
    return "PED" + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase()
  }

  // Función para guardar pedido en el historial
  function saveOrderToHistory(orderData) {
    const user = window.getCurrentUser ? window.getCurrentUser() : null
    if (!user) return

    const userEmail = user.email
    const existingOrders = JSON.parse(localStorage.getItem(`pedidos_${userEmail}`)) || []

    const newOrder = {
      id: generateOrderId(),
      fecha: new Date().toISOString(),
      estado: "completado", // Puede ser: completado, en-proceso, entregado
      items: [...orderData.items],
      total: orderData.total,
      subtotal: orderData.subtotal,
    }

    existingOrders.unshift(newOrder) // Agregar al inicio
    localStorage.setItem(`pedidos_${userEmail}`, JSON.stringify(existingOrders))

    return newOrder
  }

  // Agregar producto al carrito
  document.querySelectorAll(".btn-agregar-pro").forEach((button) => {
    button.addEventListener("click", () => {
      const product = button.getAttribute("data-product")
      const price = Number.parseFloat(button.getAttribute("data-price"))
      const image = button.getAttribute("data-image")
      const quantity = 1

      const item = cart.find((item) => item.product === product)
      if (item) {
        item.quantity += quantity
      } else {
        cart.push({ product, price, image, quantity })
      }

      localStorage.setItem("cart", JSON.stringify(cart))
      updateCartCount()
      showNotification(`¡${product} agregado al carrito!`)
      updateCartDisplay()
    })
  })

  // Actualizar contador del carrito
  function updateCartCount() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    console.log("Conteo del carrito:", cartCount) // Depuración

    document.querySelectorAll(".cart-count").forEach((count) => {
      count.textContent = `(${cartCount})`
      count.parentElement.setAttribute("aria-label", `Carrito de compras con ${cartCount} ítems`)
    })
  }

  // Mostrar notificación
  function showNotification(message) {
    const notification = document.createElement("div")
    notification.className = "notification"
    notification.textContent = message
    notification.setAttribute("aria-live", "polite")
    document.body.appendChild(notification)

    notification.style.display = "block"

    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  // Actualizar visualización del carrito
  function updateCartDisplay() {
    const cartItems = document.getElementById("carrito-items")
    if (cartItems) {
      if (cart.length === 0) {
        cartItems.innerHTML = '<p>Tu carrito está vacío. <a href="Producto.html">Explora productos</a>.</p>'
      } else {
        cartItems.innerHTML = ""

        cart.forEach((item) => {
          const cartItem = document.createElement("div")
          cartItem.className = "carrito-item"
          cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.product}" width="50" height="50">
            <div class="item-info">
              <h4>${item.product}</h4>
              <span class="price">S/ ${item.price.toFixed(2)}</span>
            </div>
            <div class="quantity-controls">
              <button class="quantity-btn" data-action="decrease">-</button>
              <input type="number" class="quantity-input" value="${item.quantity}" min="1">
              <button class="quantity-btn" data-action="increase">+</button>
            </div>
            <button class="remove-btn" data-product="${item.product}"><i class="fas fa-trash"></i></button>
          `

          cartItems.appendChild(cartItem)

          // Control de cantidad
          cartItem.querySelectorAll(".quantity-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
              const action = btn.getAttribute("data-action")
              const input = cartItem.querySelector(".quantity-input")
              let quantity = Number.parseInt(input.value)

              if (action === "increase") quantity++
              else if (action === "decrease" && quantity > 1) quantity--

              input.value = quantity
              item.quantity = quantity
              localStorage.setItem("cart", JSON.stringify(cart))
              updateCartDisplay()
              updateSummary()
            })
          })

          // Validar entrada manual
          cartItem.querySelector(".quantity-input").addEventListener("input", (e) => {
            let quantity = Number.parseInt(e.target.value)
            if (isNaN(quantity) || quantity < 1) {
              quantity = 1
              e.target.value = 1
            }
            item.quantity = quantity
            localStorage.setItem("cart", JSON.stringify(cart))
            updateCartDisplay()
            updateSummary()
          })

          // Eliminar producto
          cartItem.querySelector(".remove-btn").addEventListener("click", () => {
            cart = cart.filter((i) => i.product !== item.product)
            localStorage.setItem("cart", JSON.stringify(cart))
            updateCartDisplay()
            updateCartCount()
            updateSummary()
          })
        })
      }

      updateSummary()
    }
  }

  // Actualizar resumen del carrito
  function updateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal

    const subtotalElement = document.getElementById("subtotal")
    const totalElement = document.getElementById("total")

    if (subtotalElement) subtotalElement.textContent = `S/ ${subtotal.toFixed(2)}`
    if (totalElement) totalElement.textContent = `S/ ${total.toFixed(2)}`
  }

  // Paginación
  function mostrarProductos(pagina) {
    const productosPorPagina = 6
    const inicio = (pagina - 1) * productosPorPagina
    const fin = inicio + productosPorPagina
    const productosMostrar = productos.slice(inicio, fin)

    const productosGrid = document.querySelector(".productos-grid")
    if (productosGrid) {
      productosGrid.innerHTML = ""

      productosMostrar.forEach((item) => {
        const productoCard = document.createElement("div")
        productoCard.className = "producto-card"
        productoCard.innerHTML = `
          <div class="producto-image">
            <img src="${item.image}" alt="${item.product}" width="250" height="200" loading="lazy">
          </div>
          <div class="producto-info">
            <h3>${item.product}</h3>
            <p>${item.description}</p>
            <div class="precio-agregar">
              <span class="precio">S/ ${item.price.toFixed(2)}</span>
              <button class="btn-agregar-pro" data-product="${item.product}" data-price="${item.price}" data-image="${item.image}">Agregar</button>
            </div>
          </div>
        `

        productosGrid.appendChild(productoCard)
      })

      // Reasignar eventos a los nuevos botones
      document.querySelectorAll(".btn-agregar-pro").forEach((button) => {
        button.addEventListener("click", () => {
          const product = button.getAttribute("data-product")
          const price = Number.parseFloat(button.getAttribute("data-price"))
          const image = button.getAttribute("data-image")
          const quantity = 1

          const item = cart.find((item) => item.product === product)
          if (item) {
            item.quantity += quantity
          } else {
            cart.push({ product, price, image, quantity })
          }

          localStorage.setItem("cart", JSON.stringify(cart))
          updateCartCount()
          showNotification(`¡${product} agregado al carrito!`)
          updateCartDisplay()
        })
      })
    }
  }

  // Configurar paginación
  const pageButtons = document.querySelectorAll(".page-btn")
  if (pageButtons.length > 0) {
    pageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelector(".page-btn.active")?.classList.remove("active")
        button.classList.add("active")
        const pagina = Number.parseInt(button.textContent)
        mostrarProductos(pagina)
      })
    })

    // Cargar la primera página
    pageButtons[0].classList.add("active")
    mostrarProductos(1)
  }

  // Botón de pago - MODIFICADO PARA GUARDAR EN HISTORIAL
  const btnPagar = document.getElementById("btn-pagar")
  if (btnPagar) {
    btnPagar.addEventListener("click", () => {
      if (cart.length > 0) {
        // Verificar si el usuario está logueado
        const user = window.getCurrentUser ? window.getCurrentUser() : null
        if (!user) {
          alert("Debes iniciar sesión para realizar una compra.")
          window.location.href = "login.html"
          return
        }

        // Calcular totales
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const total = subtotal

        // Guardar pedido en el historial
        const orderData = {
          items: cart,
          subtotal: subtotal,
          total: total,
        }

        const savedOrder = saveOrderToHistory(orderData)

        // Mostrar confirmación
        alert(`¡Pago realizado con éxito! 
                
Número de pedido: #${savedOrder.id}
Total: S/ ${total.toFixed(2)}

Gracias por tu compra. Puedes revisar el estado de tu pedido en "Mis Pedidos".`)

        // Limpiar carrito
        cart = []
        localStorage.setItem("cart", JSON.stringify(cart))
        updateCartDisplay()
        updateCartCount()

        // Redireccionar a historial de pedidos
        setTimeout(() => {
          window.location.href = "pedidos.html"
        }, 2000)
      } else {
        alert("Tu carrito está vacío.")
      }
    })
  }

  const n8n = "https://n8n.srv851812.hstgr.cloud/webhook/751de67c-a206-4a8c-88b6-03d0ca0699e0"

  // Validación y envío del formulario de Newsletter
  const newsletter = document.querySelector(".newsletter-form")
  if (newsletter) {
    newsletter.addEventListener("submit", async (e) => {
      // Añadir 'async' aquí
      e.preventDefault()
      const email = newsletter.querySelector('input[type="email"]').value

      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showNotification("Por favor, ingresa un correo válido.")
        return
      }

      // Datos a enviar (solo el correo electrónico)
      const datosNewsletter = {
        email: email,
      }

      // Enviar datos al webhook de n8n para el Newsletter
      try {
        const response = await fetch(n8n, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosNewsletter),
        })

        if (!response.ok) {
          const errorText = await response.text() // Lee el texto de error si no es JSON
          throw new Error(`Error en el webhook del newsletter: ${response.status} - ${errorText}`)
        }

        // Si n8n responde con algo, lo mostramos en consola. Si no, no pasa nada.
        const data = await response.json().catch(() => ({}))
        console.log("Respuesta del webhook de Newsletter:", data)

        showNotification("¡Suscripción exitosa!")
        newsletter.reset()
      } catch (error) {
        console.error("Error al enviar suscripción al webhook:", error)
        showNotification("Hubo un error al procesar tu suscripción. Intenta de nuevo.")
      }
    })
  }

  const contactoForm = document.querySelector(".contacto-form")
  if (contactoForm) {
    contactoForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const nombre = contactoForm.querySelector('input[name="Nombre_completo"]').value
      const email = contactoForm.querySelector('input[name="Correo_electronico"]').value
      const telefono = contactoForm.querySelector('input[name="Telefono"]').value
      const mensaje = contactoForm.querySelector('textarea[name="Mensaje"]').value

      if (!nombre || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) || !mensaje) {
        showNotification("Por favor, completa todos los campos requeridos.")
        return
      }

      const datosFormulario = {
        nombre,
        email,
        telefono,
        mensaje,
      }

      fetch(n8n, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosFormulario),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Error en el webhook")
          return response.json().catch(() => ({})) // si el webhook responde vacío
        })
        .then((data) => {
          console.log("Respuesta del webhook:", data)
          showNotification("¡Mensaje enviado con éxito!")
          contactoForm.reset()
        })
        .catch((error) => {
          console.error("Error al enviar al webhook:", error)
          showNotification("Hubo un error al enviar el mensaje.")
        })
    })
  }

  // Cargar el script de sesión
  const authScript = document.createElement("script")
  authScript.src = "auth-session.js"
  document.head.appendChild(authScript)

  // Mostrar mensaje de bienvenida si es necesario
  setTimeout(() => {
    if (window.showWelcomeMessage) {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get("welcome") === "true") {
        window.showWelcomeMessage()
      }
    }
  }, 1000)

  // Cargar carrito al iniciar
  updateCartCount()
  updateCartDisplay()
})
