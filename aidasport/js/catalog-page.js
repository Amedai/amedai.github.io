'use strict';

const CATALOG_PAGE_SIDEBAR = {
  men: [
    { id: 'all', label: 'ВСЕ ТОВАРЫ', muted: true },
    { id: 'vests', label: 'Жилеты, безрукавки' },
    { id: 'bombers', label: 'Бомберы, плащи, ветровки' },
    { id: 'midseason-jackets', label: 'Демисезонные куртки' },
    { id: 'winter-parks', label: 'Зимние парки' },
    { id: 'winter-suits', label: 'Зимние костюмы' },
    { id: 'tracksuits', label: 'Спортивные костюмы' },
    { id: 'hoodies', label: 'Худи и толстовки' },
    { id: 'tshirts', label: 'Футболки и поло' },
  ],
  women: [
    { id: 'all', label: 'ВСЕ ТОВАРЫ', muted: true },
    { id: 'vests', label: 'Жилеты, безрукавки' },
    { id: 'bombers', label: 'Бомберы, плащи, ветровки' },
    { id: 'midseason-jackets', label: 'Демисезонные куртки' },
    { id: 'winter-parks', label: 'Зимние парки' },
    { id: 'winter-suits', label: 'Зимние костюмы' },
    { id: 'tracksuits', label: 'Спортивные костюмы' },
    { id: 'hoodies', label: 'Худи и толстовки' },
    { id: 'tshirts', label: 'Футболки и поло' },
  ],
  kids: [
    { id: 'all', label: 'ВСЕ ТОВАРЫ', muted: true },
    { id: 'vests-bombers', label: 'Жилеты и бомберы' },
    { id: 'tracksuits', label: 'Спортивные костюмы' },
    { id: 'parks-jackets', label: 'Парки и куртки' },
    { id: 'hoodies', label: 'Худи и толстовки' },
    { id: 'tshirts', label: 'Футболки' },
  ],
  accessories: [
    { id: 'all', label: 'ВСЕ ТОВАРЫ', muted: true },
    { id: 'caps', label: 'Кепки' },
    { id: 'hats', label: 'Шапки' },
    { id: 'mittens', label: 'Варежки' },
  ],
};

const CATALOG_PAGE_SPECIAL_LINKS = [
  { href: '#new-collection', label: 'НОВАЯ КОЛЛЕКЦИЯ' },
  { href: '#sales', label: 'АКЦИИ' },
];

window.initCatalogPage = function initCatalogPage() {
  const catalogPage = document.querySelector('.catalogpage');

  if (!catalogPage) {
    return;
  }

  const genders = catalogPage.querySelectorAll('.catalogpage__gender');
  const sidebarNav = catalogPage.querySelector('.catalogpage__nav');
  const content = catalogPage.querySelector('.catalogpage__content');
  const categorySelect = catalogPage.querySelector('.catalogpage__categoryselect');
  const categoryMenu = catalogPage.querySelector('.catalogpage__categorymenu');
  const filtersToggle = catalogPage.querySelector('.catalogpage__filterstoggle');
  const filtersPanel = catalogPage.querySelector('.catalogpage__filterspanel');
  const desktopFilterButtons = catalogPage.querySelectorAll('.catalogpage__filters .catalogpage__filter[data-filters-open]');
  const filterSectionToggles = catalogPage.querySelectorAll('[data-filters-toggle]');
  const filterSectionBodies = catalogPage.querySelectorAll('[data-filters-body]');

  const placeDropdown = (trigger, dropdown) => {
    if (!trigger || !dropdown || !content) {
      return;
    }

    const contentRect = content.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const isMobile = window.matchMedia('(max-width: 767.98px)').matches;
    const hasTopButtons = categorySelect && filtersToggle;
    const categoryRect = hasTopButtons ? categorySelect.getBoundingClientRect() : null;
    const filtersRect = hasTopButtons ? filtersToggle.getBoundingClientRect() : null;

    if (isMobile && categoryRect && filtersRect) {
      const left = Math.min(categoryRect.left, filtersRect.left);
      const right = Math.max(categoryRect.right, filtersRect.right);

      dropdown.style.left = `${left - contentRect.left}px`;
      dropdown.style.top = `${triggerRect.bottom - contentRect.top + 8}px`;
      dropdown.style.width = `${right - left}px`;
      dropdown.style.maxWidth = `${right - left}px`;
      return;
    }

    if (!isMobile && dropdown.classList.contains('catalogpage__filterspanel')) {
      const desktopButtons = [...catalogPage.querySelectorAll('.catalogpage__filters .catalogpage__filter[data-filters-open]')];
      const triggerIndex = desktopButtons.indexOf(trigger);

      if (triggerIndex !== -1 && desktopButtons.length > 1) {
        const pairStartIndex = Math.floor(triggerIndex / 2) * 2;
        const pairEndIndex = Math.min(pairStartIndex + 1, desktopButtons.length - 1);
        const pairLeftRect = desktopButtons[pairStartIndex].getBoundingClientRect();
        const pairRightRect = desktopButtons[pairEndIndex].getBoundingClientRect();
        const left = pairLeftRect.left;
        const right = pairRightRect.right;

        dropdown.style.left = `${left - contentRect.left}px`;
        dropdown.style.top = `${triggerRect.bottom - contentRect.top + 8}px`;
        dropdown.style.width = `${right - left}px`;
        dropdown.style.maxWidth = `${right - left}px`;
        return;
      }
    }

    dropdown.style.left = `${triggerRect.left - contentRect.left}px`;
    dropdown.style.top = `${triggerRect.bottom - contentRect.top + 8}px`;

    if (dropdown.classList.contains('catalogpage__categorymenu')) {
      dropdown.style.width = `${triggerRect.width}px`;
      dropdown.style.maxWidth = `${triggerRect.width}px`;
    } else if (dropdown.classList.contains('catalogpage__filterspanel')) {
      dropdown.style.width = `${triggerRect.width}px`;
      dropdown.style.maxWidth = `${triggerRect.width}px`;
    } else {
      dropdown.style.width = '';
      dropdown.style.maxWidth = '';
    }
  };

  const closeCategoryMenu = () => {
    if (!categoryMenu || !categorySelect) {
      return;
    }

    categoryMenu.classList.remove('catalogpage__categorymenu--open');
    categoryMenu.hidden = true;
    categorySelect.setAttribute('aria-expanded', 'false');
  };

  const closeFiltersPanel = () => {
    if (!filtersPanel || !filtersToggle) {
      return;
    }

    filtersPanel.classList.remove('catalogpage__filterspanel--open');
    filtersPanel.classList.remove('catalogpage__filterspanel--single');
    filtersPanel.removeAttribute('data-single-section');
    filtersToggle.setAttribute('aria-expanded', 'false');
  };

  const initPriceSliders = () => {
    catalogPage.querySelectorAll('[data-price-slider]').forEach((slider) => {
      const minInput = slider.querySelector('[data-price-min]');
      const maxInput = slider.querySelector('[data-price-max]');
      const fill = slider.querySelector('[data-price-fill]');
      const body = slider.closest('[data-filters-body="price"]');
      const minLabel = body?.querySelector('[data-price-min-label]');
      const maxLabel = body?.querySelector('[data-price-max-label]');

      if (!minInput || !maxInput || !fill) {
        return;
      }

      const minValue = Number(minInput.min);
      const maxValue = Number(minInput.max);
      const gap = 200;

      const formatPrice = (value) => `${Number(value).toLocaleString('ru-RU')}₽`;

      const updateSlider = () => {
        let leftValue = Number(minInput.value);
        let rightValue = Number(maxInput.value);

        if (rightValue - leftValue < gap) {
          if (document.activeElement === minInput) {
            leftValue = rightValue - gap;
            minInput.value = `${leftValue}`;
          } else {
            rightValue = leftValue + gap;
            maxInput.value = `${rightValue}`;
          }
        }

        const leftPercent = ((leftValue - minValue) / (maxValue - minValue)) * 100;
        const rightPercent = ((rightValue - minValue) / (maxValue - minValue)) * 100;

        fill.style.left = `${leftPercent}%`;
        fill.style.width = `${rightPercent - leftPercent}%`;

        if (minLabel) {
          minLabel.textContent = `от ${formatPrice(leftValue)}`;
        }

        if (maxLabel) {
          maxLabel.textContent = `до ${formatPrice(rightValue)}`;
        }
      };

      minInput.addEventListener('input', updateSlider);
      maxInput.addEventListener('input', updateSlider);
      updateSlider();
    });
  };

  const openFilterSection = (sectionName) => {
    filterSectionBodies.forEach((body) => {
      body.classList.toggle('catalogpage__filtersbody--open', body.dataset.filtersBody === sectionName);
    });

    filterSectionToggles.forEach((toggle) => {
      const isActive = toggle.dataset.filtersToggle === sectionName;
      toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });
  };

  const getOpenedFilterSection = () => {
    const activeToggle = [...filterSectionToggles].find((toggle) => toggle.getAttribute('aria-expanded') === 'true');
    return activeToggle?.dataset.filtersToggle || null;
  };
  const renderSidebar = (category, activeTab) => {
    if (!sidebarNav) {
      return;
    }

    const items = CATALOG_PAGE_SIDEBAR[category];

    if (!items) {
      return;
    }

    sidebarNav.innerHTML = '';

    items.forEach((item) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'catalogpage__navlink';
      button.textContent = item.label;
      button.dataset.catalogCategory = category;
      button.dataset.catalogTab = item.id;

      if (item.muted) {
        button.classList.add('catalogpage__navlink--muted');
      }

      if (item.id === activeTab) {
        button.classList.add('catalogpage__navlink--active');
      }

      button.addEventListener('click', () => {
        activateCatalogState(category, item.id);
      });

      li.appendChild(button);
      sidebarNav.appendChild(li);
    });

    CATALOG_PAGE_SPECIAL_LINKS.forEach((link) => {
      const li = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.className = 'catalogpage__navlink catalogpage__navlink--special';
      anchor.href = link.href;
      anchor.textContent = link.label;
      li.appendChild(anchor);
      sidebarNav.appendChild(li);
    });
  };

  const activateCatalogState = (category, tab) => {
    const items = CATALOG_PAGE_SIDEBAR[category];
    const nextTab = items?.some((item) => item.id === tab) ? tab : 'all';

    catalogPage.dataset.activeCategory = category;
    catalogPage.dataset.activeTab = nextTab;

    genders.forEach((button) => {
      const isActive = button.dataset.catalogCategory === category;
      button.classList.toggle('catalogpage__gender--active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    renderSidebar(category, nextTab);
    if (categoryMenu) {
      categoryMenu.innerHTML = '';

      (items || []).forEach((item) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'catalogpage__categoryoption';
        option.textContent = item.label;

        if (item.id === nextTab) {
          option.classList.add('catalogpage__categoryoption--active');
        }

        option.addEventListener('click', () => {
          activateCatalogState(category, item.id);
          closeCategoryMenu();
        });

        categoryMenu.appendChild(option);
      });
    }
  };

  genders.forEach((button) => {
    button.addEventListener('click', () => {
      const { catalogCategory } = button.dataset;
      const currentTab = catalogPage.dataset.activeTab || 'vests';
      activateCatalogState(catalogCategory, currentTab);
    });
  });

  if (filtersToggle && filtersPanel) {
    filtersToggle.addEventListener('click', () => {
      const isOpen = !filtersPanel.classList.contains('catalogpage__filterspanel--open');

      if (isOpen) {
        closeCategoryMenu();
        placeDropdown(filtersToggle, filtersPanel);
        filtersPanel.classList.remove('catalogpage__filterspanel--single');
        filtersPanel.removeAttribute('data-single-section');
        filtersPanel.classList.add('catalogpage__filterspanel--open');
        openFilterSection(getOpenedFilterSection() || 'color');
      } else {
        closeFiltersPanel();
      }

      filtersToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  desktopFilterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!filtersPanel) {
        return;
      }

      const sectionName = button.dataset.filtersOpen;
      const isOpen = filtersPanel.classList.contains('catalogpage__filterspanel--open');
      const activeSection = getOpenedFilterSection();

      if (isOpen && activeSection === sectionName) {
        closeFiltersPanel();
        return;
      }

      closeCategoryMenu();
      placeDropdown(button, filtersPanel);
      filtersPanel.classList.add('catalogpage__filterspanel--open');
      filtersPanel.classList.add('catalogpage__filterspanel--single');
      filtersPanel.dataset.singleSection = sectionName || '';

      if (sectionName) {
        openFilterSection(sectionName);
      }
    });
  });

  filterSectionToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const { filtersToggle: sectionName } = toggle.dataset;
      const isActive = toggle.getAttribute('aria-expanded') === 'true';

      if (isActive) {
        toggle.setAttribute('aria-expanded', 'false');
        filterSectionBodies.forEach((body) => {
          if (body.dataset.filtersBody === sectionName) {
            body.classList.remove('catalogpage__filtersbody--open');
          }
        });
        return;
      }

      openFilterSection(sectionName);
    });
  });

  if (categorySelect && categoryMenu) {
    categorySelect.addEventListener('click', () => {
      const isOpen = !categoryMenu.classList.contains('catalogpage__categorymenu--open');

      if (isOpen) {
        closeFiltersPanel();
        placeDropdown(categorySelect, categoryMenu);
        categoryMenu.classList.add('catalogpage__categorymenu--open');
        categoryMenu.hidden = false;
      } else {
        closeCategoryMenu();
      }

      categorySelect.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.catalogpage__categoryselect') && !event.target.closest('.catalogpage__categorymenu')) {
        closeCategoryMenu();
      }

      if (!event.target.closest('.catalogpage__filterstoggle')
        && !event.target.closest('.catalogpage__filterspanel')
        && !event.target.closest('.catalogpage__filter[data-filters-open]')) {
        closeFiltersPanel();
      }
    });
  }

  document.querySelectorAll('[data-catalog-category][data-catalog-tab]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!document.querySelector('.catalogpage')) {
        return;
      }

      event.preventDefault();
      const { catalogCategory, catalogTab } = link.dataset;
      activateCatalogState(catalogCategory, catalogTab);
      catalogPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category') || 'women';
  const initialTab = params.get('tab') || 'vests';

  activateCatalogState(initialCategory, initialTab);
  openFilterSection('color');
  initPriceSliders();

  window.addEventListener('resize', () => {
    if (categoryMenu?.classList.contains('catalogpage__categorymenu--open')) {
      placeDropdown(categorySelect, categoryMenu);
    }

    if (filtersPanel?.classList.contains('catalogpage__filterspanel--open')) {
      placeDropdown(filtersToggle, filtersPanel);
    }
  });
};
