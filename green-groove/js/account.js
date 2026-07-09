'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const account = document.querySelector('.account');
    if (!account) return;

    initAccountSidebarTabs(account);
    initAccountAnalytics(account);

    const finance = account.querySelector('.account-finance');
    if (!finance) return;

    const yearPanels = finance.querySelectorAll('.account-finance__year-panel');
    const yearTabs = finance.querySelectorAll('.account-finance__year-btn');
    const yearFallbackPanel = finance.querySelector('.account-finance__year-panel[data-year-fallback]');

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
            yearTabs.forEach((yearTab) => {
                yearTab.classList.toggle('hover-dark-green', yearTab === tab);
            });
            setActivePanel(yearPanels, panel, 'account-finance__year-panel--active');
            activateFirstQuarter(panel);
        });
    });

    function initQuarterTabs(yearPanel) {
        const quarterTabs = yearPanel.querySelectorAll('.account-finance__quarter-btn');
        const quarterPanels = yearPanel.querySelectorAll('.account-finance__quarter-panel');

        if (!quarterTabs.length || !quarterPanels.length) return;

        quarterTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                const quarter = tab.dataset.quarter;
                const panel = yearPanel.querySelector(`.account-finance__quarter-panel[data-quarter="${quarter}"]`);
                if (!panel) return;

                setActiveTab(quarterTabs, tab, 'account-finance__quarter-btn--active');
                setActivePanel(quarterPanels, panel, 'account-finance__quarter-panel--active');
            });
        });
    }

    function activateFirstQuarter(yearPanel) {
        const firstQuarterTab = yearPanel.querySelector('.account-finance__quarter-btn');
        if (firstQuarterTab) {
            firstQuarterTab.click();
        }
    }

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

    initReportActions(account);
    initReportApproveModals(account);
});

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
                activeReport.querySelector('.account-finance__report-icon--approved')?.classList.add('hover-dark-green');
                activeReport.querySelector('.account-finance__report-btn--approved')?.classList.add('hover-dark-green');
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

const ACCOUNT_ANALYTICS_PERIODS = {
    week: {
        label: 'Неделя',
        context: 'Январь',
        showContext: true,
        points: [
            { label: '1', date: '1 нед. янв' },
            { label: '2', date: '2 нед. янв' },
            { label: '3', date: '3 нед. янв' },
            { label: '4', date: '4 нед. янв' },
        ],
    },
    month: {
        label: 'Месяц',
        context: '1 квартал',
        showContext: true,
        points: [
            { label: 'Январь', date: '01.01' },
            { label: 'Февраль', date: '01.02' },
            { label: 'Март', date: '01.03' },
        ],
    },
    quarter: {
        label: 'Квартал',
        showContext: false,
        points: [
            { label: '1 квартал', date: '1 кв. 2026' },
            { label: '2 квартал', date: '2 кв. 2026' },
            { label: '3 квартал', date: '3 кв. 2026' },
            { label: '4 квартал', date: '4 кв. 2026' },
        ],
    },
    year: {
        label: 'Год',
        showContext: false,
        points: [
            { label: '2023', date: '2023' },
            { label: '2024', date: '2024' },
            { label: '2025', date: '2025' },
            { label: '2026', date: '2026' },
        ],
    },
};

const ACCOUNT_ANALYTICS_PERIOD_SALTS = {
    week: 11,
    month: 22,
    quarter: 33,
    year: 44,
};

const ACCOUNT_ANALYTICS_PLATFORM_LINES = [
    { id: 'vk', color: '#5378ff', min: 70000, max: 1180000 },
    { id: 'yam', color: '#e5cf09', min: 50000, max: 1020000 },
    { id: 'zvuk', color: '#ff2a2d', min: 40000, max: 880000 },
    { id: 'kion', color: '#ff3fd5', min: 35000, max: 760000 },
    { id: 'spotify', color: '#14ce2e', min: 60000, max: 1120000 },
    { id: 'ok', color: '#ff891b', min: 30000, max: 620000 },
    { id: 'apple', color: '#0bc9de', min: 45000, max: 980000 },
];

const ACCOUNT_ANALYTICS_PLATFORM_SHORT_LABELS = {
    vk: 'VK',
    yam: 'ЯМ',
    zvuk: 'ЗВ',
    kion: 'КМ',
    apple: 'AM',
    spotify: 'SP',
    ok: 'ОД',
};

const accountAnalyticsChartStore = new WeakMap();

function initAccountAnalytics(account) {
    const section = account.querySelector('.account-analytics');
    if (!section) return;

    if (!section.dataset.analyticsPeriod) {
        section.dataset.analyticsPeriod = 'quarter';
    }

    function renderCharts() {
        section.querySelectorAll('.account-analytics__chart').forEach((chartEl) => {
            renderAccountAnalyticsChart(chartEl, section);
        });
    }

    initAccountAnalyticsSort(section, renderCharts);

    renderCharts();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderCharts, 150);
    });

    account.querySelector('[data-account-tab="analytics"]')?.addEventListener('click', () => {
        requestAnimationFrame(renderCharts);
    });

    document.addEventListener('click', (event) => {
        if (event.target.closest('.account-analytics__point-btn')) return;

        clearAccountAnalyticsActiveState(section);
    });
}

function getAccountAnalyticsPeriod(section) {
    return section.dataset.analyticsPeriod || 'quarter';
}

function getAccountAnalyticsPeriodConfig(period) {
    return ACCOUNT_ANALYTICS_PERIODS[period] || ACCOUNT_ANALYTICS_PERIODS.quarter;
}

function clearAccountAnalyticsActiveState(section) {
    section.querySelectorAll('.account-analytics__tooltip').forEach((tooltip) => {
        tooltip.hidden = true;
    });

    section.querySelectorAll('.account-analytics__point-btn--active').forEach((btn) => {
        btn.classList.remove('account-analytics__point-btn--active');
    });

    section.querySelectorAll('.account-analytics__points').forEach((layer) => {
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

function getAccountAnalyticsChartState(chartEl, type, period) {
    const cached = accountAnalyticsChartStore.get(chartEl);

    if (cached && cached.type === type && cached.period === period) {
        return cached;
    }

    const state = createAccountAnalyticsChartState(type, period);
    accountAnalyticsChartStore.set(chartEl, state);
    return state;
}

function createAccountAnalyticsChartState(type, period) {
    const periodConfig = getAccountAnalyticsPeriodConfig(period);
    const pointCount = periodConfig.points.length;
    const periodSalt = ACCOUNT_ANALYTICS_PERIOD_SALTS[period] || 33;

    if (type === 'total') {
        return {
            type,
            period,
            points: periodConfig.points,
            context: periodConfig.context || '',
            showContext: Boolean(periodConfig.showContext),
            lines: [{
                id: 'total',
                color: '#000000',
                width: 3,
                values: generateAccountAnalyticsLine(pointCount, 120000, 1480000, periodSalt),
            }],
        };
    }

    return {
        type,
        period,
        points: periodConfig.points,
        context: periodConfig.context || '',
        showContext: Boolean(periodConfig.showContext),
        lines: ACCOUNT_ANALYTICS_PLATFORM_LINES.map((line, lineIndex) => ({
            id: line.id,
            color: line.color,
            width: 2,
            values: generateAccountAnalyticsLine(
                pointCount,
                line.min,
                line.max,
                periodSalt + lineIndex + 1
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
    const period = getAccountAnalyticsPeriod(section);
    const state = getAccountAnalyticsChartState(chartEl, type, period);
    const width = plot.clientWidth;
    const height = plot.clientHeight;

    renderAccountAnalyticsXAxis(chartEl, state, width);

    if (!width || !height) return;

    drawAccountAnalyticsChart(canvas, state, width, height);
    renderAccountAnalyticsPoints(plot, pointsLayer, tooltip, state, width, height);
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

    ctx.strokeStyle = '#c5c5c5';
    ctx.lineWidth = 1;

    yTicks.forEach((tick) => {
        const y = metrics.valueToY(tick);
        ctx.beginPath();
        ctx.moveTo(metrics.padding.left, y);
        ctx.lineTo(metrics.padding.left + metrics.chartWidth, y);
        ctx.stroke();
    });

    const baseY = metrics.valueToY(0);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(metrics.padding.left, baseY);
    ctx.lineTo(metrics.padding.left + metrics.chartWidth, baseY);
    ctx.stroke();

    if (state.points.length > 1) {
        ctx.strokeStyle = '#8f8f8f';
        ctx.lineWidth = 2;

        for (let segment = 1; segment < state.points.length; segment += 1) {
            const x = metrics.padding.left + (metrics.chartWidth / (state.points.length - 1)) * segment;
            ctx.beginPath();
            ctx.moveTo(x, metrics.padding.top - 8);
            ctx.lineTo(x, baseY);
            ctx.stroke();
        }
    }

    state.lines.forEach((line) => {
        drawAccountAnalyticsLine(
            ctx,
            line.values,
            line.color,
            line.width,
            metrics.indexToX,
            metrics.valueToY
        );
    });
}

function renderAccountAnalyticsPoints(plot, pointsLayer, tooltip, state, width, height) {
    const metrics = getAccountAnalyticsMetrics(width, height, state.points.length);
    const activeIndex = Number(pointsLayer.dataset.activeIndex);
    const activeLineId = pointsLayer.dataset.activeLineId || '';
    const fragment = document.createDocumentFragment();

    state.lines.forEach((line) => {
        line.values.forEach((value, index) => {
            const x = metrics.indexToX(index);
            const y = metrics.valueToY(value);
            const button = document.createElement('button');
            const isActive = activeIndex === index && activeLineId === line.id;
            const dateLabel = getAccountAnalyticsDateLabel(state, index);

            button.type = 'button';
            button.className = `account-analytics__point-btn account-analytics__point-btn--line-${line.id}`;
            button.dataset.index = String(index);
            button.dataset.lineId = line.id;
            button.style.left = `${(x / width) * 100}%`;
            button.style.top = `${(y / height) * 100}%`;
            button.setAttribute('aria-label', `Показать данные за ${dateLabel}`);

            if (isActive) {
                button.classList.add('account-analytics__point-btn--active');
            }

            button.addEventListener('click', (event) => {
                event.stopPropagation();
                activateAccountAnalyticsPoint(plot, pointsLayer, tooltip, state, button, index, line.id);
            });

            fragment.appendChild(button);
        });
    });

    pointsLayer.replaceChildren(fragment);

    if (!Number.isNaN(activeIndex) && activeLineId) {
        const activeButton = pointsLayer.querySelector(
            `[data-index="${activeIndex}"][data-line-id="${activeLineId}"]`
        );

        if (activeButton) {
            showAccountAnalyticsTooltip(plot, tooltip, state, activeButton, activeIndex, activeLineId);
        }
    }
}

function activateAccountAnalyticsPoint(plot, pointsLayer, tooltip, state, button, index, lineId) {
    pointsLayer.dataset.activeIndex = String(index);
    pointsLayer.dataset.activeLineId = lineId;

    pointsLayer.querySelectorAll('.account-analytics__point-btn').forEach((pointBtn) => {
        pointBtn.classList.toggle('account-analytics__point-btn--active', pointBtn === button);
    });

    showAccountAnalyticsTooltip(plot, tooltip, state, button, index, lineId);
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
    const tooltipWidth = bubble ? bubble.offsetWidth : tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;
    const offset = 14;
    const tailOffset = isPlatforms ? 32 : tooltipWidth / 2;
    let left = isPlatforms ? buttonLeft - tailOffset : buttonLeft;
    let top = buttonTop - tooltipHeight - offset;

    if (isPlatforms) {
        if (left < 8) {
            left = 8;
        } else if (left + tooltipWidth > plotWidth - 8) {
            left = plotWidth - tooltipWidth - 8;
        }

        tooltip.style.transform = 'none';
    } else if (left - tooltipWidth / 2 < 8) {
        left = tooltipWidth / 2 + 8;
        tooltip.style.transform = 'translateX(-50%)';
    } else if (left + tooltipWidth / 2 > plotWidth - 8) {
        left = plotWidth - tooltipWidth / 2 - 8;
        tooltip.style.transform = 'translateX(-50%)';
    } else {
        tooltip.style.transform = 'translateX(-50%)';
    }

    if (top < 0) {
        top = buttonTop + offset;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

function updateAccountAnalyticsTooltipContent(tooltip, state, index, lineId = 'vk') {
    const dateLabel = getAccountAnalyticsDateLabel(state, index);

    if (state.type === 'total') {
        const dateEl = tooltip.querySelector('.account-analytics__tooltip-date');
        if (dateEl) dateEl.textContent = dateLabel;

        tooltip.querySelectorAll('.account-analytics__tooltip-row').forEach((row, rowIndex) => {
            const valueEl = row.querySelector('.account-analytics__tooltip-value');
            if (valueEl) {
                valueEl.textContent = formatAccountAnalyticsNumber(deriveAccountAnalyticsValue(index, rowIndex, 12000, 98000));
            }
        });

        return;
    }

    const dateEl = tooltip.querySelector('.account-analytics__tooltip-date');
    if (dateEl) dateEl.textContent = dateLabel;

    const activeLine = state.lines.find((line) => line.id === lineId) || state.lines[0];
    const platformLabelEl = tooltip.querySelector('.account-analytics__tooltip-label--platform');
    const statValueEl = tooltip.querySelector('.account-analytics__tooltip-summary > .account-analytics__tooltip-stat .account-analytics__tooltip-value');

    if (platformLabelEl && activeLine) {
        const shortLabel = ACCOUNT_ANALYTICS_PLATFORM_SHORT_LABELS[activeLine.id] || activeLine.id.toUpperCase();
        platformLabelEl.textContent = `${shortLabel}:`;
        platformLabelEl.className = `account-analytics__tooltip-label account-analytics__tooltip-label--platform account-analytics__tooltip-label--${activeLine.id}`;
    }

    if (statValueEl && activeLine) {
        statValueEl.textContent = `+ ${formatAccountAnalyticsNumber(activeLine.values[index])}`;
    }

    const indicatorValues = tooltip.querySelectorAll('.account-analytics__tooltip-indicators .account-analytics__tooltip-value');
    if (indicatorValues[0]) {
        indicatorValues[0].textContent = `+ ${formatAccountAnalyticsNumber(deriveAccountAnalyticsValue(index, 1, 4000, 28000))}`;
    }
    if (indicatorValues[1]) {
        indicatorValues[1].textContent = `- ${formatAccountAnalyticsNumber(deriveAccountAnalyticsValue(index, 2, 1000, 12000))}`;
    }

    tooltip.querySelectorAll('.account-analytics__tooltip-track').forEach((track, trackIndex) => {
        const changeEl = track.querySelector('.account-analytics__tooltip-change');
        const percent = deriveAccountAnalyticsValue(index, trackIndex + 3, 3, 18);
        const isUp = trackIndex === 0;

        if (!changeEl) return;

        changeEl.className = `account-analytics__tooltip-change account-analytics__tooltip-change--${isUp ? 'up' : 'down'}`;

        if (isUp) {
            changeEl.innerHTML = `<span class="account-analytics__tooltip-change-sign">+</span>${percent}<span class="account-analytics__tooltip-change-sign">%</span>`;
        } else {
            changeEl.innerHTML = `- ${percent}<span class="account-analytics__tooltip-change-sign">%</span>`;
        }
    });
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
    const labelsHtml = state.points
        .map((point, index) => {
            const x = metrics.indexToX(index);
            const left = width ? (x / width) * 100 : 0;

            return `<span class="account-analytics__x-label" style="left: ${left}%">${point.label}</span>`;
        })
        .join('');
    const contextHtml = state.showContext && state.context
        ? `<p class="account-analytics__x-context">${state.context}</p>`
        : '';

    axis.innerHTML = `
        <div class="account-analytics__x-labels">
            ${labelsHtml}
        </div>
        ${contextHtml}
    `;
}

function deriveAccountAnalyticsValue(index, salt, min, max) {
    const seed = (index + 1) * 9301 + salt * 49297;
    return min + (seed % (max - min + 1));
}

function formatAccountAnalyticsNumber(value) {
    return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function generateAccountAnalyticsLine(count, min, max, seedSalt = 0) {
    if (count <= 0) return [];

    const range = max - min;
    const levelPattern = [0.14, 0.86, 0.28, 0.92, 0.38, 0.78, 0.22, 0.84];
    const values = [];

    for (let i = 0; i < count; i += 1) {
        const phase = deriveAccountAnalyticsValue(i, seedSalt, 0, 1000) / 1000;
        const baseLevel = levelPattern[(i + seedSalt) % levelPattern.length];
        const offset = (phase - 0.5) * 0.16;
        const normalized = Math.max(0.08, Math.min(0.96, baseLevel + offset));

        values.push(min + normalized * range);
    }

    return values;
}

function drawAccountAnalyticsLine(ctx, values, color, lineWidth, indexToX, valueToY) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();

    values.forEach((value, index) => {
        const x = indexToX(index);
        const y = valueToY(value);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}
