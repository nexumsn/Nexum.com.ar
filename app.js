(function () {
  const STORE_KEY = "editableStoreState.v1";
  const CART_KEY = "editableStoreCart.v1";

  const defaultState = {
    settings: {
      storeName: "Casa Nube",
      tagline: "Objetos lindos para todos los dias",
      catalogTitle: "Productos destacados",
      catalogSubtitle: "Elegí tus favoritos, revisa el stock y confirma el pedido por WhatsApp.",
      announcement: "Envios coordinados por WhatsApp. Retiro disponible en tienda.",
      logo: "assets/logo.png",
      currency: "$",
      whatsappNumber: "5491123456789",
      whatsappIntro: "Hola, quiero realizar este pedido:",
      checkoutHint: "Al tocar el boton se abre WhatsApp con el detalle del pedido listo para enviar.",
      adminPin: "1234",
      autoDiscountStock: false,
      colors: {
        primary: "#0f766e",
        accent: "#f97316",
        background: "#f7faf8",
        surface: "#ffffff",
        text: "#172a33"
      }
    },
    categories: [
      { id: "cat-deco", name: "Deco", description: "Detalles para renovar espacios." },
      { id: "cat-bazar", name: "Bazar", description: "Piezas utiles y lindas para la mesa." },
      { id: "cat-regalos", name: "Regalos", description: "Ideas simples para quedar bien." }
    ],
    slides: [
      {
        id: "slide-1",
        title: "Nueva coleccion",
        subtitle: "Texturas, aromas y accesorios seleccionados para armar una tienda clara y vendible desde el primer dia.",
        buttonText: "Ver productos",
        categoryId: "all",
        image: "assets/hero-1.png"
      },
      {
        id: "slide-2",
        title: "Pedidos por WhatsApp",
        subtitle: "Tus clientes cargan el carrito, el sistema respeta el stock y genera el mensaje automaticamente.",
        buttonText: "Comprar ahora",
        categoryId: "cat-regalos",
        image: "assets/hero-2.png"
      },
      {
        id: "slide-3",
        title: "Tu tienda editable",
        subtitle: "Carga productos, imagenes, categorias, colores y carrusel desde el panel admin.",
        buttonText: "Explorar",
        categoryId: "cat-deco",
        image: "assets/hero-3.png"
      }
    ],
    products: [
      {
        id: "prod-taza",
        title: "Taza ceramica arena",
        price: 6200,
        stock: 8,
        categoryId: "cat-bazar",
        description: "Ceramica esmaltada, ideal para cafe o te. Capacidad 320 ml.",
        image: "assets/product-mug.png",
        active: true,
        featured: true
      },
      {
        id: "prod-vela",
        title: "Vela botanica",
        price: 8400,
        stock: 5,
        categoryId: "cat-regalos",
        description: "Aroma suave con envase reutilizable y terminacion artesanal.",
        image: "assets/product-candle.png",
        active: true,
        featured: true
      },
      {
        id: "prod-bolso",
        title: "Bolso lino natural",
        price: 14500,
        stock: 3,
        categoryId: "cat-regalos",
        description: "Bolso liviano con manijas reforzadas para uso diario.",
        image: "assets/product-bag.png",
        active: true,
        featured: false
      },
      {
        id: "prod-cuaderno",
        title: "Cuaderno tapa dura",
        price: 7300,
        stock: 12,
        categoryId: "cat-regalos",
        description: "Hojas lisas de alto gramaje y cinta señaladora.",
        image: "assets/product-notebook.png",
        active: true,
        featured: true
      },
      {
        id: "prod-maceta",
        title: "Maceta grafito",
        price: 9900,
        stock: 6,
        categoryId: "cat-deco",
        description: "Maceta de cemento sellado con plato incluido.",
        image: "assets/product-pot.png",
        active: true,
        featured: false
      },
      {
        id: "prod-lampara",
        title: "Lampara mesa cobre",
        price: 28500,
        stock: 2,
        categoryId: "cat-deco",
        description: "Lampara compacta con pantalla orientable y luz calida.",
        image: "assets/product-lamp.png",
        active: true,
        featured: true
      }
    ]
  };

  let state = loadState();
  let cart = loadCart();
  let activeCategory = "all";
  let activeSlide = 0;
  let adminSection = "general";
  let carouselTimer = null;
  let toastTimer = null;
  const customer = { name: "", phone: "", address: "", note: "" };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const elements = {
    announcementBar: $("#announcementBar"),
    storeLogo: $("#storeLogo"),
    storeName: $("#storeName"),
    storeTagline: $("#storeTagline"),
    productSearch: $("#productSearch"),
    searchResults: $("#searchResults"),
    slidesTrack: $("#slidesTrack"),
    carouselDots: $("#carouselDots"),
    catalogTitle: $("#catalogTitle"),
    catalogSubtitle: $("#catalogSubtitle"),
    categoryFilters: $("#categoryFilters"),
    productGrid: $("#productGrid"),
    cartButton: $("#cartButton"),
    cartCount: $("#cartCount"),
    drawerBackdrop: $("#drawerBackdrop"),
    cartDrawer: $("#cartDrawer"),
    cartItems: $("#cartItems"),
    cartTotal: $("#cartTotal"),
    checkoutHint: $("#checkoutHint"),
    adminPanel: $("#adminPanel"),
    adminContent: $("#adminContent"),
    adminTitle: $("#adminTitle"),
    adminLoginModal: $("#adminLoginModal"),
    adminLoginForm: $("#adminLoginForm"),
    adminPinInput: $("#adminPinInput"),
    toast: $("#toast")
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (!saved) return clone(defaultState);
      return mergeState(clone(defaultState), JSON.parse(saved));
    } catch (error) {
      console.warn("No se pudo cargar la tienda guardada.", error);
      return clone(defaultState);
    }
  }

  function mergeState(base, saved) {
    return {
      ...base,
      ...saved,
      settings: {
        ...base.settings,
        ...(saved.settings || {}),
        colors: {
          ...base.settings.colors,
          ...((saved.settings && saved.settings.colors) || {})
        }
      },
      categories: Array.isArray(saved.categories) ? saved.categories : base.categories,
      slides: Array.isArray(saved.slides) ? saved.slides : base.slides,
      products: Array.isArray(saved.products) ? saved.products : base.products
    };
  }

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch (error) {
      return [];
    }
  }

  function saveState() {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function money(value) {
    const amount = Number(value || 0);
    return `${state.settings.currency || "$"}${amount.toLocaleString("es-AR", {
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2
    })}`;
  }

  function getCategoryName(id) {
    if (!id || id === "all") return "Todos";
    return state.categories.find((category) => category.id === id)?.name || "Sin categoria";
  }

  function activeProducts() {
    return state.products.filter((product) => product.active !== false);
  }

  function cartQuantity(productId) {
    return cart.find((item) => item.productId === productId)?.quantity || 0;
  }

  function getProduct(productId) {
    return state.products.find((product) => product.id === productId);
  }

  function clampCartToStock() {
    let changed = false;
    cart = cart
      .map((item) => {
        const product = getProduct(item.productId);
        if (!product || product.active === false || Number(product.stock) <= 0) {
          changed = true;
          return null;
        }
        const quantity = Math.min(Number(item.quantity || 1), Number(product.stock || 0));
        if (quantity !== item.quantity) changed = true;
        return { productId: item.productId, quantity };
      })
      .filter(Boolean);
    if (changed) saveCart();
  }

  function applyTheme() {
    const colors = state.settings.colors || {};
    const root = document.documentElement;
    root.style.setProperty("--color-primary", colors.primary || defaultState.settings.colors.primary);
    root.style.setProperty("--color-accent", colors.accent || defaultState.settings.colors.accent);
    root.style.setProperty("--color-bg", colors.background || defaultState.settings.colors.background);
    root.style.setProperty("--color-surface", colors.surface || defaultState.settings.colors.surface);
    root.style.setProperty("--color-text", colors.text || defaultState.settings.colors.text);
    document.title = state.settings.storeName || "Tienda editable";
  }

  function renderHeader() {
    elements.announcementBar.textContent = state.settings.announcement || "";
    elements.storeLogo.src = state.settings.logo || "assets/logo.png";
    elements.storeName.textContent = state.settings.storeName || "Tienda";
    elements.storeTagline.textContent = state.settings.tagline || "";
  }

  function renderCarousel() {
    const slides = state.slides.length ? state.slides : defaultState.slides;
    activeSlide = Math.min(activeSlide, slides.length - 1);
    elements.slidesTrack.innerHTML = slides.map((slide) => `
      <article class="hero-slide">
        <img src="${escapeHtml(slide.image || "assets/hero-1.png")}" alt="${escapeHtml(slide.title || "Foto de portada")}">
        <div class="hero-copy">
          <h2>${escapeHtml(slide.title || "Tu tienda")}</h2>
          <p>${escapeHtml(slide.subtitle || "")}</p>
          <button class="button primary" type="button" data-slide-category="${escapeHtml(slide.categoryId || "all")}">
            ${escapeHtml(slide.buttonText || "Ver productos")}
          </button>
        </div>
      </article>
    `).join("");
    elements.slidesTrack.style.transform = `translateX(-${activeSlide * 100}%)`;
    elements.carouselDots.innerHTML = slides.map((slide, index) => `
      <button class="dot ${index === activeSlide ? "active" : ""}" type="button" data-slide-to="${index}" aria-label="Ir a ${escapeHtml(slide.title || `foto ${index + 1}`)}"></button>
    `).join("");
    restartCarousel();
  }

  function restartCarousel() {
    window.clearInterval(carouselTimer);
    if (state.slides.length <= 1) return;
    carouselTimer = window.setInterval(() => moveSlide(1), 5600);
  }

  function moveSlide(direction) {
    const count = state.slides.length || defaultState.slides.length;
    activeSlide = (activeSlide + direction + count) % count;
    renderCarousel();
  }

  function renderCatalogControls() {
    elements.catalogTitle.textContent = state.settings.catalogTitle || "Productos";
    elements.catalogSubtitle.textContent = state.settings.catalogSubtitle || "";
    const chips = [
      `<button class="filter-chip ${activeCategory === "all" ? "active" : ""}" type="button" data-category-filter="all">Todos</button>`,
      ...state.categories.map((category) => `
        <button class="filter-chip ${activeCategory === category.id ? "active" : ""}" type="button" data-category-filter="${escapeHtml(category.id)}">
          ${escapeHtml(category.name)}
        </button>
      `)
    ];
    elements.categoryFilters.innerHTML = chips.join("");
  }

  function renderProducts() {
    const products = activeProducts().filter((product) => activeCategory === "all" || product.categoryId === activeCategory);
    if (!products.length) {
      elements.productGrid.innerHTML = `<div class="empty-state">No hay productos en esta categoria. Puedes agregarlos desde el panel admin.</div>`;
      return;
    }

    elements.productGrid.innerHTML = products.map((product) => {
      const inCart = cartQuantity(product.id);
      const stock = Number(product.stock || 0);
      const canAdd = stock > 0 && inCart < stock;
      const label = stock <= 0 ? "Sin stock" : canAdd ? "Agregar al carrito" : "Stock maximo en carrito";
      return `
        <article class="product-card" id="product-${escapeHtml(product.id)}">
          <div class="product-media">
            <img src="${escapeHtml(product.image || "assets/product-notebook.png")}" alt="${escapeHtml(product.title)}">
            <span class="stock-pill">${stock > 0 ? `${stock} en stock` : "Sin stock"}</span>
          </div>
          <div class="product-body">
            <div class="product-meta">
              <h3>${escapeHtml(product.title)}</h3>
              <span class="price">${money(product.price)}</span>
            </div>
            <p class="mini-copy">${escapeHtml(getCategoryName(product.categoryId))}</p>
            <p class="product-description">${escapeHtml(product.description)}</p>
            <button class="button primary wide" type="button" data-add-product="${escapeHtml(product.id)}" ${canAdd ? "" : "disabled"}>
              ${label}
            </button>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderCart() {
    clampCartToStock();
    const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    elements.cartCount.textContent = totalItems;

    if (!cart.length) {
      elements.cartItems.innerHTML = `<div class="empty-state">Tu carrito esta vacio.</div>`;
      elements.cartTotal.textContent = money(0);
      elements.checkoutHint.textContent = state.settings.checkoutHint || "";
      syncCustomerInputs();
      return;
    }

    let total = 0;
    elements.cartItems.innerHTML = cart.map((item) => {
      const product = getProduct(item.productId);
      const quantity = Number(item.quantity || 1);
      const subtotal = Number(product.price || 0) * quantity;
      total += subtotal;
      return `
        <article class="cart-item">
          <img src="${escapeHtml(product.image || "assets/product-notebook.png")}" alt="${escapeHtml(product.title)}">
          <div>
            <h3>${escapeHtml(product.title)}</h3>
            <p class="mini-copy">${money(product.price)} c/u · Stock ${Number(product.stock || 0)}</p>
            <div class="cart-line">
              <div class="qty-control" aria-label="Cantidad">
                <button type="button" data-cart-dec="${escapeHtml(product.id)}" ${quantity <= 1 ? "disabled" : ""}>-</button>
                <span>${quantity}</span>
                <button type="button" data-cart-inc="${escapeHtml(product.id)}" ${quantity >= Number(product.stock || 0) ? "disabled" : ""}>+</button>
              </div>
              <strong>${money(subtotal)}</strong>
            </div>
            <button class="small-button danger" type="button" data-cart-remove="${escapeHtml(product.id)}">Quitar</button>
          </div>
        </article>
      `;
    }).join("");
    elements.cartTotal.textContent = money(total);
    elements.checkoutHint.textContent = state.settings.checkoutHint || "";
    syncCustomerInputs();
  }

  function syncCustomerInputs() {
    $("#customerName").value = customer.name;
    $("#customerPhone").value = customer.phone;
    $("#customerAddress").value = customer.address;
    $("#customerNote").value = customer.note;
  }

  function renderStore() {
    applyTheme();
    renderHeader();
    renderCarousel();
    renderCatalogControls();
    renderProducts();
    renderCart();
    updateSearchResults(elements.productSearch.value);
  }

  function addToCart(productId) {
    const product = getProduct(productId);
    if (!product || product.active === false) return;
    const stock = Number(product.stock || 0);
    const existing = cart.find((item) => item.productId === productId);
    const current = existing?.quantity || 0;
    if (stock <= 0) {
      showToast("Este producto no tiene stock disponible.");
      return;
    }
    if (current >= stock) {
      showToast(`Solo hay ${stock} unidades disponibles de ${product.title}.`);
      return;
    }
    if (existing) existing.quantity += 1;
    else cart.push({ productId, quantity: 1 });
    saveCart();
    renderProducts();
    renderCart();
    updateSearchResults(elements.productSearch.value);
    showToast(`${product.title} agregado al carrito.`);
  }

  function changeCartQuantity(productId, direction) {
    const product = getProduct(productId);
    const item = cart.find((entry) => entry.productId === productId);
    if (!product || !item) return;
    const nextQuantity = item.quantity + direction;
    if (nextQuantity <= 0) {
      cart = cart.filter((entry) => entry.productId !== productId);
    } else if (nextQuantity <= Number(product.stock || 0)) {
      item.quantity = nextQuantity;
    } else {
      showToast(`Stock maximo: ${product.stock} unidades.`);
    }
    saveCart();
    renderProducts();
    renderCart();
    updateSearchResults(elements.productSearch.value);
  }

  function openCart() {
    elements.drawerBackdrop.hidden = false;
    elements.cartDrawer.classList.add("open");
    elements.cartDrawer.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    elements.drawerBackdrop.hidden = true;
    elements.cartDrawer.classList.remove("open");
    elements.cartDrawer.setAttribute("aria-hidden", "true");
  }

  function updateSearchResults(query) {
    const term = String(query || "").trim().toLowerCase();
    if (!term) {
      elements.searchResults.hidden = true;
      elements.searchResults.innerHTML = "";
      return;
    }
    const results = activeProducts()
      .filter((product) => {
        const haystack = `${product.title} ${product.description} ${getCategoryName(product.categoryId)}`.toLowerCase();
        return haystack.includes(term);
      })
      .slice(0, 7);

    if (!results.length) {
      elements.searchResults.hidden = false;
      elements.searchResults.innerHTML = `<div class="empty-state">No se encontraron productos.</div>`;
      return;
    }

    elements.searchResults.hidden = false;
    elements.searchResults.innerHTML = results.map((product) => {
      const stock = Number(product.stock || 0);
      return `
        <button class="search-row" type="button" data-focus-product="${escapeHtml(product.id)}">
          <img src="${escapeHtml(product.image || "assets/product-notebook.png")}" alt="${escapeHtml(product.title)}">
          <span>
            <strong>${escapeHtml(product.title)}</strong>
            <span>${stock > 0 ? `${stock} en stock` : "Sin stock"} · ${escapeHtml(getCategoryName(product.categoryId))}</span>
          </span>
          <span class="price">${money(product.price)}</span>
        </button>
      `;
    }).join("");
  }

  function focusProduct(productId) {
    const product = getProduct(productId);
    if (!product) return;
    activeCategory = "all";
    renderCatalogControls();
    renderProducts();
    elements.searchResults.hidden = true;
    elements.productSearch.value = "";
    const card = $(`#product-${CSS.escape(productId)}`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.animate([
        { boxShadow: "0 0 0 0 rgba(15, 118, 110, 0)" },
        { boxShadow: "0 0 0 6px rgba(15, 118, 110, 0.28)" },
        { boxShadow: "0 0 0 0 rgba(15, 118, 110, 0)" }
      ], { duration: 1100, easing: "ease-out" });
    }
  }

  function buildWhatsappMessage() {
    const lines = [
      state.settings.whatsappIntro || "Hola, quiero realizar este pedido:",
      "",
      ...cart.map((item) => {
        const product = getProduct(item.productId);
        return `- ${item.quantity} x ${product.title} (${money(product.price)} c/u) = ${money(Number(product.price || 0) * item.quantity)}`;
      }),
      "",
      `Total: ${elements.cartTotal.textContent}`,
      "",
      `Nombre: ${customer.name || "-"}`,
      `Telefono: ${customer.phone || "-"}`,
      `Direccion/retiro: ${customer.address || "-"}`,
      `Nota: ${customer.note || "-"}`
    ];
    return lines.join("\n");
  }

  function checkoutWhatsapp() {
    clampCartToStock();
    if (!cart.length) {
      showToast("Agrega productos al carrito antes de enviar el pedido.");
      return;
    }
    const number = String(state.settings.whatsappNumber || "").replace(/\D/g, "");
    if (!number) {
      showToast("Configura el numero de WhatsApp desde el panel admin.");
      return;
    }
    const url = `https://wa.me/${number}?text=${encodeURIComponent(buildWhatsappMessage())}`;
    window.open(url, "_blank", "noopener");

    if (state.settings.autoDiscountStock) {
      cart.forEach((item) => {
        const product = getProduct(item.productId);
        if (product) product.stock = Math.max(0, Number(product.stock || 0) - Number(item.quantity || 0));
      });
      cart = [];
      saveState();
      saveCart();
      renderStore();
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    toastTimer = window.setTimeout(() => elements.toast.classList.remove("show"), 2600);
  }

  function openAdminLogin() {
    elements.adminPinInput.value = "";
    elements.adminLoginModal.hidden = false;
    window.setTimeout(() => elements.adminPinInput.focus(), 30);
  }

  function closeAdminLogin() {
    elements.adminLoginModal.hidden = true;
  }

function openAdminPanel() {
  closeAdminLogin();

  document.body.style.overflow = "hidden";

  elements.adminPanel.classList.add("open");
  elements.adminPanel.setAttribute("aria-hidden", "false");

  renderAdmin();
}

function closeAdminPanel() {
  document.body.style.overflow = "";

  elements.adminPanel.classList.remove("open");
  elements.adminPanel.setAttribute("aria-hidden", "true");
}

  function renderAdmin() {
    $$(".admin-tab").forEach((button) => button.classList.toggle("active", button.dataset.adminSection === adminSection));
    const titleMap = {
      general: "General",
      apariencia: "Apariencia",
      carrusel: "Carrusel",
      productos: "Productos",
      categorias: "Categorias",
      whatsapp: "WhatsApp",
      datos: "Datos"
    };
    elements.adminTitle.textContent = titleMap[adminSection] || "General";

    const renderers = {
      general: renderGeneralAdmin,
      apariencia: renderAppearanceAdmin,
      carrusel: renderCarouselAdmin,
      productos: renderProductsAdmin,
      categorias: renderCategoriesAdmin,
      whatsapp: renderWhatsappAdmin,
      datos: renderDataAdmin
    };
    elements.adminContent.innerHTML = (renderers[adminSection] || renderGeneralAdmin)();
  }

  function renderGeneralAdmin() {
    return `
      <div class="admin-section">
        <div class="settings-panel">
          <h3>Identidad de la tienda</h3>
          <div class="admin-grid">
            ${field("Nombre de la tienda", "storeName", state.settings.storeName)}
            ${field("Frase corta", "tagline", state.settings.tagline)}
            ${field("Titulo del catalogo", "catalogTitle", state.settings.catalogTitle)}
            ${field("Subtitulo del catalogo", "catalogSubtitle", state.settings.catalogSubtitle)}
            ${field("Mensaje superior", "announcement", state.settings.announcement, "textarea")}
            ${field("Simbolo de moneda", "currency", state.settings.currency)}
            ${field("URL del logo", "logo", state.settings.logo)}
            ${fileField("Subir logo", "settings", "logo")}
            ${field("PIN admin", "adminPin", state.settings.adminPin, "password")}
          </div>
        </div>
      </div>
    `;
  }

  function renderAppearanceAdmin() {
    const colors = state.settings.colors;
    return `
      <div class="admin-section">
        <div class="settings-panel">
          <h3>Colores de la tienda</h3>
          <div class="admin-grid">
            ${colorField("Principal", "primary", colors.primary)}
            ${colorField("Acento carrito", "accent", colors.accent)}
            ${colorField("Fondo", "background", colors.background)}
            ${colorField("Superficie", "surface", colors.surface)}
            ${colorField("Texto", "text", colors.text)}
          </div>
        </div>
        <div class="settings-panel">
          <h3>Acciones rapidas</h3>
          <button class="button ghost" type="button" data-reset-colors>Restaurar colores iniciales</button>
        </div>
      </div>
    `;
  }

  function renderCarouselAdmin() {
    return `
      <div class="admin-section">
        <div class="data-actions">
          <button class="button primary" type="button" data-add-slide>Agregar foto al carrusel</button>
        </div>
        <div class="editor-list">
          ${state.slides.map((slide, index) => `
            <article class="editor-card">
              <div class="editor-card-head">
                <div>
                  <h3>Foto ${index + 1}</h3>
                  <p class="mini-copy">Se muestra en el encabezado de la tienda.</p>
                </div>
                <div class="editor-actions">
                  <button class="small-button danger" type="button" data-delete-slide="${escapeHtml(slide.id)}">Eliminar</button>
                </div>
              </div>
              <div class="media-preview"><img src="${escapeHtml(slide.image || "assets/hero-1.png")}" alt="${escapeHtml(slide.title || "Foto")}"></div>
              <div class="admin-grid">
                ${itemField("Titulo", "slide", slide.id, "title", slide.title)}
                ${itemField("Texto del boton", "slide", slide.id, "buttonText", slide.buttonText)}
                ${itemField("Descripcion", "slide", slide.id, "subtitle", slide.subtitle, "textarea")}
                ${itemField("URL de imagen", "slide", slide.id, "image", slide.image)}
                ${selectField("Categoria del boton", "slide", slide.id, "categoryId", slide.categoryId, true)}
                ${fileField("Subir imagen", "slide", "image", slide.id)}
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderProductsAdmin() {
    return `
      <div class="admin-section">
        <div class="data-actions">
          <button class="button primary" type="button" data-add-admin-product>Agregar producto</button>
        </div>
        <div class="editor-list">
          ${state.products.map((product) => `
            <article class="editor-card">
              <div class="editor-card-head">
                <div>
                  <h3>${escapeHtml(product.title || "Producto sin titulo")}</h3>
                  <p class="mini-copy">${money(product.price)} · Stock ${Number(product.stock || 0)} · ${escapeHtml(getCategoryName(product.categoryId))}</p>
                </div>
                <div class="editor-actions">
                  <button class="small-button" type="button" data-duplicate-product="${escapeHtml(product.id)}">Duplicar</button>
                  <button class="small-button danger" type="button" data-delete-product="${escapeHtml(product.id)}">Eliminar</button>
                </div>
              </div>
              <div class="media-preview"><img src="${escapeHtml(product.image || "assets/product-notebook.png")}" alt="${escapeHtml(product.title)}"></div>
              <div class="admin-grid">
                ${itemField("Titulo", "product", product.id, "title", product.title)}
                ${selectField("Categoria", "product", product.id, "categoryId", product.categoryId)}
                ${itemField("Precio", "product", product.id, "price", product.price, "number")}
                ${itemField("Stock", "product", product.id, "stock", product.stock, "number")}
                ${itemField("Descripcion", "product", product.id, "description", product.description, "textarea")}
                ${itemField("URL de imagen", "product", product.id, "image", product.image)}
                ${fileField("Subir imagen", "product", "image", product.id)}
                <label class="switch-row">
                  Producto visible
                  <input type="checkbox" data-product-id="${escapeHtml(product.id)}" data-product-field="active" ${product.active !== false ? "checked" : ""}>
                </label>
                <label class="switch-row">
                  Destacado
                  <input type="checkbox" data-product-id="${escapeHtml(product.id)}" data-product-field="featured" ${product.featured ? "checked" : ""}>
                </label>
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderCategoriesAdmin() {
    return `
      <div class="admin-section">
        <div class="data-actions">
          <button class="button primary" type="button" data-add-category>Agregar categoria</button>
        </div>
        <div class="editor-list">
          ${state.categories.map((category) => `
            <article class="editor-card">
              <div class="editor-card-head">
                <div>
                  <h3>${escapeHtml(category.name || "Categoria")}</h3>
                  <p class="mini-copy">${countProductsInCategory(category.id)} productos asignados</p>
                </div>
                <div class="editor-actions">
                  <button class="small-button danger" type="button" data-delete-category="${escapeHtml(category.id)}">Eliminar</button>
                </div>
              </div>
              <div class="admin-grid">
                ${itemField("Nombre", "category", category.id, "name", category.name)}
                ${itemField("Descripcion", "category", category.id, "description", category.description, "textarea")}
              </div>
            </article>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderWhatsappAdmin() {
    return `
      <div class="admin-section">
        <div class="settings-panel">
          <h3>Configuracion de pedidos</h3>
          <div class="admin-grid">
            ${field("Numero de WhatsApp con codigo de pais", "whatsappNumber", state.settings.whatsappNumber)}
            ${field("Mensaje inicial", "whatsappIntro", state.settings.whatsappIntro, "textarea")}
            ${field("Ayuda visible en checkout", "checkoutHint", state.settings.checkoutHint, "textarea")}
            <label class="switch-row admin-field-full">
              Descontar stock automaticamente al tocar enviar pedido
              <input type="checkbox" data-setting="autoDiscountStock" ${state.settings.autoDiscountStock ? "checked" : ""}>
            </label>
          </div>
          <p class="mini-copy">Formato recomendado para Argentina: 549 + codigo de area + numero, sin espacios.</p>
        </div>
      </div>
    `;
  }

  function renderDataAdmin() {
    return `
      <div class="admin-section">
        <div class="settings-panel">
          <h3>Backup y traspaso</h3>
          <p class="mini-copy">Exporta tu configuracion para guardarla o importala en otro navegador.</p>
          <div class="data-actions">
            <button class="button primary" type="button" data-export-store>Exportar JSON</button>
            <label class="button ghost">
              Importar JSON
              <input class="sr-only" type="file" accept="application/json" data-import-store>
            </label>
            <button class="button ghost" type="button" data-reset-demo>Restaurar demo</button>
          </div>
        </div>
      </div>
    `;
  }

  function field(label, key, value, type = "text") {
    if (type === "textarea") {
      return `
        <label class="admin-field-full">
          ${escapeHtml(label)}
          <textarea rows="3" data-setting="${escapeHtml(key)}">${escapeHtml(value)}</textarea>
        </label>
      `;
    }
    return `
      <label>
        ${escapeHtml(label)}
        <input type="${escapeHtml(type)}" data-setting="${escapeHtml(key)}" value="${escapeHtml(value)}">
      </label>
    `;
  }

  function itemField(label, type, id, key, value, inputType = "text") {
    const dataAttrs = `data-${type}-id="${escapeHtml(id)}" data-${type}-field="${escapeHtml(key)}"`;
    const fullClass = inputType === "textarea" ? "admin-field-full" : "";
    if (inputType === "textarea") {
      return `
        <label class="${fullClass}">
          ${escapeHtml(label)}
          <textarea rows="3" ${dataAttrs}>${escapeHtml(value)}</textarea>
        </label>
      `;
    }
    return `
      <label class="${fullClass}">
        ${escapeHtml(label)}
        <input type="${escapeHtml(inputType)}" ${dataAttrs} value="${escapeHtml(value)}" ${inputType === "number" ? "min=\"0\" step=\"1\"" : ""}>
      </label>
    `;
  }

  function colorField(label, key, value) {
    return `
      <div class="color-row">
        <label>
          ${escapeHtml(label)}
          <input type="text" data-color-text="${escapeHtml(key)}" value="${escapeHtml(value)}">
        </label>
        <input type="color" data-color="${escapeHtml(key)}" value="${escapeHtml(value)}" aria-label="${escapeHtml(label)}">
      </div>
    `;
  }

  function selectField(label, type, id, key, value, includeAll = false) {
    const options = [
      includeAll ? `<option value="all" ${value === "all" ? "selected" : ""}>Todos los productos</option>` : "",
      ...state.categories.map((category) => `
        <option value="${escapeHtml(category.id)}" ${value === category.id ? "selected" : ""}>${escapeHtml(category.name)}</option>
      `)
    ].join("");
    return `
      <label>
        ${escapeHtml(label)}
        <select data-${type}-id="${escapeHtml(id)}" data-${type}-field="${escapeHtml(key)}">${options}</select>
      </label>
    `;
  }

  function fileField(label, type, key, id = "") {
    const idAttr = id ? `data-${type}-id="${escapeHtml(id)}"` : "";
    return `
      <label>
        ${escapeHtml(label)}
        <input type="file" accept="image/*" data-upload-type="${escapeHtml(type)}" data-upload-key="${escapeHtml(key)}" ${idAttr}>
      </label>
    `;
  }

  function countProductsInCategory(categoryId) {
    return state.products.filter((product) => product.categoryId === categoryId).length;
  }

  function updateSetting(input) {
    const key = input.dataset.setting;
    const value = input.type === "checkbox" ? input.checked : input.value;
    state.settings[key] = value;
    saveState();
    renderStore();
  }

  function updateColor(input, key) {
    const value = input.value;
    state.settings.colors[key] = value;
    const paired = input.dataset.color ? $(`[data-color-text="${CSS.escape(key)}"]`) : $(`[data-color="${CSS.escape(key)}"]`);
    if (paired && paired.value !== value) paired.value = value;
    saveState();
    renderStore();
  }

  function updateCollectionItem(collection, id, fieldKey, input) {
    const item = state[collection].find((entry) => entry.id === id);
    if (!item) return;
    if (input.type === "checkbox") {
      item[fieldKey] = input.checked;
    } else if (input.type === "number") {
      item[fieldKey] = Math.max(0, Number(input.value || 0));
    } else {
      item[fieldKey] = input.value;
    }
    saveState();
    renderStore();
  }

  function addProduct() {
    const firstCategory = state.categories[0]?.id || "";
    state.products.unshift({
      id: uid("prod"),
      title: "Nuevo producto",
      price: 0,
      stock: 1,
      categoryId: firstCategory,
      description: "Describe el producto para que tus clientes lo entiendan rapido.",
      image: "assets/product-notebook.png",
      active: true,
      featured: false
    });
    saveState();
    renderStore();
    renderAdmin();
  }

  function duplicateProduct(productId) {
    const product = getProduct(productId);
    if (!product) return;
    state.products.unshift({ ...clone(product), id: uid("prod"), title: `${product.title} copia` });
    saveState();
    renderStore();
    renderAdmin();
  }

  function deleteProduct(productId) {
    state.products = state.products.filter((product) => product.id !== productId);
    cart = cart.filter((item) => item.productId !== productId);
    saveState();
    saveCart();
    renderStore();
    renderAdmin();
  }

  function addCategory() {
    state.categories.push({
      id: uid("cat"),
      name: "Nueva categoria",
      description: "Descripcion de la categoria."
    });
    saveState();
    renderStore();
    renderAdmin();
  }

  function deleteCategory(categoryId) {
    if (state.categories.length <= 1) {
      showToast("La tienda necesita al menos una categoria.");
      return;
    }
    const fallback = state.categories.find((category) => category.id !== categoryId)?.id || "";
    state.categories = state.categories.filter((category) => category.id !== categoryId);
    state.products.forEach((product) => {
      if (product.categoryId === categoryId) product.categoryId = fallback;
    });
    state.slides.forEach((slide) => {
      if (slide.categoryId === categoryId) slide.categoryId = "all";
    });
    if (activeCategory === categoryId) activeCategory = "all";
    saveState();
    renderStore();
    renderAdmin();
  }

  function addSlide() {
    state.slides.push({
      id: uid("slide"),
      title: "Nueva foto",
      subtitle: "Describe una promo, temporada o novedad.",
      buttonText: "Ver productos",
      categoryId: "all",
      image: "assets/hero-1.png"
    });
    saveState();
    renderStore();
    renderAdmin();
  }

  function deleteSlide(slideId) {
    state.slides = state.slides.filter((slide) => slide.id !== slideId);
    activeSlide = 0;
    saveState();
    renderStore();
    renderAdmin();
  }

  function handleImageUpload(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = reader.result;
      const type = input.dataset.uploadType;
      const key = input.dataset.uploadKey;
      if (type === "settings") {
        state.settings[key] = value;
      }
      if (type === "product") {
        const product = getProduct(input.dataset.productId);
        if (product) product[key] = value;
      }
      if (type === "slide") {
        const slide = state.slides.find((entry) => entry.id === input.dataset.slideId);
        if (slide) slide[key] = value;
      }
      saveState();
      renderStore();
      renderAdmin();
      showToast("Imagen cargada.");
    };
    reader.readAsDataURL(file);
  }

  function exportStore() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(state.settings.storeName || "tienda").toLowerCase().replace(/\s+/g, "-")}-config.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function importStore(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        state = mergeState(clone(defaultState), imported);
        activeCategory = "all";
        activeSlide = 0;
        saveState();
        renderStore();
        renderAdmin();
        showToast("Configuracion importada.");
      } catch (error) {
        showToast("El archivo no parece ser una configuracion valida.");
      }
    };
    reader.readAsText(file);
  }

  function resetDemo() {
    if (!window.confirm("Restaurar los productos y colores de ejemplo?")) return;
    state = clone(defaultState);
    cart = [];
    activeCategory = "all";
    activeSlide = 0;
    saveState();
    saveCart();
    renderStore();
    renderAdmin();
    showToast("Demo restaurada.");
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      const addButton = target.closest("[data-add-product]");
      const filterButton = target.closest("[data-category-filter]");
      const slideButton = target.closest("[data-slide-to]");
      const slideCategory = target.closest("[data-slide-category]");
      const focusButton = target.closest("[data-focus-product]");

      if (addButton) addToCart(addButton.dataset.addProduct);
      if (filterButton) {
        activeCategory = filterButton.dataset.categoryFilter;
        renderCatalogControls();
        renderProducts();
        document.getElementById("catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (slideButton) {
        activeSlide = Number(slideButton.dataset.slideTo || 0);
        renderCarousel();
      }
      if (target.closest("[data-carousel='prev']")) moveSlide(-1);
      if (target.closest("[data-carousel='next']")) moveSlide(1);
      if (slideCategory) {
        activeCategory = slideCategory.dataset.slideCategory || "all";
        renderCatalogControls();
        renderProducts();
        document.getElementById("catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (focusButton) focusProduct(focusButton.dataset.focusProduct);

      if (target.closest("#cartButton")) openCart();
      if (target.closest("[data-close-cart]") || target === elements.drawerBackdrop) closeCart();
      if (target.closest("[data-cart-inc]")) changeCartQuantity(target.closest("[data-cart-inc]").dataset.cartInc, 1);
      if (target.closest("[data-cart-dec]")) changeCartQuantity(target.closest("[data-cart-dec]").dataset.cartDec, -1);
      if (target.closest("[data-cart-remove]")) {
        cart = cart.filter((item) => item.productId !== target.closest("[data-cart-remove]").dataset.cartRemove);
        saveCart();
        renderProducts();
        renderCart();
      }
      if (target.closest("#checkoutWhatsapp")) checkoutWhatsapp();

      if (target.closest("#adminButton")) openAdminLogin();
      if (target.closest("[data-close-login]") || target === elements.adminLoginModal) closeAdminLogin();
      if (target.closest("[data-close-admin]")) closeAdminPanel();
      if (target.closest("[data-save-admin]")) {
        saveState();
        showToast("Cambios guardados.");
      }
      if (target.closest("[data-admin-section]")) {
        adminSection = target.closest("[data-admin-section]").dataset.adminSection;
        renderAdmin();
      }
      if (target.closest("[data-add-admin-product]")) addProduct();
      if (target.closest("[data-duplicate-product]")) duplicateProduct(target.closest("[data-duplicate-product]").dataset.duplicateProduct);
      if (target.closest("[data-delete-product]")) deleteProduct(target.closest("[data-delete-product]").dataset.deleteProduct);
      if (target.closest("[data-add-category]")) addCategory();
      if (target.closest("[data-delete-category]")) deleteCategory(target.closest("[data-delete-category]").dataset.deleteCategory);
      if (target.closest("[data-add-slide]")) addSlide();
      if (target.closest("[data-delete-slide]")) deleteSlide(target.closest("[data-delete-slide]").dataset.deleteSlide);
      if (target.closest("[data-reset-colors]")) {
        state.settings.colors = clone(defaultState.settings.colors);
        saveState();
        renderStore();
        renderAdmin();
      }
      if (target.closest("[data-export-store]")) exportStore();
      if (target.closest("[data-reset-demo]")) resetDemo();
    });

    document.addEventListener("input", (event) => {
      const input = event.target;
      if (input === elements.productSearch) updateSearchResults(input.value);
      if (input.id === "customerName") customer.name = input.value;
      if (input.id === "customerPhone") customer.phone = input.value;
      if (input.id === "customerAddress") customer.address = input.value;
      if (input.id === "customerNote") customer.note = input.value;
      if (input.matches("[data-setting]")) updateSetting(input);
      if (input.matches("[data-color]")) updateColor(input, input.dataset.color);
      if (input.matches("[data-color-text]")) updateColor(input, input.dataset.colorText);
      if (input.matches("[data-product-field]")) updateCollectionItem("products", input.dataset.productId, input.dataset.productField, input);
      if (input.matches("[data-category-field]")) updateCollectionItem("categories", input.dataset.categoryId, input.dataset.categoryField, input);
      if (input.matches("[data-slide-field]")) updateCollectionItem("slides", input.dataset.slideId, input.dataset.slideField, input);
    });

    document.addEventListener("change", (event) => {
      const input = event.target;
      if (input.matches("[data-upload-type]")) handleImageUpload(input);
      if (input.matches("[data-import-store]")) importStore(input.files && input.files[0]);
      if (input.matches("select[data-product-field]")) updateCollectionItem("products", input.dataset.productId, input.dataset.productField, input);
      if (input.matches("select[data-slide-field]")) updateCollectionItem("slides", input.dataset.slideId, input.dataset.slideField, input);
      if (input.matches("input[type='checkbox'][data-setting]")) updateSetting(input);
      if (input.matches("input[type='checkbox'][data-product-field]")) updateCollectionItem("products", input.dataset.productId, input.dataset.productField, input);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCart();
        closeAdminLogin();
        elements.searchResults.hidden = true;
      }
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".search-box")) elements.searchResults.hidden = true;
    });

    elements.adminLoginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (elements.adminPinInput.value === String(state.settings.adminPin || "")) {
        openAdminPanel();
      } else {
        showToast("PIN incorrecto.");
      }
    });
  }

  bindEvents();
  renderStore();
})();
