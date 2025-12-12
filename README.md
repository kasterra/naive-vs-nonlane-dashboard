# 📚 About this repo

React 19의 동시성(concurrent) 기능을 이용해 “나이브(동기 계산) vs Non‑Lane(동시성 기반)” UI 반응성 차이를 체감할 수 있도록 만든 작은 대시보드 예제입니다. 가짜 트래픽/매출 로그 데이터를 생성해 필터·검색·집계를 수행하고, 같은 기능을 두 화면에서 서로 다른 방식으로 처리합니다.

- `Naive` 화면: 입력 변화마다 무거운 계산을 동기적으로 즉시 수행합니다.
- `Non‑Lane` 화면: React 19의 `useDeferredValue`, `useTransition`, `Suspense + lazy`를 활용해 급한 일(입력 반영)과 덜 급한 일(무거운 파생 계산/렌더)을 분리하고, 코드 스플리팅으로 초기/상호작용 지연을 줄입니다.

아래 안내에 따라 로컬에서 실행해보며 두 화면의 차이를 직접 비교해보세요.

## 빠른 시작

사전 준비

- Node.js 18 이상, npm 필요

설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 다음 경로로 접근합니다.

- 나이브: http://localhost:5173/naive
- Non‑Lane: http://localhost:5173/non-lane

프로덕션 빌드/프리뷰

```bash
npm run build
npm run preview
```

품질 검사

```bash
npm run lint
```

## 무엇을 볼 수 있나요?

- 대량 데이터(기본 2만 행, 1만/2만/5만으로 변경 가능)를 대상으로 필터(기간/세그먼트/검색)와 집계(일별 매출·방문, 채널별 매출 비중), 테이블 페이지네이션을 수행합니다.
- `Naive`는 입력할 때마다 `useMemo` 안에서 무거운 계산을 즉시 실행해, 데이터가 많을수록 타이핑 지연이나 스크롤/클릭 지연이 체감됩니다.
- `Non‑Lane`는 다음을 사용합니다.
  - `useDeferredValue`: 사용자가 타이핑하는 검색어를 지연 값으로 분리해, 긴 계산이 타이핑 체감에 영향을 최소화하도록 합니다.
  - `useTransition`: 무거운 파생 계산을 전환으로 분리해, 급한 렌더(입력 반영)는 먼저, 무거운 작업은 뒤로 미룹니다.
  - `Suspense + lazy`: 차트/테이블을 코드 스플리팅하고 로딩 상태를 명확히 보여줍니다.

이 조합으로 Non‑Lane 화면은 데이터가 커질수록 UI ‘버벅임(jank)’이 줄어드는 것을 확인할 수 있습니다.

## 기술 스택

- React 19, React Router 7
- TypeScript, Vite 7
- Tailwind CSS 4 (Vite 플러그인), tw-animate-css
- Recharts (차트)
- faker.js (@faker-js/faker, 더미 데이터 생성)

## 주요 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 타입체크 + 프로덕션 빌드
- `npm run preview`: 빌드 결과 미리보기 서버
- `npm run lint`: ESLint 검사

## 라우트

- `/naive`: 동기 계산 기반 화면
- `/non-lane`: 동시성 기능을 적용한 화면

## 데이터 및 동작

- 데이터는 전적으로 클라이언트에서 `@faker-js/faker`로 생성합니다. `src/api/data.ts`의 `generateDataset`/`getDataset`/`regenerateDataset`를 통해 시드 기반의 결정론적 데이터가 만들어집니다.
- 화면 상단의 “Data volume” 선택 박스로 데이터 행 수를 바꿀 수 있습니다. 데이터가 커질수록 두 화면의 상호작용 차이가 뚜렷해집니다.
- 집계 로직은 `src/lib/compute.ts`의 `computeDashboard` 하나를 두 화면이 공통으로 사용합니다. 차이는 “언제/어떻게 실행하느냐”입니다.

## 폴더 구조(요약)

```
src/
  api/            // 타입 정의와 더미 데이터 생성
  lib/            // 무거운 파생 계산 로직(computeDashboard)
  components/ui/  // 간단한 차트/툴팁 래퍼
  screens/        // Naive, NonLane, parts(Charts/Table 분리)
  App.tsx         // 라우트 구성 (/naive, /non-lane)
  main.tsx        // 앱 엔트리
  index.css       // Tailwind v4 테마 토큰
```

Vite 경로 별칭은 `@ → ./src` 입니다.(`vite.config.ts` 참고)

## 비교 포인트 체크리스트

- 검색 입력에 타이핑을 해보세요.
  - Naive: 데이터가 클수록 타이핑이 끊깁니다.
  - Non‑Lane: 타이핑은 부드럽고, 결과 갱신은 약간 늦더라도 자연스러운 전환 메시지(`Updating results…`)로 안내합니다.
- 기간/세그먼트 변경 시 차트와 테이블이 갱신되는 느낌을 비교하세요.
- 데이터 볼륨을 5만으로 높였을 때의 상호작용 품질을 비교해보세요.

## 기타

- 완전히 클라이언트 사이드 예제이며, 서버 통신은 없습니다.
- 동시성 API는 React 19 기준으로 사용됩니다.
