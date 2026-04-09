// btn-eye 버튼 클릭 시 input type 토글 및 active 클래스 관리
$(document).ready(function () {
  // 이벤트 위임을 사용하여 동적으로 생성된 요소에도 작동하도록 함
  $(document).on('click', '.btn-eye', function () {
    const $btnEye = $(this);
    const $inputWrap = $btnEye.closest('.input-wrap');
    const $input = $inputWrap.find('input[type="password"], input[type="text"]');

    if ($input.length === 0) return;

    // input type 토글
    if ($input.attr('type') === 'password') {
      $input.attr('type', 'text');
      $btnEye.addClass('active');
    } else if ($input.attr('type') === 'text') {
      $input.attr('type', 'password');
      $btnEye.removeClass('active');
    }
  });
});
