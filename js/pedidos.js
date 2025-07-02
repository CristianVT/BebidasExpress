// ===== GESTIÓN DE HISTORIAL DE PEDIDOS =====

document.addEventListener("DOMContentLoaded", () => {
  // Verificar autenticación
  if (window.requireAuth && !window.requireAuth()) {
    return
  }

  // Variables globales
  let allPedidos = []
  let filteredPedidos = []

  // Elementos del DOM
  const pedidosContainer = document.getElementById("pedidos-container")
  const emptyState = document.getElementById("empty-state")
  const loadingState = document.getElementById("loading-state")
  const filterEstado = document.getElementById("filter-estado")
  const filterFecha = document.getElementById("filter-fecha")
  const clearFiltersBtn = document.getElementById("clear-filters")
  const modal = document.getElementById("pedido-modal")
  const closeModal = document.getElementById("close-modal")
  const modalBody = document.getElementById("modal-body")

  // Cargar pedidos al iniciar
  loadPedidos()

  // Event listeners
  filterEstado.addEventListener("change", applyFilters)
  filterFecha.addEventListener("change", applyFilters)
  clearFiltersBtn.addEventListener("click", clearFilters)
  closeModal.addEventListener("click", () => (modal.style.display = "none"))

  // Cerrar modal al hacer clic fuera
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none"
    }
  })

  // Función para cargar pedidos
  function loadPedidos() {
    showLoading(true)

    // Simular carga (en producción sería una llamada al backend)
    setTimeout(() => {
      allPedidos = getPedidosFromStorage()
      filteredPedidos = [...allPedidos]
      renderPedidos()
      showLoading(false)
    }, 1000)
  }

  // Obtener pedidos del localStorage
  function getPedidosFromStorage() {
    const user = window.getCurrentUser ? window.getCurrentUser() : null
    if (!user) return []

    const pedidos = JSON.parse(localStorage.getItem(`pedidos_${user.email}`)) || []
    return pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  }

  // Mostrar/ocultar loading
  function showLoading(show) {
    loadingState.style.display = show ? "block" : "none"
    pedidosContainer.style.display = show ? "none" : "block"
  }

  // Renderizar pedidos
  function renderPedidos() {
    if (filteredPedidos.length === 0) {
      pedidosContainer.style.display = "none"
      emptyState.style.display = "block"
      return
    }

    emptyState.style.display = "none"
    pedidosContainer.style.display = "block"
    pedidosContainer.innerHTML = ""

    filteredPedidos.forEach((pedido) => {
      const pedidoCard = createPedidoCard(pedido)
      pedidosContainer.appendChild(pedidoCard)
    })
  }

  // Crear tarjeta de pedido
  function createPedidoCard(pedido) {
    const card = document.createElement("div")
    card.className = "pedido-card"

    const fechaFormateada = formatDate(pedido.fecha)
    const estadoBadge = getEstadoBadge(pedido.estado)

    card.innerHTML = `
            <div class="pedido-header">
                <div class="pedido-info">
                    <h3>Pedido #${pedido.id}</h3>
                    <p><i class="fas fa-calendar"></i> ${fechaFormateada}</p>
                </div>
                <div class="pedido-estado">
                    ${estadoBadge}
                    <div class="pedido-total">S/ ${pedido.total.toFixed(2)}</div>
                </div>
            </div>
            <div class="pedido-content">
                <div class="pedido-items">
                    ${pedido.items
                      .slice(0, 3)
                      .map(
                        (item) => `
                        <div class="pedido-item">
                            <img src="${item.image}" alt="${item.product}" class="item-image">
                            <div class="item-details">
                                <h4>${item.product}</h4>
                                <p>S/ ${item.price.toFixed(2)} c/u</p>
                            </div>
                            <div class="item-quantity">x${item.quantity}</div>
                            <div class="item-price">S/ ${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `,
                      )
                      .join("")}
                    ${
                      pedido.items.length > 3
                        ? `
                        <div class="more-items">
                            <p><i class="fas fa-plus"></i> ${pedido.items.length - 3} productos más</p>
                        </div>
                    `
                        : ""
                    }
                </div>
                <div class="pedido-actions">
                    <button class="btn-action btn-primary" onclick="verDetalles('${pedido.id}')">
                        <i class="fas fa-eye"></i>
                        Ver Detalles
                    </button>
                    <button class="btn-action btn-outline" onclick="seguirPedido('${pedido.id}')">
                        <i class="fas fa-truck"></i>
                        Seguir Pedido
                    </button>
                    ${
                      pedido.estado === "entregado"
                        ? `
                        <button class="btn-action btn-secondary" onclick="reordenar('${pedido.id}')">
                            <i class="fas fa-redo"></i>
                            Reordenar
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
        `

    return card
  }

  // Formatear fecha
  function formatDate(dateString) {
    const date = new Date(dateString)
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
    return date.toLocaleDateString("es-ES", options)
  }

  // Obtener badge de estado
  function getEstadoBadge(estado) {
    const badges = {
      completado: '<span class="estado-badge completado"><i class="fas fa-check"></i> Completado</span>',
      "en-proceso": '<span class="estado-badge en-proceso"><i class="fas fa-clock"></i> En Proceso</span>',
      entregado: '<span class="estado-badge entregado"><i class="fas fa-check-double"></i> Entregado</span>',
    }
    return badges[estado] || badges["completado"]
  }

  // Aplicar filtros
  function applyFilters() {
    const estadoFilter = filterEstado.value
    const fechaFilter = filterFecha.value

    filteredPedidos = allPedidos.filter((pedido) => {
      // Filtro por estado
      if (estadoFilter !== "todos" && pedido.estado !== estadoFilter) {
        return false
      }

      // Filtro por fecha
      if (fechaFilter !== "todos") {
        const pedidoDate = new Date(pedido.fecha)
        const now = new Date()
        const diffTime = now - pedidoDate
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        switch (fechaFilter) {
          case "ultima-semana":
            if (diffDays > 7) return false
            break
          case "ultimo-mes":
            if (diffDays > 30) return false
            break
          case "ultimos-3-meses":
            if (diffDays > 90) return false
            break
        }
      }

      return true
    })

    renderPedidos()
  }

  // Limpiar filtros
  function clearFilters() {
    filterEstado.value = "todos"
    filterFecha.value = "todos"
    filteredPedidos = [...allPedidos]
    renderPedidos()
  }

  // Ver detalles del pedido
  window.verDetalles = (pedidoId) => {
    const pedido = allPedidos.find((p) => p.id === pedidoId)
    if (!pedido) return

    modalBody.innerHTML = `
            <div class="pedido-detalle">
                <div class="detalle-section">
                    <h3><i class="fas fa-info-circle"></i> Información del Pedido</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Número de Pedido</span>
                            <span class="info-value">#${pedido.id}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Fecha</span>
                            <span class="info-value">${formatDate(pedido.fecha)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Estado</span>
                            <span class="info-value">${getEstadoBadge(pedido.estado)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Total</span>
                            <span class="info-value">S/ ${pedido.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div class="detalle-section">
                    <h3><i class="fas fa-shopping-bag"></i> Productos</h3>
                    <div class="pedido-items">
                        ${pedido.items
                          .map(
                            (item) => `
                            <div class="pedido-item">
                                <img src="${item.image}" alt="${item.product}" class="item-image">
                                <div class="item-details">
                                    <h4>${item.product}</h4>
                                    <p>S/ ${item.price.toFixed(2)} c/u</p>
                                </div>
                                <div class="item-quantity">x${item.quantity}</div>
                                <div class="item-price">S/ ${(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>

                <div class="detalle-section">
                    <h3><i class="fas fa-truck"></i> Estado del Envío</h3>
                    <div class="estado-timeline">
                        <div class="timeline-item">
                            <div class="timeline-icon completed">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="timeline-content">
                                <h4>Pedido Confirmado</h4>
                                <p>Tu pedido ha sido confirmado y está siendo preparado</p>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-icon ${pedido.estado === "en-proceso" || pedido.estado === "entregado" ? "completed" : "pending"}">
                                <i class="fas fa-box"></i>
                            </div>
                            <div class="timeline-content">
                                <h4>En Preparación</h4>
                                <p>Tu pedido está siendo preparado para el envío</p>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-icon ${pedido.estado === "entregado" ? "completed" : pedido.estado === "en-proceso" ? "current" : "pending"}">
                                <i class="fas fa-truck"></i>
                            </div>
                            <div class="timeline-content">
                                <h4>En Camino</h4>
                                <p>Tu pedido está en camino a tu dirección</p>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-icon ${pedido.estado === "entregado" ? "completed" : "pending"}">
                                <i class="fas fa-home"></i>
                            </div>
                            <div class="timeline-content">
                                <h4>Entregado</h4>
                                <p>Tu pedido ha sido entregado exitosamente</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `

    modal.style.display = "block"
  }

  // Seguir pedido
  window.seguirPedido = (pedidoId) => {
    const pedido = allPedidos.find((p) => p.id === pedidoId)
    if (!pedido) return

    let mensaje = ""
    switch (pedido.estado) {
      case "completado":
        mensaje = "Tu pedido está siendo preparado. Te notificaremos cuando esté listo para el envío."
        break
      case "en-proceso":
        mensaje = "Tu pedido está en camino. Tiempo estimado de entrega: 30-45 minutos."
        break
      case "entregado":
        mensaje = "Tu pedido ya fue entregado. ¡Esperamos que lo disfrutes!"
        break
    }

    alert(mensaje)
  }

  // Reordenar
  window.reordenar = (pedidoId) => {
    const pedido = allPedidos.find((p) => p.id === pedidoId)
    if (!pedido) return

    if (confirm("¿Quieres agregar todos los productos de este pedido al carrito?")) {
      // Agregar productos al carrito
      const cart = JSON.parse(localStorage.getItem("cart")) || []

      pedido.items.forEach((item) => {
        const existingItem = cart.find((cartItem) => cartItem.product === item.product)
        if (existingItem) {
          existingItem.quantity += item.quantity
        } else {
          cart.push({ ...item })
        }
      })

      localStorage.setItem("cart", JSON.stringify(cart))
      alert("Productos agregados al carrito. ¡Ve al carrito para finalizar tu pedido!")

      // Redireccionar al carrito
      window.location.href = "Carrito.html"
    }
  }
})
