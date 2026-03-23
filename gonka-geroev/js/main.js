'use strict';

const syncPersonalModalState = () => {
    const hasActiveModal = document.querySelector('.personal-add--active, .personal-contact--active, .personal-style--active');
    document.body.classList.toggle('personal-modal-open', Boolean(hasActiveModal));
};

window.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    const headerInner = document.querySelector('.header__inner');
    const burgerBtn = document.querySelector('.header__burger');
    const closeBtn = document.querySelector('.header__close');

    if (header && headerInner && burgerBtn && closeBtn) {
        const CLASS_ACTIVE = 'header__inner--active';

        const closeMenu = () => {
            headerInner.classList.remove(CLASS_ACTIVE);
        };

        const toggleMenu = () => {
            headerInner.classList.toggle(CLASS_ACTIVE);
        };

        burgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
        });

        document.addEventListener('click', (e) => {
            // Если меню не открыто — не делаем ничего
            if (!headerInner.classList.contains(CLASS_ACTIVE)) return;

            // Не закрываем при клике по элементам управления
            if (e.target.closest('.header__burger, .header__close')) return;

            closeMenu();
        });
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const dropBtn = document.querySelector('[data-filter-drop-btn]');
    const filterContent = document.querySelector('.catalog__filter-content');
    const applyBtn = document.querySelector('[data-filter-apply-btn]');

    if (!dropBtn || !filterContent) return;

    const CLASS_ACTIVE = 'catalog__filter-content--active';

    const toggleActive = () => {
        filterContent.classList.toggle(CLASS_ACTIVE);
    };

    const close = () => {
        filterContent.classList.remove(CLASS_ACTIVE);
    };

    dropBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleActive();
    });

    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            close();
        });
    }

    // Закрываем при клике вне фильтра
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target && target.closest && target.closest('.catalog__filter-content, [data-filter-drop-btn]')) return;
        close();
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const sponsorshipSliderEl = document.querySelector('.sponsorship__column-slider.swiper');
    if (!sponsorshipSliderEl) return;
    if (typeof Swiper === 'undefined') return;

    new Swiper(sponsorshipSliderEl, {
        slidesPerView: 'auto',
        spaceBetween: 0,
        grabCursor: true,
        observer: true,
        observeParents: true,
        watchSlidesProgress: true,
        navigation: {
            prevEl: '.sponsorship__arrow-left',
            nextEl: '.sponsorship__arrow-right',
        },
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const backLink = document.querySelector('.catalog-more__back-link');
    if (!backLink) return;

    backLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.back();
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const teamItems = document.querySelectorAll('.personal__team-block-item');
    if (!teamItems.length) return;

    teamItems.forEach((item) => {
        const arrow = item.querySelector('.personal__dropdown-img');
        if (!arrow) return;

        arrow.addEventListener('click', () => {
            item.classList.toggle('personal__team-block-item--open');
        });
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const serviceItems = document.querySelectorAll('.personal__service-block-item');
    if (!serviceItems.length) return;

    serviceItems.forEach((item) => {
        const arrow = item.querySelector('.personal__service-block-dropdown-img');
        if (!arrow) return;

        arrow.addEventListener('click', () => {
            item.classList.toggle('personal__service-block-item--open');
        });
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.querySelector('[data-teams-dropdown]');
    if (!dropdown) return;

    const menu = dropdown.querySelector('.personal__teams-list');
    const closeBtn = dropdown.querySelector('.personal__teams-list-close');
    const teamCurrent = dropdown.querySelector('.personal__team-current');
    const teamButtons = dropdown.querySelectorAll('[data-team-name]');
    if (!menu || !teamCurrent) return;

    const OPEN_CLASS = 'personal__teams-list--open';

    const openMenu = () => {
        menu.classList.add(OPEN_CLASS);
    };

    const closeMenu = () => {
        menu.classList.remove(OPEN_CLASS);
    };

    dropdown.addEventListener('click', (e) => {
        if (e.target.closest('.personal__teams-list')) return;
        if (menu.classList.contains(OPEN_CLASS)) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenu();
        });
    }

    teamButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            teamCurrent.textContent = btn.textContent;
            closeMenu();
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('[data-teams-dropdown]')) {
            closeMenu();
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.querySelector('[data-add-btn]');
    const modal = document.querySelector('[data-add-participant-modal]');
    const closeBtn = document.querySelector('[data-add-participant-close]');

    if (!openBtn || !modal || !closeBtn) return;

    const ACTIVE_CLASS = 'personal-add--active';

    const openModal = () => {
        modal.classList.add(ACTIVE_CLASS);
        syncPersonalModalState();
    };

    const closeModal = () => {
        modal.classList.remove(ACTIVE_CLASS);
        syncPersonalModalState();
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.querySelector('[data-upload-style]');
    const modal = document.querySelector('[data-upload-style-modal]');
    const closeBtn = document.querySelector('[data-upload-style-close]');

    if (!openBtn || !modal || !closeBtn) return;

    const ACTIVE_CLASS = 'personal-style--active';

    const openModal = () => {
        modal.classList.add(ACTIVE_CLASS);
        syncPersonalModalState();
    };

    const closeModal = () => {
        modal.classList.remove(ACTIVE_CLASS);
        syncPersonalModalState();
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    const uploadFields = modal.querySelectorAll('[data-upload-field]');
    uploadFields.forEach((field) => {
        const input = field.querySelector('.personal-style__input');
        const addBtn = field.querySelector('.personal-style__add-file');
        const removeBtn = field.querySelector('.personal-style__remove');
        const filenameEl = field.querySelector('.personal-style__filename');

        if (!input || !addBtn || !removeBtn || !filenameEl) return;

        addBtn.addEventListener('click', () => {
            input.click();
        });

        input.addEventListener('change', () => {
            const file = input.files && input.files[0];
            if (!file) return;
            filenameEl.textContent = file.name;
            field.classList.add('personal-style__field--filled');
        });

        removeBtn.addEventListener('click', () => {
            input.value = '';
            filenameEl.textContent = '';
            field.classList.remove('personal-style__field--filled');
        });
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const openBtns = document.querySelectorAll('[data-edit-data]');
    const modal = document.querySelector('[data-edit-participant-modal]');
    const closeBtn = document.querySelector('[data-edit-participant-close]');
    const title = modal ? modal.querySelector('.personal-add__title') : null;

    if (!openBtns.length || !modal || !closeBtn || !title) return;

    const ACTIVE_CLASS = 'personal-add--active';

    const getParticipantNumber = (btn) => {
        const item = btn.closest('.personal__team-block-item');
        if (!item) return 1;
        const items = Array.from(document.querySelectorAll('.personal__team-block-item'));
        const index = items.indexOf(item);
        return index >= 0 ? index + 1 : 1;
    };

    const openModal = (btn) => {
        const number = getParticipantNumber(btn);
        title.textContent = `участник #${number}`;
        modal.classList.add(ACTIVE_CLASS);
        syncPersonalModalState();
    };

    const closeModal = () => {
        modal.classList.remove(ACTIVE_CLASS);
        syncPersonalModalState();
    };

    openBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            openModal(btn);
        });
    });

    closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

window.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.querySelector('[data-contact-curator]');
    const modal = document.querySelector('[data-contact-curator-modal]');
    const closeBtn = document.querySelector('[data-contact-curator-close]');

    if (!openBtn || !modal || !closeBtn) return;

    const ACTIVE_CLASS = 'personal-contact--active';

    const openModal = () => {
        modal.classList.add(ACTIVE_CLASS);
        syncPersonalModalState();
    };

    const closeModal = () => {
        modal.classList.remove(ACTIVE_CLASS);
        syncPersonalModalState();
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

