/**
 * MATELINK CLEANING - INTERACTIVE LOGIC & PRICING ENGINE
 * Sydney, Australia
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // CONFIGURATION & PRICING MATRICES
  // (Easily configurable per brief specifications)
  // ==========================================
  const BASE_PRICES = {
    'end-of-lease': { base: 269, bedRate: 45, bathRate: 40, name: 'End-of-Lease Cleaning' },
    'move-in': { base: 249, bedRate: 45, bathRate: 40, name: 'Move-In Cleaning' },
    'deep-cleaning': { base: 229, bedRate: 40, bathRate: 35, name: 'Deep Cleaning' }
  };

  const ADDONS_CATALOG = {
    'end-of-lease': [
      { id: 'carpet-steam', name: 'Carpet Steam Clean', price: 65, note: 'Hot water extraction per room' },
      { id: 'ext-windows', name: 'External Window Clean', price: 75, note: 'Ground level & reachable glass' },
      { id: 'garage-sweep', name: 'Garage Sweep', price: 35, note: 'Cobweb removal & dry sweep' },
      { id: 'deck-clean', name: 'Deck Clean', price: 55, note: 'Outdoor timber or composite wash' },
      { id: 'patio-clean', name: 'Patio Clean', price: 45, note: 'Hard surface pressure rinse' },
      { id: 'small-balcony', name: 'Small Balcony', price: 40, note: 'Floors, railings & sweep' },
      { id: 'large-balcony', name: 'Large Balcony', price: 65, note: 'Full wash & glass railings' },
      { id: 'inside-fridge', name: 'Inside Fridge', price: 45, note: 'Shelves sanitized & defrosted wipe' },
      { id: 'blinds-clean', name: 'Blinds Clean', price: 20, note: '$20 per blind / quantity', isQuantity: true, defaultQty: 1 },
      { id: 'key-pickup', name: 'Key Pickup or Drop Off', price: 40, note: '$40 up to 20 km from property' }
    ],
    'move-in': [
      { id: 'carpet-steam', name: 'Carpet Steam Clean', price: 65, note: 'Hot water extraction per room' },
      { id: 'ext-windows', name: 'External Window Clean', price: 75, note: 'Ground level & reachable glass' },
      { id: 'garage-sweep', name: 'Garage Sweep', price: 35, note: 'Cobweb removal & dry sweep' },
      { id: 'deck-clean', name: 'Deck Clean', price: 55, note: 'Outdoor timber or composite wash' },
      { id: 'patio-clean', name: 'Patio Clean', price: 45, note: 'Hard surface pressure rinse' },
      { id: 'small-balcony', name: 'Small Balcony', price: 40, note: 'Floors, railings & sweep' },
      { id: 'large-balcony', name: 'Large Balcony', price: 65, note: 'Full wash & glass railings' },
      { id: 'inside-fridge', name: 'Inside Fridge', price: 45, note: 'Shelves sanitized & wiped' },
      { id: 'blinds-clean', name: 'Blinds Clean', price: 20, note: '$20 per blind / quantity', isQuantity: true, defaultQty: 1 },
      { id: 'key-pickup', name: 'Key Pickup or Drop Off', price: 40, note: '$40 up to 20 km from property' }
    ],
    'deep-cleaning': [
      { id: 'inside-oven', name: 'Inside Oven Intensive', price: 65, note: 'Grease extraction & rack soak' },
      { id: 'inside-fridge', name: 'Inside Fridge Detail', price: 45, note: 'Complete disassembly & sanitize' },
      { id: 'wall-spots', name: 'Wall Spot Cleaning', price: 50, note: 'Skirting & scuff marks removal' },
      { id: 'grout-tile', name: 'Grout & Tile Revival', price: 70, note: 'Deep shower & floor tile scrub' },
      { id: 'balcony-wash', name: 'Balcony Wash', price: 40, note: 'Outdoor washdown & glass wipe' },
      { id: 'window-tracks', name: 'Interior Windows & Tracks', price: 50, note: 'Track vacuum & glass squeegee' }
    ]
  };

  // State
  const bookingState = {
    service: 'end-of-lease',
    postcode: '2000',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    selectedAddons: {}, // id: quantity
    date: '',
    timeSlot: 'Morning (8:00 AM - 12:00 PM)',
    customer: {
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    }
  };

  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedTomorrow = tomorrow.toISOString().split('T')[0];
  bookingState.date = formattedTomorrow;

  const dateInput = document.getElementById('preferred-date');
  if (dateInput) {
    dateInput.min = formattedTomorrow;
    dateInput.value = formattedTomorrow;
  }

  // ==========================================
  // SYDNEY POSTCODE VALIDATOR
  // ==========================================
  const sydneyPostcodes = {
    '2000': 'Sydney CBD & Barangaroo',
    '2010': 'Surry Hills & Darlinghurst',
    '2026': 'Bondi, Tamarama & Bondi Beach',
    '2030': 'Vaucluse & Watsons Bay',
    '2040': 'Leichhardt & Lilyfield',
    '2042': 'Newtown & Enmore',
    '2060': 'North Sydney & McMahons Point',
    '2088': 'Mosman',
    '2095': 'Manly & Fairy Bower',
    '2099': 'Dee Why & Curl Curl',
    '2134': 'Burwood',
    '2145': 'Westmead & Wentworthville',
    '2150': 'Parramatta & Harris Park',
    '2153': 'Baulkham Hills & Bella Vista',
    '2220': 'Hurstville'
  };

  const heroPostcodeBtn = document.getElementById('hero-check-postcode-btn');
  const heroPostcodeInput = document.getElementById('hero-postcode-input');
  const heroPostcodeStatus = document.getElementById('hero-postcode-status');

  if (heroPostcodeBtn && heroPostcodeInput) {
    heroPostcodeBtn.addEventListener('click', () => {
      checkPostcode(heroPostcodeInput.value.trim());
    });
    heroPostcodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkPostcode(heroPostcodeInput.value.trim());
    });
  }

  function checkPostcode(code) {
    if (!heroPostcodeStatus) return;
    heroPostcodeStatus.className = 'postcode-status active';

    if (code.length === 4 && (code.startsWith('2') || sydneyPostcodes[code])) {
      const area = sydneyPostcodes[code] || 'Greater Sydney Metro Area';
      heroPostcodeStatus.classList.add('success');
      heroPostcodeStatus.innerHTML = `
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span>We service <strong>${code} (${area})</strong>! Request your clean below.</span>
      `;
      bookingState.postcode = code;
      const bPostcodeInput = document.getElementById('booking-postcode');
      if (bPostcodeInput) bPostcodeInput.value = code;
    } else {
      heroPostcodeStatus.classList.add('warning');
      heroPostcodeStatus.innerHTML = `
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>We cover all NSW postcodes starting with 2000-2234. Feel free to request a custom quote!</span>
      `;
    }
  }

  // ==========================================
  // SERVICE TABS SWITCHER (Homepage Showcase)
  // ==========================================
  const serviceTabBtns = document.querySelectorAll('.service-tab-btn');
  const servicePanels = document.querySelectorAll('.service-panel');

  serviceTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetService = btn.getAttribute('data-service');
      
      serviceTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      servicePanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `panel-${targetService}`) {
          panel.classList.add('active');
        }
      });

      // Synchronize booking wizard service if user wants
      setBookingService(targetService);
    });
  });

  // ==========================================
  // BOOKING WIZARD STEPS
  // ==========================================
  let currentStep = 1;
  const totalSteps = 4;

  const stepNodes = document.querySelectorAll('.step-node');
  const stepPanes = document.querySelectorAll('.wizard-step-pane');
  const stepIndicatorBar = document.getElementById('step-indicator-bar');
  const btnPrev = document.getElementById('wizard-prev-btn');
  const btnNext = document.getElementById('wizard-next-btn');

  function updateWizardUI() {
    stepPanes.forEach((pane, idx) => {
      pane.classList.toggle('active', idx + 1 === currentStep);
    });

    stepNodes.forEach((node, idx) => {
      const stepNum = idx + 1;
      node.classList.toggle('active', stepNum === currentStep);
      node.classList.toggle('completed', stepNum < currentStep);
    });

    if (stepIndicatorBar) {
      const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
      stepIndicatorBar.style.width = `${progressPercent}%`;
    }

    if (btnPrev) {
      btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }

    if (btnNext) {
      if (currentStep === totalSteps) {
        btnNext.style.display = 'none';
      } else {
        btnNext.style.display = 'inline-flex';
        btnNext.innerHTML = `Continue <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
      }
    }
  }

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateWizardUI();
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
          currentStep++;
          updateWizardUI();
        }
      }
    });
  }

  stepNodes.forEach((node, idx) => {
    node.addEventListener('click', () => {
      const targetStep = idx + 1;
      if (targetStep < currentStep || validateCurrentStep()) {
        currentStep = targetStep;
        updateWizardUI();
      }
    });
  });

  function validateCurrentStep() {
    if (currentStep === 1) {
      return true;
    }
    if (currentStep === 3) {
      const dateVal = document.getElementById('preferred-date')?.value;
      if (!dateVal) {
        alert('Please choose your preferred cleaning date.');
        return false;
      }
      bookingState.date = dateVal;
    }
    return true;
  }

  // ==========================================
  // SERVICE SELECTION IN WIZARD
  // ==========================================
  const wizardServiceCards = document.querySelectorAll('.service-select-card');
  wizardServiceCards.forEach(card => {
    card.addEventListener('click', () => {
      const sId = card.getAttribute('data-service');
      setBookingService(sId);
    });
  });

  function setBookingService(serviceId) {
    bookingState.service = serviceId;
    bookingState.selectedAddons = {}; // reset addons for new service

    // Update wizard cards
    wizardServiceCards.forEach(c => {
      c.classList.toggle('selected', c.getAttribute('data-service') === serviceId);
    });

    renderAddonsList();
    calculatePrice();
  }

  // ==========================================
  // PROPERTY CONFIGURATION (BEDS / BATHS / TYPE)
  // ==========================================
  const bedValueEl = document.getElementById('bed-val');
  const bathValueEl = document.getElementById('bath-val');

  document.getElementById('bed-minus')?.addEventListener('click', () => {
    if (bookingState.bedrooms > 1) {
      bookingState.bedrooms--;
      bedValueEl.textContent = bookingState.bedrooms;
      calculatePrice();
    }
  });

  document.getElementById('bed-plus')?.addEventListener('click', () => {
    if (bookingState.bedrooms < 7) {
      bookingState.bedrooms++;
      bedValueEl.textContent = bookingState.bedrooms >= 6 ? '6+' : bookingState.bedrooms;
      calculatePrice();
    }
  });

  document.getElementById('bath-minus')?.addEventListener('click', () => {
    if (bookingState.bathrooms > 1) {
      bookingState.bathrooms--;
      bathValueEl.textContent = bookingState.bathrooms;
      calculatePrice();
    }
  });

  document.getElementById('bath-plus')?.addEventListener('click', () => {
    if (bookingState.bathrooms < 5) {
      bookingState.bathrooms++;
      bathValueEl.textContent = bookingState.bathrooms >= 4 ? '4+' : bookingState.bathrooms;
      calculatePrice();
    }
  });

  const propertyTypeBtns = document.querySelectorAll('.btn-type-option');
  propertyTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      propertyTypeBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      bookingState.propertyType = btn.getAttribute('data-type');
      calculatePrice();
    });
  });

  // Time slot buttons
  const slotBtns = document.querySelectorAll('.btn-slot');
  slotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      slotBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      bookingState.timeSlot = btn.getAttribute('data-slot');
      calculatePrice();
    });
  });

  // ==========================================
  // DYNAMIC ADD-ONS RENDERING
  // ==========================================
  const addonsContainer = document.getElementById('dynamic-addons-list');

  function renderAddonsList() {
    if (!addonsContainer) return;
    const addons = ADDONS_CATALOG[bookingState.service] || [];
    addonsContainer.innerHTML = '';

    addons.forEach(addon => {
      const isSelected = !!bookingState.selectedAddons[addon.id];
      const card = document.createElement('div');
      card.className = `addon-card ${isSelected ? 'selected' : ''}`;
      card.id = `addon-item-${addon.id}`;

      if (addon.isQuantity) {
        const qty = bookingState.selectedAddons[addon.id] || 0;
        card.innerHTML = `
          <div class="addon-left">
            <div class="addon-checkbox">
              ${isSelected ? '✓' : ''}
            </div>
            <div>
              <div class="addon-title">${addon.name}</div>
              <div class="addon-note">${addon.note}</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="addon-stepper">
              <button type="button" class="btn-blind-minus" data-id="${addon.id}">-</button>
              <span id="qty-${addon.id}" style="font-weight:700; min-width:18px; text-align:center;">${qty}</span>
              <button type="button" class="btn-blind-plus" data-id="${addon.id}">+</button>
            </div>
            <div class="addon-price">$${addon.price}/ea</div>
          </div>
        `;

        // Quantity clicks
        const plusBtn = card.querySelector('.btn-blind-plus');
        const minusBtn = card.querySelector('.btn-blind-minus');

        plusBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const current = bookingState.selectedAddons[addon.id] || 0;
          bookingState.selectedAddons[addon.id] = current + 1;
          card.classList.add('selected');
          card.querySelector('.addon-checkbox').textContent = '✓';
          card.querySelector(`#qty-${addon.id}`).textContent = bookingState.selectedAddons[addon.id];
          calculatePrice();
        });

        minusBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const current = bookingState.selectedAddons[addon.id] || 0;
          if (current > 1) {
            bookingState.selectedAddons[addon.id] = current - 1;
            card.querySelector(`#qty-${addon.id}`).textContent = bookingState.selectedAddons[addon.id];
          } else {
            delete bookingState.selectedAddons[addon.id];
            card.classList.remove('selected');
            card.querySelector('.addon-checkbox').textContent = '';
            card.querySelector(`#qty-${addon.id}`).textContent = 0;
          }
          calculatePrice();
        });

      } else {
        card.innerHTML = `
          <div class="addon-left">
            <div class="addon-checkbox">
              ${isSelected ? '✓' : ''}
            </div>
            <div>
              <div class="addon-title">${addon.name}</div>
              <div class="addon-note">${addon.note}</div>
            </div>
          </div>
          <div class="addon-price">+$${addon.price}</div>
        `;

        card.addEventListener('click', () => {
          if (bookingState.selectedAddons[addon.id]) {
            delete bookingState.selectedAddons[addon.id];
            card.classList.remove('selected');
            card.querySelector('.addon-checkbox').textContent = '';
          } else {
            bookingState.selectedAddons[addon.id] = 1;
            card.classList.add('selected');
            card.querySelector('.addon-checkbox').textContent = '✓';
          }
          calculatePrice();
        });
      }

      addonsContainer.appendChild(card);
    });
  }

  // ==========================================
  // REAL-TIME PRICE CALCULATION ENGINE
  // ==========================================
  function calculatePrice() {
    const serviceConfig = BASE_PRICES[bookingState.service];
    let total = serviceConfig.base;

    // Additional bedrooms & bathrooms above 1 Bed / 1 Bath
    const extraBeds = Math.max(0, bookingState.bedrooms - 1);
    const extraBaths = Math.max(0, bookingState.bathrooms - 1);

    const bedsCost = extraBeds * serviceConfig.bedRate;
    const bathsCost = extraBaths * serviceConfig.bathRate;
    total += bedsCost + bathsCost;

    // Property type adjustment (e.g. multi-storey house extra stairs/hallways)
    let typeModifier = 0;
    if (bookingState.propertyType === 'house') {
      typeModifier = 40;
    } else if (bookingState.propertyType === 'townhouse') {
      typeModifier = 25;
    }
    total += typeModifier;

    // Add-ons total
    let addonsTotal = 0;
    const currentAddonsCatalog = ADDONS_CATALOG[bookingState.service] || [];
    const activeAddonsDetails = [];

    for (const [addonId, qty] of Object.entries(bookingState.selectedAddons)) {
      const match = currentAddonsCatalog.find(a => a.id === addonId);
      if (match && qty > 0) {
        const itemTotal = match.price * qty;
        addonsTotal += itemTotal;
        activeAddonsDetails.push({
          name: match.name,
          qty: qty > 1 ? `x${qty}` : '',
          price: itemTotal
        });
      }
    }
    total += addonsTotal;

    // Update Summary Card in DOM
    const summaryTitleEl = document.getElementById('summary-service-name');
    const summaryTypeEl = document.getElementById('summary-property-type');
    const summaryBedsEl = document.getElementById('summary-beds');
    const summaryBathsEl = document.getElementById('summary-baths');
    const summaryDateEl = document.getElementById('summary-date');
    const summarySlotEl = document.getElementById('summary-slot');
    const summaryAddonsListEl = document.getElementById('summary-addons-list');
    const summaryTotalEl = document.getElementById('summary-total-amount');

    if (summaryTitleEl) summaryTitleEl.textContent = serviceConfig.name;
    if (summaryTypeEl) {
      const formattedType = bookingState.propertyType.charAt(0).toUpperCase() + bookingState.propertyType.slice(1);
      summaryTypeEl.textContent = formattedType;
    }
    if (summaryBedsEl) summaryBedsEl.textContent = `${bookingState.bedrooms} ${bookingState.bedrooms === 1 ? 'Bed' : 'Beds'}`;
    if (summaryBathsEl) summaryBathsEl.textContent = `${bookingState.bathrooms} ${bookingState.bathrooms === 1 ? 'Bath' : 'Baths'}`;
    
    if (summaryDateEl) {
      const d = document.getElementById('preferred-date')?.value || bookingState.date;
      summaryDateEl.textContent = d ? new Date(d + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Pending selection';
    }
    if (summarySlotEl) summarySlotEl.textContent = bookingState.timeSlot;

    if (summaryAddonsListEl) {
      if (activeAddonsDetails.length === 0) {
        summaryAddonsListEl.innerHTML = '<div style="font-size:0.8rem; color:#94A3B8; font-style:italic;">No extra add-ons selected</div>';
      } else {
        summaryAddonsListEl.innerHTML = activeAddonsDetails.map(item => `
          <div class="summary-addon-item">
            <span>+ ${item.name} ${item.qty}</span>
            <span style="font-weight:600; color:var(--brand-navy);">$${item.price}</span>
          </div>
        `).join('');
      }
    }

    if (summaryTotalEl) {
      summaryTotalEl.textContent = `$${total}`;
    }

    return total;
  }

  // ==========================================
  // FINAL SUBMISSION: "REQUEST MY CLEAN"
  // ==========================================
  const requestCleanBtn = document.getElementById('btn-request-my-clean');
  const confirmModal = document.getElementById('booking-confirmation-modal');

  if (requestCleanBtn) {
    requestCleanBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Read customer input values
      const nameInput = document.getElementById('cust-name');
      const mobileInput = document.getElementById('cust-mobile');
      const emailInput = document.getElementById('cust-email');
      const streetInput = document.getElementById('cust-street');
      const notesInput = document.getElementById('cust-notes');

      if (!nameInput?.value.trim() || !mobileInput?.value.trim() || !emailInput?.value.trim()) {
        // Jump to Step 4 if not there yet
        currentStep = 4;
        updateWizardUI();
        alert('Please fill in your Contact Name, Sydney Mobile, and Email.');
        nameInput?.focus();
        return;
      }

      bookingState.customer = {
        name: nameInput.value.trim(),
        phone: mobileInput.value.trim(),
        email: emailInput.value.trim(),
        address: streetInput?.value.trim() || 'Sydney, NSW',
        notes: notesInput?.value.trim() || ''
      };

      const finalPrice = calculatePrice();
      const bookingRef = 'MC-' + Math.floor(10000 + Math.random() * 90000);

      // Populate confirmation modal
      document.getElementById('conf-ref-id').textContent = bookingRef;
      document.getElementById('conf-service').textContent = BASE_PRICES[bookingState.service].name;
      document.getElementById('conf-property').textContent = `${bookingState.bedrooms} Bed, ${bookingState.bathrooms} Bath (${bookingState.propertyType})`;
      document.getElementById('conf-datetime').textContent = `${bookingState.date} • ${bookingState.timeSlot}`;
      document.getElementById('conf-price').textContent = `$${finalPrice} AUD`;
      document.getElementById('conf-client-name').textContent = bookingState.customer.name;
      document.getElementById('conf-client-email').textContent = bookingState.customer.email;

      // Show confirmation modal
      if (confirmModal) confirmModal.classList.add('open');
    });
  }

  // ==========================================
  // MODALS (QUOTE, RE-CLEAN, GENERAL)
  // ==========================================
  const quoteModal = document.getElementById('quote-modal');
  const recleanModal = document.getElementById('reclean-modal');

  // Trigger buttons
  document.querySelectorAll('[data-open-quote]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (quoteModal) quoteModal.classList.add('open');
    });
  });

  document.querySelectorAll('[data-open-reclean]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (recleanModal) recleanModal.classList.add('open');
    });
  });

  // Close modals
  document.querySelectorAll('.modal-close-btn, [data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    });
  });

  // Outside click close
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });

  // Quote form submission
  const quoteForm = document.getElementById('custom-quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const quoteRef = 'MQ-' + Math.floor(10000 + Math.random() * 90000);
      alert(`Thank you! Your quote request (${quoteRef}) has been submitted to Matelink. We will review your property details and respond with a transparent quote within 2-4 hours.`);
      quoteModal.classList.remove('open');
      quoteForm.reset();
    });
  }

  // Re-clean form submission
  const recleanForm = document.getElementById('reclean-request-form');
  if (recleanForm) {
    recleanForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Your Re-Clean request linked to your booking has been received. Our Matelink Sydney review team will check your agent notes and coordinate the re-clean free of charge within our Bond Back Guarantee terms.');
      recleanModal.classList.remove('open');
      recleanForm.reset();
    });
  }

  // ==========================================
  // FAQ ACCORDION
  // ==========================================
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    questionBtn?.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all others
      faqItems.forEach(other => {
        other.classList.remove('active');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ==========================================
  // MOBILE NAVIGATION DRAWER
  // ==========================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });

    mobileDrawer.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // Initial render
  renderAddonsList();
  calculatePrice();
  updateWizardUI();
});
