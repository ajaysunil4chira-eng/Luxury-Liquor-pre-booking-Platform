/**
 * Script.js - Professional Client-side Application
 * Luxury Liquor Store Management System
 * 
 * Features:
 * - Product catalog management
 * - Shopping cart functionality with localStorage persistence
 * - Order processing and validation
 * - ETA calculation system
 * - Responsive UI updates
 * 
 * @version 1.0.0
 * @author Luxury Liquor Store
 */

'use strict';

/* ========================================
   APPLICATION CONFIGURATION & DATA
   ======================================== */

/**
 * Product catalog and promotional offers
 * @constant {Object} PRODUCT_CATALOG
 */
const PRODUCT_CATALOG = {
  products: [
    {
      id: 'jack-premium-whisky',
      name: 'Premium Whisky - Jack Daniels',
      price: 1299,
      abv: 40,
      image: 'images/jack.jpg',
      category: 'whisky',
      description: 'Tennessee whiskey with smooth vanilla finish'
    },
    {
      id: 'jameson-irish-whisky',
      name: 'Jameson Irish Whisky',
      price: 1199,
      abv: 40,
      image: 'images/jameson.jpg',
      category: 'whisky',
      description: 'Triple-distilled Irish whiskey with citrus notes'
    },
    {
      id: 'luxury-premium-vodka',
      name: 'Luxury Premium Vodka',
      price: 999,
      abv: 40,
      image: 'images/vodka.jpg',
      category: 'vodka',
      description: 'Ultra-pure vodka with crystal clarity'
    },
    {
      id: 'black-tot-rum',
      name: 'Black Tot Premium Rum',
      price: 899,
      abv: 42,
      image: 'images/blacktot.jpg',
      category: 'rum',
      description: 'Caribbean rum with rich molasses flavor'
    },
    {
      id: 'black-white-scotch',
      name: 'Black & White Scotch Whisky',
      price: 1099,
      abv: 43,
      image: 'images/blackwhite.jpg',
      category: 'whisky',
      description: 'Blended Scotch with smoky undertones'
    },
    {
      id: 'old-monk-rum',
      name: 'Old Monk Dark Rum',
      price: 499,
      abv: 42,
      image: 'images/oldmonk.jpg',
      category: 'rum',
      description: 'Classic Indian dark rum with vanilla notes'
    }
  ],
  
  offers: [
    {
      id: 'seasonal-offer',
      title: 'Seasonal Tasting',
      description: 'Complimentary tasting sample with every premium bottle purchase.',
      validUntil: '2025-12-31',
      minOrderValue: 1000
    },
    {
      id: 'bulk-discount',
      title: 'Volume Discount',
      description: '5% off for 3+ bottles in a single order. Perfect for celebrations.',
      validUntil: '2025-12-31',
      minQuantity: 3
    },
    {
      id: 'weekend-priority',
      title: 'Priority Dispatch',
      description: 'Orders placed on Friday receive priority weekend dispatch.',
      validUntil: '2025-12-31',
      applicableDays: ['friday']
    }
  ]
};

/**
 * Application configuration constants
 * @constant {Object} CONFIG
 */
const CONFIG = {
  STORAGE_KEYS: {
    SELECTED_PRODUCT: 'luxe_liquor_selected_product',
    BOOKING_DATA: 'luxe_liquor_booking_data',
    USER_PREFERENCES: 'luxe_liquor_user_prefs'
  },
  
  DELIVERY: {
    MIN_DAYS: 2,
    MAX_DAYS: 5,
    WEEKEND_DELAY: 1
  },
  
  VALIDATION: {
    PHONE_REGEX: /^[6-9]\d{9}$/,
    PIN_REGEX: /^\d{6}$/,
    MIN_NAME_LENGTH: 2,
    MIN_ADDRESS_LENGTH: 10
  },
  
  CURRENCY: {
    SYMBOL: '₹',
    LOCALE: 'en-IN'
  }
};

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

/**
 * Enhanced DOM query utilities
 */
const DOM = {
  /**
   * Select single element
   * @param {string} selector - CSS selector
   * @returns {Element|null}
   */
  select: (selector) => document.querySelector(selector),
  
  /**
   * Select multiple elements
   * @param {string} selector - CSS selector
   * @returns {Element[]}
   */
  selectAll: (selector) => Array.from(document.querySelectorAll(selector)),
  
  /**
   * Create element with attributes and content
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {string} content - Inner HTML content
   * @returns {Element}
   */
  create: (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });
    if (content) element.innerHTML = content;
    return element;
  }
};

/**
 * Currency formatting utility
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    console.warn('Invalid amount provided to formatCurrency:', amount);
    return `${CONFIG.CURRENCY.SYMBOL}0`;
  }
  return `${CONFIG.CURRENCY.SYMBOL}${amount.toLocaleString(CONFIG.CURRENCY.LOCALE)}`;
};

/**
 * Local storage utilities with error handling
 */
const Storage = {
  /**
   * Set item in localStorage with error handling
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success status
   */
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage setItem error:', error);
      return false;
    }
  },
  
  /**
   * Get item from localStorage with error handling
   * @param {string} key - Storage key
   * @returns {*|null} Retrieved value or null
   */
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  },
  
  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return false;
    }
  },
  
  /**
   * Clear all app-related storage
   */
  clearAll: () => {
    Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
      Storage.removeItem(key);
    });
  }
};

/**
 * Input validation utilities
 */
const Validator = {
  /**
   * Validate customer name
   * @param {string} name - Customer name
   * @returns {Object} Validation result
   */
  validateName: (name) => {
    const trimmedName = (name || '').trim();
    const isValid = trimmedName.length >= CONFIG.VALIDATION.MIN_NAME_LENGTH;
    return {
      isValid,
      message: isValid ? '' : `Name must be at least ${CONFIG.VALIDATION.MIN_NAME_LENGTH} characters long`
    };
  },
  
  /**
   * Validate Indian phone number
   * @param {string} phone - Phone number
   * @returns {Object} Validation result
   */
  validatePhone: (phone) => {
    const trimmedPhone = (phone || '').trim().replace(/\s+/g, '');
    const isValid = CONFIG.VALIDATION.PHONE_REGEX.test(trimmedPhone);
    return {
      isValid,
      value: trimmedPhone,
      message: isValid ? '' : 'Please enter a valid 10-digit Indian mobile number'
    };
  },
  
  /**
   * Validate address
   * @param {string} address - Customer address
   * @returns {Object} Validation result
   */
  validateAddress: (address) => {
    const trimmedAddress = (address || '').trim();
    const isValid = trimmedAddress.length >= CONFIG.VALIDATION.MIN_ADDRESS_LENGTH;
    return {
      isValid,
      message: isValid ? '' : `Address must be at least ${CONFIG.VALIDATION.MIN_ADDRESS_LENGTH} characters long`
    };
  },
  
  /**
   * Validate PIN code
   * @param {string} pin - PIN code
   * @returns {Object} Validation result
   */
  validatePIN: (pin) => {
    const trimmedPIN = (pin || '').trim();
    const isValid = CONFIG.VALIDATION.PIN_REGEX.test(trimmedPIN);
    return {
      isValid,
      message: isValid ? '' : 'Please enter a valid 6-digit PIN code'
    };
  }
};

/* ========================================
   CORE APPLICATION MODULES
   ======================================== */

/**
 * Product management module
 */
const ProductManager = {
  /**
   * Get all products
   * @returns {Array} Array of products
   */
  getAllProducts: () => [...PRODUCT_CATALOG.products],
  
  /**
   * Get product by ID
   * @param {string} productId - Product identifier
   * @returns {Object|null} Product object or null
   */
  getProductById: (productId) => {
    return PRODUCT_CATALOG.products.find(product => product.id === productId) || null;
  },
  
  /**
   * Get products by category
   * @param {string} category - Product category
   * @returns {Array} Filtered products
   */
  getProductsByCategory: (category) => {
    return PRODUCT_CATALOG.products.filter(product => product.category === category);
  },
  
  /**
   * Search products by name
   * @param {string} query - Search query
   * @returns {Array} Matching products
   */
  searchProducts: (query) => {
    const searchTerm = query.toLowerCase().trim();
    return PRODUCT_CATALOG.products.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }
};

/**
 * Selection management module
 */
const SelectionManager = {
  /**
   * Select a product
   * @param {string} productId - Product ID to select
   * @returns {boolean} Success status
   */
  selectProduct: (productId) => {
    const product = ProductManager.getProductById(productId);
    if (!product) {
      console.warn('Product not found:', productId);
      return false;
    }
    
    const success = Storage.setItem(CONFIG.STORAGE_KEYS.SELECTED_PRODUCT, product);
    if (success) {
      UIManager.updateSelectedSummary();
      UIManager.showNotification('Product selected successfully', 'success');
    }
    return success;
  },
  
  /**
   * Get currently selected product
   * @returns {Object|null} Selected product or null
   */
  getSelectedProduct: () => {
    return Storage.getItem(CONFIG.STORAGE_KEYS.SELECTED_PRODUCT);
  },
  
  /**
   * Clear product selection
   * @returns {boolean} Success status
   */
  clearSelection: () => {
    const success = Storage.removeItem(CONFIG.STORAGE_KEYS.SELECTED_PRODUCT);
    if (success) {
      UIManager.updateSelectedSummary();
    }
    return success;
  }
};

/**
 * Order management module
 */
const OrderManager = {
  /**
   * Generate estimated delivery date
   * @returns {Object} ETA information
   */
  generateETA: () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Add weekend delay if ordered on weekend
    let baseDays = Math.floor(Math.random() * (CONFIG.DELIVERY.MAX_DAYS - CONFIG.DELIVERY.MIN_DAYS + 1)) + CONFIG.DELIVERY.MIN_DAYS;
    
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      baseDays += CONFIG.DELIVERY.WEEKEND_DELAY;
    }
    
    const deliveryDate = new Date(today.getTime() + baseDays * 24 * 60 * 60 * 1000);
    
    return {
      date: deliveryDate,
      dateString: deliveryDate.toLocaleDateString(CONFIG.CURRENCY.LOCALE, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      daysFromNow: baseDays,
      relative: baseDays === 1 ? 'Tomorrow' : `${baseDays} days`
    };
  },
  
  /**
   * Generate unique order ID
   * @returns {string} Order ID
   */
  generateOrderId: () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 4);
    return `LLX-${timestamp}-${random}`.toUpperCase();
  },
  
  /**
   * Validate order form data
   * @param {Object} formData - Form data to validate
   * @returns {Object} Validation results
   */
  validateOrderForm: (formData) => {
    const errors = {};
    let isValid = true;
    
    // Validate name
    const nameValidation = Validator.validateName(formData.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.message;
      isValid = false;
    }
    
    // Validate phone
    const phoneValidation = Validator.validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message;
      isValid = false;
    }
    
    // Validate address
    const addressValidation = Validator.validateAddress(formData.address);
    if (!addressValidation.isValid) {
      errors.address = addressValidation.message;
      isValid = false;
    }
    
    // Validate city
    if (!formData.city || formData.city.trim().length < 2) {
      errors.city = 'Please enter a valid city name';
      isValid = false;
    }
    
    // Validate PIN
    const pinValidation = Validator.validatePIN(formData.pin);
    if (!pinValidation.isValid) {
      errors.pin = pinValidation.message;
      isValid = false;
    }
    
    // Validate payment method
    if (!formData.payment) {
      errors.payment = 'Please select a payment method';
      isValid = false;
    }
    
    // Validate quantity
    const quantity = parseInt(formData.quantity, 10);
    if (isNaN(quantity) || quantity < 1 || quantity > 10) {
      errors.quantity = 'Quantity must be between 1 and 10';
      isValid = false;
    }
    
    return { isValid, errors, validatedData: { ...formData, phone: phoneValidation.value } };
  },
  
  /**
   * Process order submission
   * @param {Object} formData - Order form data
   * @returns {Object} Processing result
   */
  processOrder: (formData) => {
    const selectedProduct = SelectionManager.getSelectedProduct();
    if (!selectedProduct) {
      return {
        success: false,
        error: 'No product selected. Please select a product from the menu first.'
      };
    }
    
    const validation = OrderManager.validateOrderForm(formData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }
    
    const orderId = OrderManager.generateOrderId();
    const eta = OrderManager.generateETA();
    
    const booking = {
      id: orderId,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      customer: validation.validatedData,
      product: selectedProduct,
      eta,
      totalAmount: selectedProduct.price * parseInt(validation.validatedData.quantity, 10)
    };
    
    const success = Storage.setItem(CONFIG.STORAGE_KEYS.BOOKING_DATA, booking);
    
    return {
      success,
      booking: success ? booking : null,
      error: success ? null : 'Failed to save order. Please try again.'
    };
  }
};

/**
 * UI Management module
 */
const UIManager = {
  /**
   * Show notification to user
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info)
   * @param {number} duration - Duration in milliseconds
   */
  showNotification: (message, type = 'info', duration = 3000) => {
    // Remove existing notifications
    const existingNotification = DOM.select('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const notification = DOM.create('div', {
      className: `notification notification-${type}`,
      style: `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--accent)' : type === 'error' ? '#e74c3c' : 'var(--panel)'};
        color: ${type === 'success' ? '#120800' : '#f5f5f5'};
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
      `
    }, message);
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  },
  
  /**
   * Render product grid for menu page
   */
  renderMenuGrid: () => {
    const grid = DOM.select('#menuGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    const products = ProductManager.getAllProducts();
    
    products.forEach(product => {
      const productElement = DOM.create('div', 
        { className: 'product' },
        `
          <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='images/placeholder.jpg'" />
          <div class="name">${product.name}</div>
          <div class="meta">${product.abv}% ABV • ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
          <div class="price">${formatCurrency(product.price)}</div>
          <button class="select-btn" data-id="${product.id}">Select Product</button>
        `
      );
      
      grid.appendChild(productElement);
    });
    
    // Attach event listeners to select buttons
    DOM.selectAll('.select-btn').forEach(button => {
      button.addEventListener('click', (event) => {
        const productId = event.currentTarget.dataset.id;
        const success = SelectionManager.selectProduct(productId);
        
        if (success) {
          // Update visual feedback
          DOM.selectAll('.select-btn').forEach(btn => btn.classList.remove('selected'));
          event.currentTarget.classList.add('selected');
        }
      });
    });
    
    // Highlight pre-selected product
    const selectedProduct = SelectionManager.getSelectedProduct();
    if (selectedProduct) {
      const selectedButton = DOM.select(`.select-btn[data-id="${selectedProduct.id}"]`);
      if (selectedButton) {
        selectedButton.classList.add('selected');
      }
    }
  },
  
  /**
   * Update selected product summary
   */
  updateSelectedSummary: () => {
    const summaryElement = DOM.select('#selectedSummary');
    if (!summaryElement) return;
    
    const selectedProduct = SelectionManager.getSelectedProduct();
    
    if (!selectedProduct) {
      summaryElement.innerHTML = `
        <div style="color: var(--muted); text-align: center; padding: 20px;">
          <p>No product selected</p>
          <a href="menu.html" class="btn">Browse Products</a>
        </div>
      `;
      return;
    }
    
    summaryElement.innerHTML = `
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        <img src="${selectedProduct.image}" alt="${selectedProduct.name}" 
             style="width: 72px; height: 56px; object-fit: cover; border-radius: 8px;"
             onerror="this.src='images/placeholder.jpg'" />
        <div style="flex: 1; min-width: 200px;">
          <div style="font-weight: 700; margin-bottom: 4px;">${selectedProduct.name}</div>
          <div style="color: var(--muted); font-size: 13px;">
            ${selectedProduct.abv}% ABV • ${formatCurrency(selectedProduct.price)}
          </div>
          ${selectedProduct.description ? `<div style="color: var(--muted); font-size: 12px; margin-top: 2px;">${selectedProduct.description}</div>` : ''}
        </div>
        <button onclick="SelectionManager.clearSelection()" class="btn" style="font-size: 12px;">
          Change Selection
        </button>
      </div>
    `;
  },
  
  /**
   * Render offers list
   */
  renderOffers: () => {
    const container = DOM.select('#offersList');
    if (!container) return;
    
    container.innerHTML = '';
    
    PRODUCT_CATALOG.offers.forEach(offer => {
      const offerElement = DOM.create('div',
        { className: 'offer' },
        `
          <div class="title">${offer.title}</div>
          <div class="sub">${offer.description}</div>
          ${offer.validUntil ? `<div style="font-size: 11px; color: var(--muted); margin-top: 6px;">Valid until: ${new Date(offer.validUntil).toLocaleDateString(CONFIG.CURRENCY.LOCALE)}</div>` : ''}
        `
      );
      
      container.appendChild(offerElement);
    });
  },
  
  /**
   * Display form validation errors
   * @param {Object} errors - Error object
   */
  displayFormErrors: (errors) => {
    // Clear existing errors
    DOM.selectAll('.error-message').forEach(el => el.remove());
    DOM.selectAll('.error').forEach(el => el.classList.remove('error'));
    
    // Display new errors
    Object.entries(errors).forEach(([field, message]) => {
      const input = DOM.select(`#${field}`) || DOM.select(`[name="${field}"]`);
      if (input) {
        input.classList.add('error');
        const errorElement = DOM.create('div', 
          { className: 'error-message' },
          message
        );
        errorElement.style.cssText = 'color: #e74c3c; font-size: 12px; margin-top: 4px;';
        input.parentNode.appendChild(errorElement);
      }
    });
  },
  
  /**
   * Render order confirmation
   */
  renderConfirmation: () => {
    const wrapper = DOM.select('#confirmationWrap');
    if (!wrapper) return;
    
    const booking = Storage.getItem(CONFIG.STORAGE_KEYS.BOOKING_DATA);
    
    if (!booking) {
      wrapper.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <h3 style="color: var(--muted); margin-bottom: 16px;">No Order Found</h3>
          <p style="color: var(--muted); margin-bottom: 20px;">
            We couldn't find your order details. Please place a new order.
          </p>
          <a href="menu.html" class="cta">Browse Products</a>
        </div>
      `;
      return;
    }
    
    const { product, customer, eta, totalAmount, id: orderId, createdAt } = booking;
    
    wrapper.innerHTML = `
      <div class="booking card">
        <div class="booking-header" style="display: flex; justify-content: space-between; align-items: start; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
          <div style="display: flex; gap: 12px; align-items: center; flex: 1; min-width: 300px;">
            <img src="${product.image}" alt="${product.name}" 
                 style="width: 96px; height: 72px; object-fit: cover; border-radius: 8px;"
                 onerror="this.src='images/placeholder.jpg'" />
            <div>
              <div style="font-weight: 800; font-size: 18px; margin-bottom: 4px;">${product.name}</div>
              <div style="color: var(--muted); margin-bottom: 2px;">${product.abv}% ABV</div>
              <div style="color: var(--accent); font-weight: 700;">${customer.qty} × ${formatCurrency(product.price)} = ${formatCurrency(totalAmount)}</div>
            </div>
          </div>
          
          <div style="text-align: right; min-width: 200px;">
            <div class="eta" style="font-size: 16px; font-weight: 700; color: var(--accent); margin-bottom: 4px;">
              Expected Delivery: ${eta.dateString}
            </div>
            <div class="order-id" style="color: var(--muted); font-size: 13px; margin-bottom: 2px;">
              Order ID: ${orderId}
            </div>
            <div style="color: var(--muted); font-size: 12px;">
              Placed: ${new Date(createdAt).toLocaleDateString(CONFIG.CURRENCY.LOCALE)}
            </div>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.04); margin: 20px 0;" />

        <div class="booking-details" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
          <div>
            <h4 style="color: var(--muted); font-size: 14px; margin-bottom: 8px;">Customer Information</h4>
            <div style="font-weight: 700; margin-bottom: 4px;">${customer.name}</div>
            <div style="color: var(--muted); margin-bottom: 4px;">${customer.phone}</div>
            <div style="color: var(--muted); font-size: 14px; line-height: 1.4;">
              ${customer.address}<br>
              ${customer.city} - ${customer.pin}
            </div>
          </div>

          <div>
            <h4 style="color: var(--muted); font-size: 14px; margin-bottom: 8px;">Order Details</h4>
            <div style="margin-bottom: 4px;">
              <span style="font-weight: 700;">${customer.qty}</span> × ${product.name}
            </div>
            <div style="color: var(--muted); margin-bottom: 4px; font-size: 14px;">
              Payment: ${customer.payment}
            </div>
            <div style="color: var(--accent); font-weight: 700; font-size: 16px;">
              Total: ${formatCurrency(totalAmount)}
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 24px; flex-wrap: wrap;">
          <a href="menu.html" class="btn">Place New Order</a>
          <button onclick="window.print()" class="btn">Print Receipt</button>
        </div>
      </div>
    `;
  }
};

/* ========================================
   PAGE INITIALIZATION FUNCTIONS
   ======================================== */

/**
 * Initialize menu page
 */
const initMenuPage = () => {
  console.log('Initializing menu page...');
  
  UIManager.renderMenuGrid();
  UIManager.updateSelectedSummary();
  
  // Add search functionality if search input exists
  const searchInput = DOM.select('#productSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      const query = event.target.value;
      // Implement search functionality here if needed
      console.log('Search query:', query);
    });
  }
  
  console.log('Menu page initialized successfully');
};

/**
 * Initialize order page
 */
const initOrderPage = () => {
  console.log('Initializing order page...');
  
  UIManager.updateSelectedSummary();
  
  const orderForm = DOM.select('#orderForm');
  const submitButton = DOM.select('#submitOrder');
  
  const handleOrderSubmit = (event) => {
    event.preventDefault();
    
    // Collect form data
    const formData = {
      name: DOM.select('#customerName')?.value || '',
      phone: DOM.select('#phone')?.value || '',
      address: DOM.select('#address')?.value || '',
      city: DOM.select('#city')?.value || '',
      pin: DOM.select('#pin')?.value || '',
      payment: DOM.select('#payment')?.value || '',
      quantity: DOM.select('#quantity')?.value || '1'
    };
    
    // Process the order
    const result = OrderManager.processOrder(formData);
    
    if (result.success) {
      // Clear form errors
      DOM.selectAll('.error-message').forEach(el => el.remove());
      DOM.selectAll('.error').forEach(el => el.classList.remove('error'));
      
      // Show success message
      UIManager.showNotification('Order placed successfully! Redirecting...', 'success');
      
      // Redirect to confirmation page
      setTimeout(() => {
        window.location.href = 'confirmation.html';
      }, 1500);
    } else {
      // Display errors
      if (result.errors) {
        UIManager.displayFormErrors(result.errors);
        UIManager.showNotification('Please correct the errors below', 'error');
      } else {
        UIManager.showNotification(result.error || 'Failed to place order', 'error');
      }
    }
  };
  
  // Attach event listeners
  if (orderForm) {
    orderForm.addEventListener('submit', handleOrderSubmit);
  }
  
  if (submitButton) {
    submitButton.addEventListener('click', handleOrderSubmit);
  }
  
  console.log('Order page initialized successfully');
};

/**
 * Initialize confirmation page
 */
const initConfirmationPage = () => {
  console.log('Initializing confirmation page...');
  
  UIManager.renderConfirmation();
  
  console.log('Confirmation page initialized successfully');
};

/**
 * Initialize offers page
 */
const initOffersPage = () => {
  console.log('Initializing offers page...');
  
  UIManager.renderOffers();
  
  console.log('Offers page initialized successfully');
};

/* ========================================
   APPLICATION INITIALIZATION
   ======================================== */

/**
 * Initialize application based on current page
 */
const initializeApplication = () => {
  console.log('Initializing Luxury Liquor Store Application...');
  
  // Determine current page and initialize accordingly
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  switch (currentPage) {
    case 'menu.html':
      initMenuPage();
      break;
    case 'order.html':
      initOrderPage();
      break;
    case 'confirmation.html':
      initConfirmationPage();
      break;
    case 'offers.html':
      initOffersPage();
      break;
    default:
      console.log('Default page initialization');
      // Initialize common functionality for index page
      break;
  }
  
  // Global event listeners
  document.addEventListener('click', (event) => {
    // Handle any global click events if needed
    if (event.target.matches('[data-action]')) {
      const action = event.target.dataset.action;
      const productId = event.target.dataset.productId;
      
      switch (action) {
        case 'select-product':
          if (productId) {
            SelectionManager.selectProduct(productId);
          }
          break;
        case 'clear-selection':
          SelectionManager.clearSelection();
          break;
        default:
          console.log('Unknown action:', action);
      }
    }
  });
  
  console.log('Application initialized successfully');
};

/* ========================================
   GLOBAL EXPOSURE & EVENT LISTENERS
   ======================================== */

// Expose necessary functions to global scope for backward compatibility
window.LuxuryLiquorApp = {
  // Core modules
  ProductManager,
  SelectionManager,
  OrderManager,
  UIManager,
  
  // Utilities
  DOM,
  Storage,
  Validator,
  formatCurrency,
  
  // Initialization functions
  initMenuPage,
  initOrderPage,
  initConfirmationPage,
  initOffersPage,
  
  // Legacy compatibility
  initializeApplication,
  
  // Backward compatibility aliases
  selectProductById: SelectionManager.selectProduct,
  generateETA: OrderManager.generateETA,
  renderMenuGrid: UIManager.renderMenuGrid,
  updateSelectedSummary: UIManager.updateSelectedSummary
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
  // DOM is already ready
  initializeApplication();
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // Page became visible, refresh selected product summary
    UIManager.updateSelectedSummary();
  }
});

// Handle browser back/forward navigation
window.addEventListener('popstate', () => {
  // Re-initialize based on new page
  setTimeout(initializeApplication, 100);
});

console.log('Luxury Liquor Store Script loaded successfully');