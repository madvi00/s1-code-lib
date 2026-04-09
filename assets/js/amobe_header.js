function LanguageToggler(e) {
  const selButton = e.target;
  const languageBox = selButton.closest('.language-box');
  const thisOptions = languageBox.querySelectorAll('.lang-option');

  // 기존 외부 클릭 핸들러 제거
  if (languageBox._outsideClickHandler) {
    document.removeEventListener('click', languageBox._outsideClickHandler);
    languageBox._outsideClickHandler = null;
  }
  if (languageBox._blurHandler) {
    window.removeEventListener('blur', languageBox._blurHandler);
    languageBox._blurHandler = null;
  }

  languageBox.classList.toggle('active');

  if (languageBox.classList.contains('active')) {
    e.currentTarget.title = '언어선택 닫기';
  } else {
    e.currentTarget.title = '언어선택 열기';
    return; // 닫힐 때는 외부 클릭 핸들러를 추가하지 않음
  }

  const optionBtnClick = (e) => {
    const thisButton = e.target;
    const allButtons = thisOptions;

    for (const button of allButtons) {
      button.ariaCurrent = '';
      button.classList.remove('on');
    }

    selButton.textContent = thisButton.textContent;
    thisButton.ariaCurrent = 'page';
    thisButton.classList.add('on');
    languageBox.classList.remove('active');
    selButton.focus();

    languageBox.querySelector('.btn-language').title = '언어선택 열기';

    // 옵션 선택 시 외부 클릭 핸들러 제거
    if (languageBox._outsideClickHandler) {
      document.removeEventListener('click', languageBox._outsideClickHandler);
      languageBox._outsideClickHandler = null;
    }
    if (languageBox._blurHandler) {
      window.removeEventListener('blur', languageBox._blurHandler);
      languageBox._blurHandler = null;
    }
  };

  // 옵션 클릭 핸들러는 한 번만 추가 (중복 방지)
  if (!languageBox._optionHandlersAdded) {
    for (const thisOption of thisOptions) {
      thisOption.addEventListener('click', optionBtnClick);
    }
    languageBox._optionHandlersAdded = true;
  }

  // 외부 클릭 시 닫기
  const handleOutsideClick = (event) => {
    // iframe 요소를 클릭한 경우도 외부 클릭으로 간주
    const isIframe = event.target.tagName === 'IFRAME';
    if (!languageBox.contains(event.target) || isIframe) {
      languageBox.classList.remove('active');
      selButton.title = '언어선택 열기';
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('blur', handleBlur);
      languageBox._outsideClickHandler = null;
      languageBox._blurHandler = null;
    }
  };

  // window blur 이벤트 (아이프레임 클릭 시 포커스 이동 감지)
  const handleBlur = () => {
    // 포커스가 아이프레임으로 이동했을 때 드롭다운 닫기
    setTimeout(() => {
      if (languageBox.classList.contains('active')) {
        languageBox.classList.remove('active');
        selButton.title = '언어선택 열기';
        document.removeEventListener('click', handleOutsideClick);
        window.removeEventListener('blur', handleBlur);
        languageBox._outsideClickHandler = null;
        languageBox._blurHandler = null;
      }
    }, 0);
  };

  // 다음 이벤트 루프에서 실행하여 현재 클릭 이벤트가 처리된 후 실행되도록 함
  setTimeout(() => {
    if (languageBox.classList.contains('active')) {
      languageBox._outsideClickHandler = handleOutsideClick;
      languageBox._blurHandler = handleBlur;
      document.addEventListener('click', handleOutsideClick);
      window.addEventListener('blur', handleBlur);
    }
  }, 0);
}

// 마이메뉴 toggle (language-box 처럼 toggle 방식)
function MymenuToggler(e) {
  const btn = e.currentTarget;
  const mymenuBox = btn.closest('.mymenu-box');

  // 기존 외부 클릭 핸들러 제거
  if (mymenuBox._outsideClickHandler) {
    document.removeEventListener('click', mymenuBox._outsideClickHandler);
    mymenuBox._outsideClickHandler = null;
  }
  if (mymenuBox._blurHandler) {
    window.removeEventListener('blur', mymenuBox._blurHandler);
    mymenuBox._blurHandler = null;
  }

  mymenuBox.classList.toggle('active');
  const isActive = mymenuBox.classList.contains('active');

  btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  btn.title = isActive ? '마이메뉴 닫기' : '마이메뉴 열기';

  // 닫힐 때는 외부 클릭 핸들러를 추가하지 않음
  if (!isActive) {
    return;
  }

  // 외부 클릭 시 닫기
  const handleOutsideClick = (event) => {
    // iframe 요소를 클릭한 경우도 외부 클릭으로 간주
    const isIframe = event.target.tagName === 'IFRAME';
    if (!mymenuBox.contains(event.target) || isIframe) {
      mymenuBox.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      btn.title = '마이메뉴 열기';
      document.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('blur', handleBlur);
      mymenuBox._outsideClickHandler = null;
      mymenuBox._blurHandler = null;
    }
  };

  // window blur 이벤트 (아이프레임 클릭 시 포커스 이동 감지)
  const handleBlur = () => {
    // 포커스가 아이프레임으로 이동했을 때 드롭다운 닫기
    setTimeout(() => {
      if (mymenuBox.classList.contains('active')) {
        mymenuBox.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
        btn.title = '마이메뉴 열기';
        document.removeEventListener('click', handleOutsideClick);
        window.removeEventListener('blur', handleBlur);
        mymenuBox._outsideClickHandler = null;
        mymenuBox._blurHandler = null;
      }
    }, 0);
  };

  // 다음 이벤트 루프에서 실행하여 현재 클릭 이벤트가 처리된 후 실행되도록 함
  setTimeout(() => {
    if (mymenuBox.classList.contains('active')) {
      mymenuBox._outsideClickHandler = handleOutsideClick;
      mymenuBox._blurHandler = handleBlur;
      document.addEventListener('click', handleOutsideClick);
      window.addEventListener('blur', handleBlur);
    }
  }, 0);
}

document.addEventListener('DOMContentLoaded', function () {
  /* language options */
  const languageButton = document.querySelector('.btn-language');
  if (languageButton) {
    languageButton.addEventListener('click', LanguageToggler);
  }

  /* mymenu options */
  const mymenuBtn = document.querySelector('.btn-mymenu');
  if (mymenuBtn) {
    mymenuBtn.addEventListener('click', MymenuToggler);
  }
});
