document.addEventListener('DOMContentLoaded', function () {
  const maxFileSize = `10MB`; // 최대 파일 크기
  const fileFields = document.querySelectorAll('.field-file');

  // 초기화 함수 호출
  if (fileFields) {
    for (const fileField of fileFields) {
      resetFileField(fileField);
    }
  }

  function resetFileField(fileField) {
    const fileNameInput = fileField.querySelector('.file-upload');
    if (fileNameInput) {
      fileNameInput.addEventListener('change', updateFileName);
    }
  }

  function updateFileName(event) {
    const target = event.target;
    const parent = target.closest('.file');
    const fileNameLabel = parent.querySelector('.file-name');
    const nameRemoveBtn = parent.querySelector('.btn-name-remove');
    const currentFieldFile = target.closest('.field-file');

    if (target.files.length > 0) {
      const file = target.files[0];
      const fileSize = file.size;

      fileNameLabel.value = file.name;
      fileNameLabel.dataset.size = fileSize;
      nameRemoveBtn.style.display = 'block';

      nameRemoveBtn.addEventListener('click', function handleRemove() {
        target.value = '';
        fileNameLabel.value = '';
        fileNameLabel.dataset.size = 0;
        nameRemoveBtn.style.display = 'none';
        updateFileSizeDisplay(currentFieldFile);
        nameRemoveBtn.removeEventListener('click', handleRemove);
      });
    } else {
      fileNameLabel.value = '';
      fileNameLabel.dataset.size = 0;
      nameRemoveBtn.style.display = 'none';
    }

    updateFileSizeDisplay(currentFieldFile);
  }

  function updateFileSizeDisplay(fieldFile) {
    if (!fieldFile) return;

    const descBox = fieldFile.querySelector('.field-desc-box .field-desc');

    if (!descBox) return;

    // 기존 sizeBox를 찾아냄
    let sizeBox = descBox.querySelector('.desc-size-box');

    const currentFileNames = fieldFile.querySelectorAll('.file-name');
    let sumFileSize = 0;

    for (const fileName of currentFileNames) {
      const fileSize = fileName.dataset.size ? parseFloat(fileName.dataset.size) : 0;
      sumFileSize += fileSize;
    }

    if (sumFileSize === 0) {
      // sizeBox가 존재하면 제거
      if (sizeBox) {
        sizeBox.remove();
      }
    } else {
      // sizeBox가 없으면 생성
      if (!sizeBox) {
        sizeBox = document.createElement('span');
        sizeBox.className = 'desc-size-box';
        descBox.append(sizeBox);
      }

      // 파일 크기 표시 업데이트
      const formattedSize = getByteSize(sumFileSize);
      sizeBox.innerHTML = `[첨부된 파일 <em class="red">${formattedSize}</em>/<em class="bold">${maxFileSize}</em>]`;
    }
  }

  function getByteSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)}${units[unitIndex]}`;
  }
});
