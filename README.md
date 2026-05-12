# 에스원 UI 코드 라이브러리

에스원 UI를 구성하는 모든 컴포넌트의 코드와 가이드를 한 곳에서 확인할 수 있는 내부 디자인 시스템 문서입니다.
PC · Mobile 환경에 최적화된 디자인 토큰, 바로 복사해 사용할 수 있는 HTML/CSS 스니펫, 올바른 사용법을 안내하는 컴포넌트 가이드라인을 제공합니다.

> 별도 프레임워크 없이 순수 HTML/CSS만으로 에스원 디자인 시스템을 빠르고 일관되게 구현할 수 있습니다.

---

## 주요 수치

| 항목 | 수치 |
|---|---|
| PC 컴포넌트 | 14개 |
| PC 모듈 | 2개 |
| Mobile 컴포넌트 | 17개 |
| Mobile 모듈 | 1개 |
| 디자인 토큰 카테고리 | 3개 (Color · Spacing · Typography) |
| CSS 변수 | 488개 |
| 구현 방식 | 순수 HTML/CSS (프레임워크 없음) |

---

## 시작하기

### 1. assets.zip 다운로드

라이브러리 홈의 [시작하기] 페이지에서 `assets.zip`을 받아 프로젝트 루트에 압축 해제합니다.
`css / fonts / images / js` 가 그대로 배치됩니다. (HTML 마크업은 각 컴포넌트 페이지의 코드 스니펫에서 복사해 사용)

### 2. CSS 연결

```html
<!-- 공통 레이아웃 -->
<link rel="stylesheet" href="assets/css/lib-style.css" />

<!-- PC 사용 시 -->
<link rel="stylesheet" href="assets/css/pc-style.css" />

<!-- Mobile 사용 시 -->
<link rel="stylesheet" href="assets/css/mobile-style.css" />
```

### 3. 디자인 토큰 (CSS 변수)

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
| Filter Chip | `layouts/general_pc/filter-chip.html` | line / solid 스타일 · prefix 라벨 · default · selected · disabled 상태 |
| Input | `layouts/general_pc/input.html` | 텍스트, 검색, 비밀번호, 숫자 입력 |
| Loading | `layouts/general_pc/loading.html` | 로딩 인디케이터 |
| Modal | `layouts/general_pc/modal.html` | 제목, 내용, 버튼으로 구성되는 팝업 |
| Radio | `layouts/general_pc/radio.html` | 단일 선택 라디오 버튼 |
| Range TimePicker | `layouts/general_pc/range-time-picker.html` | 시간 범위 선택기 |
| Tab | `layouts/general_pc/tab.html` | 탭 네비게이션 |
| Time Picker | `layouts/general_pc/time-picker.html` | 시간 선택기 |
| Weather Widget | `layouts/general_pc/weather-widget.html` | 날씨 위젯 |

### PC Module

| 모듈 | 파일 | 설명 |
|---|---|---|
| Accordion | `layouts/general_pc/route-accordion.html` | 노선 리스트 + 배차 정보 + 차량 리스트 등을 조합한 노선 아코디언 |
| Table | `layouts/general_pc/table.html` | 데이터 리스트(jqGrid) 및 상세정보 폼 테이블 |

### Mobile

| 컴포넌트 | 파일 | 설명 |
|---|---|---|
| Badge | `layouts/general_mobile/badge.html` | 모바일 상태 표시 뱃지 |
| Button | `layouts/general_mobile/button.html` | 모바일 버튼 변형 |
| Checkbox | `layouts/general_mobile/checkbox.html` | 모바일 체크박스 |
| Datepicker | `layouts/general_mobile/datepicker.html` | 모바일 날짜 선택기 |
| Dropdown | `layouts/general_mobile/dropdown.html` | 모바일 드롭다운 |
| Dropdown Type Label | `layouts/general_mobile/dropdown-type-label.html` | 라벨 타입 드롭다운 (Mobile 전용) |
| Filter Chip | `layouts/general_mobile/filter-chip.html` | line / solid 스타일 · prefix 라벨 · default · selected · disabled 상태 |
| Input | `layouts/general_mobile/input.html` | 모바일 입력 필드 |
| Loading | `layouts/general_mobile/loading.html` | 모바일 로딩 인디케이터 |
| Modal | `layouts/general_mobile/modal.html` | 모바일 팝업 모달 |
| Multi Dropdown | `layouts/general_mobile/multi-dropdown.html` | 다중 선택 드롭다운 (Mobile 전용) |
| Radio | `layouts/general_mobile/radio.html` | 모바일 라디오 버튼 |
| Range Time Picker | `layouts/general_mobile/range-time-picker.html` | 모바일 시간 범위 선택기 |
| Switch | `layouts/general_mobile/switch.html` | 토글 스위치 (Mobile 전용) |
| Underline Tab | `layouts/general_mobile/underline-tab.html` | 언더라인 탭 |
| Time Picker | `layouts/general_mobile/time-picker.html` | 모바일 시간 선택기 |
| Weather Widget | `layouts/general_mobile/weather-widget.html` | 모바일 날씨 위젯 |

### Mobile Module

| 모듈 | 파일 | 설명 |
|---|---|---|
| Accordion | `layouts/general_mobile/route-accordion.html` | 노선 리스트 + 배차 정보 + 차량 리스트 등을 조합한 노선 아코디언 |

---

## 프로젝트 구조

```
s1-code-lib/
├── index.html                  # 메인 라이브러리 페이지
├── assets.zip                  # 시작하기 페이지에서 배포되는 자산 묶음
├── assets/
│   ├── css/
│   │   ├── variables.css       # 디자인 토큰 (Foundation · Semantic)
│   │   ├── lib-style.css       # 라이브러리 공통 레이아웃
│   │   ├── pc-style.css        # PC 컴포넌트 스타일
│   │   ├── mobile-style.css    # Mobile 컴포넌트 스타일
│   │   ├── pc-components.css   # PC 컴포넌트 상세
│   │   └── mobile-components.css # Mobile 컴포넌트 상세
│   ├── js/
│   │   ├── script.js           # 라이브러리 인터랙션
│   │   └── dropdown.js         # Dropdown · Filter Chip 동작
│   ├── fonts/                  # Pretendard · Noto Sans KR · FA
│   └── images/                 # 아이콘 · 이미지 리소스
├── layouts/
│   ├── general_pc/             # PC 컴포넌트 단독 페이지
│   └── general_mobile/         # Mobile 컴포넌트 단독 페이지
└── vendor/                     # 외부 라이브러리
```

---

## 업데이트 내역

### v1.1.1 (2026.05.11)
- PC Button 사이즈 레이블 정비 (sm/md/lg → xxsmall/xsmall/medium 표기)
- Button Icon Type / Assist Type 코드 스니펫 아이콘 클래스 보정 (`icon-list-download`)
- 일부 컴포넌트 미세 간격 조정 (Modal padding, Dropdown padding, Button xsmall min-width)
- `assets.zip` 재생성

### v1.1.0 (2026.05)
- Filter Chip 컴포넌트 확장: line / solid 스타일에 `selected` 상태 추가
- Filter Chip prefix 라벨 변형(line+, solid+) 미리보기·코드 스니펫 정비
- 코드 스니펫 포맷 통일: 카테고리별 탭(Medium · Medium + · Small · Small +) 분리
- 비밀번호 입력 eye 아이콘 색상 정비 (`#C4C4C4` → `#757575`)
- `assets.zip` 재생성 (CSS · JS · 아이콘 변경분 반영)

### v1.0.0 (2026.04)
- PC / Mobile 컴포넌트 최초 공개
- 디자인 토큰 (Color · Spacing · Typography) 문서화
- 사용 가이드라인 페이지 추가
- Mobile 전용 컴포넌트: Switch, Multi Dropdown, Dropdown Type Label

---

© 2025 에스원
