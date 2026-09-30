/* Thunder Gear - JavaScript Interactivity */

document.addEventListener("DOMContentLoaded", () => {

    /* STICKY HEADER */
    const header = document.querySelector("header");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    /* SMOOTH SCROLL */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", (e) => {
            const href = anchor.getAttribute("href");
            if (href === "#") return; // skip empty hash
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    const searchInput = document.querySelector(".search-box input, .search input");
    const productCards = document.querySelectorAll(".product-card");

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase().trim();
            if (productCards.length === 0 && query.length > 0) {
                return;
            }
            productCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(query)) {
                    card.style.display = "";
                    card.style.opacity = "1";
                    card.style.transform = "scale(1)";
                } else {
                    card.style.opacity = "0";
                    card.style.transform = "scale(0.95)";
                    setTimeout(() => {
                        if (!card.textContent.toLowerCase().includes(searchInput.value.toLowerCase().trim())) {
                            card.style.display = "none";
                        }
                    }, 250);
                }
            });
        });

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !window.location.pathname.includes("index.html") && window.location.pathname.includes("cart.html")) {
                window.location.href = "index.html#products";
            }
        });
    }

    /* GLOBAL KEYBOARD SHORTCUT (Ctrl+K or Cmd+K for search) */
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });

    /* MOBILE DRAWER TOGGLE */
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const mobileDrawer = document.getElementById("mobile-drawer");
    if (mobileToggle && mobileDrawer) {
        mobileToggle.addEventListener("click", () => {
            mobileDrawer.classList.toggle("open");
        });

        document.querySelectorAll(".mobile-nav-link").forEach(link => {
            link.addEventListener("click", () => {
                mobileDrawer.classList.remove("open");
            });
        });
    }

    /* PASSWORD SHOW / HIDE TOGGLE */
    document.querySelectorAll(".pwd-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = btn.closest(".input-with-icon").querySelector("input");
            if (input) {
                if (input.type === "password") {
                    input.type = "text";
                    btn.textContent = "🔒";
                } else {
                    input.type = "password";
                    btn.textContent = "👁️";
                }
            }
        });
    });

    /* MODAL HANDLING (Login, Signup, Checkout, Order Success) */
    const loginBtns = document.querySelectorAll(".login-btn, #header-login-btn");
    const loginModal = document.getElementById("login-modal");
    const modalClose = document.getElementById("modal-close");
    const loginOverlay = loginModal ? loginModal.querySelector(".modal-overlay") : null;

    const signupModal = document.getElementById("signup-modal");
    const signupClose = document.getElementById("signup-close");
    const signupOverlay = signupModal ? signupModal.querySelector(".modal-overlay") : null;
    const showSignupLink = document.getElementById("show-signup");
    const showLoginLink = document.getElementById("show-login");

    const checkoutModal = document.getElementById("checkout-modal");
    const checkoutClose = document.getElementById("checkout-close");
    const checkoutOverlay = checkoutModal ? checkoutModal.querySelector(".modal-overlay") : null;
    const openCheckoutBtn = document.getElementById("open-checkout-btn");
    const checkoutForm = document.getElementById("checkout-form");
    const checkoutModalTotal = document.getElementById("checkout-modal-total");

    const orderSuccessModal = document.getElementById("order-success-modal");
    const successClose = document.getElementById("success-close");
    const successOverlay = orderSuccessModal ? orderSuccessModal.querySelector(".modal-overlay") : null;

    function openModal(modal) {
        if (modal) {
            modal.classList.add("open");
            document.body.style.overflow = "hidden";
        }
    }

    function closeAllModals() {
        [loginModal, signupModal, checkoutModal, orderSuccessModal].forEach(m => {
            if (m) m.classList.remove("open");
        });
        document.body.style.overflow = "";
    }

    // Open login modal
    loginBtns.forEach(btn => {
        btn.addEventListener("click", () => openModal(loginModal));
    });

    // Close buttons
    if (modalClose) modalClose.addEventListener("click", closeAllModals);
    if (signupClose) signupClose.addEventListener("click", closeAllModals);
    if (checkoutClose) checkoutClose.addEventListener("click", closeAllModals);
    if (successClose) successClose.addEventListener("click", closeAllModals);

    // Close on overlay click
    if (loginOverlay) loginOverlay.addEventListener("click", closeAllModals);
    if (signupOverlay) signupOverlay.addEventListener("click", closeAllModals);
    if (checkoutOverlay) checkoutOverlay.addEventListener("click", closeAllModals);
    if (successOverlay) successOverlay.addEventListener("click", closeAllModals);

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllModals();
    });

    // Switch between Login ↔ Sign Up
    if (showSignupLink) {
        showSignupLink.addEventListener("click", (e) => {
            e.preventDefault();
            closeAllModals();
            setTimeout(() => openModal(signupModal), 100);
        });
    }
    if (showLoginLink) {
        showLoginLink.addEventListener("click", (e) => {
            e.preventDefault();
            closeAllModals();
            setTimeout(() => openModal(loginModal), 100);
        });
    }

    // Social Quick Login Demo
    document.querySelectorAll("#login-google, #login-discord").forEach(btn => {
        btn.addEventListener("click", () => {
            const provider = btn.id.includes("google") ? "Google" : "Discord";
            const demoEmail = `gamer_${Math.floor(Math.random()*1000)}@${provider.toLowerCase()}.com`;
            localStorage.setItem("thunderGearSession", JSON.stringify({
                userId: "user_" + Date.now(),
                email: demoEmail,
                name: "GamerPro",
                loggedInAt: new Date().toISOString()
            }));
            showToast(`✅ Authenticated with ${provider} as ${demoEmail}!`);
            closeAllModals();
            updateLoginState(demoEmail);
        });
    });

    // Checkout Modal open
    if (openCheckoutBtn) {
        openCheckoutBtn.addEventListener("click", () => {
            let currentCart = JSON.parse(localStorage.getItem("thunderGearCart") || "[]");
            if (currentCart.length === 0) {
                showToast("⚠️ Your battle cart is empty! Add gear first.");
                return;
            }
            let subtotal = 0;
            currentCart.forEach(item => {
                subtotal += parseInt(item.price.replace(/[^0-9]/g, "")) || 0;
            });
            if (checkoutModalTotal) {
                checkoutModalTotal.textContent = "₹" + subtotal.toLocaleString("en-IN");
            }
            openModal(checkoutModal);
        });
    }

    // Checkout Form Submit
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const orderId = "#TG-" + Math.floor(10000 + Math.random() * 90000);
            const name = document.getElementById("checkout-name")?.value || "Champion";

            // Clear Cart
            localStorage.setItem("thunderGearCart", JSON.stringify([]));
            cart = [];
            updateCartIcon();
            if (typeof renderCart === "function") {
                renderCart();
            }

            closeAllModals();

            // Show Success Modal
            const orderIdDisplay = document.getElementById("order-id-display");
            const orderSuccessText = document.getElementById("order-success-text");
            if (orderIdDisplay) orderIdDisplay.textContent = orderId;
            if (orderSuccessText) orderSuccessText.textContent = `Thank you, ${name}! Your order ${orderId} has been confirmed.`;

            setTimeout(() => {
                openModal(orderSuccessModal);
                showToast(`🎉 Order ${orderId} placed successfully!`);
            }, 200);
        });
    }

    // === JSON DATABASE HELPER ===
    const DB_KEY = "thunderGearDB";

    function getDB() {
        const data = localStorage.getItem(DB_KEY);
        if (data) {
            return JSON.parse(data);
        }
        // Initialize empty database structure
        const emptyDB = {
            appName: "Thunder Gear",
            version: "1.0",
            totalUsers: 0,
            users: []
        };
        localStorage.setItem(DB_KEY, JSON.stringify(emptyDB));
        return emptyDB;
    }

    function saveDB(db) {
        db.totalUsers = db.users.length;
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        // Log full JSON to console for viewing
        console.log("📦 Thunder Gear Database (JSON):");
        console.log(JSON.stringify(db, null, 2));
    }

    function generateId() {
        return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    }

    // === LOGIN FORM SUBMIT ===
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;

            const db = getDB();
            const user = db.users.find(u => u.email === email && u.password === password);

            if (user) {
                // Update last login time
                user.lastLogin = new Date().toISOString();
                user.loginCount = (user.loginCount || 0) + 1;
                saveDB(db);

                // Save current session
                localStorage.setItem("thunderGearSession", JSON.stringify({
                    userId: user.id,
                    email: user.email,
                    name: user.email.split("@")[0],
                    loggedInAt: new Date().toISOString()
                }));

                showToast("✅ Login successful! Welcome back, " + user.email);
                closeAllModals();
                loginForm.reset();
                updateLoginState(user.email);
            } else {
                showToast("❌ Invalid email or password. Please try again.");
            }
        });
    }

    // === SIGN UP FORM SUBMIT ===
    const signupForm = document.getElementById("signup-form");
    const signupError = document.getElementById("signup-error");

    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const phone = document.getElementById("signup-phone").value.trim();
            const email = document.getElementById("signup-email").value.trim();
            const password = document.getElementById("signup-password").value;
            const confirm = document.getElementById("signup-confirm").value;

            // Clear previous error
            if (signupError) signupError.textContent = "";

            // Validate passwords match
            if (password !== confirm) {
                if (signupError) {
                    signupError.textContent = "⚠️ Passwords do not match!";
                }
                return;
            }

            // Check if email already exists
            const db = getDB();
            if (db.users.find(u => u.email === email)) {
                if (signupError) {
                    signupError.textContent = "⚠️ An account with this email already exists!";
                }
                return;
            }

            // Create new user with full JSON data
            const newUser = {
                id: generateId(),
                phone: phone,
                email: email,
                password: password,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                loginCount: 1,
                status: "active"
            };

            db.users.push(newUser);
            saveDB(db);

            // Save current session
            localStorage.setItem("thunderGearSession", JSON.stringify({
                userId: newUser.id,
                email: newUser.email,
                name: newUser.email.split("@")[0],
                loggedInAt: new Date().toISOString()
            }));

            showToast("🎉 Account created successfully! Welcome to Thunder Gear!");
            closeAllModals();
            signupForm.reset();
            updateLoginState(email);
        });
    }

    // === Update header login button after login/signup ===
    function updateLoginState(email) {
        const username = email.split("@")[0];
        document.querySelectorAll(".login-btn, #header-login-btn").forEach(btn => {
            btn.innerHTML = `
                <span class="login-status-dot" style="background:#00ffaa; box-shadow:0 0 6px #00ffaa;"></span>
                <span>${username}</span>
            `;
            btn.classList.add("logged-in");
            btn.title = `Signed in as ${email} (Click to manage account)`;
        });
    }

    // === Restore session on page load ===
    const session = JSON.parse(localStorage.getItem("thunderGearSession") || "null");
    if (session) {
        updateLoginState(session.email);
    }

    // Log current DB on page load
    console.log("📦 Thunder Gear Database loaded:");
    console.log(JSON.stringify(getDB(), null, 2));

    /* PRODUCT FILTER TABS & CATEGORY FILTER */
    const filterTabs = document.querySelectorAll(".filter-tab");
    const allProductCards = document.querySelectorAll(".product-card");

    function filterProducts(category) {
        allProductCards.forEach(card => {
            const cardCat = card.getAttribute("data-category") || "";
            if (category === "all" || cardCat === category) {
                card.style.display = "";
                card.style.opacity = "1";
                card.style.transform = "scale(1)";
            } else {
                card.style.opacity = "0";
                card.style.transform = "scale(0.95)";
                setTimeout(() => {
                    if (card.getAttribute("data-category") !== category && category !== "all") {
                        card.style.display = "none";
                    }
                }, 250);
            }
        });
    }

    if (filterTabs.length > 0) {
        filterTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                filterTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                const filter = tab.getAttribute("data-filter") || "all";
                filterProducts(filter);
            });
        });
    }

    // Connect top categories section to filter tabs
    const categoryBoxes = document.querySelectorAll(".selected-iteam, .selected-item");
    categoryBoxes.forEach(box => {
        box.addEventListener("click", () => {
            const text = box.querySelector("p") ? box.querySelector("p").textContent.toLowerCase().trim() : "";
            let targetCategory = "all";
            if (text.includes("mouse")) targetCategory = "mouse";
            else if (text.includes("keyboard")) targetCategory = "keyboard";
            else if (text.includes("controller")) targetCategory = "controller";
            else if (text.includes("computer") || text.includes("pc")) targetCategory = "pc";

            // Activate matching tab
            filterTabs.forEach(t => {
                if (t.getAttribute("data-filter") === targetCategory) {
                    t.classList.add("active");
                } else {
                    t.classList.remove("active");
                }
            });

            filterProducts(targetCategory);

            // Scroll to products
            const productsSection = document.getElementById("products");
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    /* WISHLIST TOGGLE */
    const wishlistBtns = document.querySelectorAll(".wishlist-btn");
    wishlistBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.toggle("active");
            const card = btn.closest(".product-card");
            const name = card ? (card.querySelector(".product-name, h3, h2")?.textContent || "Item") : "Item";
            if (btn.classList.contains("active")) {
                btn.style.color = "#ff4757";
                showToast(`❤️ Saved "${name}" to your Wishlist!`);
            } else {
                btn.style.color = "";
                showToast(`💔 Removed "${name}" from Wishlist`);
            }
        });
    });

    /* NEWSLETTER SUBSCRIPTION */
    const newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("newsletter-email");
            if (emailInput && emailInput.value) {
                const email = emailInput.value.trim();
                showToast(`⚡ Welcome to Thunder Elite! 15% discount code THUNDER15 sent to ${email}`);
                emailInput.value = "";
            }
        });
    }

    /* BACK TO TOP */
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* CART SYSTEM */
    const cartBadge = document.getElementById("cart-badge");
    const cartBtn = document.querySelector(".cart-btn");

    // Redirect to cart page on click
    if (cartBtn) {
        cartBtn.addEventListener("click", () => {
            if (!window.location.href.includes("cart.html")) {
                window.location.href = "cart.html";
            }
        });
    }
    const buyButtons = document.querySelectorAll(".buy-now");

    // Initialize cart from storage
    let cart = JSON.parse(localStorage.getItem("thunderGearCart") || "[]");
    updateCartIcon();

    function updateCartIcon() {
        if (cartBadge) {
            cartBadge.textContent = cart.length;
            if (cart.length > 0) {
                cartBadge.classList.add("bump");
                setTimeout(() => cartBadge.classList.remove("bump"), 300);
            }
        }
    }

    // Add to Cart Logic
    if (buyButtons.length > 0) {
        buyButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const card = btn.closest(".product-card");

                // Extract product data safely
                const nameEl = card.querySelector(".product-name, h3, h2");
                const descEl = card.querySelector(".product-desc, p");
                const priceEl = card.querySelector(".price");
                const imgEl = card.querySelector("img");

                const product = {
                    id: Date.now() + Math.random().toString(36).substr(2, 4),
                    name: nameEl ? nameEl.textContent.trim() : "Gaming Gear",
                    desc: descEl ? descEl.textContent.trim() : "High performance esports peripheral",
                    price: priceEl ? priceEl.textContent.trim() : "₹1,999",
                    image: imgEl ? imgEl.src : "Assets/products1.png"
                };

                // Save to storage
                cart.push(product);
                localStorage.setItem("thunderGearCart", JSON.stringify(cart));
                updateCartIcon();

                showToast(`🛒 ${product.name} added to cart!`);
            });
        });
    }

    // Render Cart Page (only runs on cart.html)
    const cartItemsContainer = document.getElementById("cart-items");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const cartTotal = document.getElementById("cart-total");

    // Helper to parse price string "₹2,000" -> 2000
    function parsePrice(priceStr) {
        return parseInt(priceStr.replace(/[^0-9]/g, "")) || 0;
    }

    function renderCart() {
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart-box"><p class="empty-msg">Your battle cart is empty.</p><a href="index.html#products" class="shopnow" style="margin-top:15px;">Browse Arsenal</a></div>';
            if (cartSubtotal) cartSubtotal.textContent = "₹0";
            if (cartTotal) cartTotal.textContent = "₹0";
            return;
        }

        cart.forEach((item, index) => {
            total += parsePrice(item.price);

            const itemEl = document.createElement("div");
            itemEl.className = "cart-item";
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                    <div class="item-price">${item.price}</div>
                </div>
                <button class="remove-btn" data-index="${index}">Remove ✕</button>
            `;
            cartItemsContainer.appendChild(itemEl);
        });

        // Update totals
        const formattedTotal = "₹" + total.toLocaleString("en-IN");
        if (cartSubtotal) cartSubtotal.textContent = formattedTotal;
        if (cartTotal) cartTotal.textContent = formattedTotal;

        // Add remove handlers
        setTimeout(() => {
            document.querySelectorAll(".remove-btn").forEach(btn => {
                btn.addEventListener("click", (e) => {
                    const index = parseInt(e.target.getAttribute("data-index"));
                    cart.splice(index, 1);
                    localStorage.setItem("thunderGearCart", JSON.stringify(cart));
                    updateCartIcon();
                    renderCart();
                    showToast("🗑️ Item removed from cart");
                });
            });
        }, 0);
    }

    // Initial render if on cart page
    if (cartItemsContainer) {
        renderCart();
    }

    /* TOAST NOTIFICATION */
    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add("show");
        });

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400);
        }, 2800);
    }

    /* CYBER CINEMA CONTROLS & CART HOOKS */
    const muteBtns = document.querySelectorAll(".video-mute-btn");
    const playBtns = document.querySelectorAll(".video-play-btn");

    muteBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const videoId = btn.getAttribute("data-video");
            const video = document.getElementById(videoId);
            if (video) {
                video.muted = !video.muted;
                const icon = btn.querySelector(".sound-icon");
                if (icon) {
                    icon.textContent = video.muted ? "🔇" : "🔊";
                }
                showToast(video.muted ? "🔇 Video muted" : "🔊 Video unmuted");
            }
        });
    });

    playBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const videoId = btn.getAttribute("data-video");
            const video = document.getElementById(videoId);
            if (video) {
                if (video.paused) {
                    video.play();
                    const icon = btn.querySelector(".play-icon");
                    if (icon) icon.textContent = "⏸️";
                } else {
                    video.pause();
                    const icon = btn.querySelector(".play-icon");
                    if (icon) icon.textContent = "▶️";
                }
            }
        });
    });

    const cinemaBuyBtns = document.querySelectorAll(".buy-now-video");
    cinemaBuyBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const name = btn.getAttribute("data-name") || "DualSense Controller";
            const price = btn.getAttribute("data-price") || "₹6,499";
            const img = btn.getAttribute("data-img") || "Assets/controller-hero.png";

            const product = {
                id: Date.now() + Math.random().toString(36).substr(2, 4),
                name: name,
                desc: "Tournament-grade wireless esports controller with dynamic haptics",
                price: price,
                image: img
            };

            cart.push(product);
            localStorage.setItem("thunderGearCart", JSON.stringify(cart));
            updateCartIcon();
            showToast(`🎮 Added "${name}" (${price}) to Cart!`);
        });
    });

});
