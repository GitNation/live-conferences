// offcanvass
// ----------------------------------------------
const offcanvasLinks = document.querySelectorAll('._open-modal');
const offcanvasCloseIcon = document.querySelectorAll('._close-modal');
const html = document.querySelector('html');

let unlock = true;

const timeout = 200;

if (offcanvasLinks.length > 0) {
  for (let index = 0; index < offcanvasLinks.length; index++) {
    const offcanvasLink = offcanvasLinks[index];
    offcanvasLink.addEventListener('click', function(e) {
      let offcanvasName;
      if (this.hasAttribute('href')) {
        offcanvasName = offcanvasLink.getAttribute('href').replace('#', '');
      } else {
        offcanvasName = offcanvasLink.getAttribute('data-href').replace('#', '');
      }

      const curentoffcanvas = document.getElementById(offcanvasName);
      offcanvasOpen(curentoffcanvas);
      e.preventDefault();
    });
  }
}

if (offcanvasCloseIcon.length > 0) {
  for (let index = 0; index < offcanvasCloseIcon.length; index++) {
    const el = offcanvasCloseIcon[index];
    el.addEventListener('click', function(e) {
      offcanvasClose(el.closest('._modal'));
      if (el.dataset.storage) {
        localStorage.setItem(el.dataset.storage, true);
      }
      e.preventDefault();
    });
  }
}

function offcanvasOpen(curentoffcanvas) {
  if (curentoffcanvas && unlock) {
    const offcanvasActive = document.querySelector('._modal._open');
    if (offcanvasActive) {
      offcanvasClose(offcanvasActive, false);
    } else {
      bodyLock();
    }
    curentoffcanvas.classList.add('_open');
    setTimeout(() => {
      curentoffcanvas.classList.add('_animate');
    }, 50);
    curentoffcanvas.addEventListener('click', function(e) {
      if (!e.target.closest('._modal__content')) {
        offcanvasClose(e.target.closest('._modal'));
      }
    });
  }
}

function offcanvasClose(offcanvasActive, doUnlock = true) {
  if (unlock) {
    offcanvasActive.classList.remove('_animate');

    setTimeout(() => {
      offcanvasActive.classList.remove('_open');
    }, 250);
    if (doUnlock) {
      // если открыто фиксированное меню то...
      bodyUnLock();
    }
  }
}

function bodyLock() {
  html.classList.add('lock');

  unlock = false;
  setTimeout(function() {
    unlock = true;
  }, timeout);
}

function bodyUnLock() {
  setTimeout(function() {
    html.classList.remove('lock');
  }, timeout);

  unlock = false;
  setTimeout(function() {
    unlock = true;
  }, timeout);
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const offcanvasActive = document.querySelector('._modal._open');
    offcanvasClose(offcanvasActive);
  }
});

if (document.querySelector('#popup-pst')) {
  const PopupPst = document.querySelector('#popup-pst');
  document.querySelector('.js-subscribe-tools').addEventListener('click', function() {
    localStorage.setItem('popupSubscriptionToolsIsHidden', true);
  });

  if (localStorage.popupSubscriptionToolsIsHidden !== 'true') {
    setTimeout(() => {
      offcanvasOpen(PopupPst);
      bodyLock();
    }, 10000);
  }
}

// Initialize already opened modals on page load
document.addEventListener('DOMContentLoaded', function() {
  const openModals = document.querySelectorAll('._modal._open');
  if (openModals.length > 0) {
    bodyLock();
    openModals.forEach(function(modal) {
      modal.addEventListener('click', function(e) {
        if (!e.target.closest('._modal__content')) {
          offcanvasClose(modal);
        }
      });
    });
  }
});
