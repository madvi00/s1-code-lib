# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 성격

**에스원 UI 코드 라이브러리** — PC/Mobile 컴포넌트를 위한 순수 HTML/CSS/JS 디자인 시스템 문서 사이트. 빌드 시스템·패키지 매니저 없음 (npm/yarn 사용 안 함). 모든 파일은 정적 자원으로 직접 배포되며, 소비자는 `assets.zip`을 받아 자기 프로젝트에 풀어서 사용한다.

## 개발 방법

- 로컬 미리보기는 **VS Code Live Server** (포트 5501, [.vscode/settings.json](.vscode/settings.json) 설정됨). `index.html`을 Live Server로 열어 작업.
- 빌드/테스트/린트 명령 없음. 변경한 HTML/CSS/JS는 브라우저 새로고침으로만 확인.
- `assets.zip`은 수동 재생성 — CSS·JS·이미지가 바뀌면 다음 PowerShell 명령으로 갱신:
  ```powershell
  Remove-Item assets.zip -Force
  Compress-Archive -Path assets/css, assets/fonts, assets/images, assets/js -DestinationPath assets.zip -CompressionLevel Optimal
  ```

## 아키텍처 (큰 그림)

### CSS 레이어 구조

`assets/css/`는 5개 레이어로 나뉘며 로드 순서·역할이 명확히 분리되어 있다:

1. **[variables.css](assets/css/variables.css)** — Foundation 토큰(원시 값: `--foundation-color-blue-400`, `--foundation-sizing-34` …) + Semantic 토큰(의미적 추상: `--semantic-color-button-background-primary-default` …). 총 511개 변수.
2. **[lib-style.css](assets/css/lib-style.css)** — 라이브러리 문서 사이트(`index.html`) 자체의 레이아웃·사이드바·헤더. PC/Mobile 둘 다 항상 로드.
3. **[pc-style.css](assets/css/pc-style.css) / [mobile-style.css](assets/css/mobile-style.css)** — 단순 래퍼. `@import url('./variables.css')` + 해당 플랫폼 `*-components.css`만 임포트.
4. **[pc-components.css](assets/css/pc-components.css) / [mobile-components.css](assets/css/mobile-components.css)** — 실제 컴포넌트 구현체. **`body { font-size: 10px }`을 강제**해서 rem 베이스를 10px로 만든다. 따라서 `1.4rem = 14px`, `4.4rem = 44px`. 일반 16px 가정으로 환산하면 안 됨.
5. **[iframe-layout.css](assets/css/iframe-layout.css)** — `layouts/*.html` 미리보기 iframe 안에서만 사용. `pc-components.css`의 `body { min-width: 1440px }`를 해제해 iframe 폭에 맞게 유동적으로 렌더링되도록 함.

### 플랫폼 토글 (PC ↔ Mobile)

`index.html`은 PC/Mobile 컴포넌트 시트를 **동시에 `<link>` 태그로 선언**하되, 한쪽을 `disabled` 속성으로 비활성화해 둔다:

```html
<link href="assets/css/pc-style.css" id="pc-components" rel="stylesheet" />
<link disabled href="assets/css/mobile-style.css" id="mobile-components" rel="stylesheet" />
```

`[assets/js/script.js:120-134](assets/js/script.js#L120-L134)`의 플랫폼 토글 핸들러가 두 시트의 `disabled` 프로퍼티를 뒤집고 사이드바 섹션 가시성을 함께 토글한다. 새 컴포넌트 추가 시 사이드바 nav 섹션에 `platform-pc` 또는 `platform-mobile` 클래스로 분류해야 토글 대상에 포함된다.

### 컴포넌트 미리보기 = iframe 임베드

각 컴포넌트는 두 곳에 산다:

- `layouts/general_pc/<name>.html` / `layouts/general_mobile/<name>.html` — 단독으로 실행되는 컴포넌트 미리보기 페이지. 자체 head에서 `lib-style.css` + 해당 플랫폼 `*-style.css`를 로드하고 컴포넌트 동작에 필요한 JS도 직접 임포트한다.
- `index.html` 안 `<iframe src="layouts/general_pc/<name>.html">` — 위 페이지를 iframe으로 임베드.

각 미리보기 페이지 하단에는 인라인 스크립트가 박혀 있어 **부모-자식 postMessage**로 두 가지 동작을 한다:
- `iframeHeight`: ResizeObserver로 body 높이 변동을 감지해 부모에 통보 → 부모는 `[assets/js/script.js:158-171](assets/js/script.js#L158-L171)`에서 받아 `iframe.style.height`를 갱신 (iframe 스크롤바 없이 자연스러운 높이로 맞춤).
- `iframeWheel`: iframe 내부 휠 이벤트를 부모로 전파 → 부모 페이지 스크롤로 위임 (iframe이 스크롤을 가로채지 않음).

이 패턴 때문에 미리보기 페이지를 새로 만들 때는 기존 페이지 하단의 인라인 `<script>` 블록을 그대로 복사해 넣어야 한다.

### 컴포넌트 JS

`assets/js/` 안에는 두 종류가 섞여 있다:
- **모듈 JS** (`dropdown.js`, `modal.js`, `tab.js`, `multi-dropdown.js`, `route-accordion.js`, `range-time-picker.js`, `time-picker.js`, `datepicker.js`, `input.js`, `file.js` 등) — 컴포넌트 동작 본체. jQuery 없이 vanilla 작성된 것과 jQuery 의존인 것이 혼재.
- **`amobe_*.js`** — PC용 변형(amobe = 동일 기능의 PC 버전). 모바일 미리보기는 `xxx.js`, PC 미리보기는 보통 `amobe_xxx.js`를 사용.
- `vendor/` 및 `assets/js/lib/` — 외부 라이브러리 (jQuery, bootstrap-datepicker, swiper, jqGrid 등). **수정 금지** (`.gitattributes`에서 `-text`로 마킹해 LF 정규화 제외).

## 디자인 시스템 사용 규칙

### 컴포넌트 클래스 명명

- 버튼 사이즈: `btn`(기본 28px·xxsmall) / `.btn-medium`(34px·xsmall) / `.btn-large`(44px·medium). PC Button 사이즈 라벨은 xxsmall/xsmall/medium으로 통일됨. README 컴포넌트 표에서 최신 이름 확인.
- 입력 사이즈: `.input-xsmall`(28) / `.input-small`(34) / `.input-medium`(44).
- 드롭다운: `.field-dropdown.field-small`(34) / `.field-dropdown.field-medium`(44).
- 배지: `.badge` + 컬러 모디파이어 `.blue / .gray / .teal / .green`.

### 토큰 사용

직접 색상값 박지 말고 가능한 한 semantic 토큰을 사용한다. Foundation은 semantic이 못 다루는 예외에만:

```css
/* ✅ */ color: var(--semantic-color-text-default);
/* ❌ */ color: #353535;
```

## 파일·인코딩 규약

- [.editorconfig](.editorconfig): UTF-8 / LF / 2-space / trim trailing whitespace / final newline. `vendor/**`는 모든 규칙 unset.
- [.gitattributes](.gitattributes): 텍스트 파일 전부 `eol=lf`로 정규화. `vendor/**`와 `assets/js/lib/**`는 `-text`로 변환 제외.
- **PowerShell 5.1 한글 인코딩 함정**: `Get-Content -Raw`가 기본 CP949로 읽어 한글이 깨진다. 한글이 있는 파일을 일괄 편집할 때는 반드시 `[System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)`와 `[System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding $false))` 같은 .NET API로 BOM 없이 처리. `Edit` tool로 한 파일씩 수정하는 것이 가장 안전.

## 가이드 준수 (필수)

코드 수정 시 반드시 **사이트 내장 가이드 두 곳**을 참조하고 거기 정의된 규칙을 위반하지 않는다. 추측하지 말고 가이드 본문을 직접 확인한 뒤 작업할 것.

- **퍼블리싱 가이드** — [index.html#page-pub-guide](index.html) (line 8430+). 4개 탭:
  - `기본 환경` — 인코딩(UTF-8 no BOM), 들여쓰기(공백 2칸), 줄 끝(LF), 브라우저·기기 호환 기준, 해상도, 파일·폴더 네이밍.
  - `코드 규칙` — HTML 속성 카테고리(특히 `식별·정보` 카테고리의 `id`/`name`/`value`는 빈 값이라도 명시), 클래스 명명, CSS 작성 순서, JS 작성 규칙.
  - `표준 규칙` — 시맨틱 마크업, 폼 컨트롤, 이미지 대체 텍스트.
  - `WAI-ARIA 접근성` — `aria-label`, `role`, 키보드 포커스 등.
- **사용 가이드라인** — [index.html#page-guidelines](index.html) (line 5340+). 컴포넌트별 Do's & Don'ts, 색상·간격 원칙, 접근성 지침.

### 과거에 실수했던 사례

- **`value=""` 일괄 제거 금지** — input의 빈 `value=""`는 퍼블리싱 가이드 `식별·정보` 카테고리에 명시되어 있어 보존해야 한다. "불필요해 보인다"는 이유로 지우지 말 것. ([index.html](index.html) 8501 라인 부근 표 참조)
- **자동완성 차단은 `autocomplete` 속성으로** — 브라우저 자동완성 dropdown을 막으려면 `autocomplete="off"` (password는 `"new-password"`)를 input 속성에 추가한다. CSS로 처리하지 말 것.
- **bootstrap-datepicker 로케일 수정 위치 = `s1-uvis-script.js`** — datepicker의 `monthsShort`, `days`, `today` 등 한글 라벨은 `amobe_datepicker.js` / `datepicker.js`에도 정의되어 있지만 PC 페이지가 실제로 로드하는 건 `s1-uvis-script.js`다. 그쪽 로케일이 더 늦게 등록되어 우선 적용되므로, 라벨 변경 시 반드시 [s1-uvis-script.js#L201-L212](assets/js/s1-uvis-script.js#L201-L212)를 수정해야 한다.
- **외부 라이브러리 라벨 후처리 = CSS `::after content`** — `assets/js/lib/bootstrap-datepicker.js`는 수정 금지 라이브러리. 셀 라벨에 접미사를 붙이고 싶을 때(예: 연도에 `'년'` 추가)는 `.year-wrap .year::after { content: '년' }` 같은 CSS 가상 요소로 시각적으로만 덧붙인다.

## 단독 페이지가 새 창에서 열릴 때 (Standalone) 패턴

미리보기 페이지는 기본적으로 iframe 임베드용이지만 "새 창에서 열기"로 단독 열릴 수도 있다. 이 두 컨텍스트의 동작이 달라야 할 때는 인라인 스크립트 하단에서 `window.self === window.top` 으로 분기한다.

**예시**: PC Navigation은 max-width 1920px이라 1920 이상 viewport에서만 의도된 layout이 보인다. iframe-layout.css가 `html, body { min-width: 0 !important; overflow-x: hidden }`을 강제하기 때문에 작은 모니터에선 단독 열기를 해도 1920이 안 보임. → [layouts/general_pc/navigation.html](layouts/general_pc/navigation.html) 하단 스크립트가 standalone 일 때만 `style.setProperty('min-width','1920px','important')` + `overflow-x: auto`를 강제해 가로 스크롤을 허용.

이 패턴은 1920+ layout 컴포넌트가 추가될 때 같은 방식으로 적용할 수 있다.

## 작업 시 주의 (.github/copilot-instructions.md 발췌)

- `assets/css/` 안에서는 플랫폼별 파일(`pc-*.css`, `mobile-*.css`, `lib-style.css`, `iframe-layout.css`)의 역할 경계를 유지한다. 위 "CSS 레이어 구조" 참고.
- 상대 경로 의존도가 높음 — `layouts/general_pc/badge.html`은 `../../assets/css/lib-style.css`처럼 두 단계 상위를 기준으로 한다. 이동·이름 변경 시 모든 참조를 함께 갱신.
- CSS 파일명을 바꾸면 `index.html`, 각 `layouts/*.html`, `pc-style.css`/`mobile-style.css`의 `@import`까지 모두 추적해야 한다.
- 미리보기 iframe이 잘리거나 스크롤바가 생기면 `iframe-layout.css`와 `pc-components.css`의 `body`, `html`, `overflow`, `min-width`, `padding` 충돌을 먼저 본다.
- Time Picker / Range Time Picker처럼 드롭다운이 iframe 경계를 벗어나는 컴포넌트는 index.html의 해당 iframe에 충분한 `min-height` (700px~900px)를 지정해야 dropdown이 잘리지 않는다.
- 컴포넌트 마크업을 수정한 뒤에는 `index.html`의 코드 스니펫(`<pre>` 블록) 과 미리보기 HTML 두 곳을 동기화해야 한다.

## 별개 애플리케이션: srs_hub.html

루트의 `srs_hub.html`은 이 라이브러리를 **소비하는 별개의 SPA 데모**다 (S-1 SRS Hub 시뮬레이션). 라이브러리 컴포넌트를 인라인 `<style>`에 복제해 self-contained로 작성되어 있고, 자체 디자인 토큰(`--color-primary-500: #0071CD` S-1 브랜드)을 갖는다.

**작업 규칙**: `srs_hub.html`을 수정할 때는 **이 파일 내부만** 건드린다. lib-style.css, pc-components.css 등 라이브러리 파일은 절대 손대지 않는다 — 이 파일의 요구로 라이브러리를 바꾸면 다른 모든 컴포넌트 미리보기가 영향을 받는다. 스타일은 인라인 `<style>` 블록에서 specificity로 오버라이드하고, 동작 변경은 인라인 `<script>`로 처리한다.
