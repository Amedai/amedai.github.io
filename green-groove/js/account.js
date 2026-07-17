'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const account = document.querySelector('.account');
    if (!account) return;

    initAccountSidebarTabs(account);
    initAccountProfile(account);
    initAccountAnalytics(account);
    initAccountFinance(account);
    initReportActions(account);
    initReportApproveModals(account);
});

const ACCOUNT_PROFILE_FIELDS = ['full-name', 'age', 'city', 'about'];
const ACCOUNT_PROFILE_STORAGE_KEY = 'green-groove-account-profile';

function initAccountProfile(account) {
    const profile = account.querySelector('.account-profile');
    if (!profile) return;

    const editBtn = profile.querySelector('[data-profile-edit]');
    const saveBtn = profile.querySelector('[data-profile-save]');
    const photo = profile.querySelector('[data-profile-photo]');
    const photoOpenBtn = profile.querySelector('[data-profile-photo-open]');
    const photoModal = document.getElementById('account-profile-photo-modal');
    const photoPreview = photoModal?.querySelector('[data-profile-preview]');
    const photoFileInput = photoModal?.querySelector('[data-profile-file]');
    const photoAddBtn = photoModal?.querySelector('[data-profile-file-trigger]');

    loadAccountProfileData(profile, photo, photoPreview);
    setEditing(false);

    function setEditing(isEditing) {
        profile.classList.toggle('account-profile--editing', isEditing);

        if (editBtn) editBtn.hidden = isEditing;
        if (saveBtn) saveBtn.hidden = !isEditing;

        if (isEditing) {
            ACCOUNT_PROFILE_FIELDS.forEach((fieldName) => {
                const display = profile.querySelector(`[data-profile-display="${fieldName}"]`);
                const input = profile.querySelector(`[data-profile-input="${fieldName}"]`);

                if (display && input) {
                    input.value = display.textContent.trim();
                }
            });
        }
    }

    function saveProfile() {
        const data = {};

        ACCOUNT_PROFILE_FIELDS.forEach((fieldName) => {
            const input = profile.querySelector(`[data-profile-input="${fieldName}"]`);
            const display = profile.querySelector(`[data-profile-display="${fieldName}"]`);

            if (!input || !display) return;

            const value = input.value.trim();
            display.textContent = value;
            data[fieldName] = value;
        });

        if (photo?.src && !photo.src.startsWith('blob:')) {
            data.photo = photo.src;
        }

        try {
            localStorage.setItem(ACCOUNT_PROFILE_STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            // Демо-режим: если localStorage недоступен, данные остаются в DOM.
        }

        setEditing(false);
    }

    function openPhotoModal() {
        if (!photoModal) return;

        if (photoPreview && photo?.src) {
            photoPreview.src = photo.src;
        }

        photoModal.hidden = false;
        photoModal.setAttribute('aria-hidden', 'false');
        photoModal.classList.add('account-profile__modal--open');
    }

    function closePhotoModal() {
        if (!photoModal) return;

        photoModal.hidden = true;
        photoModal.setAttribute('aria-hidden', 'true');
        photoModal.classList.remove('account-profile__modal--open');

        if (photoFileInput) {
            photoFileInput.value = '';
        }
    }

    function applyPhoto(file) {
        if (!file || !photo) return;

        const reader = new FileReader();

        reader.onload = () => {
            const dataUrl = typeof reader.result === 'string' ? reader.result : '';
            if (!dataUrl) return;

            photo.src = dataUrl;

            if (photoPreview) {
                photoPreview.src = dataUrl;
            }

            try {
                const stored = JSON.parse(localStorage.getItem(ACCOUNT_PROFILE_STORAGE_KEY) || '{}');
                stored.photo = dataUrl;
                localStorage.setItem(ACCOUNT_PROFILE_STORAGE_KEY, JSON.stringify(stored));
            } catch (error) {
                // localStorage может быть недоступен или переполнен в демо.
            }

            closePhotoModal();
        };

        reader.readAsDataURL(file);
    }

    editBtn?.addEventListener('click', () => {
        setEditing(true);
    });

    saveBtn?.addEventListener('click', () => {
        saveProfile();
    });

    photoOpenBtn?.addEventListener('click', () => {
        openPhotoModal();
    });

    photoAddBtn?.addEventListener('click', () => {
        photoFileInput?.click();
    });

    photoFileInput?.addEventListener('change', () => {
        const file = photoFileInput.files?.[0];
        if (file) {
            applyPhoto(file);
        }
    });

    photoModal?.querySelectorAll('[data-profile-modal-close]').forEach((closeEl) => {
        closeEl.addEventListener('click', () => {
            closePhotoModal();
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && photoModal && !photoModal.hidden) {
            closePhotoModal();
        }
    });
}

function loadAccountProfileData(profile, photo, photoPreview) {
    let data = null;

    try {
        data = JSON.parse(localStorage.getItem(ACCOUNT_PROFILE_STORAGE_KEY) || 'null');
    } catch (error) {
        data = null;
    }

    if (!data) return;

    ACCOUNT_PROFILE_FIELDS.forEach((fieldName) => {
        if (!data[fieldName]) return;

        const display = profile.querySelector(`[data-profile-display="${fieldName}"]`);
        const input = profile.querySelector(`[data-profile-input="${fieldName}"]`);

        if (display) display.textContent = data[fieldName];
        if (input) input.value = data[fieldName];
    });

    if (data.photo && photo && !data.photo.startsWith('blob:')) {
        photo.src = data.photo;

        if (photoPreview) {
            photoPreview.src = data.photo;
        }
    }
}

function initAccountFinance(account) {
    const finance = account.querySelector('.account-finance');
    if (!finance) return;

    const yearPanels = finance.querySelectorAll('.account-finance__year-panel');
    const yearTabs = finance.querySelectorAll('.account-finance__year-btn');
    const yearFallbackPanel = finance.querySelector('.account-finance__year-panel[data-year-fallback]');

    function setActiveTab(tabs, activeTab, activeClass) {
        tabs.forEach((tab) => {
            const isActive = tab === activeTab;
            tab.classList.toggle(activeClass, isActive);
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
    }

    function setActivePanel(panels, activePanel, activeClass) {
        panels.forEach((panel) => {
            const isActive = panel === activePanel;
            panel.classList.toggle(activeClass, isActive);
            panel.hidden = !isActive;
        });
    }

    function syncFinanceSortDropdown(yearPanel, quarter) {
        const options = yearPanel.querySelectorAll('[data-finance-quarter]');
        const activeOption = yearPanel.querySelector(`[data-finance-quarter="${quarter}"]`);

        options.forEach((option) => {
            option.classList.toggle('account-finance__sort-option--active', option === activeOption);
        });
    }

    function activateQuarter(yearPanel, quarter) {
        const quarterTabs = yearPanel.querySelectorAll('.account-finance__quarter-btn');
        const quarterPanels = yearPanel.querySelectorAll('.account-finance__quarter-panel');
        const tab = yearPanel.querySelector(`.account-finance__quarter-btn[data-quarter="${quarter}"]`);
        const panel = yearPanel.querySelector(`.account-finance__quarter-panel[data-quarter="${quarter}"]`);

        if (!tab || !panel) return;

        setActiveTab(quarterTabs, tab, 'account-finance__quarter-btn--active');
        setActivePanel(quarterPanels, panel, 'account-finance__quarter-panel--active');

        quarterTabs.forEach((quarterTab) => {
            const isActive = quarterTab === tab;
            quarterTab.classList.toggle('hover-dark-green', isActive);
            quarterTab.classList.toggle('hover-dark-gray', !isActive);
        });

        syncFinanceSortDropdown(yearPanel, quarter);
    }

    function initFinanceSortDropdown(yearPanel) {
        const dropdown = yearPanel.querySelector('.account-finance__sort-dropdown');
        if (!dropdown) return;

        const toggle = dropdown.querySelector('.account-finance__sort');
        const menu = dropdown.querySelector('.account-finance__sort-menu');
        const options = dropdown.querySelectorAll('[data-finance-quarter]');

        if (!toggle || !menu) return;

        function closeDropdown() {
            dropdown.classList.remove('account-finance__sort-dropdown--open');
            toggle.setAttribute('aria-expanded', 'false');
            menu.hidden = true;
        }

        function openDropdown() {
            finance.querySelectorAll('.account-finance__sort-dropdown--open').forEach((openDropdown) => {
                if (openDropdown === dropdown) return;

                openDropdown.classList.remove('account-finance__sort-dropdown--open');
                openDropdown.querySelector('.account-finance__sort')?.setAttribute('aria-expanded', 'false');
                const openMenu = openDropdown.querySelector('.account-finance__sort-menu');
                if (openMenu) openMenu.hidden = true;
            });

            dropdown.classList.add('account-finance__sort-dropdown--open');
            toggle.setAttribute('aria-expanded', 'true');
            menu.hidden = false;
        }

        toggle.addEventListener('click', (event) => {
            event.stopPropagation();

            if (dropdown.classList.contains('account-finance__sort-dropdown--open')) {
                closeDropdown();
            } else {
                openDropdown();
            }
        });

        options.forEach((option) => {
            option.addEventListener('click', () => {
                const quarter = option.dataset.financeQuarter;
                if (!quarter) return;

                activateQuarter(yearPanel, quarter);
                closeDropdown();
            });
        });

        document.addEventListener('click', (event) => {
            if (!dropdown.contains(event.target)) {
                closeDropdown();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeDropdown();
            }
        });
    }

    function initQuarterTabs(yearPanel) {
        const quarterTabs = yearPanel.querySelectorAll('.account-finance__quarter-btn');

        if (!quarterTabs.length) return;

        quarterTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                activateQuarter(yearPanel, tab.dataset.quarter);
            });
        });

        initFinanceSortDropdown(yearPanel);
    }

    function activateFirstQuarter(yearPanel) {
        const activeQuarterTab = yearPanel.querySelector('.account-finance__quarter-btn--active');
        const quarter = activeQuarterTab?.dataset.quarter || '1';
        activateQuarter(yearPanel, quarter);
    }

    yearPanels.forEach((panel) => {
        initQuarterTabs(panel);
    });

    yearTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const year = tab.dataset.year;
            let panel = finance.querySelector(`.account-finance__year-panel[data-year="${year}"]`);

            if (!panel && yearFallbackPanel) {
                panel = yearFallbackPanel;
            }

            if (!panel) return;

            if (panel === yearFallbackPanel) {
                panel.querySelectorAll('.account-finance__report-period').forEach((periodEl, index) => {
                    periodEl.textContent = `${index + 1} кв. ${year}`;
                });
            }

            setActiveTab(yearTabs, tab, 'account-finance__year-btn--active');
            setActivePanel(yearPanels, panel, 'account-finance__year-panel--active');
            activateFirstQuarter(panel);
        });
    });

    const activeYearPanel = finance.querySelector('.account-finance__year-panel--active');
    if (activeYearPanel) {
        activateFirstQuarter(activeYearPanel);
    }
}

function initAccountSidebarTabs(account) {
    const sidebarLinks = account.querySelectorAll('[data-account-tab]');
    const panels = account.querySelectorAll('[data-account-panel]');
    const sidebarItems = account.querySelectorAll('.account-sidebar__item');

    if (!sidebarLinks.length || !panels.length) return;

    function activatePanel(tabId) {
        const panel = account.querySelector(`[data-account-panel="${tabId}"]`);
        const link = account.querySelector(`[data-account-tab="${tabId}"]`);

        if (!panel || !link) return;

        sidebarItems.forEach((item) => {
            item.classList.toggle('account-sidebar__item--active', item.contains(link));
        });

        panels.forEach((panelEl) => {
            const isActive = panelEl === panel;
            panelEl.classList.toggle('account__panel--active', isActive);
            panelEl.hidden = !isActive;
            panelEl.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        });

        account.classList.toggle('account--analytics', tabId === 'analytics');
    }

    sidebarLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            const tabId = link.dataset.accountTab;
            if (!account.querySelector(`[data-account-panel="${tabId}"]`)) return;

            activatePanel(tabId);
        });
    });

    activatePanel('profile');
}

function initReportActions(account) {
    account.addEventListener('click', (event) => {
        const downloadBtn = event.target.closest('.account-finance__report-action--download');
        if (downloadBtn) {
            const report = downloadBtn.closest('.account-finance__report');
            const fileUrl = report?.dataset.reportFile;

            if (!fileUrl) return;

            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileUrl.split('/').pop() || 'report.pdf';
            link.click();
            return;
        }

        const deleteBtn = event.target.closest('.account-finance__report-action--delete');
        if (!deleteBtn) return;

        const report = deleteBtn.closest('.account-finance__report');
        if (report) {
            report.remove();
        }
    });
}

function initReportApproveModals(account) {
    const modals = {
        confirm: document.getElementById('account-finance-modal-confirm'),
        edit: document.getElementById('account-finance-modal-edit'),
        manager: document.getElementById('account-finance-modal-manager'),
    };

    const editForm = document.getElementById('account-finance-requisites-form');
    let activeReport = null;

    if (!modals.confirm || !modals.edit || !modals.manager) return;

    account.addEventListener('click', (event) => {
        const approveTrigger = event.target.closest('.account-finance__report-icon--approved, .account-finance__report-btn--approved');
        if (!approveTrigger) return;

        const report = approveTrigger.closest('.account-finance__report');
        if (!report || report.classList.contains('account-finance__report--confirmed')) return;

        activeReport = report;
        openModal(modals.confirm);
    });

    document.querySelectorAll('[data-modal-close]').forEach((closeEl) => {
        closeEl.addEventListener('click', () => {
            closeAllModals();
        });
    });

    document.querySelectorAll('[data-modal-action="confirm-requisites"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (activeReport) {
                activeReport.classList.add('account-finance__report--confirmed');
                const icon = activeReport.querySelector('.account-finance__report-icon--approved');
                const btn = activeReport.querySelector('.account-finance__report-btn--approved');

                icon?.classList.remove('hover-dark-gray');
                btn?.classList.remove('hover-dark-gray');
                icon?.classList.add('hover-dark-green');
                btn?.classList.add('hover-dark-green');
            }

            closeAllModals();
            activeReport = null;
        });
    });

    document.querySelectorAll('[data-modal-action="open-edit"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            closeModal(modals.confirm);
            openModal(modals.edit);
        });
    });

    if (editForm) {
        editForm.addEventListener('submit', (event) => {
            event.preventDefault();
            closeModal(modals.edit);
            openModal(modals.manager);
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllModals();
            activeReport = null;
        }
    });

    function openModal(modal) {
        modal.hidden = false;
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('account-finance__modal--open');
        document.body.classList.add('no-scroll');
    }

    function closeModal(modal) {
        modal.hidden = true;
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('account-finance__modal--open');
    }

    function closeAllModals() {
        Object.values(modals).forEach((modal) => {
            closeModal(modal);
        });
        document.body.classList.remove('no-scroll');
    }
}

const ACCOUNT_ANALYTICS_Y_MAX = 1600000;

const ACCOUNT_ANALYTICS_PERIOD_LABELS = {
    week: 'Неделя',
    month: 'Месяц',
    quarter: 'Квартал',
    year: 'Год',
};

const ACCOUNT_ANALYTICS_RANGE_LABELS = {
    7: 'Последние 7 дней',
    30: 'Последние 30 дней',
    90: 'Последние 90 дней',
    365: 'Последний год',
};

const ACCOUNT_ANALYTICS_PLATFORM_LINES = [
    { id: 'vk', color: '#5378ff', min: 70000, max: 1180000 },
    { id: 'yam', color: '#e5cf09', min: 50000, max: 1020000 },
    { id: 'zvuk', color: '#ff2a2d', min: 40000, max: 880000 },
    { id: 'kion', color: '#ff3fd5', min: 35000, max: 760000 },
    { id: 'apple', color: '#0bc9de', min: 45000, max: 980000 },
    { id: 'spotify', color: '#14ce2e', min: 60000, max: 1120000 },
    { id: 'ok', color: '#ff891b', min: 30000, max: 620000 },
];

const ACCOUNT_ANALYTICS_PLATFORM_ICONS = {
    vk: './images/icons/analytics/vk.png',
    yam: './images/icons/analytics/ym.png',
    zvuk: './images/icons/analytics/zv.png',
    kion: './images/icons/analytics/km.png',
    spotify: './images/icons/analytics/sp.png',
    ok: './images/icons/analytics/od.png',
    apple: './images/icons/analytics/am.png',
};

const accountAnalyticsChartStore = new WeakMap();

function initAccountAnalytics(account) {
    const section = account.querySelector('.account-analytics');
    if (!section) return;

    if (!section.dataset.analyticsPeriod) {
        section.dataset.analyticsPeriod = 'month';
    }

    initAccountAnalyticsFilters(section);
    initAccountAnalyticsSort(section, () => renderAccountAnalyticsSection(section));
    bindAccountAnalyticsHover(section);

    function renderCharts() {
        renderAccountAnalyticsSection(section);
    }

    renderCharts();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderCharts, 150);
    });

    account.querySelector('[data-account-tab="analytics"]')?.addEventListener('click', () => {
        requestAnimationFrame(renderCharts);
    });
}

function initAccountAnalyticsFilters(section) {
    const form = section.querySelector('[data-analytics-filters]');
    const searchInput = section.querySelector('[data-analytics-search]');
    const dateInput = section.querySelector('[data-analytics-date]');
    const rangeDropdown = section.querySelector('.account-analytics__range-dropdown');

    if (dateInput && !dateInput.value) {
        const now = new Date();
        dateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    if (rangeDropdown) {
        initAccountAnalyticsRangeDropdown(section, rangeDropdown);
    }

    form?.addEventListener('submit', (event) => {
        event.preventDefault();

        const activeRange = section.querySelector('.account-analytics__range-option--active');

        section.dataset.analyticsSearch = searchInput?.value.trim() || '';
        section.dataset.analyticsDate = dateInput?.value || '';
        section.dataset.analyticsRange = activeRange?.dataset.analyticsRange
            || section.dataset.analyticsRangePending
            || '30';
        section.dataset.analyticsFiltersApplied = 'true';

        invalidateAccountAnalyticsCharts(section);
        clearAccountAnalyticsActiveState(section);
        renderAccountAnalyticsSection(section);
    });
}

function initAccountAnalyticsRangeDropdown(section, dropdown) {
    const toggle = dropdown.querySelector('[data-analytics-range-toggle]');
    const menu = dropdown.querySelector('.account-analytics__range-menu');
    const labelEl = dropdown.querySelector('[data-analytics-range-label]');
    const options = dropdown.querySelectorAll('[data-analytics-range]');

    if (!toggle || !menu) return;

    function closeDropdown() {
        dropdown.classList.remove('account-analytics__range-dropdown--open');
        toggle.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
    }

    function openDropdown() {
        dropdown.classList.add('account-analytics__range-dropdown--open');
        toggle.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
    }

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();

        if (dropdown.classList.contains('account-analytics__range-dropdown--open')) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });

    options.forEach((option) => {
        option.addEventListener('click', () => {
            const range = option.dataset.analyticsRange;
            if (!range) return;

            options.forEach((item) => {
                item.classList.remove('account-analytics__range-option--active');
            });
            option.classList.add('account-analytics__range-option--active');

            section.dataset.analyticsRangePending = range;

            if (labelEl) {
                labelEl.textContent = option.textContent.trim();
            }

            closeDropdown();
        });
    });

    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target)) {
            closeDropdown();
        }
    });
}

function renderAccountAnalyticsSection(section) {
    section.querySelectorAll('.account-analytics__chart').forEach((chartEl) => {
        renderAccountAnalyticsChart(chartEl, section);
    });

    updateAccountAnalyticsTotal(section);
}

function getAccountAnalyticsReferenceDate(section) {
    if (section.dataset.analyticsFiltersApplied !== 'true') {
        return startOfDay(new Date());
    }

    const monthValue = section.dataset.analyticsDate;
    if (monthValue) {
        const [year, month] = monthValue.split('-').map(Number);
        if (year && month) {
            const monthEnd = new Date(year, month, 0);
            const today = startOfDay(new Date());
            return monthEnd > today ? today : monthEnd;
        }
    }

    return startOfDay(new Date());
}

function buildAccountAnalyticsPeriodConfig(period, section) {
    const referenceDate = getAccountAnalyticsReferenceDate(section);
    const label = ACCOUNT_ANALYTICS_PERIOD_LABELS[period] || ACCOUNT_ANALYTICS_PERIOD_LABELS.month;
    let periodStart;
    let periodEnd;

    switch (period) {
        case 'week': {
            const mondayOffset = (referenceDate.getDay() + 6) % 7;
            periodStart = addDays(referenceDate, -mondayOffset);
            periodEnd = addDays(periodStart, 6);
            break;
        }
        case 'quarter': {
            const quarter = Math.floor(referenceDate.getMonth() / 3);
            periodStart = new Date(referenceDate.getFullYear(), quarter * 3, 1);
            periodEnd = new Date(referenceDate.getFullYear(), quarter * 3 + 3, 0);
            break;
        }
        case 'year': {
            periodStart = new Date(referenceDate.getFullYear(), 0, 1);
            periodEnd = new Date(referenceDate.getFullYear(), 11, 31);
            break;
        }
        case 'month':
        default: {
            periodStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
            periodEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
            break;
        }
    }

    periodStart = startOfDay(periodStart);
    periodEnd = startOfDay(periodEnd);

    const today = startOfDay(new Date());
    const dataEnd = periodEnd > today ? today : periodEnd;
    const filtersApplied = section.dataset.analyticsFiltersApplied === 'true';
    let rangeStart = periodStart;

    if (filtersApplied) {
        const rangeDays = Number(section.dataset.analyticsRange) || 30;
        rangeStart = addDays(today, -(rangeDays - 1));
    }

    let cursor = new Date(periodStart);
    const points = [];

    while (cursor <= dataEnd) {
        if (!filtersApplied || cursor >= rangeStart) {
            const day = cursor.getDate();
            const month = cursor.getMonth() + 1;
            const dateLabel = `${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}`;

            points.push({
                label: '',
                date: dateLabel,
                timestamp: cursor.getTime(),
                isFriday: cursor.getDay() === 5,
            });
        }

        cursor = addDays(cursor, 1);
    }

    if (!points.length) {
        points.push({
            label: formatAccountAnalyticsAxisLabel(referenceDate),
            date: formatAccountAnalyticsAxisLabel(referenceDate),
            timestamp: referenceDate.getTime(),
            isFriday: referenceDate.getDay() === 5,
        });
    }

    applyAccountAnalyticsAxisMarkers(points, period);

    return {
        label,
        points,
    };
}

const ACCOUNT_ANALYTICS_MONTH_SHORT = [
    'янв', 'фев', 'мар', 'апр', 'май', 'июн',
    'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

function applyAccountAnalyticsAxisMarkers(points, period) {
    points.forEach((point, index) => {
        const date = new Date(point.timestamp);
        const prevDate = index > 0 ? new Date(points[index - 1].timestamp) : null;
        const isMonthStart = index === 0
            || date.getDate() === 1
            || (prevDate && prevDate.getMonth() !== date.getMonth());
        const isWeekStart = index === 0 || date.getDay() === 1;

        point.axisMajor = false;
        point.axisLabel = '';

        switch (period) {
            case 'week':
                point.axisMajor = true;
                point.axisLabel = point.date;
                break;
            case 'month':
                point.axisMajor = isWeekStart;
                if (isWeekStart) {
                    point.axisLabel = point.date;
                }
                break;
            case 'quarter':
            case 'year':
                point.axisMajor = isMonthStart;
                if (isMonthStart) {
                    point.axisLabel = ACCOUNT_ANALYTICS_MONTH_SHORT[date.getMonth()];
                }
                break;
            default:
                point.axisMajor = isWeekStart;
                if (isWeekStart) {
                    point.axisLabel = point.date;
                }
                break;
        }

        point.label = point.axisLabel;
    });
}

function drawAccountAnalyticsFridayStripes(ctx, state, metrics, stripeTop, stripeHeight) {
    const pointCount = state.points.length;
    const daySpacing = pointCount > 1
        ? metrics.chartWidth / (pointCount - 1)
        : metrics.chartWidth;
    const barWidth = Math.max(8, Math.min(71, daySpacing * 0.9));

    state.points.forEach((point, index) => {
        if (!point.isFriday) return;

        const x = metrics.indexToX(index);
        ctx.fillStyle = '#d7ece4';
        ctx.fillRect(x - barWidth / 2, stripeTop, barWidth, stripeHeight);
    });
}

function getAccountAnalyticsPeriod(section) {
    return section.dataset.analyticsPeriod || 'month';
}

function getAccountAnalyticsFilterKey(section) {
    if (section.dataset.analyticsFiltersApplied !== 'true') {
        return '';
    }

    return [
        section.dataset.analyticsSearch || '',
        section.dataset.analyticsRange || '30',
        section.dataset.analyticsDate || '',
    ].join('|');
}

function clearAccountAnalyticsActiveState(section) {
    section.querySelectorAll('.account-analytics__tooltip').forEach((tooltip) => {
        tooltip.hidden = true;
    });

    section.querySelectorAll('.account-analytics__plot--hovering').forEach((plot) => {
        plot.classList.remove('account-analytics__plot--hovering');
    });

    section.querySelectorAll('.account-analytics__points').forEach((layer) => {
        layer.replaceChildren();
        delete layer.dataset.activeIndex;
        delete layer.dataset.activeLineId;
    });
}

function invalidateAccountAnalyticsCharts(section) {
    section.querySelectorAll('.account-analytics__chart').forEach((chartEl) => {
        accountAnalyticsChartStore.delete(chartEl);
    });
}

function initAccountAnalyticsSort(section, renderCharts) {
    const dropdown = section.querySelector('.account-analytics__sort-dropdown');
    if (!dropdown) return;

    const toggle = dropdown.querySelector('.account-analytics__sort');
    const menu = dropdown.querySelector('.account-analytics__sort-menu');
    const periodLabel = section.querySelector('.account-analytics__period-label');
    const options = dropdown.querySelectorAll('[data-analytics-period]');

    if (!toggle || !menu) return;

    function closeDropdown() {
        dropdown.classList.remove('account-analytics__sort-dropdown--open');
        toggle.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
    }

    function openDropdown() {
        dropdown.classList.add('account-analytics__sort-dropdown--open');
        toggle.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
    }

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();

        if (dropdown.classList.contains('account-analytics__sort-dropdown--open')) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });

    options.forEach((option) => {
        option.addEventListener('click', () => {
            const period = option.dataset.analyticsPeriod;
            if (!period || period === getAccountAnalyticsPeriod(section)) {
                closeDropdown();
                return;
            }

            options.forEach((item) => {
                item.classList.remove('account-analytics__sort-option--active');
            });
            option.classList.add('account-analytics__sort-option--active');

            section.dataset.analyticsPeriod = period;

            if (periodLabel) {
                periodLabel.textContent = option.textContent.trim();
            }

            invalidateAccountAnalyticsCharts(section);
            clearAccountAnalyticsActiveState(section);
            renderCharts();
            closeDropdown();
        });
    });

    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target)) {
            closeDropdown();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDropdown();
        }
    });
}

function getAccountAnalyticsChartState(chartEl, type, section) {
    const period = getAccountAnalyticsPeriod(section);
    const filterKey = getAccountAnalyticsFilterKey(section);
    const cached = accountAnalyticsChartStore.get(chartEl);

    if (cached && cached.type === type && cached.period === period && cached.filterKey === filterKey) {
        return cached;
    }

    const state = createAccountAnalyticsChartState(type, period, section, filterKey);
    accountAnalyticsChartStore.set(chartEl, state);
    return state;
}

function createAccountAnalyticsChartState(type, period, section, filterKey) {
    const periodConfig = buildAccountAnalyticsPeriodConfig(period, section);
    const pointCount = periodConfig.points.length;
    const searchSeed = section.dataset.analyticsFiltersApplied === 'true'
        ? hashAccountAnalyticsString(section.dataset.analyticsSearch || '')
        : 0;
    const periodSalt = hashAccountAnalyticsString(`${period}|${filterKey}`);

    if (type === 'total') {
        const platformValues = ACCOUNT_ANALYTICS_PLATFORM_LINES.map((line, lineIndex) => (
            generateSmoothAccountAnalyticsLine(
                pointCount,
                line.min,
                line.max,
                periodSalt + lineIndex + 1 + searchSeed
            )
        ));

        return {
            type,
            period,
            filterKey,
            points: periodConfig.points,
            lines: [{
                id: 'total',
                color: '#009a5f',
                width: 3,
                values: generateSmoothAccountAnalyticsLine(
                    pointCount,
                    120000,
                    1480000,
                    periodSalt + searchSeed
                ),
            }],
            platformValues,
        };
    }

    return {
        type,
        period,
        filterKey,
        points: periodConfig.points,
        lines: ACCOUNT_ANALYTICS_PLATFORM_LINES.map((line, lineIndex) => ({
            id: line.id,
            color: line.color,
            width: 2,
            values: generateWavyAccountAnalyticsLine(
                pointCount,
                line.min,
                line.max,
                periodSalt + lineIndex + 1 + searchSeed
            ),
        })),
    };
}

function getAccountAnalyticsMetrics(width, height, pointCount) {
    const padding = { top: 10, right: 4, bottom: 12, left: 16 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const safePointCount = Math.max(pointCount, 1);

    return {
        padding,
        chartWidth,
        chartHeight,
        pointCount: safePointCount,
        valueToY(value) {
            return padding.top + chartHeight - (value / ACCOUNT_ANALYTICS_Y_MAX) * chartHeight;
        },
        indexToX(index) {
            if (safePointCount <= 1) {
                return padding.left;
            }

            return padding.left + (chartWidth / (safePointCount - 1)) * index;
        },
    };
}

function renderAccountAnalyticsChart(chartEl, section) {
    const plot = chartEl.querySelector('.account-analytics__plot');
    const canvas = chartEl.querySelector('.account-analytics__canvas');
    const pointsLayer = chartEl.querySelector('.account-analytics__points');
    const tooltip = chartEl.querySelector('.account-analytics__tooltip');

    if (!plot || !canvas || !pointsLayer || !tooltip) return;

    const type = chartEl.dataset.chart;
    const state = getAccountAnalyticsChartState(chartEl, type, section);
    const width = plot.clientWidth;
    const height = plot.clientHeight;

    renderAccountAnalyticsXAxis(chartEl, state, width);

    if (!width || !height) return;

    drawAccountAnalyticsChart(canvas, state, width, height);

    const activeIndex = Number(pointsLayer.dataset.activeIndex);
    const activeLineId = pointsLayer.dataset.activeLineId || '';

    if (!Number.isNaN(activeIndex) && activeLineId) {
        renderAccountAnalyticsHoverPoint(plot, pointsLayer, state, width, height, activeIndex, activeLineId);
        const activeButton = pointsLayer.querySelector('.account-analytics__point-btn');

        if (activeButton) {
            showAccountAnalyticsTooltip(plot, tooltip, state, activeButton, activeIndex, activeLineId);
        }
    } else {
        pointsLayer.replaceChildren();
        tooltip.hidden = true;
    }
}

function bindAccountAnalyticsHover(section) {
    section.querySelectorAll('.account-analytics__plot').forEach((plot) => {
        if (plot.dataset.hoverBound) return;
        plot.dataset.hoverBound = 'true';

        plot.addEventListener('mousemove', (event) => {
            const chartEl = plot.closest('.account-analytics__chart');
            const pointsLayer = plot.querySelector('.account-analytics__points');
            const tooltip = plot.querySelector('.account-analytics__tooltip');
            if (!chartEl || !pointsLayer || !tooltip) return;

            const state = getAccountAnalyticsChartState(chartEl, chartEl.dataset.chart, section);
            const width = plot.clientWidth;
            const height = plot.clientHeight;
            if (!width || !height || !state.points.length) return;

            const rect = plot.getBoundingClientRect();
            const relativeX = event.clientX - rect.left;
            const relativeY = event.clientY - rect.top;
            const metrics = getAccountAnalyticsMetrics(width, height, state.points.length);
            const chartX = Math.max(metrics.padding.left, Math.min(metrics.padding.left + metrics.chartWidth, relativeX));
            const rawIndex = metrics.chartWidth
                ? ((chartX - metrics.padding.left) / metrics.chartWidth) * (state.points.length - 1)
                : 0;
            const index = Math.round(rawIndex);
            const clampedIndex = Math.max(0, Math.min(state.points.length - 1, index));

            let lineId = state.lines[0]?.id || 'total';

            if (state.type === 'platforms') {
                lineId = findNearestAccountAnalyticsLineId(state, metrics, clampedIndex, relativeY) || lineId;
            }

            plot.classList.add('account-analytics__plot--hovering');
            pointsLayer.dataset.activeIndex = String(clampedIndex);
            pointsLayer.dataset.activeLineId = lineId;

            renderAccountAnalyticsHoverPoint(plot, pointsLayer, state, width, height, clampedIndex, lineId);

            const button = pointsLayer.querySelector('.account-analytics__point-btn');
            if (button) {
                showAccountAnalyticsTooltip(plot, tooltip, state, button, clampedIndex, lineId);
            }
        });

        plot.addEventListener('mouseleave', () => {
            plot.classList.remove('account-analytics__plot--hovering');

            const pointsLayerEl = plot.querySelector('.account-analytics__points');
            if (pointsLayerEl) {
                pointsLayerEl.replaceChildren();
                delete pointsLayerEl.dataset.activeIndex;
                delete pointsLayerEl.dataset.activeLineId;
            }

            const tooltipEl = plot.querySelector('.account-analytics__tooltip');
            if (tooltipEl) {
                tooltipEl.hidden = true;
            }
        });
    });
}

function findNearestAccountAnalyticsLineId(state, metrics, index, relativeY) {
    let nearestLineId = state.lines[0]?.id || '';
    let nearestDistance = Infinity;

    state.lines.forEach((line) => {
        const value = line.values[index];
        if (typeof value !== 'number') return;

        const pointY = metrics.valueToY(value);
        const distance = Math.abs(pointY - relativeY);

        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestLineId = line.id;
        }
    });

    return nearestLineId;
}

function renderAccountAnalyticsHoverPoint(plot, pointsLayer, state, width, height, index, lineId) {
    const line = state.lines.find((item) => item.id === lineId) || state.lines[0];
    if (!line) {
        pointsLayer.replaceChildren();
        return;
    }

    const metrics = getAccountAnalyticsMetrics(width, height, state.points.length);
    const value = line.values[index];
    const x = metrics.indexToX(index);
    const y = metrics.valueToY(value);
    const button = document.createElement('button');

    button.type = 'button';
    button.className = `account-analytics__point-btn account-analytics__point-btn--visible account-analytics__point-btn--line-${line.id}`;
    button.style.left = `${(x / width) * 100}%`;
    button.style.top = `${(y / height) * 100}%`;
    button.setAttribute('aria-hidden', 'true');
    button.tabIndex = -1;

    pointsLayer.replaceChildren(button);
}

function drawAccountAnalyticsChart(canvas, state, width, height) {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const metrics = getAccountAnalyticsMetrics(width, height, state.points.length);
    const yTicks = [1600000, 1400000, 1200000, 1000000, 800000, 600000, 400000, 200000, 0];
    const baseY = metrics.valueToY(0);
    const stripeTop = metrics.padding.top - 8;
    const stripeHeight = baseY - stripeTop;

    drawAccountAnalyticsFridayStripes(ctx, state, metrics, stripeTop, stripeHeight);

    ctx.strokeStyle = '#9b9b9b';
    ctx.lineWidth = 1;

    yTicks.forEach((tick) => {
        const y = metrics.valueToY(tick);
        ctx.beginPath();
        ctx.moveTo(metrics.padding.left, y);
        ctx.lineTo(metrics.padding.left + metrics.chartWidth, y);
        ctx.stroke();
    });

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(metrics.padding.left, baseY);
    ctx.lineTo(metrics.padding.left + metrics.chartWidth, baseY);
    ctx.stroke();

    state.lines.forEach((line) => {
        drawSmoothAccountAnalyticsLine(
            ctx,
            line.values,
            line.color,
            line.width,
            metrics.indexToX,
            metrics.valueToY
        );
    });
}

function showAccountAnalyticsTooltip(plot, tooltip, state, button, index, lineId) {
    updateAccountAnalyticsTooltipContent(tooltip, state, index, lineId);

    tooltip.hidden = false;

    const plotWidth = plot.clientWidth;
    const plotHeight = plot.clientHeight;
    const buttonLeft = (parseFloat(button.style.left) / 100) * plotWidth;
    const buttonTop = (parseFloat(button.style.top) / 100) * plotHeight;
    const isPlatforms = state.type === 'platforms';
    const bubble = tooltip.querySelector('.account-analytics__tooltip-bubble');
    const tooltipBox = isPlatforms && bubble ? bubble : tooltip;
    const tooltipWidth = tooltipBox.offsetWidth;
    const tooltipHeight = tooltipBox.offsetHeight;
    const offset = 14;
    const tailHeight = isPlatforms ? 10 : 0;
    const minTop = 8;
    let left;
    let top = buttonTop - tooltipHeight - offset - tailHeight;

    if (isPlatforms) {
        const tailTipLeft = 50;
        left = buttonLeft - tailTipLeft;

        if (left < 8) {
            left = 8;
        } else if (left + tooltipWidth > plotWidth - 8) {
            left = plotWidth - tooltipWidth - 8;
        }

        top = Math.max(minTop, top);
        tooltip.style.transform = 'none';
    } else {
        left = buttonLeft;

        if (left - tooltipWidth / 2 < 8) {
            left = tooltipWidth / 2 + 8;
            tooltip.style.transform = 'translateX(-50%)';
        } else if (left + tooltipWidth / 2 > plotWidth - 8) {
            left = plotWidth - tooltipWidth / 2 - 8;
            tooltip.style.transform = 'translateX(-50%)';
        } else {
            tooltip.style.transform = 'translateX(-50%)';
        }

        if (top < minTop) {
            top = buttonTop + offset;
        }

        top = Math.max(minTop, Math.min(plotHeight - tooltipHeight - 8, top));
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

function updateAccountAnalyticsTooltipContent(tooltip, state, index, lineId = 'vk') {
    const dateLabel = getAccountAnalyticsDateLabel(state, index);
    const dateEl = tooltip.querySelector('.account-analytics__tooltip-date');
    if (dateEl) dateEl.textContent = dateLabel;

    if (state.type === 'total') {
        const platformIds = ACCOUNT_ANALYTICS_PLATFORM_LINES.map((line) => line.id);

        tooltip.querySelectorAll('.account-analytics__tooltip-row').forEach((row, rowIndex) => {
            const platformId = platformIds[rowIndex];
            const valueEl = row.querySelector('.account-analytics__tooltip-value');
            const platformValues = state.platformValues?.[rowIndex];
            const value = platformValues
                ? platformValues[index]
                : deriveAccountAnalyticsValue(index, rowIndex, 12000, 98000);

            if (valueEl) {
                valueEl.textContent = formatAccountAnalyticsNumber(value);
            }

            if (platformId) {
                row.className = `account-analytics__tooltip-row account-analytics__tooltip-row--${platformId}`;
            }
        });

        return;
    }

    const activeLine = state.lines.find((line) => line.id === lineId) || state.lines[0];
    const iconEl = tooltip.querySelector('[data-analytics-platform-icon]');
    const valueEl = tooltip.querySelector('[data-analytics-platform-value]');

    if (iconEl && activeLine) {
        iconEl.src = ACCOUNT_ANALYTICS_PLATFORM_ICONS[activeLine.id] || iconEl.src;
        iconEl.alt = activeLine.id;
    }

    if (valueEl && activeLine) {
        valueEl.textContent = formatAccountAnalyticsNumber(activeLine.values[index]);
    }
}

function updateAccountAnalyticsTotal(section) {
    const totalEl = section.querySelector('[data-analytics-total]');
    const chartEl = section.querySelector('[data-chart="total"]');
    if (!totalEl || !chartEl) return;

    const state = getAccountAnalyticsChartState(chartEl, 'total', section);

    if (state.platformValues?.length) {
        const totalValue = state.platformValues.reduce(
            (sum, values) => sum + values.reduce((lineSum, value) => lineSum + value, 0),
            0
        );
        totalEl.textContent = formatAccountAnalyticsNumber(totalValue);
        return;
    }

    const totalValue = state.lines[0]?.values.reduce((sum, value) => sum + value, 0) || 0;
    totalEl.textContent = formatAccountAnalyticsNumber(totalValue);
}

function getAccountAnalyticsDateLabel(state, index) {
    const point = state.points[index];
    if (!point) return '';

    return point.date || point.label;
}

function renderAccountAnalyticsXAxis(chartEl, state, plotWidth) {
    const axis = chartEl.querySelector('.account-analytics__x-axis');
    if (!axis) return;

    const width = plotWidth || chartEl.querySelector('.account-analytics__plot')?.clientWidth || 0;
    const metrics = getAccountAnalyticsMetrics(width, 1, state.points.length);
    const period = state.period || 'month';
    const labelsHtml = state.points
        .map((point, index) => {
            if (!point.axisLabel) return '';

            const x = metrics.indexToX(index);
            const left = width ? (x / width) * 100 : 0;
            const alignClass = 'account-analytics__x-label--align-center';

            return `<span class="account-analytics__x-label ${alignClass}" style="left: ${left}%">${point.axisLabel}</span>`;
        })
        .join('');

    axis.innerHTML = `
        <div class="account-analytics__x-labels account-analytics__x-labels--${period}">
            ${labelsHtml}
        </div>
    `;
}

function deriveAccountAnalyticsValue(index, salt, min, max) {
    const seed = (index + 1) * 9301 + salt * 49297;
    return min + (seed % (max - min + 1));
}

function formatAccountAnalyticsNumber(value) {
    return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function generateWavyAccountAnalyticsLine(count, min, max, seedSalt = 0) {
    if (count <= 0) return [];

    const range = max - min;
    const mid = min + range * 0.52;
    const phase = (seedSalt % 7) * 0.45;
    const values = [];

    for (let i = 0; i < count; i += 1) {
        const waveA = Math.sin((i * 0.95) + phase) * range * 0.3;
        const waveB = Math.sin((i * 1.85) + phase + 1.2) * range * 0.14;
        const waveC = Math.cos((i * 0.55) + phase * 0.7) * range * 0.08;
        const noise = (deriveAccountAnalyticsValue(i, seedSalt, -6, 6) / 100) * range;
        let value = mid + waveA + waveB + waveC + noise;

        value = Math.max(min, Math.min(max, value));
        values.push(value);
    }

    return values;
}

function generateSmoothAccountAnalyticsLine(count, min, max, seedSalt = 0) {
    if (count <= 0) return [];

    const range = max - min;
    let current = min + range * (0.35 + (deriveAccountAnalyticsValue(0, seedSalt, 0, 30) / 100));
    const values = [];

    for (let i = 0; i < count; i += 1) {
        const drift = (deriveAccountAnalyticsValue(i, seedSalt + 3, -8, 8) / 100) * range;
        const target = min + range * (0.25 + (deriveAccountAnalyticsValue(i, seedSalt + 7, 10, 90) / 100));
        current += (target - current) * 0.18 + drift * 0.04;
        current = Math.max(min, Math.min(max, current));
        values.push(current);
    }

    return values;
}

function drawSmoothAccountAnalyticsLine(ctx, values, color, lineWidth, indexToX, valueToY) {
    if (!values.length) return;

    const points = values.map((value, index) => ({
        x: indexToX(index),
        y: valueToY(value),
    }));

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    if (points.length === 1) {
        ctx.stroke();
        return;
    }

    if (points.length === 2) {
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
        return;
    }

    for (let i = 0; i < points.length - 1; i += 1) {
        const p0 = points[i - 1] || points[i];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    ctx.stroke();
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return startOfDay(next);
}

function formatAccountAnalyticsAxisLabel(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}.${month}`;
}

function hashAccountAnalyticsString(value) {
    let hash = 0;

    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash) + value.charCodeAt(i);
        hash |= 0;
    }

    return Math.abs(hash);
}
