document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu ul li a');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');

            // Toggle body scroll
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // Add staggered delay to child elements if they exist
                const staggerChildren = entry.target.querySelectorAll('.stagger-child');
                staggerChildren.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('active');
                    }, index * 150);
                });

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    // Smooth Scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Products Dataset is now loaded externally from products.js ---

    // --- Product Detail Page Functions ---
    const isProductDetail = window.location.pathname.includes('product-detail.html');
    if (isProductDetail) {
        const urlParams = new URLSearchParams(window.location.search);
        const nameParam = urlParams.get('name');

        let currentProduct = null;

        if (nameParam) {
            currentProduct = allProducts.find(p => p.name === nameParam);
        }

        if (currentProduct) {
            // Update page with product from allProducts catalog
            document.getElementById('product-name').textContent = currentProduct.name;
            document.querySelector('.product-price').textContent = '₹' + currentProduct.price.toLocaleString();
            document.getElementById('product-img').src = currentProduct.image;
            document.getElementById('product-category-label').textContent = currentProduct.category.toUpperCase();

            // Find related products (same category, excluding current product)
            const relatedContainer = document.getElementById('related-products-container');
            if (relatedContainer) {
                const relatedProducts = allProducts.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id);

                if (relatedProducts.length > 0) {
                    relatedContainer.innerHTML = relatedProducts.map(product => `
                        <div class="product-card">
                            <a href="product-detail.html?name=${encodeURIComponent(product.name)}&price=${product.price}&img=${encodeURIComponent(product.image)}">
                                <div class="product-img">
                                    <img src="${product.image}" alt="${product.name}">
                                    <span class="product-action">View Details</span>
                                </div>
                                <div class="product-info">
                                    <h3>${product.name}</h3>
                                    <p>${product.category.toUpperCase()}</p>
                                    <span class="price">₹${product.price.toLocaleString()}</span>
                                </div>
                            </a>
                        </div>
                    `).join('');
                } else {
                    relatedContainer.innerHTML = '<p style="padding: 20px;">No related products found.</p>';
                }
            }
        } else {
            // Fallback to URL params if product not in catalog (e.g., from old links)
            const price = urlParams.get('price');
            const img = urlParams.get('img');
            if (nameParam) document.getElementById('product-name').textContent = nameParam;
            if (price) document.querySelector('.product-price').textContent = '₹' + price;
            if (img) document.getElementById('product-img').src = img;

            // Hide related products section since category is unknown
            const relatedContainer = document.getElementById('related-products-container');
            if (relatedContainer) relatedContainer.innerHTML = '<p style="padding: 20px;">No related products found.</p>';
        }
    }

    // --- Collections Page Functions ---
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        let currentCategory = 'all';
        let currentSort = 'featured';

        const renderProducts = () => {
            let filtered = currentCategory === 'all' ? allProducts : allProducts.filter(p => p.category === currentCategory);

            if (currentSort === 'price-low') filtered.sort((a, b) => a.price - b.price);
            if (currentSort === 'price-high') filtered.sort((a, b) => b.price - a.price);
            if (currentSort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));

            productsGrid.innerHTML = filtered.map(product => `
                <div class="product-card active">
                    <a href="product-detail.html?name=${encodeURIComponent(product.name)}&price=${product.price}&img=${encodeURIComponent(product.image)}">
                        <div class="product-img">
                            <img src="${product.image}" alt="${product.name}">
                            <span class="product-action">View Details</span>
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p>${product.category.toUpperCase()}</p>
                            <span class="price">₹${product.price.toLocaleString()}</span>
                        </div>
                    </a>
                </div>
            `).join('');
        };

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentCategory = e.target.dataset.category;
                renderProducts();
            });
        });

        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                renderProducts();
            });
        }

        renderProducts();
    }

    // --- Cart System ---
    let cart = JSON.parse(localStorage.getItem('aspa_cart')) || [];

    const updateCartCount = () => {
        const countElements = document.querySelectorAll('#cart-count');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        countElements.forEach(el => el.textContent = totalItems);
    };

    const saveCart = () => {
        localStorage.setItem('aspa_cart', JSON.stringify(cart));
        updateCartCount();
    };

    // Add to Cart Logic
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const name = document.getElementById('product-name').textContent;
            const priceText = document.querySelector('.product-price').textContent;
            const price = parseInt(priceText.replace('₹', '').replace(',', ''));
            const image = document.getElementById('product-img').src;

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id: Date.now(), name, price, image, quantity: 1 });
            }

            saveCart();
            alert(`${name} added to cart!`);
        });
    }

    // Render Cart Page (Card Layout)
    const cartContainer = document.getElementById('cart-container');
    if (cartContainer) {
        if (cart.length === 0) {
            cartContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty. <br><br> <a href="collections.html" class="btn-premium">Start Shopping</a></div>';
            const cartFooter = document.getElementById('cart-footer');
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            let total = 0;
            let cartHtml = '<div class="cart-card-list">';
            cart.forEach((item, index) => {
                total += item.price * item.quantity;
                cartHtml += `
                    <div class="cart-card">
                        <img src="${item.image}" class="cart-card-img">
                        <div class="cart-card-info">
                            <h3>${item.name}</h3>
                            <p>Unit Price: ₹${item.price.toLocaleString()}</p>
                            <span class="remove-item" style="display:inline-block; margin-top: 10px;" onclick="removeItem(${index})">Remove</span>
                        </div>
                        <div class="cart-card-actions">
                            <div class="quantity-control">
                                <button class="q-btn" onclick="updateQty(${index}, -1)">-</button>
                                <span>${item.quantity}</span>
                                <button class="q-btn" onclick="updateQty(${index}, 1)">+</button>
                            </div>
                            <div class="cart-card-price">₹${(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                    </div>
                `;
            });
            cartHtml += '</div>';
            cartContainer.innerHTML = cartHtml;
            const cartFooter = document.getElementById('cart-footer');
            if (cartFooter) {
                cartFooter.style.display = 'block';
                document.getElementById('cart-total-amount').textContent = '₹' + total.toLocaleString();
            }
        }
    }

    window.updateQty = (index, change) => {
        if (cart[index].quantity + change > 0) {
            cart[index].quantity += change;
            saveCart();
            location.reload();
        }
    };

    window.removeItem = (index) => {
        cart.splice(index, 1);
        saveCart();
        location.reload();
    };

    // Render Checkout Summary
    const summaryContainer = document.getElementById('summary-items');
    if (summaryContainer) {
        let summaryHtml = '';
        let total = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            summaryHtml += `
                <div class="summary-item">
                    <span>${item.name} x ${item.quantity}</span>
                    <span>₹${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `;
        });
        summaryContainer.innerHTML = summaryHtml;
        const totalEl = document.getElementById('summary-total');
        if (totalEl) totalEl.textContent = '₹' + total.toLocaleString();
    }

    window.finalizeOrder = () => {
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;

        if (!name || !phone || !address) {
            alert("Please fill in all details");
            return;
        }

        let orderDetails = `*New Order from AspaFashions*%0A%0A`;
        orderDetails += `*Customer Details:*%0AName: ${name}%0APhone: ${phone}%0AAddress: ${address}%0A%0A`;
        orderDetails += `*Order Summary:*%0A`;

        let total = 0;
        cart.forEach(item => {
            orderDetails += `- ${item.name} (x${item.quantity}): ₹${(item.price * item.quantity).toLocaleString()}%0A`;
            total += item.price * item.quantity;
        });

        orderDetails += `%0A*Total Amount: ₹${total.toLocaleString()}*`;

        const whatsappNumber = "919876543210";
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${orderDetails}`;

        localStorage.removeItem('aspa_cart');
        window.location.href = whatsappUrl;
    };

    updateCartCount();
});
