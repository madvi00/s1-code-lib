---
description: "Workspace instructions for the s1-code-lib frontend library. Use this guidance when editing HTML, CSS, and JavaScript in this repository."
---

# s1-code-lib workspace instructions

## 프로젝트 개요
- 이 저장소는 PC/Mobile UI 컴포넌트 라이브러리와 컴포넌트 미리보기 페이지로 구성된 정적 프론트엔드 프로젝트입니다.
- 주요 폴더 구조:
  - `assets/css/` : CSS 스타일 시트
  - `assets/js/` : 기본 JavaScript 라이브러리와 스크립트
  - `layouts/` : 컴포넌트 미리보기 HTML 템플릿
  - `html/` : 실제 서비스 HTML 페이지 템플릿
  - `vendor/` : 외부 라이브러리 코드

## 작업 원칙
- 가능한 한 기존 스타일 구조를 유지하세요.
- `assets/css/` 안에서는 플랫폼별 파일(`pc-*.css`, `mobile-*.css`, `lib-style.css`, `iframe-layout.css`)을 기준으로 수정합니다.
- `layouts/`의 컴포넌트 미리보기 HTML에서는 `iframe-layout.css`가 레이아웃 전용 CSS입니다.
- CSS 파일 이름 변경 시에는 모든 참조를 함께 업데이트해야 합니다.
- 상대 경로가 중요한 프로젝트이므로 HTML/CSS 경로 수정 시 경로가 올바른지 특히 주의하세요.
- `vendor/` 폴더는 외부 라이브러리 코드입니다. 일반적으로 수정하지 않습니다.

## 스타일/레이아웃 관련
- PC 미리보기 렌더링은 `layouts/general_pc/*`에서, 모바일 미리보기는 `layouts/general_mobile/*`에서 확인합니다.
- 공통 미리보기 레이아웃 스타일은 `assets/css/iframe-layout.css`에 저장됩니다.
- `pc-components.css`와 `mobile-components.css`는 각각 PC/모바일 컴포넌트 스타일을 담고 있습니다.
- `pc-style.css`와 `mobile-style.css`는 각 플랫폼의 변수 파일과 컴포넌트 파일을 임포트하는 래퍼 역할입니다.

## JavaScript 관련
- `assets/js/script.js`는 플랫폼 토글 및 설정을 처리할 가능성이 큽니다.
- 일반적인 동작은 브라우저에서 실행되는 정적 JavaScript입니다.

## 수정 시 주의
- HTML/CSS/JS에서 경로를 수정한 후 브라우저 개발자 도구에서 로드 여부를 반드시 확인하세요.
- SVG나 이미지가 보이지 않는 경우, 상대 경로(`../images/` 등)가 변경되었는지 먼저 점검합니다.
- 미리보기 iframe이 잘못 보일 때는 `iframe-layout.css`와 `pc-components.css`의 `body`, `html`, `overflow`, `min-width`, `padding` 설정을 확인합니다.

## 권장 프롬프트 예시
- `이 프로젝트에서 PC/모바일 컴포넌트 미리보기 CSS 구조를 설명해줘.`
- `assets/css/iframe-layout.css에 미리보기 iframe 레이아웃을 보정하는 규칙을 추가해줘.`
- `layouts/general_pc/badge.html을 수정하지 않고 PC 미리보기 레이아웃이 잘리면 어디를 점검해야 해?`

## 금지 및 제한
- `vendor/` 내의 외부 라이브러리는 되도록 수정하지 않습니다.
- 정적 사이트로서 빌드 시스템 파일이 없으므로 `npm`/`yarn` 설치 관련 작업을 기본으로 수행하지 않습니다.
- `.github/` 외부나 사용자 로컬 프롬프트를 건드리지 않습니다.
