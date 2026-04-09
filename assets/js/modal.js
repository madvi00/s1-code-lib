/*
 ** modal
 */

document.addEventListener('DOMContentLoaded', function () {
  const modals = document.querySelectorAll('.modal');
  const btnShows = document.querySelectorAll('.btn-modal');

  btnShows.forEach((btnShow) => {
    btnShow.addEventListener('click', function () {
      const modalId = btnShow.getAttribute('data-modal');
      const modalEl = document.getElementById(modalId);
      modalEl.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  modals.forEach((modal) => {
    const btnClose = modal.querySelector('.btn-close');
    const dim = modal.querySelector('.dim');

    const closeModal = () => {
      modal.classList.remove('is-open');
      document.body.removeAttribute('style');
    };

    if (btnClose) {
      btnClose.addEventListener('click', closeModal);
    }

    if (dim) {
      dim.addEventListener('click', closeModal);
    }
  });
});
