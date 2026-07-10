'use strict';

const CATALOG_TABS = {
  men: [
    { id: 'vests', label: 'Жилеты, безрукавки' },
    { id: 'bombers', label: 'Бомберы, плащи, ветровки' },
    { id: 'midseason-jackets', label: 'Демисезонные куртки' },
    { id: 'winter-parks', label: 'Зимние парки' },
    { id: 'winter-suits', label: 'Зимние костюмы' },
    { id: 'tracksuits', label: 'Спортивные костюмы' },
    { id: 'hoodies', label: 'Худи и толстовки' },
    { id: 'tshirts', label: 'Футболки и поло' },
    { id: 'merch', label: 'Мерч' },
  ],
  women: [
    { id: 'vests', label: 'Жилеты, безрукавки' },
    { id: 'bombers', label: 'Бомберы, плащи, ветровки' },
    { id: 'midseason-jackets', label: 'Демисезонные куртки' },
    { id: 'winter-parks', label: 'Зимние парки' },
    { id: 'winter-suits', label: 'Зимние костюмы' },
    { id: 'tracksuits', label: 'Спортивные костюмы' },
    { id: 'hoodies', label: 'Худи и толстовки' },
    { id: 'tshirts', label: 'Футболки и поло' },
    { id: 'merch', label: 'Мерч' },
  ],
  kids: [
    { id: 'vests-bombers', label: 'Жилеты и бомберы' },
    { id: 'tracksuits', label: 'Спортивные костюмы' },
    { id: 'parks-jackets', label: 'Парки и куртки' },
    { id: 'hoodies', label: 'Худи и толстовки' },
    { id: 'tshirts', label: 'Футболки' },
    { id: 'merch', label: 'Мерч' },
  ],
  accessories: [
    { id: 'caps', label: 'Кепки' },
    { id: 'hats', label: 'Шапки' },
    { id: 'mittens', label: 'Варежки' },
    { id: 'merch', label: 'Мерч' },
  ],
};

window.initCatalogTabs = function initCatalogTabs() {
  const catalog = document.querySelector('.catalog');

  if (!catalog) {
    return;
  }

  const tabsContainer = catalog.querySelector('.catalog__tabs');

  if (!tabsContainer) {
    return;
  }

  const renderTabs = (category, activeTab) => {
    const tabs = CATALOG_TABS[category];

    if (!tabs) {
      return;
    }

    tabsContainer.innerHTML = '';

    tabs.forEach((tab) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'catalog__tab';
      button.textContent = tab.label;
      button.dataset.catalogCategory = category;
      button.dataset.catalogTab = tab.id;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', tab.id === activeTab ? 'true' : 'false');

      if (tab.id === activeTab) {
        button.classList.add('catalog__tab--active');
      }

      button.addEventListener('click', () => {
        activateCatalogTab(category, tab.id, false);
      });

      tabsContainer.appendChild(button);
    });
  };

  const activateCatalogTab = (category, tab, shouldScroll) => {
    const tabs = CATALOG_TABS[category];

    if (!tabs || !tabs.some((item) => item.id === tab)) {
      return;
    }

    catalog.classList.add('catalog--tabs-visible');
    catalog.dataset.activeCategory = category;
    catalog.dataset.activeTab = tab;
    renderTabs(category, tab);

    if (shouldScroll) {
      catalog.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  window.activateCatalogTab = activateCatalogTab;

  document.querySelectorAll('[data-catalog-category][data-catalog-tab]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (link.closest('.header')) {
        return;
      }

      const { catalogCategory, catalogTab } = link.dataset;
      const isCatalogPage = Boolean(document.querySelector('.catalog'));

      if (!isCatalogPage) {
        return;
      }

      event.preventDefault();
      activateCatalogTab(catalogCategory, catalogTab, true);
    });
  });

  const params = new URLSearchParams(window.location.search);
  const hashCategory = params.get('category');
  const hashTab = params.get('tab');

  if (hashCategory && hashTab) {
    activateCatalogTab(hashCategory, hashTab, true);
  }
};
