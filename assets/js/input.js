// 2/2 update
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.input-box').forEach((box) => {
    const input = box.querySelector('input');
    const clearBtn = box.querySelector('.icon-clear');
    const eyeBox = box.querySelector('.eye-button-box');
    const searchBox = box.querySelector('.search-button-box');
    const timeBox = box.querySelector('.time');

    const updateClearBtn = () => {
      const hasValue = input.value.length > 0;
      const isReadonly = input.readOnly;
      if (isReadonly) {
        clearBtn.style.display = 'none';
        input.style.paddingRight = '';
        return;
      }
      clearBtn.style.display = hasValue ? 'block' : 'none';
      if (eyeBox) eyeBox.style.right = hasValue ? '4.4rem' : '1.2rem';
      if (hasValue) {
        input.style.paddingRight = eyeBox || searchBox ? '7.6rem' : '4.4rem';
      } else {
        input.style.paddingRight = '';
      }
      if (timeBox) timeBox.style.right = hasValue ? '4.4rem' : '';
    };

    box.addEventListener('input', updateClearBtn);
    updateClearBtn();

    clearBtn.addEventListener('click', () => {
      input.value = '';
      updateClearBtn();
      input.focus();
    });
  });

  document.querySelectorAll('.btn-eye').forEach((btn) => {
    btn.addEventListener('click', () => {
      const box = btn.closest('.input-box');
      const input = box.querySelector('input');
      const eyeBox = box.querySelector('.eye-button-box');
      const clearBtn = box.querySelector('.icon-clear');

      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.classList.toggle('active', show);

      const hasValue = input.value.length > 0;
      if (clearBtn) clearBtn.style.display = hasValue ? 'block' : 'none';
      if (eyeBox) eyeBox.style.right = hasValue ? '4.4rem' : '1.2rem';
    });
  });
});
