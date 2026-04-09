# 5. React 컴포넌트와 Props_State 설계서 (5조)

## **문서 정보**

- **프로젝트명**: 풀카운트 (Full Count) - 야구 팬 커뮤니티 및 직관/티켓 양도 플랫폼
- **작성자**: [풀카운트/박미정]
- **작성일**: [2026-04-07]
- **버전**: [v1.0]
- **검토자**: [안진경, 김어진, 박미정, 이시연, 이준호]
- **승인자**: [안진경, 김어진, 박미정, 이시연, 이준호]

---

## 0. 컴포넌트 설계 기준

본 프로젝트는 React 19 + Vite 기반 SPA이며, `react-router-dom`을 사용하지 않고 `App.jsx`의 `tab` 상태와 URL QueryString으로 화면을 전환한다. 전역 인증 상태는 Zustand가 아니라 `AuthContext`에서 관리하고, 각 페이지의 서버 데이터/모달/필터 상태는 대부분 로컬 `useState`로 관리한다.

### 0.1 컴포넌트 분리 기준

| 기준 | 적용 방식 |
| --- | --- |
| 화면 단위 상태 소유 | `pages/*.jsx`가 API 호출, 필터, 선택 항목, 모달 열림 상태를 소유 |
| 공통 표시 요소 | `TeamBadge`, `TeamFilter`, `StatusBadge`처럼 여러 화면에서 쓰는 요소는 `components/`에 위치 |
| 기능성 모달 | 신청/작성/상세 모달은 화면 컴포넌트에서 열림 상태를 관리하고 모달에는 `onClose`, `onSubmit` 콜백 전달 |
| 인증 상태 | `AuthContext`의 `user`, `loading`, `login`, `logout`, `fetchMyInfo`를 필요한 컴포넌트에서 `useAuth()`로 사용 |
| 실시간 채팅 | `ChatPage`, `GlobalChatListener`, `LiveChatPanel`, `stompLiveClient`로 역할 분리 |

---

## 1. 컴포넌트 개요

### 1.1 주요 컴포넌트 목록

| 구분 | 컴포넌트명 | 파일 위치 | 주요 역할 |
| --- | --- | --- | --- |
| 최상위 | `App` | `src/App.jsx` | 탭 라우팅, 보호 화면 제어, 채팅 팝업 상태 관리 |
| 인증 | `AuthProvider`, `useAuth` | `src/context/AuthContext.jsx` | 로그인 사용자와 인증 로딩 상태 전역 제공 |
| 페이지 | `HomePage` | `src/pages/HomePage.jsx` | 홈 대시보드, 빠른 메뉴, 오늘의 경기, 최신 모집글 |
| 페이지 | `SchedulePage` | `src/pages/SchedulePage.jsx` | 경기 일정 화면 래퍼 |
| 기능 | `ScheduleList` | `src/components/ScheduleList.jsx` | 월/팀/날짜 필터, 일정 조회/동기화, 경기 상세 모달 |
| 페이지 | `MeetupPage` | `src/pages/MeetupPage.jsx` | 직관 메이트 목록/작성/수정 |
| 페이지 | `MeetupDetailPage` | `src/pages/Meetupdetailpage.jsx` | 메이트 상세, 신청, 멤버 목록, 그룹 채팅 |
| 페이지 | `CrewPage` | `src/pages/CrewPage.jsx` | 직관 크루 목록/작성/수정 |
| 페이지 | `CrewDetailPage` | `src/pages/CrewDetailPage.jsx` | 크루 상세, 신청 승인/거절, DM 문의 |
| 페이지 | `TicketTransferBoard` | `src/pages/TicketTransferBoard.jsx` | 티켓 양도 목록/필터/등록/상세/문의 |
| 페이지 | `MyPage` | `src/pages/MyPage.jsx` | 프로필, 설정, 충전, 참여 목록, 직관 일정 |
| 페이지 | `SignupPage` | `src/pages/SignupPage.jsx` | 회원가입 폼과 응원팀 선택 |
| 페이지/팝업 | `ChatPage` | `src/pages/ChatPage.jsx` | STOMP 채팅, 참여자 목록, 티켓 거래 액션 |
| 공통 | `LoginCard` | `src/components/LoginCard.jsx` | 로그인 폼 또는 로그인 사용자 팬 카드 |
| 공통 | `TeamBadge`, `TeamFilter` | `src/components/TeamComponents.jsx` | 팀 표시/필터 |
| 공통 | `StatusBadge` | `src/components/StatusBadge.jsx` | 모집 상태 표시 |
| 공통 모달 | `ApplyModal` | `src/components/ApplyModal.jsx` | 메이트/크루 신청 메시지 입력 |
| 공통 모달 | `CreateCrewModal` | `src/components/CreateCrewModal.jsx` | 크루 작성/수정 입력 |
| 채팅 | `ChatFab` | `src/components/ChatFab.jsx` | 채팅방 목록 진입 플로팅 버튼 |
| 채팅 | `GlobalChatListener` | `src/components/GlobalChatListener.jsx` | 전역 채팅 알림 수신 |
| 채팅 | `LiveChatPanel` | `src/components/LiveChatPanel.jsx` | 경기별 실시간 응원 채팅 |

### 1.2 파일 구조

```
src/
├── api/
│   ├── api.js                  # Axios 인스턴스
│   ├── auth.js                 # 로그인/로그아웃/회원가입/내 정보 API
│   ├── chat.js                 # 채팅방 REST API
│   ├── meetup.js               # 메이트 게시글/신청 API
│   └── Crew.js                 # 크루 관련 API
├── assets/                     # 정적 이미지
├── components/
│   ├── ApplyModal.jsx
│   ├── ChatFab.jsx
│   ├── CreateCrewModal.jsx
│   ├── GlobalChatListener.jsx
│   ├── KboStandings.jsx
│   ├── LoginCard.jsx
│   ├── LiveChatPanel.jsx
│   ├── MatchDetailModal.jsx
│   ├── ScheduleList.jsx
│   ├── StatusBadge.jsx
│   ├── TeamComponents.jsx
│   ├── TodaysGame.jsx
│   └── WeatherWidget.jsx
├── context/
│   └── AuthContext.jsx
├── hooks/
│   └── useChat.js
├── pages/
│   ├── AttendanceCalendar.jsx
│   ├── ChatPage.jsx
│   ├── CrewDetailPage.jsx
│   ├── CrewPage.jsx
│   ├── HomePage.jsx
│   ├── MeetupPage.jsx
│   ├── Meetupdetailpage.jsx
│   ├── MyPage.jsx
│   ├── SchedulePage.jsx
│   ├── SignupPage.jsx
│   └── TicketTransferBoard.jsx
├── utils/
│   ├── auth.js
│   └── stompLiveClient.js
├── App.jsx
├── index.css
└── main.jsx
```

---

## 2. 컴포넌트 트리 설계

### 2.1 최상위 앱 트리

```
main.jsx
  └── AuthProvider
        └── App                                    ← tab, selectedPostId, chatRoom 상태 소유
              ├── Header/Nav                       ← App 내부 렌더링
              ├── renderPage()
              │     ├── HomePage
              │     │     ├── LoginCard
              │     │     ├── TodaysGame
              │     │     ├── KboStandings
              │     │     └── LiveChatPanel
              │     ├── SchedulePage
              │     │     └── ScheduleList
              │     │           ├── TeamFilter
              │     │           ├── MatchDetailModal
              │     │           └── LiveChatPanel
              │     ├── MeetupPage
              │     │     ├── TeamFilter
              │     │     ├── MeetupCard
              │     │     └── MeetupDetailPage
              │     │           ├── ApplyModal
              │     │           ├── StatusBadge
              │     │           └── TeamBadge
              │     ├── CrewPage
              │     │     ├── TeamFilter
              │     │     ├── CrewCard
              │     │     ├── CrewDetailPage
              │     │     └── CreateCrewModal
              │     ├── TicketTransferBoard
              │     │     ├── FilterSelect
              │     │     ├── TicketCard
              │     │     ├── TicketDetailModal
              │     │     └── TicketWriteModal
              │     ├── MyPage
              │     │     └── AttendanceCalendar
              │     └── SignupPage
              ├── GlobalChatListener               ← 로그인 사용자 전용
              ├── ChatFab                          ← 로그인 사용자 전용
              └── ChatPage                         ← chatRoom 선택 시 오버레이
```

### 2.2 컴포넌트별 책임 요약

| 컴포넌트명 | 책임 | 주요 상태 위치 | 재사용성 |
| --- | --- | --- | --- |
| `App` | 화면 전환, 브라우저 history 동기화, 보호 탭 제어, 채팅방 열림 상태 | 로컬 `useState` + `useAuth` | 낮음 |
| `HomePage` | 홈 콘텐츠 조합, My Team 저장, 홈 응원 채팅 열림 제어 | 로컬 `useState`, `sessionStorage` | 낮음 |
| `ScheduleList` | 경기 일정 API 조회, 필터링, 날짜 선택, 경기 상세/라이브 채팅 | 로컬 `useState`, `useMemo`성 필터 계산 | 보통 |
| `MeetupPage` | 메이트 목록 조회, 필터, 작성/수정 모달, 상세 전환 | 로컬 `useState`, `useAuth` | 낮음 |
| `MeetupDetailPage` | 게시글 상세 조회, 신청, 멤버 목록, 그룹 채팅방 생성 | 로컬 `useState`, `useAuth` | 낮음 |
| `CrewPage` | 크루 목록 조회, 필터, 작성/수정 모달, 상세 전환 | 로컬 `useState` | 낮음 |
| `CrewDetailPage` | 멤버 조회, 가입 신청, 승인/거절/퇴장, DM 문의 | 로컬 `useState` | 낮음 |
| `TicketTransferBoard` | 티켓 목록 조회, 필터, 등록, 상세, 문의 채팅 | 로컬 `useState`, `useMemo`, `useAuth` | 낮음 |
| `MyPage` | 내 정보 수정/설정/충전/참여 목록/일정 관리 | 로컬 `useState`, `useAuth` | 낮음 |
| `LoginCard` | 로그인 폼 또는 사용자 카드 표시 | 로컬 `useState`, `useAuth` | 보통 |
| `ApplyModal` | 신청 메시지 입력 및 제출 | 로컬 `useState` | 높음 |
| `TeamBadge` | 팀 로고/이름 표시 | 상태 없음 | 높음 |
| `TeamFilter` | 팀 필터 버튼 목록 표시 | 상태 없음, 부모 제어 | 높음 |
| `ChatPage` | 채팅 연결, 메시지 목록, 거래 액션 | 로컬 `useState`, `useRef` | 보통 |

---

## 3. Props 설계

### 3.1 최상위/페이지 Props

| 컴포넌트 | Props명 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- | --- |
| `HomePage` | `onNavigate` | `(tab: string) => void` | 선택 | `undefined` | 빠른 메뉴와 CTA 클릭 시 App의 탭 전환 호출 |
| `MeetupPage` | `onSelectPost` | `(id: number | string) => void` | 선택 | 내부 `selectedPostId` 사용 가능 |
| `MeetupPage` | `onOpenChat` | `(room: ChatRoomOpenPayload) => void` | 선택 | `undefined` | 상세에서 그룹 채팅방 열기 |
| `MeetupDetailPage` | `postId` | `number | string` | 필수 | - |
| `MeetupDetailPage` | `onBack` | `() => void` | 필수 | - | 목록으로 돌아가기 |
| `MeetupDetailPage` | `onOpenChat` | `(room: ChatRoomOpenPayload) => void` | 선택 | `undefined` | 그룹 채팅방 팝업 열기 |
| `MeetupDetailPage` | `onEdit` | `(post: Post) => void` | 선택 | `undefined` | 작성자 수정 |
| `MeetupDetailPage` | `onDelete` | `(post: Post) => void` | 선택 | `undefined` | 작성자 삭제 |
| `CrewPage` | `currentUser` | `User | null` | 선택 | `undefined` |
| `CrewPage` | `onOpenChat` | `(room: ChatRoomOpenPayload) => void` | 선택 | `undefined` | DM 채팅방 열기 |
| `CrewDetailPage` | `crew` | `Post` | 필수 | - | 선택한 크루 게시글 |
| `CrewDetailPage` | `currentUser` | `User | null` | 선택 | `null` |
| `CrewDetailPage` | `onBack` | `() => void` | 필수 | - | 목록으로 돌아가기 |
| `CrewDetailPage` | `onOpenDmChat` | `(nickname: string) => void` | 선택 | `undefined` | 크루장/멤버 DM 열기 |
| `TicketTransferBoard` | `onOpenChat` | `(room: ChatRoomOpenPayload) => void` | 선택 | `undefined` | 티켓 문의 채팅방 열기 |
| `SignupPage` | `onSwitchToLogin` | `() => void` | 필수 | - | 가입 성공 또는 로그인 링크 클릭 시 홈/로그인 영역 이동 |
| `SchedulePage` | 없음 | - | - | - | 현재 연도를 내부에서 계산해 `ScheduleList`에 전달 |

### 3.2 공통 컴포넌트 Props

| 컴포넌트 | Props명 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- | --- |
| `TeamBadge` | `teamId` | `'LG' | 'DU' | 'SSG' | 'KIA' |
| `TeamFilter` | `selected` | `string` | 필수 | - | 현재 선택 팀 ID |
| `TeamFilter` | `onChange` | `(teamId: string) => void` | 필수 | - | 팀 버튼 클릭 시 부모 필터 상태 변경 |
| `StatusBadge` | `status` | `string` | 필수 | - | 모집 상태 표시 |
| `ApplyModal` | `post` | `Post` | 필수 | - | 신청 대상 게시글. 작성자 표시 등에 사용 |
| `ApplyModal` | `onClose` | `() => void` | 필수 | - | 취소 또는 닫기 |
| `ApplyModal` | `onSubmit` | `(message: string) => Promise<void> | void` | 필수 | - |
| `CreateCrewModal` | `onClose` | `() => void` | 필수 | - | 모달 닫기 |
| `CreateCrewModal` | `onSubmit` | `(formData: CrewFormData) => Promise<void> | void` | 필수 | - |
| `CreateCrewModal` | `initialData` | `Post | null` | 선택 | `undefined` |
| `LoginCard` | `onNavigate` | `(tab: string) => void` | 선택 | `undefined` | 회원가입 이동 |
| `ChatFab` | `currentUser` | `User` | 필수 | - | 채팅방 목록 조회 기준 사용자 |
| `ChatFab` | `onOpenChat` | `(room: ChatRoomOpenPayload) => void` | 필수 | - | 선택 채팅방 열기 |
| `ChatFab` | `refreshToggle` | `number` | 선택 | `0` | 알림 수신 후 목록 갱신 트리거 |
| `GlobalChatListener` | `user` | `User` | 필수 | - | 웹소켓 알림 구독 사용자 |
| `GlobalChatListener` | `onNotification` | `(notif: ChatNotification) => void` | 필수 | - | 알림 수신 시 App에서 채팅방 팝업 처리 |

### 3.3 `ChatPage` Props

| Props명 | 타입 | 필수 | 기본값 | 설명 |
| --- | --- | --- | --- | --- |
| `crew` | `{ title?: string, crewTeam?: string, id?: number }` | 선택 | `undefined` | 채팅방 제목/크루 정보 |
| `postId` | `number | string` | 선택 | `undefined` |
| `roomType` | `'GROUP_JOIN' | 'ONE_ON_ONE' | 'ONE_ON_ONE_DIRECT' | string` |
| `roomId` | `number | string` | 선택 | `undefined` |
| `currentUser` | `User | null` | 필수 | - |
| `isDm` | `boolean` | 선택 | `false` | 1:1 DM 여부 |
| `dmTargetNickname` | `string` | 선택 | `undefined` | DM 상대 닉네임 |
| `onBack` | `() => void` | 필수 | - | 팝업 닫기 |

### 3.4 도메인 데이터 타입 정의

```jsx
// User
{
  id: number,
  email?: string,
  nickname: string,
  teamId?: number,
  teamName?: string,
  teamShortName?: string,
  profileImageUrl?: string,
  balance?: number,
  mannerTemperature?: number,
  badgeLevel?: 'ROOKIE' | 'PRO' | 'ALL_STAR' | 'LEGEND',
  chatAlert?: boolean,
  transferAlert?: boolean,
  mannerAlert?: boolean
}

// Post: MATE 또는 CREW 게시글
{
  id: number,
  boardType: 'MATE' | 'CREW',
  title: string,
  content: string,
  status: 'OPEN' | 'CLOSED' | string,
  authorId?: number,
  authorNickname: string,
  authorTeam?: string,
  homeTeamId?: number,
  awayTeamId?: number,
  homeTeamName?: string,
  awayTeamName?: string,
  supportTeamId?: number,
  supportTeamName?: string,
  stadium?: string,
  matchDate?: string,
  matchTime?: string,
  currentParticipants: number,
  maxParticipants: number,
  chatRoomId?: number
}

// TicketTransfer
{
  id: number,
  authorId?: number,
  author: string,
  homeTeam: string,
  awayTeam: string,
  matchDate: string,
  matchTime: string,
  stadium: string,
  seatArea: string,
  seatBlock?: string,
  seatRow?: string,
  price: number,
  description?: string,
  status: 'selling' | 'reserved' | 'sold'
}

// ChatRoomOpenPayload
{
  id: number | string,
  title?: string,
  roomType: string,
  postId?: number | string,
  crewId?: number | string,
  crewTeam?: string,
  isDm?: boolean,
  dmTargetNickname?: string
}
```

---

## 4. State 설계

### 4.1 전역 인증 상태

| 상태/함수 | 위치 | 타입 | 용도 |
| --- | --- | --- | --- |
| `user` | `AuthContext` | `User | null` |
| `loading` | `AuthContext` | `boolean` | 앱 초기 인증 확인 중 전체 로딩 표시 |
| `login(email, password)` | `AuthContext` | `function` | 로그인 API 호출 및 토큰 저장 |
| `logout()` | `AuthContext` | `function` | 로그아웃 API 호출 및 토큰 제거 |
| `fetchMyInfo(token?)` | `AuthContext` | `function` | 내 정보 재조회, 프로필/잔액/알림 설정 갱신 |

### 4.2 `App` 로컬 상태

| 상태명 | 타입 | 초기값 | 용도 |
| --- | --- | --- | --- |
| `tab` | `string` | `'home'` | 현재 화면 탭 |
| `selectedPostId` | `string | null` | `null` |
| `chatRoom` | `ChatRoomOpenPayload | null` | `null` |
| `roomRefreshToggle` | `number` | `0` | 채팅 알림 수신 시 `ChatFab` 목록 갱신 트리거 |

### 4.3 페이지별 로컬 상태

| 컴포넌트 | 상태명 | 타입 | 초기값 | 용도 |
| --- | --- | --- | --- | --- |
| `HomePage` | `myTeam` | `string | null` | `sessionStorage.myTeam` |
| `HomePage` | `activeChatGame` | `object | null` | `null` |
| `ScheduleList` | `games` | `Game[]` | `[]` | 시즌 경기 일정 |
| `ScheduleList` | `loading`, `syncing` | `boolean` | `false` | 일정 로딩/동기화 상태 |
| `ScheduleList` | `error` | `string | null` | `null` |
| `ScheduleList` | `teamFilter` | `string` | `'ALL'` | 팀 필터 |
| `ScheduleList` | `month` | `number` | 현재 월 | 월 필터 |
| `ScheduleList` | `selectedDate` | `string | null` | `null` |
| `ScheduleList` | `selectedGame` | `Game | null` | `null` |
| `MeetupPage` | `posts` | `Post[]` | `[]` | 메이트 모집 목록 |
| `MeetupPage` | `selectedPostId` | `number | string | null` |
| `MeetupPage` | `filterTeam`, `filterStatus` | `string` | `'ALL'` | 팀/상태 필터 |
| `MeetupPage` | `isModalOpen` | `boolean` | `false` | 작성/수정 모달 표시 |
| `MeetupPage` | `editingPostId` | `number | null` | `null` |
| `MeetupPage` | `formData` | `object` | 빈 게시글 폼 | 작성/수정 입력값 |
| `MeetupDetailPage` | `post` | `Post | null` | `null` |
| `MeetupDetailPage` | `members` | `Member[]` | `[]` | 참여 멤버 |
| `MeetupDetailPage` | `tab` | `'info' | 'apply'` | `'info'` |
| `MeetupDetailPage` | `groupChatRoomId` | `number | null` | `null` |
| `CrewPage` | `view` | `'list' | 'detail'` | `'list'` |
| `CrewPage` | `crews` | `Post[]` | `[]` | 크루 목록 |
| `CrewPage` | `selectedCrew` | `Post | null` | `null` |
| `CrewPage` | `isCreateModalOpen`, `editingCrew` | `boolean`, `Post | null` | `false`, `null` |
| `CrewDetailPage` | `tab` | `'info' | 'members'` | `'info'` |
| `CrewDetailPage` | `members` | `Member[]` | `[]` | 승인/대기 멤버 |
| `CrewDetailPage` | `isApplyModalOpen` | `boolean` | `false` | 신청 모달 표시 |
| `TicketTransferBoard` | `tickets` | `TicketTransfer[]` | `[]` | 티켓 목록 |
| `TicketTransferBoard` | `filterDate`, `filterStadium`, `filterTeam` | `string` | `'전체'` | 티켓 필터 |
| `TicketTransferBoard` | `showWriteModal` | `boolean` | `false` | 티켓 등록 모달 |
| `TicketTransferBoard` | `selectedTicket` | `TicketTransfer | null` | `null` |
| `MyPage` | `isEditing` | `boolean` | `false` | 닉네임 수정 모드 |
| `MyPage` | `isSettingsModalOpen`, `isChargeModalOpen` | `boolean` | `false` | 설정/충전 모달 |
| `MyPage` | `activeTab` | `'profile' | 'team' | 'noti'` |
| `MyPage` | `participatingActivities` | `object` | `{crews:[], mates:[], transfers:[]}` | 참여 중인 목록 |
| `SignupPage` | `formData` | `object` | 이메일/비밀번호/닉네임/teamId | 회원가입 입력값 |
| `ChatPage` | `messages` | `Message[]` | `[]` | 채팅 메시지 |
| `ChatPage` | `connected` | `boolean` | `false` | STOMP 연결 상태 |
| `ChatPage` | `resolvedRoomId` | `number | string | null` |
| `ChatPage` | `participants` | `Member[]` | `[]` | 참여자 목록 |
| `ChatPage` | `transfer` | `object | null` | `null` |

### 4.4 State 위치 결정 근거

| 상태 유형 | 위치 | 이유 |
| --- | --- | --- |
| 로그인 사용자, 인증 로딩 | `AuthContext` | 앱 전체에서 접근하고 보호 화면/헤더/마이페이지/채팅에 공통 필요 |
| 현재 탭, 선택 게시글, 채팅 팝업 | `App` | 화면 전환과 전역 오버레이를 최상위에서 조합해야 함 |
| 목록 데이터, 필터, 모달 열림 | 각 페이지 컴포넌트 | 해당 화면에서만 사용되고 다른 화면과 공유하지 않음 |
| 작성/수정 폼 입력값 | 폼을 소유한 페이지 또는 모달 | 제출 전 임시 UI 상태이며 서버 저장 전까지 전역 공유 불필요 |
| My Team | `HomePage` + `sessionStorage` | 홈/순위 위젯에서만 필요하지만 새로고침 후 유지가 필요 |
| STOMP client | `ChatPage`의 `useRef` | 렌더링 상태가 아니며 연결 객체를 재렌더 없이 유지해야 함 |

---

## 5. API 연동 설계

### 5.1 인증/회원 API

| API 엔드포인트 | 메서드 | 호출 컴포넌트 | 호출 시점 | 인증 |
| --- | --- | --- | --- | --- |
| `/auth/login` | `POST` | `LoginCard` -> `AuthContext` | 로그인 폼 제출 | 불필요 |
| `/auth/logout` | `POST` | `LoginCard`, `MyPage` -> `AuthContext` | 로그아웃 클릭 | 필요 |
| `/auth/signup` | `POST` | `SignupPage` | 회원가입 제출 | 불필요 |
| `/members/me` | `GET` | `AuthContext` | 앱 초기화, 로그인 직후 | 필요 |
| `/members/me` | `PUT` | `MyPage` | 닉네임 수정 | 필요 |
| `/members/me/team` | `PUT` | `MyPage` | 응원팀 변경 | 필요 |
| `/members/me/profile-image` | `PUT` | `MyPage` | 프로필 이미지 변경 | 필요 |
| `/members/me/password` | `PUT` | `MyPage` | 비밀번호 변경 | 필요 |
| `/members/me/alerts` | `PUT` | `MyPage` | 알림 설정 변경 | 필요 |
| `/members/me/charge` | `PUT` | `MyPage` | 잔액 충전 | 필요 |

### 5.2 게시글/일정/티켓 API

| API 엔드포인트 | 메서드 | 호출 컴포넌트 | 호출 시점 | 인증 |
| --- | --- | --- | --- | --- |
| `/posts?boardType=MATE...` | `GET` | `MeetupPage` | 진입/필터 변경 | 불필요 |
| `/posts?boardType=CREW...` | `GET` | `CrewPage`, `MyPage` | 진입/필터 변경/참여 목록 | 상황별 |
| `/posts` | `POST` | `MeetupPage`, `CrewPage` | 모집글 작성 | 필요 |
| `/posts/{id}` | `GET` | `MeetupDetailPage` | 상세 진입 | 불필요 |
| `/posts/{id}` | `PUT` | `MeetupPage`, `CrewPage` | 작성자 수정 | 필요 |
| `/posts/{id}` | `DELETE` | `MeetupPage`, `CrewPage` | 작성자 삭제 | 필요 |
| `/posts/{id}/mate/join` | `POST` | `MeetupDetailPage` | 메이트 신청 | 필요 |
| `/posts/{id}/mate/members` | `GET` | `MeetupDetailPage` | 상세 진입/신청 탭 | 불필요 또는 필요 |
| `/posts/{id}/join` | `POST` | `CrewDetailPage` | 크루 신청 | 필요 |
| `/posts/{id}/members` | `GET` | `CrewDetailPage` | 멤버 탭/상세 진입 | 불필요 또는 필요 |
| `/posts/{id}/members/{memberId}/approve` | `POST` | `CrewDetailPage` | 크루장 승인 | 필요 |
| `/posts/{id}/members/{memberId}/reject` | `DELETE` | `CrewDetailPage` | 크루장 거절 | 필요 |
| `/posts/{id}/members/{memberId}/expel` | `DELETE` | `CrewDetailPage`, `MeetupDetailPage` | 작성자 내보내기 | 필요 |
| `/posts/{id}/leave` | `DELETE` | `CrewDetailPage`, `MeetupDetailPage` | 참여 취소/나가기 | 필요 |
| `/baseball/season?year={year}` | `GET` | `ScheduleList` | 일정 페이지 진입 | 불필요 |
| `/baseball/sync?year={year}` | `POST` | `ScheduleList` | 최신 동기화 클릭 | 필요 가능 |
| `/baseball/live?date={date}` | `GET` | `ScheduleList` | 날짜 선택 | 불필요 |
| `/ticket-transfers` | `GET` | `TicketTransferBoard` | 티켓 페이지 진입 | 불필요 |
| `/ticket-transfers` | `POST` | `TicketTransferBoard` | 티켓 등록 | 필요 |
| `/transfers/me` | `GET` | `MyPage` | 참여 중인 티켓 양도 조회 | 필요 |

### 5.3 채팅/거래 API 및 WebSocket

| API 또는 채널 | 메서드/프로토콜 | 호출 컴포넌트 | 용도 |
| --- | --- | --- | --- |
| `/chat/rooms` | `GET` | `ChatFab`, `ChatPage` | 내 채팅방 목록, postId 기반 방 조회 |
| `/chat/rooms` | `POST` | `MeetupDetailPage` | 그룹 채팅방 생성/조회 |
| `/chat/rooms/{roomId}` | `GET` | `ChatPage`, `MeetupDetailPage` | 채팅방 상세/참여자 조회 |
| `/chat/rooms/{roomId}/messages` | `GET` | `ChatPage` | 이전 메시지 조회 |
| `/chat/rooms/{roomId}/read` | `POST` | `ChatPage` | 읽음 처리 |
| `/chat/rooms/{roomId}/leave` | `DELETE` | `ChatPage` | 채팅방 나가기 |
| `/chat/rooms/dm` | `POST` | `CrewPage` | 닉네임 기반 1:1 DM |
| `/chat/rooms/dm/crew/{crewId}` | `POST` | `CrewPage`, `ChatPage` | 크루 기반 DM |
| `/chat/rooms/transfer/{ticketId}` | `POST` | `TicketTransferBoard` | 티켓 문의 채팅방 |
| `http://localhost:8080/ws` | SockJS/STOMP | `ChatPage` | 실시간 채팅 연결 |
| `/topic/chat/{roomId}` | STOMP subscribe | `ChatPage` | 실시간 메시지 수신 |
| `/app/chat/{roomId}` | STOMP send | `ChatPage` | 메시지 전송 |
| `/transfers/room/{roomId}` | `GET` | `ChatPage` | 티켓 거래 상태 조회 |
| `/transfers/room/{roomId}/request` | `POST` | `ChatPage` | 양도 요청 |
| `/transfers/{transferId}/pay` | `POST` | `ChatPage` | 에스크로 결제 |
| `/transfers/{transferId}/ticket-sent` | `POST` | `ChatPage` | 티켓 전달 완료 |
| `/transfers/{transferId}/confirm` | `POST` | `ChatPage` | 인수 확정 |
| `/transfers/{transferId}/cancel` | `POST` | `ChatPage` | 거래 취소 |

### 5.4 에러 처리 방식

| 상황 | 처리 방식 |
| --- | --- |
| 인증 만료 `401` | `AuthContext.fetchMyInfo`에서 토큰 제거 및 `user=null` 처리 |
| 비로그인 보호 기능 접근 | `alert('로그인이 필요합니다.')` 또는 홈으로 이동 |
| 작성/수정/삭제 실패 | 백엔드 `message` 또는 기본 실패 문구를 `alert`로 표시 |
| 목록 조회 실패 | 로딩 종료 후 빈 목록 또는 에러 문구 표시 |
| 티켓 목록 조회 실패 | `error` 상태에 "티켓 목록을 불러오는데 실패했습니다." 표시 |
| 채팅 연결 실패 | `connected=false`, 헤더에 "연결 중..." 또는 콘솔 오류 |
| 거래 액션 실패 | 백엔드 `message` 또는 "처리에 실패했습니다." 표시 |

---

## 6. 주요 컴포넌트 구현 골격

### 6.1 페이지 컴포넌트 기본 패턴

```jsx
export default function MeetupPage({ onSelectPost, onOpenChat }) {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/posts', {
        params: { boardType: 'MATE', teamId, status, page: 0, size: 100 },
      });
      setPosts(response.data?.data?.content || []);
    } finally {
      setLoading(false);
    }
  }, [filterTeam, filterStatus]);

  useEffect(() => {
    fetchMates();
  }, [fetchMates]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('로그인 필요');
    await api.post('/posts', { ...formData, boardType: 'MATE' });
    setIsModalOpen(false);
    fetchMates();
  };

  return (
    <div className="meetup-page">
      <TeamFilter selected={filterTeam} onChange={setFilterTeam} />
      {loading ? <div>로딩 중...</div> : <div className="card-grid">{/* cards */}</div>}
    </div>
  );
}
```

### 6.2 모달 컴포넌트 기본 패턴

```jsx
export default function ApplyModal({ post, onClose, onSubmit }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(message);
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <form onSubmit={handleSubmit}>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
        <button type="button" onClick={onClose}>취소</button>
        <button type="submit" disabled={loading}>
          {loading ? '신청 중...' : '신청하기'}
        </button>
      </form>
    </div>
  );
}
```

### 6.3 전역 인증 사용 패턴

```jsx
const { user, loading, login, logout, fetchMyInfo } = useAuth();

if (loading) return <p>Loading...</p>;

if (!user) {
  alert('로그인이 필요합니다.');
  return;
}
```

### 6.4 채팅 연결 패턴

```jsx
const clientRef = useRef(null);
const [connected, setConnected] = useState(false);
const [messages, setMessages] = useState([]);

useEffect(() => {
  const socket = new SockJS('<http://localhost:8080/ws>');
  const client = Stomp.over(socket);
  clientRef.current = client;

  client.connect({ Authorization: `Bearer ${localStorage.getItem('accessToken')}` }, () => {
    setConnected(true);
    client.subscribe(`/topic/chat/${roomId}`, (frame) => {
      const parsed = JSON.parse(frame.body);
      setMessages((prev) => [...prev, parsed]);
    });
  });

  return () => {
    if (clientRef.current?.connected) clientRef.current.disconnect();
  };
}, [roomId]);
```

---

## 7. 성능 및 유지보수 고려사항

| 항목 | 적용 위치 | 적용 내용 |
| --- | --- | --- |
| `useCallback` | `MeetupPage.fetchMates`, `ScheduleList.loadGames`, `ChatPage` 핸들러 | 필터 변경과 effect 의존성 관리 |
| `useMemo` | `TicketTransferBoard.dateOptions`, `TicketTransferBoard.filtered` | 티켓 목록 필터링 결과 계산 |
| `useRef` | `ChatPage.clientRef`, `ChatPage.endRef`, `TicketDetailModal.overlayRef` | STOMP 클라이언트, 스크롤, 외부 클릭 감지 |
| 조건부 렌더링 | 전체 페이지 | 로딩/에러/빈 데이터/권한 상태 분기 |
| 데이터 정규화 | `MeetupPage`, `TicketTransferBoard`, `ChatPage` | 백엔드 응답 필드 차이를 프론트 표시 모델로 변환 |
| 중복 방지 | 작성/수정 모달 | 수정 모드에서 변경사항 없음 검사 |
| URL 동기화 | `App.navigateTo`, `popstate` effect | 뒤로가기와 QueryString 화면 상태 유지 |

---

## 8. 컴포넌트별 체크리스트

| 점검 항목 | 상태 |
| --- | --- |
| 화면별 페이지 컴포넌트와 공통 컴포넌트가 구분되었는가? | O |
| 부모-자식 컴포넌트 트리가 작성되었는가? | O |
| 주요 Props의 타입, 필수 여부, 설명이 작성되었는가? | O |
| `AuthContext` 기반 전역 상태가 명시되었는가? | O |
| 페이지별 로컬 State가 작성되었는가? | O |
| Zustand 미사용, Context + 로컬 상태 구조가 반영되었는가? | O |
| API 엔드포인트와 호출 컴포넌트/시점이 명확한가? | O |
| 로딩/에러/빈 데이터/권한 상태가 고려되었는가? | O |
| 실시간 채팅의 REST API와 STOMP 연결 구조가 포함되었는가? | O |
| 화면 설계서의 탭 기반 URL 구조와 일치하는가? | O |