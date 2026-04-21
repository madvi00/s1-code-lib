# 에스원 UI 코드 라이브러리

에스원 UI를 구성하는 모든 컴포넌트의 코드와 가이드를 한 곳에서 확인할 수 있는 내부 디자인 시스템 문서입니다.
PC · Mobile 환경에 최적화된 디자인 토큰, 바로 복사해 사용할 수 있는 HTML/CSS 스니펫, 올바른 사용법을 안내하는 컴포넌트 가이드라인을 제공합니다.

> 별도 프레임워크 없이 순수 HTML/CSS만으로 에스원 디자인 시스템을 빠르고 일관되게 구현할 수 있습니다.

---

## 주요 수치

| 항목 | 수치 |
|---|---|
| PC 컴포넌트 | 15개 |
| Mobile 컴포넌트 | 18개 |
| 디자인 토큰 카테고리 | 3개 (Color · Spacing · Typography) |
| CSS 변수 | 488개 |
| 구현 방식 | 순수 HTML/CSS (프레임워크 없음) |

---

## 시작하기

### 1. CSS 연결

```html
<!-- 공통 레이아웃 -->
<link rel="stylesheet" href="assets/css/lib-style.css" />

<!-- PC 사용 시 -->
<link rel="stylesheet" href="assets/css/pc-style.css" />

<!-- Mobile 사용 시 -->
<link rel="stylesheet" href="assets/css/mobile-style.css" />
```

### 2. 디자인 토큰 (CSS 변수)

모든 토큰은 `assets/css/variables.css`에 정의되어 있습니다.

```css
/* Foundation 토큰 예시 */
--foundation-border-width-100: 1px;
--foundation-border-width-200: 2px;

/* Semantic 토큰 예시 */
--semantic-border-width-default: var(--foundation-border-width-100);
--semantic-border-width-strong:  var(--foundation-border-width-200);
```

---

## 컴포넌트 목록

### PC

| 컴포넌트 | 파일 | 설명 |
|---|---|---|
| Badge | `layouts/general_pc/badge.html` | 상태 표시 뱃지 (Blue / Gray / Teal / Green) |
| Button | `layouts/general_pc/button.html` | Primary, Secondary, Blue Line, Assist, Text 등 |
| Checkbox | `layouts/general_pc/checkbox.html` | 다중 선택, 라벨 조합, 비활성 상태 포함 |
| Datepicker | `layouts/general_pc/datepicker.html` | Single / Range 날짜 선택기 |
| Dropdown | `layouts/general_pc/dropdown.html` | 단일 항목 선택, has-label 변형 포함 |
| Filter Chip | `layouts/general_pc/filterChip.html` | has-label / has-label-solid 두 가지 스타일 |
| Input | `layouts/general_pc/input.html` | 텍스트, 검색, 비밀번호, 숫자 입력 |
| Loading | `layouts/general_pc/loading.html` | 로딩 인디케이터 |
| Modal | `layouts/general_pc/modal.html` | 제목, 내용, 버튼으로 구성되는 팝업 |
| Radio | `layouts/general_pc/radio.html` | 단일 선택 라디오 버튼 |
| Range TimePicker | `layouts/general_pc/rangeTimePicker.html` | 시간 범위 선택기 |
| Accordion | `layouts/general_pc/routeAccordion.html` | 경로 아코디언 |
| Tab | `layouts/general_pc/tab.html` | 탭 네비게이션 |
| Time Picker | `layouts/general_pc/timePicker.html` | 시간 선택기 |
| Weather Widget | `layouts/general_pc/weatherWidget.html` | 날씨 위젯 |

### Mobile

| 컴포넌트 | 파일 | 설명 |
|---|---|---|
| Badge | `layouts/general_mobile/badge.html` | 모바일 상태 표시 뱃지 |
| Button | `layouts/general_mobile/button.html` | 모바일 버튼 변형 |
| Checkbox | `layouts/general_mobile/checkbox.html` | 모바일 체크박스 |
| Datepicker | `layouts/general_mobile/datepicker.html` | 모바일 날짜 선택기 |
| Dropdown | `layouts/general_mobile/dropdown.html` | 모바일 드롭다운 |
| Dropdown Type Label | `layouts/general_mobile/dropdownTypeLabel.html` | 라벨 타입 드롭다운 (Mobile 전용) |
| Filter Chip | `layouts/general_mobile/filterChip.html` | 모바일 필터 칩 |
| Input | `layouts/general_mobile/input.html` | 모바일 입력 필드 |
| Loading | `layouts/general_mobile/loading.html` | 모바일 로딩 인디케이터 |
| Modal | `layouts/general_mobile/modal.html` | 모바일 팝업 모달 |
| Multi Dropdown | `layouts/general_mobile/multiDropdown.html` | 다중 선택 드롭다운 (Mobile 전용) |
| Radio | `layouts/general_mobile/radio.html` | 모바일 라디오 버튼 |
| Range Time Picker | `layouts/general_mobile/rangeTimePicker.html` | 모바일 시간 범위 선택기 |
| Accordion | `layouts/general_mobile/routeAccordion.html` | 모바일 아코디언 |
| Switch | `layouts/general_mobile/switch.html` | 토글 스위치 (Mobile 전용) |
| Underline Tab | `layouts/general_mobile/tab.html` | 언더라인 탭 |
| Time Picker | `layouts/general_mobile/timePicker.html` | 모바일 시간 선택기 |
| Weather Widget | `layouts/general_mobile/weatherWidget.html` | 모바일 날씨 위젯 |

---

## 프로젝트 구조

```
s1-code-lib/
├── index.html                  # 메인 라이브러리 페이지
├── assets/
│   ├── css/
│   │   ├── variables.css       # 디자인 토큰 (Foundation · Semantic)
│   │   ├── lib-style.css       # 라이브러리 공통 레이아웃
│   │   ├── pc-style.css        # PC 컴포넌트 스타일
│   │   ├── mobile-style.css    # Mobile 컴포넌트 스타일
│   │   ├── pc-components.css   # PC 컴포넌트 상세
│   │   └── mobile-components.css # Mobile 컴포넌트 상세
│   ├── js/
│   │   └── script.js           # 라이브러리 인터랙션
│   └── images/                 # 이미지 리소스
├── layouts/
│   ├── general_pc/             # PC 컴포넌트 단독 페이지
│   └── general_mobile/         # Mobile 컴포넌트 단독 페이지
└── vendor/                     # 외부 라이브러리
```

---

## 업데이트 내역

### v1.0.0 (2026.04)
- PC / Mobile 컴포넌트 최초 공개
- 디자인 토큰 (Color · Spacing · Typography) 문서화
- 사용 가이드라인 페이지 추가
- Mobile 전용 컴포넌트: Switch, Multi Dropdown, Dropdown Type Label

---

© 2025 에스원
