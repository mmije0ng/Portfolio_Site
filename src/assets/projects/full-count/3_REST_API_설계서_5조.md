# 3. REST API 설계서 (5조)

## **문서 정보**

- **프로젝트명**: 풀카운트 (Full Count) - 야구 팬 커뮤니티 및 직관/티켓 양도 플랫폼
- **작성자**: [풀카운트/박미정]
- **작성일**: [2026-04-06]
- **버전**: [v1.3]
- **검토자**: [안진경, 김어진, 박미정, 이시연, 이준호]
- **승인자**: [안진경, 김어진, 박미정, 이시연, 이준호]

---

## 1. API 설계 개요

### 1.1 설계 목적

KBO 팬들을 위한 안전한 티켓 양도(에스크로 기반) 및 커뮤니티 기능을 제공하기 위해 클라이언트(React)와 서버(Spring Boot) 간의 통신 규격을 정의한다.

### 1.2 설계 원칙

- **RESTful**: HTTP 메서드와 상태 코드의 명확한 사용
- **일관성**: 모든 API에서 동일한 응답 구조 사용
- **보안**: JWT 기반 인증, `/api/auth/**` 및 일부 조회 API 제외 보호
    - `/api/admin/**` 의 경우 관리자(ADMIN) 권한을 가진 사용자만 접근 가능
- **성능**: 게시글 및 회원 목록 페이징 처리 (기본 size=10)

### 1.3 기술 스택

| 항목 | 기술 |
| --- | --- |
| 프레임워크 | Spring Boot 3.4.6 |
| 인증 | JWT (액세스 토큰 1시간, 리프레시 토큰 7일) |
| 직렬화 | JSON |
| API 문서 | OpenAPI 3.0 (Swagger) |

---

## 2. API 공통 규칙

### 2.1 URL 설계 규칙

| 규칙 | 좋은 예 | 나쁜 예 |
| --- | --- | --- |
| 명사 사용 | `GET /api/posts` | `GET /api/getPosts` |
| 복수형 사용 | `/api/posts`, `/api/teams` | `/api/post`, `/api/team` |
| 계층 구조 | `/api/posts/1/request` | `/api/requestTransfer` |
| 소문자+하이픈 | `/api/team-boards` | `/api/teamBoards` |
| HTTP 메서드로 동작 표현 | `POST /api/transfers` | `/api/createTransfer` |

### 2.2 HTTP 메서드 사용 규칙

| 메서드 | 용도 | 멱등성 | 예시 |
| --- | --- | --- | --- |
| `GET` | 리소스 조회 | ✅ | `GET /api/posts` |
| `POST` | 리소스 생성/액션 | ❌ | `POST /api/auth/signup` |
| `PUT` | 리소스 전체 수정 | ✅ | `PUT /api/members/me` |
| `PATCH` | 리소스 부분 수정 | ❌ | `PATCH /api/admin/members/1/status` |
| `DELETE` | 리소스 삭제 | ✅ | `DELETE /api/posts/1` |

### **2.3 HTTP 상태 코드 가이드**

| **코드** | **상태** | **설명** | **사용 예시** |
| --- | --- | --- | --- |
| **200** | OK | 성공 (데이터 포함) | GET 요청 성공 |
| **201** | Created | 리소스 생성 성공 | POST 요청 성공 |
| **204** | No Content | 성공 (응답 데이터 없음) | DELETE 요청 성공 |
| **400** | Bad Request | 잘못된 요청 | 검증 실패 |
| **401** | Unauthorized | 인증 필요 | 토큰 없음/만료 |
| **403** | Forbidden | 권한 없음 | 접근 거부 |
| **404** | Not Found | 리소스 없음 | 존재하지 않는 ID |
| **409** | Conflict | 충돌 | 중복 생성 시도 |
| **422** | Unprocessable Entity | 의미상 오류 | 비즈니스 규칙 위반 |
| **500** | Internal Server Error | 서버 오류 | 예기치 못한 오류 |

### **2.4 공통 요청 헤더**

```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {JWT_TOKEN}
```

### 2.5 공통 응답/실패 구조

#### 성공 응답 (단일 객체/메시지)

```json
{
  "success": true,
  "data": { },
  "message": "요청이 성공적으로 처리되었습니다",
  "timestamp": "2026-03-30T10:30:00Z"
}
```

#### 성공 응답 (목록/페이지네이션 - PagedResponse)

```json
{
  "success": true,
  "data": {
    "content": [ ],
    "page": {
      "number": 0,
      "size": 10,
      "totalElements": 50,
      "totalPages": 5
    }
  }
}
```

#### 성공 응답 (무한 스크롤 - CursorResponse)

```json
{
  "success": true,
  "data": {
    "content": [ ],
    "nextCursor": 123,
    "hasNext": true
  }
}
```

#### 실패 응답

**401 Unauthorized**

```json
{
  "error": "Unauthorized",
  "message": "로그인이 필요합니다."
}
```

**403 Forbidden**

```json
{
  "error": "Forbidden",
  "message": "권한이 없습니다."
}
```

**400 Bad Request**

```json
{
    "timestamp": "2026-04-06T14:32:10+09:00",
    "status": 400,
    "error": "Bad Request",
    "code": "VALIDATION_ERROR",
    "message": "입력값 검증에 실패했습니다.",
    "path": "/api/members/signup",
    "fieldErrors": [
      {
        "field": "email",
        "value": "abc",
        "reason": "올바른 이메일 형식이 아닙니다."
      },
      {
        "field": "password",
        "value": "",
        "reason": "비밀번호는 필수입니다."
      }
    ]
  }
```

**404 Not Found**

```json
{
  "code": "TRF_001",
  "message": "존재하지 않는 거래입니다.",
  "timestamp": "2026-04-06T15:53:56.355108"
}
```

---

## 3. 인증 및 권한 관리

### 3.1 권한 레벨

| 역할 | 접근 가능 API | 설명 |
| --- | --- | --- |
| 공개(미인증) | `POST /api/auth/login`, `POST /api/auth/signup`, `POST /api/auth/refresh`, `GET /api/teams/**`, `GET /api/baseball/**`, `POST /api/baseball/sync`, `/swagger-ui/**`, `/v3/api-docs/**`, `/h2-console/**`, `/ws/**`, `/ws-test/**` | 로그인 이전에도 접근 가능한 API 및 테스트·문서 조회 경로 |
| MEMBER | 공개 API + `POST /api/auth/logout` + 그 외 인증이 필요한 일반 사용자 API | 로그인한 일반 회원. 게시글 작성, 양도 요청, 채팅, 내 정보 조회 및 수정, 직관 다이어리 기능 등을 사용함 |
| ADMIN | MEMBER 권한 포함 + `/api/admin/**` | 시스템 관리자. 회원 관리, 게시글 관리, 거래 모니터링, 관리자 대시보드 등의 기능 수행 가능 |

### 3.2 인증 방식

본 시스템은 `/api/**` 경로에 대해 JWT 기반 인증 방식을 적용함. API 서버는 세션을 사용하지 않는 Stateless 구조로 동작하며, 로그인 후 발급받은 토큰을 통해 사용자를 인증함. 또한 `/api/auth/logout`은 인증된 사용자만 접근 가능하고, 별도로 `/api/admin/**` 경로는 `ADMIN` 권한을 가진 사용자만 접근 가능하도록 제한함.

### 3.3 인가 정책

인가 정책은 다음과 같이 구성됨.

- 인증 없이 접근 가능한 공개 API를 별도로 허용함
- 로그아웃을 포함한 대부분의 일반 API는 인증된 사용자만 접근 가능함
- 관리자 기능은 `ADMIN` 권한을 가진 사용자만 접근 가능함
- 그 외 별도로 허용되지 않은 `/api/**` 요청은 모두 인증이 필요함

즉, 시스템은 공개 기능과 인증 기능, 관리자 기능을 명확히 분리하여 보안성을 확보하도록 설계함.

---

## 4. 상세 API 명세

### 4.1 인증 API (Auth)

### 4.1.1 회원 가입

```
POST /api/auth/signup
Content-Type: application/json
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "nickname": "홈런왕",
  "password": "password123!",
  "teamId": 1
}
```

**Response 200 OK:**

```json
{ "success": true, "message": "요청이 성공적으로 처리되었습니다" }
```

**에러 발생 케이스:**

- **409 Conflict (DUPLICATE_EMAIL)**: 이미 사용 중인 이메일
- **409 Conflict (DUPLICATE_NICKNAME)**: 이미 사용 중인 닉네임
- **404 Not Found (TEAM_NOT_FOUND)**: 존재하지 않는 팀 ID

---

### 4.1.2 로그인 (JWT 토큰 발급)

```
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**

```json
{ "email": "user@example.com", "password": "password123!" }
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "eyJhbGciOiJIUzI1Ni...",
    "tokenType": "Bearer"
  }
}
```

**에러 발생 케이스:**

- **404 Not Found (MEMBER_NOT_FOUND)**: 가입되지 않은 이메일
- **403 Forbidden (INACTIVE_MEMBER)**: 비활성화된 계정
- **401 Unauthorized (INVALID_CREDENTIALS)**: 비밀번호 불일치

---

### 4.1.3 토큰 재발급

```
POST /api/auth/refresh
Content-Type: application/json
```

**Request Body:**

```json
{ "refreshToken": "eyJhbGciOiJIUzI1Ni..." }
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": { "accessToken": "eyJhbGci...", "refreshToken": "eyJhbGci..." }
}
```

**에러 발생 케이스:**

- **401 Unauthorized (INVALID_TOKEN)**: 유효하지 않은 Refresh Token
- **401 Unauthorized (EXPIRED_TOKEN)**: 만료된 Refresh Token

---

### 4.1.4 로그아웃

```
POST /api/auth/logout
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

**Response 200 OK:**

```json
{ "success": true, "message": "요청이 성공적으로 처리되었습니다" }
```

---

### 4.2 야구 경기 정보 API (Baseball)

### 4.2.1 시즌 일정 조회

```
GET /api/baseball/season?year=2026
Content-Type: application/json
```

- **권한**: 공개
- **설명**: DB에 저장된 특정 시즌 경기 일정을 날짜/시간 오름차순으로 조회합니다.
- **Query Params**:
    - `year` (String, optional): 조회 연도. 미입력 시 `2026`
- **비고**:
    - 서비스 내부에서 `year`를 정수로 변환하므로 숫자 형식이 아니면 서버 예외가 발생할 수 있습니다.
    - 정규 시즌 시작일(3월 23일) 이전 데이터는 응답에서 제외됩니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": [
    {
      "gameId": "20260405LGDU0",
      "isCanceled": false,
      "gameDate": "2026-04-05",
      "gameTime": "14:00",
      "homeTeam": "DU",
      "awayTeam": "LG",
      "homeScore": 3,
      "awayScore": 5,
      "stadium": "잠실",
      "status": "RESULT"
    },
    {
      "gameId": "20260406KTSSG0",
      "isCanceled": false,
      "gameDate": "2026-04-06",
      "gameTime": "18:30",
      "homeTeam": "SSG",
      "awayTeam": "KT",
      "homeScore": 0,
      "awayScore": 0,
      "stadium": "문학",
      "status": "SCHEDULED"
    }
  ]
}
```

**실패 케이스:**

- **400 Bad Request**: `year` 쿼리 파라미터 자체가 잘못 전달된 경우
- **500 Internal Server Error (SERVER_001)**: `year=abcd`처럼 숫자 변환이 불가능한 값이 들어와 서비스 내부 파싱에 실패한 경우

**Response 500 Internal Server Error 예시:**

```json
{
  "code": "SERVER_001",
  "message": "서버 내부 오류가 발생했습니다.",
  "timestamp": "2026-04-06T15:20:31"
}
```

---

### 4.2.2 시즌 일정 동기화

```
POST /api/baseball/sync?year=2026
Content-Type: application/json
```

- **권한**: 현재 구현상 공개
- **설명**: 네이버/KBO 외부 데이터를 조회해 특정 시즌 경기 일정을 DB에 Upsert 합니다.
- **Query Params**:
    - `year` (int, optional): 동기화 대상 연도. 미입력 시 `2026`
- **비고**:
    - 코드 주석상 관리자성 작업이지만 현재 `SecurityConfig`에서는 `permitAll`로 열려 있습니다.
    - 3월부터 10월까지 월 단위로 외부 API를 순회하고, KBO 스크래핑으로 점수/구장 정보를 보정합니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": "2026년도 야구 데이터 DB 동기화가 성공적으로 완료되었습니다."
}
```

**실패 케이스:**

- **400 Bad Request**: `year` 파라미터가 정수 형식이 아닌 경우
- **500 Internal Server Error (SERVER_001)**: 외부 연동 또는 내부 저장 처리 중 예외가 전파된 경우

**Response 400 Bad Request 예시:**

```json
{
  "code": "SERVER_002",
  "message": "입력값이 올바르지 않습니다.",
  "timestamp": "2026-04-06T15:21:10"
}
```

**Response 500 Internal Server Error 예시:**

```json
{
  "code": "SERVER_001",
  "message": "서버 내부 오류가 발생했습니다.",
  "timestamp": "2026-04-06T15:21:25"
}
```

---

### 4.2.3 일자별 라이브 경기 조회

```
GET /api/baseball/live?date=2026-04-06
Content-Type: application/json
```

- **권한**: 공개
- **설명**: 네이버 경기 API를 우선 조회하고, 데이터가 비어 있으면 DB 저장 경기 데이터로 대체 응답을 구성합니다.
- **Query Params**:
    - `date` (String, required): 조회 날짜 (`yyyy-MM-dd`)
- **응답 특성**:
    - 이 API는 공통 `success/data` 래퍼가 아니라 외부 API 원형에 가까운 구조를 그대로 반환합니다.
    - 경기 상태는 `SCHEDULED`, `RESULT`, `CANCEL` 등으로 내려올 수 있습니다.

**Response 200 OK:**

```json
{
  "result": {
    "games": [
      {
        "gameId": "20260406LGDU0",
        "homeTeamCode": "DU",
        "awayTeamCode": "LG",
        "statusCode": "RESULT",
        "homeTeamScore": 3,
        "awayTeamScore": 5,
        "statusInfo": "종료",
        "gameDateTime": "2026-04-06T18:30:00"
      }
    ]
  }
}
```

**DB 대체 응답 예시 (네이버 결과가 비어 있을 때):**

```json
{
  "result": {
    "games": [
      {
        "gameId": "20260406KTSSG0",
        "homeTeamCode": "SSG",
        "awayTeamCode": "KT",
        "statusCode": "SCHEDULED",
        "homeTeamScore": 0,
        "awayTeamScore": 0,
        "statusInfo": "SCHEDULED",
        "gameDateTime": "2026-04-06T18:30:00"
      }
    ]
  }
}
```

**실패 케이스:**

- **400 Bad Request**: `date` 파라미터 누락
- **200 OK (`{"error":"fail"}`)**: 외부 API 호출 또는 JSON 파싱 중 예외 발생 시 현재 구현은 표준 에러 응답 대신 실패 문자열을 반환

**Response 400 Bad Request 예시:**

```json
{
  "code": "SERVER_002",
  "message": "입력값이 올바르지 않습니다.",
  "timestamp": "2026-04-06T15:22:40"
}
```

**Response 200 OK 실패 예시:**

```json
{
  "error": "fail"
}
```

---

### 4.2.4 KBO 순위 조회

```
GET /api/baseball/standings
Content-Type: application/json
```

- **권한**: 공개
- **설명**: KBO 공식 페이지를 스크래핑하여 팀 순위표를 조회합니다.
- **응답 특성**:
    - 공통 `success/data` 래퍼 없이 배열을 그대로 반환합니다.
    - `teamId`는 내부 축약 코드(`LG`, `DU`, `SSG`, `KIA`, `SA`, `LO`, `HH`, `KT`, `NC`, `WO`)로 정규화됩니다.

**Response 200 OK:**

```json
[
  {
    "rank": "1",
    "teamId": "LG",
    "teamName": "LG",
    "games": "12",
    "wins": "9",
    "losses": "3",
    "draws": "0",
    "pct": "0.750",
    "gb": "0.0"
  },
  {
    "rank": "2",
    "teamId": "DU",
    "teamName": "두산",
    "games": "12",
    "wins": "8",
    "losses": "4",
    "draws": "0",
    "pct": "0.667",
    "gb": "1.0"
  }
]
```

---

### 4.3 팀 API (Team)

### 4.3.1 전체 팀 목록 조회

```
GET /api/teams
Content-Type: application/json
```

- **권한**: 공개
- **설명**: 등록된 전체 KBO 팀 목록을 조회합니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "LG",
      "shortName": "LG",
      "homeStadium": "잠실야구장"
    },
    {
      "id": 2,
      "name": "두산",
      "shortName": "DU",
      "homeStadium": "잠실야구장"
    }
  ]
}
```

**실패 케이스:**

- 현재 구현상 비즈니스 예외 없음
- DB/서버 오류 시 `500 Internal Server Error (SERVER_001)`

### 4.3.2 단일 팀 조회

```
GET /api/teams/{id}
Content-Type: application/json
```

- **권한**: 공개
- **설명**: 팀 ID로 특정 팀 정보를 조회합니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "LG",
    "shortName": "LG",
    "homeStadium": "잠실야구장"
  }
}
```

**실패 케이스:**

- `404 Not Found (TEAM_001)`: 존재하지 않는 팀 ID
- `400 Bad Request`: 경로 변수 타입 불일치

**Response 404 Not Found 예시:**

```json
{
  "code": "TEAM_001",
  "message": "존재하지 않는 팀입니다.",
  "timestamp": "2026-04-06T16:10:00"
}
```

---

### 4.4 게시글 API (Post)

### 4.4.1 게시글 목록 조회

```
GET /api/posts?boardType=CREW&teamId=1&status=OPEN&participating=false&page=0&size=9
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **설명**: 게시판 타입별 게시글 목록을 페이지 단위로 조회합니다.
- **Query Params:**
    - `boardType` (optional): `CREW`, `MATE`, `TRANSFER`. 기본값 `CREW`
    - `teamId` (optional): 팀 ID 또는 팀 shortName. 필터 방식은 `boardType`에 따라 달라집니다.
    - `status` (optional): `OPEN`, `RESERVED`, `CLOSED`
    - `participating` (optional): `true`일 경우 내가 참여 중인 게시글만 조회. 기본값 `false`
    - `page`, `size`, `sort` (optional): 페이지네이션 파라미터. 기본 `size=9`, `sort=createdAt,DESC`

**필터 동작 규칙:**

- `boardType=CREW`: `supportTeam` 기준 필터
- `boardType=MATE`, `TRANSFER`: `homeTeam`, `awayTeam`, `supportTeam` 중 하나라도 일치하면 포함
- `participating=true` 이고 인증 사용자(`memberId`)가 있으면 `teamId`, `status`보다 참여 여부 필터가 우선 적용됩니다.
- `participating=true` 이지만 비인증 요청인 경우에는 참여 필터가 적용되지 않고 일반 목록 조회로 동작합니다.

**응답 타입 규칙:**

- `boardType=MATE` 조회 시 `MateResponse` 배열 반환
- `boardType=CREW` 조회 시 `CrewResponse` 배열 반환
- `boardType=TRANSFER` 조회 시 `TransferResponse` 배열 반환
- 즉, 같은 엔드포인트라도 `boardType`에 따라 `content[]` 내부 필드가 달라집니다.

**Response 200 OK 예시 (`boardType=CREW`):**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 12,
        "authorNickname": "야구팬1",
        "title": "잠실 직관 크루 모집",
        "content": "LG 응원하실 분 구합니다.",
        "boardType": "CREW",
        "status": "OPEN",
        "viewCount": 24,
        "createdAt": "2026-04-06T13:10:00",
        "supportTeamName": "LG",
        "maxParticipants": 4,
        "currentParticipants": 2,
        "stadium": "잠실야구장",
        "matchDate": "2026-04-10",
        "matchTime": "18:30",
        "seatArea": "1루 내야",
        "tags": ["직관", "응원", "LG"]
      }
    ],
    "page": 0,
    "size": 9,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
}
```

**Response 200 OK 예시 (`boardType=MATE`):**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 30,
        "authorNickname": "두산팬2",
        "title": "잠실 메이트 구해요",
        "content": "같이 보실 분!",
        "boardType": "MATE",
        "status": "OPEN",
        "viewCount": 8,
        "createdAt": "2026-04-06T11:00:00",
        "matchDate": "2026-04-11",
        "stadium": "잠실야구장",
        "homeTeamName": "두산",
        "awayTeamName": "LG",
        "authorTeam": "두산",
        "profileImage": "/uploads/profile1.png",
        "currentParticipants": 1,
        "maxParticipants": 2
      }
    ],
    "page": 0,
    "size": 9,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
}
```

**Response 200 OK 예시 (`boardType=TRANSFER`):**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 41,
        "authorNickname": "양도러",
        "title": "4/10 잠실 티켓 양도",
        "content": "정가 양도합니다.",
        "boardType": "TRANSFER",
        "status": "OPEN",
        "viewCount": 17,
        "createdAt": "2026-04-06T09:40:00",
        "matchDate": "2026-04-10",
        "homeTeamName": "LG",
        "awayTeamName": "두산",
        "seatArea": "블루석 104구역",
        "ticketPrice": 25000
      }
    ],
    "page": 0,
    "size": 9,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
}
```

**실패 케이스:**

- `400 Bad Request`: `boardType`, `status` enum 파싱 실패
- `404 Not Found (TEAM_001)`: `teamId`가 존재하지 않는 ID/shortName인 경우

---

### 4.4.2 팀 전용 게시글 목록 조회

```
GET /api/posts/team/{teamId}?page=0&size=10
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **설명**: `TEAM_ONLY` 게시판 글만 특정 팀 기준으로 페이지 조회합니다.
- **Path Variable:**
    - `teamId`: 팀 ID 또는 shortName
- **Pageable 기본값:** `size=10`

**응답 특성:**

- 응답 타입은 `PostResponse` 페이지 구조이지만, 현재 `PostMapper`는 `TEAM_ONLY`를 별도 매핑하지 않습니다.
- 따라서 실제 코드 기준으로는 `content[]` 요소가 `null`이 될 가능성이 있어 설계/구현 불일치 위험이 있습니다.
- 문서상으로는 `TEAM_ONLY`용 별도 응답 DTO 정비가 필요합니다.

**실패 케이스:**

- `404 Not Found (TEAM_001)`: 잘못된 팀 식별자

---

### 4.4.3 게시글 상세 조회

```
GET /api/posts/{id}
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **설명**: 게시글 상세 조회 시 조회수가 1 증가합니다.
- **응답 타입 규칙:**
- 게시글의 실제 `boardType`에 따라 `MateResponse`, `CrewResponse`, `TransferResponse` 중 하나가 반환됩니다.
- 즉, 목록 조회와 동일하게 게시글 유형에 따라 상세 응답 필드가 달라집니다.

**Response 200 OK 예시 (`CREW` 상세):**

```json
{
  "success": true,
  "data": {
    "id": 12,
    "authorNickname": "야구팬1",
    "title": "잠실 직관 크루 모집",
    "content": "LG 응원하실 분 구합니다.",
    "boardType": "CREW",
    "status": "OPEN",
    "viewCount": 25,
    "createdAt": "2026-04-06T13:10:00",
    "supportTeamName": "LG",
    "maxParticipants": 4,
    "currentParticipants": 2,
    "stadium": "잠실야구장",
    "matchDate": "2026-04-10",
    "matchTime": "18:30",
    "seatArea": "1루 내야",
    "tags": ["직관", "응원", "LG"]
  }
}
```

**실패 케이스:**

- `404 Not Found (POST_001)`

---

### 4.4.4 크루/메이트 참여 멤버 조회

```
GET /api/posts/{id}/members
GET /api/posts/{id}/mate/members

Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **설명**: `CREW` 또는 `MATE` 게시글의 참여자 목록을 조회합니다.
- **동작 규칙:**
- 두 엔드포인트 모두 내부적으로 동일 서비스(`getCrewMembers`)를 사용합니다.
- `boardType`이 `CREW` 또는 `MATE`가 아니면 실패합니다.
- 응답에는 승인 여부(`isApproved`)와 신청 메시지(`applyMessage`)가 포함됩니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": [
    {
      "memberId": 1,
      "nickname": "방장닉네임",
      "mannerTemperature": 36.5,
      "isLeader": true,
      "profileImage": "/uploads/profile-host.png",
      "applyMessage": null,
      "isApproved": true
    },
    {
      "memberId": 7,
      "nickname": "참여희망자",
      "mannerTemperature": 38.1,
      "isLeader": false,
      "profileImage": null,
      "applyMessage": "같이 응원하고 싶어요!",
      "isApproved": false
    }
  ]
}
```

**실패 케이스:**

- `404 Not Found (POST_001)`
- `400 Bad Request (POST_005)`: `CREW`, `MATE`가 아닌 게시글에 접근한 경우

---

### 4.4.5 크루 참여 신청

```
POST /api/posts/{id}/join
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: `CREW` 게시글 참여 신청
- **동작 규칙:**
- 게시글이 `OPEN` 상태여야 함
- 중복 참여 불가
- 승인 완료 인원 기준 `maxParticipants` 초과 시 불가
- 비공개 크루(`isPublic=false`)는 즉시 승인되지 않고 `isApproved=false` 상태로 대기
- 공개 크루는 즉시 승인

**Response 201 Created:**

- 바디 없음

**실패 케이스:**

- `404 Not Found (POST_001, MEM_001)`
- `400 Bad Request (POST_002)`: `OPEN` 상태 아님
- `400 Bad Request (POST_006)`: 모집 인원 초과
- `400 Bad Request (POST_007)`: 이미 참여 중

---

### 4.4.6 메이트 참여 신청

```
POST /api/posts/{id}/mate/join
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

**Request Body:**

```json
{
  "applyMessage": "같이 직관하고 싶어요!"
}
```

- **권한**: MEMBER
- **설명**: `MATE` 게시글 참여 신청
- **동작 규칙:**
- `joinCrew`와 달리 생성된 참여 정보를 응답 바디로 반환합니다.
- `applyMessage`는 최대 300자
- 현재 서비스 구현상 `MATE` 여부를 강하게 검증하지 않으므로 설계상 보완이 필요합니다.

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "memberId": 21,
    "nickname": "메이트신청자",
    "mannerTemperature": 37.2,
    "isLeader": false,
    "profileImage": "/uploads/profile21.png",
    "applyMessage": "같이 직관하고 싶어요!",
    "isApproved": true
  }
}
```

**실패 케이스:**

- `404 Not Found (POST_001, MEM_001)`
- `400 Bad Request (POST_002, POST_006, POST_007, SERVER_002)`

---

### 4.4.7 게시글 작성

```
POST /api/posts
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 다형성 요청 바디로 `MATE`, `CREW`, `TRANSFER` 게시글 작성
- **중요**: 현재 코드 기준으로 `TEAM_ONLY` 생성 요청은 지원하지 않습니다.

**Request Body 예시 (`MATE`)**

```json
{
  "boardType": "MATE",
  "title": "잠실 메이트 구해요",
  "content": "같이 볼 분 찾습니다.",
  "matchDate": "2026-04-10",
  "homeTeamId": "1",
  "awayTeamId": "2",
  "maxParticipants": 2,
  "stadium": "잠실야구장",
  "matchTime": "18:30"
}
```

**Request Body 예시 (`CREW`)**

```json
{
  "boardType": "CREW",
  "title": "LG 직관 크루 모집",
  "content": "응원 같이 하실 분!",
  "supportTeamId": "1",
  "maxParticipants": 4,
  "isPublic": false,
  "tags": ["직관", "응원", "LG"],
  "stadium": "잠실야구장",
  "matchDate": "2026-04-10",
  "matchTime": "18:30",
  "seatArea": "1루 내야"
}
```

**Request Body 예시 (`TRANSFER`)**

```json
{
  "boardType": "TRANSFER",
  "title": "4/10 잠실 티켓 양도",
  "content": "정가 양도합니다.",
  "matchDate": "2026-04-10",
  "homeTeamId": "1",
  "awayTeamId": "2",
  "seatArea": "블루석 104구역",
  "ticketPrice": 25000
}
```

**동작 규칙:**

- `MATE`: 작성자의 응원 팀이 있어야 하며, `supportTeam`은 작성자 팀으로 자동 설정됨
- `CREW`: 작성자가 참여자 목록에 방장(`isLeader=true`)으로 자동 추가됨
- `TRANSFER`: `ticketPrice < 0` 이면 실패
- `homeTeamId`, `awayTeamId`, `supportTeamId`는 숫자 ID 또는 shortName 모두 허용

**Response 201 Created:**

- 응답 객체도 게시글 타입에 따라 달라집니다.

**실패 케이스:**

- `404 Not Found (MEM_001)`
- `404 Not Found (TEAM_001)`
- `400 Bad Request (POST_004)`: 티켓 가격 정책 위반
- `400 Bad Request (SERVER_002)`: 요청 바디 검증 실패

---

### 4.4.8 게시글 수정

```
PUT /api/posts/{id}
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

**Request Body:**

```json
{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

- **권한**: MEMBER
- **설명**: 작성자 본인만 가능하며, `OPEN` 상태 게시글만 수정 가능합니다.
- **수정 가능 범위:** 제목, 내용만 수정

**Response 200 OK:**

- 게시글 타입에 맞는 `PostResponse` 반환

**실패 케이스:**

- `404 Not Found (POST_001)`
- `403 Forbidden (AUTH_002)`
- `400 Bad Request (POST_002)`
- `400 Bad Request (SERVER_002)`

---

### 4.4.9 게시글 삭제

```
DELETE /api/posts/{id}
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 작성자 본인만 삭제 가능하며, `OPEN` 상태 게시글만 삭제 가능합니다.

**Response 204 No Content**

**실패 케이스:**

- `404 Not Found (POST_001)`
- `403 Forbidden (AUTH_002)`
- `400 Bad Request (POST_002)`

---

### 4.4.10 비공개 크루 대기 멤버 승인

```
POST /api/posts/{postId}/members/{memberId}/approve
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 방장만 비공개 크루 대기 멤버를 승인할 수 있습니다.
- **동작 규칙:**
- 승인 가능한 인원 수를 다시 계산한 후 초과 시 실패

**Response 200 OK**

- 바디 없음

**실패 케이스:**

- `404 Not Found (POST_001, MEM_001)`
- `403 Forbidden (AUTH_002)`
- `400 Bad Request (POST_006)`

---

### 4.4.11 비공개 크루 대기 멤버 거절

```
DELETE /api/posts/{postId}/members/{memberId}/reject
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 방장만 특정 대기 멤버를 거절할 수 있으며, 대상 참여자는 목록에서 제거됩니다.

**Response 200 OK**

- 바디 없음

**실패 케이스:**

- `404 Not Found (POST_001, MEM_001)`
- `403 Forbidden (AUTH_002)`

---

### 4.4.12 참여 중인 게시글 나가기

```
DELETE /api/posts/{id}/leave
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 참여자가 스스로 게시글에서 나갑니다.
- **동작 규칙:**
- 방장은 나갈 수 없고, 글 삭제로 처리해야 함

**Response 200 OK**

- 바디 없음

**실패 케이스:**

- `404 Not Found (POST_001, MEM_001)`
- `400 Bad Request (POST_008)`: 방장 이탈 시도

---

### 4.4.13 참여자 강제 퇴장

```
DELETE /api/posts/{postId}/members/{memberId}/expel
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 방장이 특정 참여자를 강제 퇴장시킵니다.
- **동작 규칙:**
    - 방장 본인을 강퇴할 수는 없음

**Response 200 OK**

- 바디 없음

**실패 케이스:**

- `404 Not Found (POST_001, MEM_001)`
- `403 Forbidden (AUTH_002)`
- `400 Bad Request (COMMON_001)`: 방장 본인을 강퇴하려는 경우

---

### 4.5 티켓 게시글 API (TicketPost)

### 4.5.1 티켓 게시글 목록 조회

```
GET /api/tickets?matchDate=2026-04-10&stadium=잠실&homeTeam=LG&team=두산&status=SELLING&status=RESERVED&page=0&size=20&sort=createdAt,desc

GET /api/ticket-transfers?matchDate=2026-04-10&stadium=잠실&homeTeam=LG&team=두산&status=SELLING&status=RESERVED&page=0&size=20&sort=createdAt,desc
```

- **권한**: 공개
- **설명**: 티켓 양도 게시글 목록을 페이지 단위로 조회합니다.
- **중요**: `/api/tickets` 와 `/api/ticket-transfers` 는 동일한 컨트롤러 메서드에 매핑되며 동작이 완전히 같습니다.

**Query Parameters:**

- `matchDate` (optional, `yyyy-MM-dd`): 경기 날짜 정확 일치
- `stadium` (optional, string): 구장 부분 일치, 대소문자 무시
- `homeTeam` (optional, string): 홈팀 부분 일치, 대소문자 무시
- `team` (optional, string): 홈팀 또는 원정팀 부분 일치, 대소문자 무시
- `status` (optional, repeated): `SELLING`, `RESERVED`, `SOLD`
- `page`, `size`, `sort` (optional): Spring Pageable, 기본 `size=20`, 기본 정렬 `createdAt,DESC`

**필터 동작 규칙:**

- `status` 를 생략하면 서비스에서 기본값으로 `SELLING`, `RESERVED` 만 조회합니다.
- 따라서 기본 목록 조회에서는 판매 완료 상태 `SOLD` 가 제외됩니다.
- `homeTeam` 과 `team` 을 함께 보내면 OR 가 아니라 AND 로 함께 적용됩니다.
- `stadium`, `homeTeam`, `team` 은 모두 부분 일치 검색입니다.
- 정렬은 `Pageable` 로 받지만, 현재 Repository 구현은 결과 조회를 `createdAt DESC` 로 고정하고 있습니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 101,
        "title": "4/10 잠실 1루 내야 양도",
        "content": "정가 양도합니다.",
        "homeTeam": "LG",
        "awayTeam": "두산",
        "matchDate": "2026-04-10",
        "matchTime": "18:30:00",
        "stadium": "잠실야구장",
        "seatArea": "1루 내야",
        "seatBlock": "104",
        "seatRow": "12",
        "price": 25000,
        "status": "SELLING",
        "authorId": 1,
        "authorNickname": "풀카운트",
        "createdAt": "2026-04-06T14:20:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  },
  "timestamp": "2026-04-06T17:10:00"
}
```

**실패 케이스:**

- `400 Bad Request`: `matchDate` 형식 오류, `status` enum 파싱 실패, 잘못된 `page/size` 값

**Response 400 Bad Request 예시:**

```json
{
  "code": "SERVER_002",
  "message": "입력값이 올바르지 않습니다.",
  "timestamp": "2026-04-06T17:10:10"
}
```

---

### 4.5.2 티켓 게시글 상세 조회

```
GET /api/tickets/{id}
GET /api/ticket-transfers/{id}
```

- **권한**: 공개
- **설명**: 티켓 게시글 단건 상세를 조회합니다.
- **중요**: 두 경로는 동일하게 `ticketPostService.getTicket(id)` 를 호출합니다.

**Path Parameters:**

- `id` (required, Long): 티켓 게시글 ID

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": 101,
    "title": "4/10 잠실 1루 내야 양도",
    "content": "정가 양도합니다.",
    "homeTeam": "LG",
    "awayTeam": "두산",
    "matchDate": "2026-04-10",
    "matchTime": "18:30:00",
    "stadium": "잠실야구장",
    "seatArea": "1루 내야",
    "seatBlock": "104",
    "seatRow": "12",
    "price": 25000,
    "status": "SELLING",
    "authorId": 1,
    "authorNickname": "풀카운트",
    "createdAt": "2026-04-06T14:20:00"
  },
  "timestamp": "2026-04-06T17:11:00"
}
```

**실패 케이스:**

- `404 Not Found (TCK_001)`: 존재하지 않는 티켓 게시글 ID
- `400 Bad Request`: `id` 타입 변환 실패

**Response 404 Not Found 예시:**

```json
{
  "code": "TCK_001",
  "message": "존재하지 않는 티켓 양도 게시글입니다.",
  "timestamp": "2026-04-06T17:11:10"
}
```

---

### 4.5.3 티켓 게시글 작성

```
POST /api/tickets
Authorization: Bearer {JWT_ACCESS_TOKEN}
Content-Type: application/json
```

- **권한**: MEMBER
- **설명**: 일반 입력 스펙으로 티켓 게시글을 생성합니다.
- **인증 주체**: `@AuthenticationPrincipal Long memberId`

**Request Body:**

```json
{
  "title": "4/10 잠실 1루 내야 양도",
  "content": "정가 양도합니다.",
  "homeTeam": "LG",
  "awayTeam": "두산",
  "matchDate": "2026-04-10",
  "matchTime": "18:30:00",
  "stadium": "잠실야구장",
  "seatArea": "1루 내야",
  "seatBlock": "104",
  "seatRow": "12",
  "price": 25000
}
```

**요청값 검증 규칙:**

- `title`, `content`, `homeTeam`, `awayTeam`, `stadium`, `seatArea`: 필수, 공백 불가
- `matchDate`, `matchTime`: 필수
- `price`: 필수, `0` 이상
- `seatBlock`, `seatRow`: 선택
- 생성 시 `status` 는 요청으로 받지 않으며 엔티티 기본값 `SELLING` 으로 저장됩니다.

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": 101,
    "title": "4/10 잠실 1루 내야 양도",
    "content": "정가 양도합니다.",
    "homeTeam": "LG",
    "awayTeam": "두산",
    "matchDate": "2026-04-10",
    "matchTime": "18:30:00",
    "stadium": "잠실야구장",
    "seatArea": "1루 내야",
    "seatBlock": "104",
    "seatRow": "12",
    "price": 25000,
    "status": "SELLING",
    "authorId": 1,
    "authorNickname": "풀카운트",
    "createdAt": "2026-04-06T17:12:00"
  },
  "timestamp": "2026-04-06T17:12:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`: 액세스 토큰 없음 또는 인증 실패
- `404 Not Found (MEM_001)`: 인증된 사용자 ID에 해당하는 회원이 없음
- `400 Bad Request (SERVER_002)`: Bean Validation 실패, JSON 파싱 실패, 날짜/시간 형식 오류

**Response 400 Bad Request 예시:**

```json
{
  "code": "SERVER_002",
  "message": "price: 가격은 0 이상이어야 합니다.",
  "timestamp": "2026-04-06T17:12:20"
}
```

---

### 4.5.4 요청 스펙 기반 티켓 게시글 작성

```
POST /api/ticket-transfers
Authorization: Bearer {JWT_ACCESS_TOKEN}
Content-Type: application/json
```

- **권한**: MEMBER
- **설명**: 별도 요청 DTO 스펙으로 티켓 게시글을 생성합니다.
- **인증 주체**: `@AuthenticationPrincipal Long memberId`
- **차이점**: `title` 과 `content` 를 직접 완성해서 받지 않습니다.

**Request Body:**

```json
{
  "homeTeam": "LG",
  "awayTeam": "두산",
  "matchDate": "2026-04-10",
  "matchTime": "18:30:00",
  "stadium": "잠실야구장",
  "seatArea": "1루 내야",
  "seatBlock": "104",
  "seatRow": "12",
  "price": 25000,
  "description": "현장 전달 가능합니다."
}
```

**요청값 검증 규칙:**

- `homeTeam`, `awayTeam`, `stadium`, `seatArea`: 필수, 공백 불가
- `matchDate`, `matchTime`: 필수
- `price`: 필수, `0` 이상
- `seatBlock`, `seatRow`, `description`: 선택

**서버 내부 생성 규칙:**

- `title` 은 서버에서 `[{homeTeam} vs {awayTeam}] {stadium} {seatArea}` 형식으로 자동 생성합니다.
- `content` 는 `description` 값으로 저장합니다.
- `description` 이 `null` 이면 빈 문자열 `""` 로 저장합니다.
- 생성 직후 상태는 `SELLING` 입니다.

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": 102,
    "title": "[LG vs 두산] 잠실야구장 1루 내야",
    "content": "현장 전달 가능합니다.",
    "homeTeam": "LG",
    "awayTeam": "두산",
    "matchDate": "2026-04-10",
    "matchTime": "18:30:00",
    "stadium": "잠실야구장",
    "seatArea": "1루 내야",
    "seatBlock": "104",
    "seatRow": "12",
    "price": 25000,
    "status": "SELLING",
    "authorId": 1,
    "authorNickname": "풀카운트",
    "createdAt": "2026-04-06T17:13:00"
  },
  "timestamp": "2026-04-06T17:13:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`
- `404 Not Found (MEM_001)`
- `400 Bad Request (SERVER_002)`

**Response 400 Bad Request 예시:**

```json
{
  "code": "SERVER_002",
  "message": "homeTeam: 홈팀을 입력해주세요.",
  "timestamp": "2026-04-06T17:13:10"
}
```

---

### 4.5.5 티켓 상태 변경

```
PATCH /api/{id}/status
Authorization: Bearer {JWT_ACCESS_TOKEN}
Content-Type: application/json
```

- **권한**: MEMBER
- **설명**: 작성자 본인만 티켓 게시글 상태를 변경할 수 있습니다.
- **중요**: 현재 컨트롤러 매핑은 `/api/tickets/{id}/status` 가 아니라 루트 기준 `/api/{id}/status` 입니다.

**Path Parameters:**

- `id` (required, Long): 티켓 게시글 ID

**Request Body:**

```json
{
  "status": "RESERVED"
}
```

**요청값 규칙:**

- `status` 는 필수입니다.
- 허용 enum 값은 `SELLING`, `RESERVED`, `SOLD` 입니다.
- 서비스 계층에서 별도 상태 전이 검증은 하지 않으므로, 작성자는 세 상태 사이를 직접 변경할 수 있습니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": 101,
    "title": "4/10 잠실 1루 내야 양도",
    "content": "정가 양도합니다.",
    "homeTeam": "LG",
    "awayTeam": "두산",
    "matchDate": "2026-04-10",
    "matchTime": "18:30:00",
    "stadium": "잠실야구장",
    "seatArea": "1루 내야",
    "seatBlock": "104",
    "seatRow": "12",
    "price": 25000,
    "status": "RESERVED",
    "authorId": 1,
    "authorNickname": "풀카운트",
    "createdAt": "2026-04-06T17:12:00"
  },
  "timestamp": "2026-04-06T17:14:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`
- `404 Not Found (TCK_001)`
- `403 Forbidden (AUTH_002)`: 작성자 본인이 아님
- `400 Bad Request (SERVER_002)`: `status` 누락 또는 enum 파싱 실패

**Response 403 Forbidden 예시:**

```json
{
  "code": "AUTH_002",
  "message": "접근 권한이 없습니다.",
  "timestamp": "2026-04-06T17:14:10"
}
```

---

### 4.5.6 티켓 게시글 삭제

```
DELETE /api/{id}
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 작성자 본인만 티켓 게시글을 삭제할 수 있습니다.
- **중요**: 현재 컨트롤러 매핑은 `/api/tickets/{id}` 가 아니라 루트 기준 `/api/{id}` 입니다.
- **응답 래핑 주의**: 컨트롤러는 `204 No Content` 를 반환하지만, 전역 `ResponseBodyAdvice` 는 `null` 바디를 감싸지 않습니다. 따라서 실제 응답 바디는 비어 있다고 보는 것이 안전합니다.

**Path Parameters:**

- `id` (required, Long): 티켓 게시글 ID

**Response 204 No Content**

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`
- `404 Not Found (TCK_001)`
- `403 Forbidden (AUTH_002)`

**Response 404 Not Found 예시:**

```json
{
  "code": "TCK_001",
  "message": "존재하지 않는 티켓 양도 게시글입니다.",
  "timestamp": "2026-04-06T17:14:40"
}
```

---

### 4.6 양도 거래 API (Transfer)

### 4.6.1 게시글 기반 양도 요청

```
POST /api/transfers/{postId}/request
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: `Post(boardType=TRANSFER)` 기반 양도 거래를 생성합니다.
- **동작 규칙:**
    - 대상 게시글은 반드시 `TRANSFER` 타입이어야 합니다.
    - 게시글 작성자는 자신의 글에 양도 요청할 수 없습니다.
    - 이미 거래가 생성된 게시글에는 중복 요청할 수 없습니다.
    - 요청 성공 시 `Transfer`가 생성되고 게시글 상태는 `RESERVED`로 변경됩니다.
    - 해당 게시글 기준 1:1 채팅방이 없으면 새로 생성하고, 있으면 기존 채팅방을 재사용합니다.

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "transferId": 55,
    "chatRoomId": 301,
    "sellerId": 1,
    "buyerId": 7
  }
}
```

**실패 케이스:**

- `404 Not Found (POST_001)`: 게시글 없음
- `404 Not Found (MEM_001)`: 구매자 회원 없음
- `400 Bad Request (TRF_002)`: 게시글 타입이 `TRANSFER`가 아님
- `400 Bad Request (TRF_004)`: 자신의 게시글에 요청
- `409 Conflict (TRF_003)`: 이미 거래 존재
- `401 Unauthorized (AUTH_001)`: 인증 없음

**Response 409 Conflict 예시:**

```json
{
  "code": "TRF_003",
  "message": "이미 거래가 진행 중인 게시글입니다.",
  "timestamp": "2026-04-06T18:10:00"
}
```

---

### 4.6.2 에스크로 결제

```
POST /api/transfers/{transferId}/pay
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 구매자가 자신의 잔액에서 거래 금액을 차감해 에스크로 결제를 완료합니다.
- **동작 규칙:**
    - 현재 거래의 `buyer`만 호출할 수 있습니다.
    - 거래 상태가 `REQUESTED`일 때만 결제 가능합니다.
    - 결제 성공 시 구매자 잔액이 차감되고 거래 상태는 `PAYMENT_COMPLETED`로 변경됩니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "status": "PAYMENT_COMPLETED"
  }
}
```

**실패 케이스:**

- `404 Not Found (TRF_001)`: 거래 없음
- `404 Not Found (MEM_001)`: 구매자 회원 없음
- `403 Forbidden (AUTH_002)`: 거래의 buyer가 아닌 사용자가 요청
- `400 Bad Request (TRF_005)`: `REQUESTED` 상태가 아님
- `400 Bad Request (PAY_001)`: 잔액 부족

**Response 400 Bad Request 예시:**

```json
{
  "code": "PAY_001",
  "message": "잔액이 부족합니다.",
  "timestamp": "2026-04-06T18:11:00"
}
```

---

### 4.6.3 티켓 전달 완료

```
POST /api/transfers/{transferId}/ticket-sent
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 판매자가 티켓 전달 완료를 표시합니다.
- **동작 규칙:**
    - 판매자(`seller`)만 호출 가능
    - `PAYMENT_COMPLETED` 상태에서만 가능
    - 성공 시 상태는 `TICKET_SENT`로 변경

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "status": "TICKET_SENT"
  }
}
```

**실패 케이스:**

- `404 Not Found (TRF_001)`
- `403 Forbidden (AUTH_002)`
- `400 Bad Request (TRF_006)`: 결제 완료 전 전달 시도

---

### 4.6.4 인수 확정 및 정산

```
POST /api/transfers/{transferId}/confirm
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 구매자가 인수 확정하면 판매자에게 금액이 정산되고 거래가 완료됩니다.
- **동작 규칙:**
    - 구매자(`buyer`)만 호출 가능
    - `PAYMENT_COMPLETED` 또는 `TICKET_SENT` 상태에서만 가능
    - 판매자 잔액에 거래 금액을 충전합니다.
    - 거래 상태는 `COMPLETED`가 됩니다.
    - `post` 기반 거래는 게시글 상태를 `CLOSED`로 변경합니다.
    - `ticketPost` 기반 거래는 티켓 게시글 상태를 `SOLD`로 변경합니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "status": "COMPLETED"
  }
}
```

**실패 케이스:**

- `404 Not Found (TRF_001)`
- `403 Forbidden (AUTH_002)`
- `400 Bad Request (TRF_007)`: 인수 확정 불가능한 상태

---

### 4.6.5 거래 취소

```
POST /api/transfers/{transferId}/cancel
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 판매자 또는 구매자가 거래를 취소합니다.
- **동작 규칙:**
    - 판매자 또는 구매자만 취소 가능
    - `COMPLETED`, `CANCELLED` 상태에서는 취소 불가
    - `TICKET_SENT` 상태에서는 판매자가 취소할 수 없음
    - `PAYMENT_COMPLETED` 또는 `TICKET_SENT` 상태에서 취소되면 구매자에게 전액 환불
    - 취소를 실행한 사용자(`canceller`)의 매너 온도는 `0.1`
    - 상태는 `CANCELLED`가 됨
    - `post` 기반 거래는 게시글 상태를 `CLOSED`로 변경
    - `ticketPost` 기반 거래는 티켓 게시글 상태를 `SELLING`으로 복구

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "status": "CANCELLED"
  }
}
```

**실패 케이스:**

- `404 Not Found (TRF_001)`
- `403 Forbidden (AUTH_002)`: 거래 당사자 아님
- `400 Bad Request (TRF_002)`: 이미 종료된 거래 또는 판매자 취소 불가 상태

**Response 400 Bad Request 예시:**

```json
{
  "code": "TRF_002",
  "message": "현재 거래 상태에서 해당 작업을 수행할 수 없습니다.",
  "timestamp": "2026-04-06T18:12:00"
}
```

---

### 4.6.6 내 양도 내역 조회

```
GET /api/transfers/me?page=0&size=10
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 내가 구매자(`buyer`)인 거래의 게시글 목록을 페이지 조회합니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 41,
        "authorNickname": "양도자",
        "title": "4/10 잠실 티켓 양도",
        "content": "정가 양도합니다.",
        "boardType": "TRANSFER",
        "status": "RESERVED",
        "viewCount": 17,
        "createdAt": "2026-04-06T09:40:00",
        "matchDate": "2026-04-10",
        "homeTeamName": "LG",
        "awayTeamName": "두산",
        "seatArea": "블루석 104구역",
        "ticketPrice": 25000
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1,
    "last": true
  }
}
```

---

### 4.6.7 채팅방 기준 거래 정보 조회

```
GET /api/transfers/room/{roomId}
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 채팅방 ID 기준으로 연결된 거래 상세 정보를 조회합니다.
- **동작 규칙:**
    - 현재 구현은 `ticketPost` 기반 채팅방에 연결된 거래를 우선 대상으로 합니다.
    - 거래가 없거나 조회 중 예외가 발생하면 `200 OK`에 빈 바디를 반환합니다.
    - 표준 에러 응답을 주지 않는 현재 구현 특성이므로 프론트에서 null/empty 처리 필요

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": 55,
    "postId": 101,
    "postTitle": "[LG vs 두산] 잠실야구장 1루 내야",
    "sellerNickname": "야구팬1",
    "buyerNickname": "구매자7",
    "sellerId": 1,
    "buyerId": 7,
    "price": 25000,
    "status": "PAYMENT_COMPLETED",
    "createdAt": "2026-04-06T18:00:00",
    "updatedAt": "2026-04-06T18:05:00"
  }
}
```

**거래 없음 응답 예시:**

```json
{
  "success": true,
  "data": null
}
```

---

### 4.6.8 채팅방 기준 양도 요청

```
POST /api/transfers/room/{roomId}/request
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 티켓 게시글 기반 1:1 채팅방에서 양도 거래를 생성합니다.
- **동작 규칙:**
    - 채팅방에 `ticketPost`가 연결돼 있어야 함
    - 판매자는 티켓 게시글 작성자, 구매자는 현재 로그인 사용자
    - 자신의 게시글에는 요청할 수 없음
    - 동일 `ticketPost`에 대해 중복 거래 생성 불가
    - 성공 시 `Transfer`가 생성되고 티켓 게시글 상태는 `RESERVED`가 됩니다.

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "transferId": 88,
    "chatRoomId": 410,
    "sellerId": 1,
    "buyerId": 7
  }
}
```

**실패 케이스:**

- `404 Not Found (CHAT_001)`: 채팅방 없음
- `404 Not Found (TCK_001)`: 채팅방에 티켓 게시글 연결 없음
- `404 Not Found (MEM_001)`: 구매자 회원 없음
- `400 Bad Request (TRF_004)`: 자신의 게시글에 요청
- `409 Conflict (TRF_003)`: 이미 거래 존재

**Response 404 Not Found 예시:**

```json
{
  "code": "TCK_001",
  "message": "존재하지 않는 티켓 양도 게시글입니다.",
  "timestamp": "2026-04-06T18:13:00"
}
```

---

### 4.7 채팅 API (Chat)

### 4.7.1 WebSocket / STOMP 연결

- **프로토콜**: WebSocket + STOMP
- **Endpoint:**

```
/ws       (SockJS 지원, 프론트 기본용)
/ws-test  (테스트용)
```

- **Broker Prefix:**

```
발행: /app
구독: /topic
```

**STOMP CONNECT 예시:**

```
CONNECT
accept-version:1.2
host:localhost
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

**설명:**

- `Authorization: Bearer {JWT_ACCESS_TOKEN}` 헤더는 HTTP REST 요청 헤더가 아니라 STOMP `CONNECT` 프레임의 네이티브 헤더로 전달해야 합니다.
- `StompAuthInterceptor`가 CONNECT 시 JWT를 검증하고 세션에 `memberId`, `nickname`, `teamCode`를 저장합니다.
- `Authorization` 헤더가 없거나 형식이 잘못되면 연결 자체는 허용될 수 있으나, 비인증 세션으로 처리됩니다.
- 일반 채팅 `ChatController`는 세션의 인증정보를 직접 쓰지 않고, 메시지 payload의 `senderId`를 사용합니다.

---

### 4.7.2 채팅 메시지 발행

```
STOMP SEND /app/chat/{roomId}
content-type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}   // CONNECT 시 사용 권장
```

- **권한**: STOMP 연결 사용자
- **설명**: 특정 채팅방에 메시지를 발행하면 서버가 DB에 저장한 뒤 같은 채팅방 구독자에게 브로드캐스트합니다.
- **실제 처리 흐름:**
- 클라이언트 발행: `/app/chat/{roomId}`
- 서버 저장: `ChatService.saveMessage(roomId, payload)`
- 서버 브로드캐스트: `/topic/chat/{roomId}`

**Request Payload:**

```json
{
  "messageId": null,
  "senderId": 7,
  "senderNickname": "야구팬7",
  "content": "안녕하세요. 거래 가능할까요?",
  "timestamp": null,
  "type": "CHAT"
}
```

**필드 규칙:**

- `senderId` 필수
- `content` 필수, 공백만 보내면 불가
- `type`은 선택값이며, 미입력 시 서버에서 `CHAT`으로 저장
- `messageId`, `timestamp`는 요청 시 사실상 무의미하며 서버 저장 후 응답에서 채워집니다.
- `senderNickname`은 요청에 넣을 수는 있지만, 최종 브로드캐스트 payload는 DB 저장 결과 기준으로 다시 구성됩니다.

**Broadcast Channel:**

```
SUBSCRIBE /topic/chat/{roomId}
```

**Broadcast Payload 예시:**

```json
{
  "messageId": 155,
  "senderId": 7,
  "senderNickname": "야구팬7",
  "content": "안녕하세요. 거래 가능할까요?",
  "timestamp": "2026-04-06T18:45:12.345",
  "type": "CHAT"
}
```

**동작 규칙:**

- `roomId`에 해당하는 채팅방이 존재해야 합니다.
- `senderId`에 해당하는 회원이 존재해야 합니다.
- 현재 구현상 `senderId`가 실제 STOMP 연결 사용자와 일치하는지 추가 검증하지 않습니다.
- 즉, 보안 관점에서는 향후 세션의 `memberId`와 payload의 `senderId`를 비교하는 보완이 필요합니다.

**실패 케이스:**

- `404 Not Found (CHAT_001)`: 채팅방 없음
- `404 Not Found (MEM_001)`: 발신자 회원 없음
- `400 Bad Request (SERVER_002)`: payload 자체가 없거나 `senderId`/`content` 누락
- `400 Bad Request (CHAT_003)`에 가까운 의미지만 현재 구현은 `VALIDATION_ERROR`를 사용합니다.

**에러 응답 예시:**

```json
{
  "code": "SERVER_002",
  "message": "입력값이 올바르지 않습니다.",
  "timestamp": "2026-04-06T18:46:00"
}
```

---

### 4.7.3 메시지 구독

```
STOMP SUBSCRIBE /topic/chat/{roomId}
Authorization: Bearer {JWT_ACCESS_TOKEN}   // CONNECT 시 사용 권장
```

- **권한**: STOMP 연결 사용자
- **설명**: 특정 채팅방에 저장/발행된 메시지를 실시간으로 수신합니다.
- **주의사항:**
- 현재 `ChatController` 자체에는 구독 권한 체크 로직이 없습니다.
- 채팅방 참여 여부 검증은 REST 조회 API(`ChatRoomController`) 쪽에 주로 구현되어 있고, 실시간 발행은 `senderId` 기반 저장 흐름입니다.
- 따라서 클라이언트는 REST로 채팅방 접근 권한을 먼저 확인한 뒤 구독하는 방식이 안전합니다.

---

### 4.7.4 구현상 주의사항

- 이 섹션은 HTTP REST API가 아니라 WebSocket/STOMP 메시지 명세입니다.
- 따라서 `Content-Type: application/json`은 STOMP SEND 프레임의 payload 타입 의미로 사용됩니다.
- `Authorization: Bearer {JWT_ACCESS_TOKEN}`도 일반 HTTP 요청 헤더가 아니라 STOMP CONNECT 프레임 헤더로 보내는 것이 핵심입니다.
- `/ws`는 SockJS endpoint이고, 실제 메시지 송수신 경로는 `/app/...`, `/topic/...` 입니다.

---

### 4.8 채팅방 API (ChatRoom)

### 4.8.1 내 채팅방 목록 조회

```
GET /api/chat/rooms?page=0&size=10&sort=createdAt,desc
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 로그인 사용자가 참여 중인 채팅방 목록을 페이지 단위로 조회합니다.
- **Pageable 기본값:** `size=10`, `sort=createdAt,DESC`
- **포함 기준:**
- `ONE_ON_ONE`, `ONE_ON_ONE_DIRECT`: `initiator` 또는 `receiver`인 경우
- `GROUP_JOIN`, `GROUP_CREW`: `ChatRoomParticipant`에 포함된 경우
- 1:1 채팅은 `initiatorLeft`, `receiverLeft` 플래그가 true면 목록에서 제외됩니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "chatRoomId": 301,
        "type": "ONE_ON_ONE",
        "title": "4/10 잠실 티켓 양도",
        "lastMessage": "안녕하세요. 거래 가능할까요?",
        "lastMessageAt": "2026-04-06T19:10:00",
        "unreadCount": 2
      },
      {
        "chatRoomId": 302,
        "type": "GROUP_CREW",
        "title": "잠실 직관 크루 모집",
        "lastMessage": "입장했습니다.",
        "lastMessageAt": "2026-04-06T19:00:00",
        "unreadCount": 0
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 2,
    "totalPages": 1,
    "last": true
  }
}
```

---

### 4.8.2 그룹 채팅방 생성

```
POST /api/chat/rooms?postId=12&type=GROUP_CREW
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **Content-Type**: 없음. JSON body를 받지 않고 query parameter로 처리합니다.
- **설명**: 크루/메이트 모집 게시글 기준 그룹 채팅방을 생성하거나, 이미 있으면 기존 채팅방을 반환합니다.
- **Query Params:**
- `postId` (required): 게시글 ID
- `type` (required): `GROUP_CREW` 또는 `GROUP_JOIN`

**동작 규칙:**

- `type=GROUP_CREW`이면 게시글 참여자까지 함께 채팅방 참여자로 추가됩니다.
- 게시글 작성자는 항상 참여자에 포함됩니다.
- 같은 `postId`에 대해 기존 채팅방이 있으면 재사용합니다.
- 현재 구현은 방 생성 권한을 게시글 작성자에게만 제한하지 않습니다.

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "chatRoomId": 410,
    "type": "GROUP_CREW",
    "title": "잠실 직관 크루 모집",
    "lastMessage": null,
    "lastMessageAt": null,
    "unreadCount": 0
  }
}
```

**실패 케이스:**

- `404 Not Found (POST_001)`: 게시글 없음
- `400 Bad Request`: `type` enum 파싱 실패, `postId` 타입 오류

---

### 4.8.3 직접 DM 생성 또는 조회

```
POST /api/chat/rooms/dm/user/{targetUserId}
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **Content-Type**: 없음. JSON body 없이 path variable만 사용합니다.
- **설명**: 특정 사용자와의 1:1 직접 DM 채팅방을 생성하거나 기존 채팅방을 반환합니다.

**동작 규칙:**

- 자기 자신에게는 DM 방을 만들 수 없습니다.
- 기존에 같은 두 사용자 간 `ONE_ON_ONE_DIRECT` 채팅방이 있으면 새로 만들지 않고 기존 방을 반환합니다.
- 새로 생성되는 경우 `initiator`, `receiver`가 직접 세팅됩니다.

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "chatRoomId": 420,
    "type": "ONE_ON_ONE_DIRECT",
    "title": "야구팬1",
    "lastMessage": null,
    "lastMessageAt": null,
    "unreadCount": 0
  }
}
```

**실패 케이스:**

- `403 Forbidden (AUTH_002)`: 자기 자신과 DM 생성 시도
- `404 Not Found (MEM_001)`: 대상 회원 없음
- `400 Bad Request`: `targetUserId` 타입 오류

---

### 4.8.4 채팅방 상세 조회

```
GET /api/chat/rooms/{roomId}
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 채팅방 타입과 참여자 목록을 조회합니다.
- **동작 규칙:**
- 현재 로그인 사용자가 실제 참여자인지 검사합니다.
- `ONE_ON_ONE`, `ONE_ON_ONE_DIRECT`는 `initiator`, `receiver` 기준
- 그룹 채팅은 `ChatRoomParticipant` 기준

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "chatRoomId": 301,
    "type": "ONE_ON_ONE",
    "participants": [
      { "memberId": 1, "nickname": "양도자" },
      { "memberId": 7, "nickname": "구매자7" }
    ]
  }
}
```

**실패 케이스:**

- `404 Not Found (CHAT_001)`: 채팅방 없음
- `403 Forbidden (AUTH_002)`: 참여자가 아닌 사용자의 접근

---

### 4.8.5 채팅 메시지 내역 조회

```
GET /api/chat/rooms/{roomId}/messages?lastMessageId=150&size=20
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 커서 기반으로 특정 채팅방의 이전 메시지를 조회합니다.
- **Query Params:**
- `lastMessageId` (optional): 다음 페이지 기준 커서
- `size` (optional): 조회 개수, 기본 `20`

**동작 규칙:**

- 채팅방 존재 여부를 먼저 확인합니다.
- 현재 사용자가 해당 채팅방 참여자인지 검사합니다.
- 응답은 `CursorResponse` 구조이며, 마지막 메시지 ID가 `nextCursor`로 내려갑니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "messageId": 155,
        "senderId": 7,
        "senderNickname": "구매자7",
        "content": "안녕하세요. 거래 가능할까요?",
        "timestamp": "2026-04-06T19:10:00",
        "type": "CHAT"
      },
      {
        "messageId": 154,
        "senderId": 1,
        "senderNickname": "양도자",
        "content": "네 가능합니다.",
        "timestamp": "2026-04-06T19:09:00",
        "type": "CHAT"
      }
    ],
    "nextCursor": 154,
    "hasNext": true
  }
}
```

**실패 케이스:**

- `404 Not Found (CHAT_001)`
- `403 Forbidden (AUTH_002)`
- `400 Bad Request`: `lastMessageId`, `size` 타입 오류

---

### 4.8.6 채팅방 읽음 처리

```
POST /api/chat/rooms/{roomId}/read
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **Content-Type**: 없음. 요청 바디 없음
- **설명**: 채팅방의 마지막 메시지를 현재 사용자 기준 읽음 처리합니다.
- **동작 규칙:**
- 마지막 메시지가 없으면 아무 동작 없이 종료합니다.
- 기존 `ChatReadStatus`가 없으면 새로 생성합니다.
- 내부적으로 마지막 메시지 ID를 `lastReadMessageId`로 저장합니다.

**Response 200 OK**

- 바디 없음

**실패 케이스:**

- `404 Not Found (CHAT_001)`: 읽음 상태 생성 시 채팅방 없음
- `404 Not Found (MEM_001)`: 읽음 상태 생성 시 회원 없음

---

### 4.8.7 양도용 1:1 채팅방 생성 또는 조회

```
POST /api/chat/rooms/transfer/{postId}
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **Content-Type**: 없음. JSON body 없이 path variable만 사용합니다.
- **설명**: 티켓 게시글(`TicketPost`) 기준 1:1 채팅방을 생성하거나 기존 방을 반환합니다.
- **주의사항:**
- 경로 변수 이름은 `postId`지만 실제 서비스에서는 `ticketPostId`로 사용합니다.
- 즉, 일반 `Post` ID가 아니라 `TicketPost` ID를 넘겨야 합니다.

**동작 규칙:**

- 티켓 게시글 작성자는 자기 글로 채팅방을 생성할 수 없습니다.
- 기존에 같은 티켓 게시글 기준 채팅방이 있으면 재사용합니다.
- 새로 생성되면 `roomType=ONE_ON_ONE`입니다.

**Response 201 Created:**

```json
{
  "success": true,
  "data": {
    "chatRoomId": 430,
    "type": "ONE_ON_ONE",
    "title": "[LG vs 두산] 잠실야구장 1루 내야",
    "lastMessage": null,
    "lastMessageAt": null,
    "unreadCount": 0
  }
}
```

**실패 케이스:**

- `404 Not Found (TCK_001)`: 티켓 게시글 없음
- `404 Not Found (MEM_001)`: 로그인 회원 없음
- `403 Forbidden (AUTH_002)`: 자기 티켓 게시글에 채팅 생성 시도

---

### 4.8.8 채팅방 나가기

```
DELETE /api/chat/rooms/{roomId}/leave
Content-Type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 채팅방 타입에 따라 서로 다른 방식으로 나가기 처리합니다.

**동작 규칙:**

- `ONE_ON_ONE`:
    - 연결된 거래가 `COMPLETED` 또는 `CANCELLED`일 때만 나갈 수 있습니다.
    - 그 외 진행 중 거래에서는 `CHAT_004` 예외 발생
    - 내부적으로 `initiatorLeft` 또는 `receiverLeft` 플래그 처리
- `ONE_ON_ONE_DIRECT`:
    - 바로 나가기 가능
    - 내부적으로 left 플래그 처리
- `GROUP_JOIN`, `GROUP_CREW`:
    - `ChatRoomParticipant` 목록에서 본인을 제거

**Response 204 No Content**

**실패 케이스:**

- `404 Not Found (CHAT_001)`
- `400 Bad Request (CHAT_004)`: 거래 진행 중에는 1:1 채팅방 나가기 불가

**Response 400 Bad Request 예시:**

```json
{
  "code": "CHAT_004",
  "message": "거래 진행 중에는 채팅방을 나갈 수 없습니다.",
  "timestamp": "2026-04-06T19:20:00"
}
```

---

### 4.9 라이브 응원 API (LiveCheer)

### 4.9.1 WebSocket / STOMP 연결

- **프로토콜**: WebSocket + STOMP
- **Endpoint:**

```
/ws       (SockJS 지원, 프론트 기본 연결용)
/ws-test  (테스트용)
```

- **Broker Prefix:**

```
발행: /app
구독: /topic
```

**STOMP CONNECT 예시:**

```
CONNECT
accept-version:1.2
host:localhost
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

**설명:**

- `Authorization: Bearer {JWT_ACCESS_TOKEN}` 은 HTTP REST 헤더가 아니라 STOMP `CONNECT` 프레임의 네이티브 헤더로 전달합니다.
- `StompAuthInterceptor` 가 CONNECT 시 JWT를 검증하고 세션에 `memberId`, `nickname`, `teamCode` 를 저장합니다.
- `Authorization` 헤더가 없거나 형식이 잘못되면 연결 자체는 허용될 수 있지만, 라이브 응원 메시지는 인증되지 않은 사용자로 처리됩니다.
- `teamCode` 는 회원의 `Team.shortName` 이며, 선호 팀이 없으면 빈 문자열이 들어갑니다.

---

### 4.9.2 라이브 응원 메시지 발행

```
STOMP SEND /app/live-cheer/{gameId}
content-type: application/json
Authorization: Bearer {JWT_ACCESS_TOKEN}   // CONNECT 시 사용
```

- **권한**: 인증된 STOMP 세션 권장
- **설명**: 특정 경기의 라이브 응원 채널에 채팅 또는 리액션 메시지를 발행합니다.
- **실제 브로드캐스트 채널**: `SUBSCRIBE /topic/live-cheer/{gameId}`

**Path Parameters:**

- `gameId` (required, string): 경기 식별자
- 예시: `20260403_LG_SSG`

**Request Payload:**

```json
{
  "type": "CHAT",
  "content": "이거 넘어간다!",
  "reactionId": null
}
```

**필드 규칙:**

- `type`: 별도 enum 검증은 없지만 DTO 주석 기준 `CHAT` 또는 `REACTION` 사용
- `content`: `type=CHAT` 일 때 사용하는 메시지 내용
- `reactionId`: `type=REACTION` 일 때 사용하는 리액션 ID
- 현재 컨트롤러는 Bean Validation 을 사용하지 않으므로 필수값 누락 시에도 서버가 예외를 내기보다 그대로 처리할 수 있습니다.

**서버 처리 규칙:**

- 인증 세션에 `nickname` 이 없으면 메시지를 무시하고 브로드캐스트하지 않습니다.
- `type=CHAT` 이고 `content` 가 존재하면 차단어 목록을 `**` 로 치환합니다.
- 현재 차단어 목록은 컨트롤러 내부 상수로 관리됩니다.
- 응답 payload 의 `senderNickname`, `teamCode`, `timestamp` 는 서버가 채웁니다.
- `timestamp` 형식은 `HH:mm:ss` 입니다.

**Broadcast Payload 예시:**

```json
{
  "type": "CHAT",
  "content": "이거 넘어간다!",
  "reactionId": null,
  "senderNickname": "풀카운트",
  "teamCode": "LG",
  "timestamp": "16:21:30"
}
```

---

### 4.9.3 리액션 메시지 발행

```
STOMP SEND /app/live-cheer/{gameId}
content-type: application/json
```

- **설명**: 텍스트 채팅이 아니라 리액션 이벤트를 전송합니다.
- **구독 채널**: `SUBSCRIBE /topic/live-cheer/{gameId}`

**Request Payload:**

```json
{
  "type": "REACTION",
  "content": null,
  "reactionId": "homerun"
}
```

**Broadcast Payload 예시:**

```json
{
  "type": "REACTION",
  "content": null,
  "reactionId": "homerun",
  "senderNickname": "풀카운트",
  "teamCode": "LG",
  "timestamp": "16:22:05"
}
```

**동작 규칙:**

- `reactionId` 는 서버에서 별도 화이트리스트 검증을 하지 않습니다.
- 클라이언트는 허용 리액션 ID 집합을 자체적으로 관리하는 편이 안전합니다.
- `type=REACTION` 이면 금칙어 치환 로직은 적용되지 않습니다.

---

### 4.9.4 구현상 주의사항

- 이 섹션은 HTTP REST API가 아니라 WebSocket/STOMP 메시징 명세입니다.
- `Content-Type: application/json` 은 STOMP SEND payload 기준입니다.
- `Authorization: Bearer {JWT_ACCESS_TOKEN}` 도 일반 REST 요청 헤더가 아니라 STOMP CONNECT 프레임 헤더로 보내야 합니다.
- 인증되지 않은 사용자의 메시지는 현재 구현에서 에러 응답 없이 조용히 무시됩니다.
- `CheerMessageResponse` DTO 는 `SYSTEM` 타입도 표현할 수 있지만, 현재 `LiveCheerController` 는 `SYSTEM` 메시지를 직접 발행하지 않습니다.
- 별도 DB 저장 로직이 없으므로 라이브 응원 메시지는 휘발성 브로드캐스트로 동작합니다.

---

### 4.10 회원 API (Member)

### 4.10.1 내 정보 조회

```
GET /api/members/me
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 로그인한 회원의 프로필, 응원팀, 알림 설정, 잔액 정보를 조회합니다.
- **인증 주체**: `@AuthenticationPrincipal Long memberId`

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "풀카운트",
    "teamName": "LG 트윈스",
    "teamShortName": "LG",
    "badgeLevel": "ROOKIE",
    "mannerTemperature": 36.5,
    "role": "USER",
    "profileImageUrl": "<https://cdn.fullcount.com/profiles/1.png>",
    "chatAlert": true,
    "transferAlert": true,
    "mannerAlert": true,
    "balance": 25000
  },
  "timestamp": "2026-04-06T19:30:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`: 액세스 토큰 없음 또는 인증 실패
- `404 Not Found (MEM_001)`: 인증된 사용자 ID에 해당하는 회원이 없음

**Response 404 Not Found 예시:**

```json
{
  "code": "MEM_001",
  "message": "존재하지 않는 회원입니다.",
  "timestamp": "2026-04-06T19:30:10"
}
```

---

### 4.10.2 닉네임 변경

```
PUT /api/members/me
Authorization: Bearer {JWT_ACCESS_TOKEN}
Content-Type: application/json
```

- **권한**: MEMBER
- **설명**: 로그인한 회원의 닉네임을 변경합니다.

**Request Body:**

```json
{
  "nickname": "새닉네임"
}
```

**요청값 검증 규칙:**

- `nickname`: 필수, 공백 불가
- 길이: 2자 이상 10자 이하
- 허용 문자: 한글, 영문, 숫자만 허용
- 현재 닉네임과 동일하면 중복 검사 없이 그대로 반환됩니다.
- 다른 닉네임으로 변경하는 경우에만 `existsByNickname` 중복 검사를 수행합니다.

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "nickname": "새닉네임"
  },
  "timestamp": "2026-04-06T19:31:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`
- `404 Not Found (MEM_001)`
- `409 Conflict (MEM_003)`: 이미 사용 중인 닉네임
- `400 Bad Request (SERVER_002)`: 길이 초과, 정규식 불일치, 빈 문자열

**Response 400 Bad Request 예시:**

```json
{
  "code": "SERVER_002",
  "message": "nickname: 닉네임은 2자 이상 10자 이하로 입력해주세요.",
  "timestamp": "2026-04-06T19:31:10"
}
```

---

### 4.10.3 응원 팀 변경

```
PUT /api/members/me/team
Authorization: Bearer {JWT_ACCESS_TOKEN}
Content-Type: application/json
```

- **권한**: MEMBER
- **설명**: 로그인한 회원의 응원 팀을 변경합니다.

**Request Body:**

```json
{
  "teamId": "3"
}
```

**요청값 검증 규칙:**

- `teamId`: 필수, 공백 불가
- DTO 검증상 숫자 문자열만 허용됩니다.
- 서비스 내부 `findTeam()` 은 원래 숫자 ID 또는 `shortName` 둘 다 처리할 수 있게 작성되어 있지만, 현재 DTO의 정규식 때문에 실제 API 요청으로는 숫자 ID만 통과합니다.

**도메인 규칙:**

- 한 시즌에 한 번만 팀 변경이 가능합니다.
- 현재 팀과 같은 팀으로는 변경할 수 없습니다.
- 성공 시 회원의 `teamChangedThisSeason=true` 로 변경됩니다.

**Response 200 OK:**

```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "timestamp": "2026-04-06T19:32:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`
- `404 Not Found (MEM_001)`
- `404 Not Found (TEAM_001)`: 존재하지 않는 팀 ID
- `400 Bad Request (MEM_004)`: 이번 시즌 팀 변경 횟수 초과
- `400 Bad Request (MEM_005)`: 현재와 동일한 팀으로 변경 시도
- `400 Bad Request (SERVER_002)`: `teamId` 형식 검증 실패

**Response 400 Bad Request 예시:**

```json
{
  "code": "MEM_004",
  "message": "이번 시즌 팀 변경 횟수를 초과했습니다.",
  "timestamp": "2026-04-06T19:32:10"
}
```

---

### 4.10.4 프로필 이미지 변경

```
PUT /api/members/me/profile-image
Authorization: Bearer {JWT_ACCESS_TOKEN}
Content-Type: application/json
```

- **권한**: MEMBER
- **설명**: 프로필 이미지 URL을 변경합니다.

**Request Body:**

```json
{
  "profileImageUrl": "<https://cdn.fullcount.com/profiles/new-image.png>"
}
```

**요청값 규칙:**

- 현재 DTO에는 `@NotBlank`, URL 형식 검증이 없습니다.
- 따라서 `null`, 빈 문자열, 임의 문자열도 그대로 저장될 수 있습니다.

**Response 200 OK:**

```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "timestamp": "2026-04-06T19:33:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`
- `404 Not Found (MEM_001)`

---

### 4.10.5 비밀번호 변경

```
PUT /api/members/me/password
Authorization: Bearer {JWT_ACCESS_TOKEN}
Content-Type: application/json
```

- **권한**: MEMBER
- **설명**: 현재 비밀번호를 검증한 뒤 새 비밀번호로 변경합니다.

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**요청값 검증 규칙:**

- `currentPassword`: 필수, 공백 불가
- `newPassword`: 필수, 8자 이상 20자 이하
- `newPassword` 는 영문, 숫자, 특수문자 `!@#$%^&*` 를 모두 포함해야 합니다.
- 새 비밀번호와 기존 비밀번호의 동일 여부는 별도로 막지 않습니다.

**Response 200 OK:**

```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "timestamp": "2026-04-06T19:34:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`
- `404 Not Found (MEM_001)`
- `400 Bad Request (MEM_006)`: 현재 비밀번호 불일치
- `400 Bad Request (SERVER_002)`: 새 비밀번호 형식 불일치 또는 필수값 누락

**Response 400 Bad Request 예시:**

```json
{
  "code": "MEM_006",
  "message": "현재 비밀번호가 일치하지 않습니다.",
  "timestamp": "2026-04-06T19:34:10"
}
```

---

### 4.10.6 알림 설정 변경

```
PUT /api/members/me/alerts
Authorization: Bearer {JWT_ACCESS_TOKEN}
Content-Type: application/json
```

- **권한**: MEMBER
- **설명**: 채팅, 양도 거래, 매너 관련 알림 설정을 한 번에 변경합니다.

**Request Body:**

```json
{
  "chatAlert": true,
  "transferAlert": false,
  "mannerAlert": true
}
```

**요청값 검증 규칙:**

- `chatAlert`, `transferAlert`, `mannerAlert`: 모두 필수
- 하나라도 `null` 이면 Bean Validation 실패로 처리됩니다.

**Response 200 OK:**

```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "timestamp": "2026-04-06T19:35:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`
- `404 Not Found (MEM_001)`
- `400 Bad Request (SERVER_002)`: 필수 Boolean 값 누락

**Response 400 Bad Request 예시:**

```json
{
  "code": "SERVER_002",
  "message": "chatAlert: 채팅 알림 설정값은 필수 입력값입니다.",
  "timestamp": "2026-04-06T19:35:10"
}
```

---

### 4.10.7 잔액 충전

```
PUT /api/members/me/charge
Authorization: Bearer {JWT_ACCESS_TOKEN}
Content-Type: application/json
```

- **권한**: MEMBER
- **설명**: 회원 잔액을 충전합니다.
- **중요**: 요청값은 최종 잔액이 아니라 충전할 금액입니다. 서비스는 `member.charge(req.getBalance())` 를 호출하여 기존 잔액에 더합니다.

**Request Body:**

```json
{
  "balance": 10000
}
```

**요청값 검증 규칙:**

- `balance`: 필수
- `0` 이상
- `1,000,000,000` 이하

**Response 200 OK:**

```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다.",
  "timestamp": "2026-04-06T19:36:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`
- `404 Not Found (MEM_001)`
- `400 Bad Request (SERVER_002)`: 음수 입력, 최대치 초과, 필수값 누락

**Response 400 Bad Request 예시:**

```json
{
  "code": "SERVER_002",
  "message": "balance: 잔액은 0 이상이어야 합니다.",
  "timestamp": "2026-04-06T19:36:10"
}
```

---

### 4.11 직관 다이어리 API (Attendance)

### 4.11.1 직관 기록 등록

```
POST /api/attendances
Authorization: Bearer {JWT_ACCESS_TOKEN}
Content-Type: multipart/form-data
```

- **권한**: MEMBER
- **설명**: 직관 날짜, 경기 결과, 사진, 메모를 포함한 출석 기록을 등록합니다.
- **중요**: JSON `@RequestBody` 가 아니라 `@ModelAttribute` 기반 `multipart/form-data` 요청입니다.

**Form Data Parameters:**

- `date` (optional, `yyyy-MM-dd`): 직관 날짜
- `result` (optional, enum): `WIN`, `LOSE`, `DRAW`, `CANCEL`
- `image` (optional, file): 업로드 이미지 파일
- `memo` (optional, string): 메모

**파일 처리 규칙:**

- 이미지가 없으면 `imageUrl=null` 로 저장됩니다.
- 이미지가 있으면 서버가 `{UUID}_{원본파일명}` 형식으로 파일명을 생성합니다.
- 실제 저장 경로는 `file.upload-dir` 설정값 기준입니다.
- 응답에는 서버 접근용 경로로 `/uploads/{파일명}` 이 내려갑니다.

**Request Example:**

```
POST /api/attendances
Authorization: Bearer {JWT_ACCESS_TOKEN}
Content-Type: multipart/form-data

- date: 2026-04-05
- result: WIN
- image: [binary file]
- memo: 9회 끝내기 승리 직관
```

**Response 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": 15,
    "date": "2026-04-05",
    "result": "WIN",
    "imageUrl": "/uploads/550e8400-e29b-41d4-a716-446655440000_ticket.jpg",
    "memo": "9회 끝내기 승리 직관"
  },
  "timestamp": "2026-04-06T20:10:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`: 액세스 토큰 없음 또는 인증 실패
- `400 Bad Request`: `date` 형식 오류, `result` enum 파싱 실패, multipart 형식 오류
- `500 Internal Server Error (SERVER_001)`: 회원 조회 실패, 파일 저장 실패

**구현상 주의사항:**

- 현재 `CreateRequest` 에 Bean Validation 이 없어 `date`, `result`, `memo` 는 필수 검증이 없습니다.
- 회원을 찾지 못하는 경우 `BusinessException` 이 아니라 `RuntimeException` 을 던지므로 현재 구현 기준 응답은 `404` 가 아니라 `500` 으로 처리됩니다.
- 파일 저장 중 `IOException` 이 발생해도 현재 구현 기준 `500` 으로 처리됩니다.

**Response 500 Internal Server Error 예시:**

```json
{
  "code": "SERVER_001",
  "message": "서버 내부 오류가 발생했습니다.",
  "timestamp": "2026-04-06T20:10:10"
}
```

---

### 4.11.2 내 직관 기록 전체 조회

```
GET /api/attendances
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 로그인한 회원의 직관 기록 전체를 최신 날짜 순으로 조회합니다.
- **정렬 규칙**: `matchDate DESC`
- **응답 형태**: 페이지네이션 없이 배열 전체 반환

**Response 200 OK:**

```json
{
  "success": true,
  "data": [
    {
      "id": 15,
      "date": "2026-04-05",
      "result": "WIN",
      "imageUrl": "/uploads/550e8400-e29b-41d4-a716-446655440000_ticket.jpg",
      "memo": "9회 끝내기 승리 직관"
    },
    {
      "id": 11,
      "date": "2026-03-22",
      "result": "LOSE",
      "imageUrl": null,
      "memo": "개막 시리즈 2차전"
    }
  ],
  "timestamp": "2026-04-06T20:11:00"
}
```

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`

**구현상 주의사항:**

- 현재 서비스는 회원 존재 여부를 별도로 검증하지 않고 `memberId` 기준 조회만 수행합니다.
- 따라서 존재하지 않는 회원 ID가 들어와도 빈 배열 `[]` 로 응답할 수 있습니다.

---

### 4.11.3 직관 기록 삭제

```
DELETE /api/attendances/{id}
Authorization: Bearer {JWT_ACCESS_TOKEN}
```

- **권한**: MEMBER
- **설명**: 직관 기록과 연결된 업로드 이미지를 삭제합니다.

**Path Parameters:**

- `id` (required, Long): 직관 기록 ID

**동작 규칙:**

- 기록에 `imageUrl` 이 있으면 `/uploads/` prefix 를 제거한 뒤 물리 파일 삭제를 시도합니다.
- 이후 DB 레코드를 삭제합니다.
- 파일이 존재하지 않아도 DB 삭제는 계속 진행합니다.

**Response 204 No Content**

**실패 케이스:**

- `401 Unauthorized (AUTH_001)`
- `400 Bad Request`: `id` 타입 변환 실패
- `500 Internal Server Error (SERVER_001)`: 존재하지 않는 기록 삭제 시도 등 런타임 예외

**구현상 주의사항:**

- 현재 `memberId` 를 받지만 작성자 본인 검증을 하지 않습니다.
- 즉 현재 구현상 로그인 사용자와 무관하게 다른 사용자의 출석 기록도 ID만 알면 삭제될 수 있습니다.
- 존재하지 않는 기록 ID는 `BusinessException` 이 아니라 `RuntimeException` 으로 처리되어 현재는 `404` 가 아니라 `500` 응답이 내려갑니다.

**Response 500 Internal Server Error 예시:**

```json
{
  "code": "SERVER_001",
  "message": "서버 내부 오류가 발생했습니다.",
  "timestamp": "2026-04-06T20:12:00"
}
```

---

### 4.12 관리자 웹 API (Admin)

- **중요**: 이 섹션의 `/admin/**` 는 JSON REST API가 아니라 서버 렌더링 기반 관리자 웹 엔드포인트입니다.
- **인증 방식**: `Authorization: Bearer` 가 아니라 Spring Security 로그인 세션을 사용합니다.
- **권한 조건**: `ROLE_ADMIN`
- **응답 형태**: HTML View 반환 또는 `redirect:/admin/...` 리다이렉트
- **폼 요청 주의**: 웹 체인에서는 CSRF가 활성화되어 있으므로 실제 POST 폼 제출 시 CSRF 토큰이 필요합니다.

### 4.12.1 관리자 대시보드

```
GET /admin/dashboard
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 관리자 메인 대시보드를 조회합니다.
- **View Name**: `admin/dashboard`

**모델 데이터:**

- `summary`: 대시보드 요약 통계
- `recentMembers`: 최근 가입 회원 3건
- `recentPosts`: 최근 게시글 3건
- `recentTransfers`: 최근 거래 3건

**summary 필드:**

- `memberCount`, `activeMemberCount`, `inactiveMemberCount`, `adminCount`
- `postCount`, `openPostCount`, `reservedPostCount`, `closedPostCount`
- `transferCount`, `pendingTransferCount`, `completedTransferCount`, `cancelledTransferCount`

**동작 규칙:**

- 거래 대기 건수는 `REQUESTED`, `PAYMENT_COMPLETED`, `TICKET_SENT` 상태의 합입니다.
- 로그인 성공 후 기본 이동 경로도 `/admin/dashboard` 입니다.

**Response 200 OK:**

- HTML 렌더링

**실패 케이스:**

- `302 Redirect /login`: 비로그인 사용자
- `403 Forbidden`: 관리자 권한 없음

---

### 4.12.2 회원 관리 화면

```
GET /admin/members?keyword=lg&active=true&role=USER&page=0&size=20
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 회원 목록을 검색/필터링하여 조회합니다.
- **View Name**: `admin/members`

**Query Parameters:**

- `keyword` (optional): 이메일 또는 닉네임 검색어
- `active` (optional, boolean): 활성 여부
- `role` (optional, enum): `USER`, `ADMIN`
- `page`, `size`, `sort` (optional): 기본 `size=20`, `sort=createdAt,DESC`

**필터 동작 규칙:**

- 검색어는 trim 후 사용하며, 공백 문자열은 `null` 로 처리됩니다.
- 검색 대상은 `email`, `nickname` 입니다.
- 필터 폼 검증 실패 시 예외를 내지 않고 빈 페이지를 모델에 담아 렌더링합니다.
- `keyword` 최대 길이는 50자입니다.

**모델 데이터:**

- `members`: `Page<Member>`
- `keyword`, `active`, `role`
- `roles`: `MemberRole.values()`
- `returnUrl`: 현재 필터/페이지 정보를 유지한 복귀 URL

**Response 200 OK:**

- HTML 렌더링

**실패 케이스:**

- `302 Redirect /login`
- `403 Forbidden`
- 검증 실패 시: 빈 목록 화면 렌더링, 글로벌 에러 응답 없음

---

### 4.12.3 게시글 관리 화면

```
GET /admin/posts?keyword=양도&boardType=TRANSFER&status=OPEN&page=0&size=20
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 게시글 목록을 검색/필터링하여 조회합니다.
- **View Name**: `admin/posts`

**Query Parameters:**

- `keyword` (optional): 제목, 내용, 작성자 닉네임 검색어
- `boardType` (optional, enum): `MATE`, `CREW`, `TRANSFER`, `TEAM_ONLY`
- `status` (optional, enum): `OPEN`, `RESERVED`, `CLOSED`
- `page`, `size`, `sort` (optional): 기본 `size=20`, `sort=createdAt,DESC`

**필터 동작 규칙:**

- 검색어는 trim 후 사용합니다.
- 필터 폼 검증 실패 시 빈 페이지를 렌더링합니다.
- 관리자 목록 조회는 ID 페이지 조회 후 연관 엔티티를 fetch 하여 원래 페이지 순서를 복원합니다.

**모델 데이터:**

- `posts`: `Page<Post>`
- `keyword`, `boardType`, `status`
- `boardTypes`: `BoardType.values()`
- `postStatuses`: `PostStatus.values()`
- `returnUrl`

**Response 200 OK:**

- HTML 렌더링

**실패 케이스:**

- `302 Redirect /login`
- `403 Forbidden`

---

### 4.12.4 거래 관리 화면

```
GET /admin/transfers?keyword=풀카운트&status=PAYMENT_COMPLETED&page=0&size=20
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 거래 목록을 검색/필터링하여 조회합니다.
- **View Name**: `admin/transfers`

**Query Parameters:**

- `keyword` (optional): 게시글 제목, 판매자 닉네임, 구매자 닉네임 검색어
- `status` (optional, enum): `REQUESTED`, `PAYMENT_COMPLETED`, `TICKET_SENT`, `COMPLETED`, `CANCELLED`
- `page`, `size`, `sort` (optional): 기본 `size=20`, `sort=createdAt,DESC`

**필터 동작 규칙:**

- 필터 폼 검증 실패 시 빈 페이지를 렌더링합니다.
- 검색어는 trim 후 사용합니다.
- 구매자가 없는 거래도 존재할 수 있으므로 구매자 조건은 `LEFT JOIN` 기반입니다.

**모델 데이터:**

- `transfers`: `Page<Transfer>`
- `keyword`, `status`
- `transferStatuses`: `TransferStatus.values()`
- `returnUrl`

**Response 200 OK:**

- HTML 렌더링

**실패 케이스:**

- `302 Redirect /login`
- `403 Forbidden`

---

### 4.12.5 회원 비활성화

```
POST /admin/members/{memberId}/deactivate
Content-Type: application/x-www-form-urlencoded
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 특정 회원 계정을 비활성화합니다.
- **응답 방식**: 처리 후 `returnUrl` 또는 `/admin/dashboard` 로 리다이렉트

**Form Parameters:**

- `returnUrl` (optional): 작업 후 복귀할 관리자 페이지 경로

**동작 규칙:**

- 관리자는 자기 자신의 계정을 비활성화할 수 없습니다.
- 실패 시 `RedirectAttributes.error`, 성공 시 `RedirectAttributes.message` 에 플래시 메시지를 담습니다.

**실패 케이스:**

- `403` 성격의 비즈니스 오류: 자기 자신 비활성화 시도
- 비로그인/권한 없음: Spring Security 차단

---

### 4.12.6 회원 활성화

```
POST /admin/members/{memberId}/activate
Content-Type: application/x-www-form-urlencoded
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 특정 회원 계정을 다시 활성화합니다.
- **응답 방식**: 리다이렉트 + 플래시 메시지

**실패 케이스:**

- `404` 성격의 비즈니스 오류: 회원 없음
- 비로그인/권한 없음

---

### 4.12.7 회원 권한 변경

```
POST /admin/members/{memberId}/role
Content-Type: application/x-www-form-urlencoded
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 특정 회원의 권한을 변경합니다.

**Form Parameters:**

- `role` (required, enum): `USER`, `ADMIN`
- `returnUrl` (optional)

**동작 규칙:**

- 관리자는 자기 자신의 권한을 변경할 수 없습니다.
- 성공 시 회원의 `role` 이 즉시 변경됩니다.

**실패 케이스:**

- 자기 자신 권한 변경 시도: 비즈니스 오류
- `role` 파라미터 enum 변환 실패: 요청 바인딩 오류

---

### 4.12.8 회원 삭제

```
POST /admin/members/{memberId}/delete
Content-Type: application/x-www-form-urlencoded
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 관련 데이터가 없는 회원만 삭제합니다.

**동작 규칙:**

- 관리자는 자기 자신을 삭제할 수 없습니다.
- 아래 데이터가 하나라도 있으면 삭제할 수 없습니다.
- 게시글 작성 이력
- 판매자/구매자 거래 이력
- 채팅 메시지 이력
- 출석 기록
- 삭제 전 `refreshToken` 을 `memberId` 기준으로 제거합니다.

**실패 케이스:**

- 자기 자신 삭제 시도: 비즈니스 오류
- 관련 데이터 존재: `ACCESS_DENIED` 기반 비즈니스 오류
- 회원 없음

**실패 메시지 예시:**

- `연관 데이터가 있는 회원은 삭제할 수 없습니다. 비활성화 기능을 이용해주세요.`

---

### 4.12.9 게시글 삭제

```
POST /admin/posts/{postId}/delete
Content-Type: application/x-www-form-urlencoded
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 거래/채팅 이력이 없는 게시글만 삭제합니다.

**동작 규칙:**

- 게시글에 연결된 `Transfer` 가 있거나 `ChatRoom.post` 가 존재하면 삭제할 수 없습니다.
- 이 경우 상태 관리로 처리하라는 비즈니스 오류를 반환합니다.

**실패 케이스:**

- `POST_001`: 게시글 없음
- `POST_002`: 거래 또는 채팅 이력이 연결된 게시글

**실패 메시지 예시:**

- `거래 또는 채팅 이력이 연결된 게시글은 삭제할 수 없습니다. 상태 관리로 처리하세요.`

---

### 4.12.10 거래를 티켓 전달 완료로 변경

```
POST /admin/transfers/{transferId}/ticket-sent
Content-Type: application/x-www-form-urlencoded
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 거래 상태를 `TICKET_SENT` 로 변경합니다.

**동작 규칙:**

- 현재 상태가 `PAYMENT_COMPLETED` 인 거래만 처리할 수 있습니다.
- 그 외 상태에서는 `TRANSFER_INVALID_STATUS` 비즈니스 오류가 발생합니다.

---

### 4.12.11 거래 완료 처리

```
POST /admin/transfers/{transferId}/complete
Content-Type: application/x-www-form-urlencoded
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 거래를 강제로 완료 처리합니다.

**동작 규칙:**

- `buyer` 가 존재하고 결제가 진행된 거래만 완료 처리할 수 있습니다.
- `REQUESTED` 상태는 완료할 수 없습니다.
- `CANCELLED`, `COMPLETED` 상태도 처리할 수 없습니다.
- 성공 시 판매자 잔액에 거래 금액을 지급합니다.
- 성공 시 거래 상태는 `COMPLETED`, 연결 게시글 상태는 `CLOSED` 로 변경됩니다.
- 현재 구현은 `transfer.getPost().close()` 를 호출하므로 `ticketPost` 기반 거래에 대해서는 정합성 이슈가 있을 수 있습니다.

**실패 케이스:**

- `TRF_001`: 거래 없음
- `TRF_002`: 완료 불가 상태

---

### 4.12.12 거래 취소 처리

```
POST /admin/transfers/{transferId}/cancel
Content-Type: application/x-www-form-urlencoded
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: ADMIN
- **설명**: 거래를 강제로 취소 처리합니다.

**동작 규칙:**

- `CANCELLED`, `COMPLETED` 상태는 취소할 수 없습니다.
- 상태가 `PAYMENT_COMPLETED` 또는 `TICKET_SENT` 이고 `buyer` 가 있으면 구매자에게 금액을 환불합니다.
- 성공 시 거래 상태는 `CANCELLED`, 연결 게시글 상태는 `CLOSED` 로 변경됩니다.
- 현재 구현은 일반 사용자 취소 API와 달리 게시글 상태를 `SELLING` 으로 복구하지 않고 `CLOSED` 로 처리합니다.

**실패 케이스:**

- `TRF_001`: 거래 없음
- `TRF_002`: 이미 종료된 거래

---

### 4.12.13 리다이렉트 및 에러 처리 규칙

- 모든 관리자 POST 액션은 성공/실패와 관계없이 최종적으로 `redirect:` 응답을 반환합니다.
- `returnUrl` 이 있고 `/admin` 으로 시작하면 해당 경로로 돌아갑니다.
- 그 외에는 기본적으로 `/admin/dashboard` 로 이동합니다.
- `BusinessException` 은 JSON 에러 응답이 아니라 플래시 에러 메시지로 처리됩니다.

---

### 4.13 뷰 API (View)

- **중요**: 이 섹션은 JSON REST API가 아니라 서버 렌더링 기반 웹 뷰 및 Spring Security 폼 로그인 플로우입니다.
- **응답 형식**: HTML View 또는 리다이렉트
- **관련 구현 위치:**
- `ViewController`: 로그인 페이지 뷰 반환
- `SecurityConfig`: 로그인 처리, 성공/실패 리다이렉트, 로그아웃 처리

### 4.13.1 로그인 페이지 조회

```
GET /login
```

- **권한**: 공개
- **설명**: 관리자 로그인 페이지를 렌더링합니다.
- **View Name**: `login`
- **Template**: `src/main/resources/templates/login.html`

**화면 특성:**

- 관리자 로그인 UI 전용 페이지입니다.
- 로그인 폼은 `POST /login` 으로 제출됩니다.
- 템플릿 내부에 CSRF hidden input 이 포함됩니다.
- `param.error` 가 있으면 로그인 실패 메시지를 표시합니다.
- `param.logout` 이 있으면 로그아웃 완료 메시지를 표시합니다.

**Response 200 OK:**

- HTML 렌더링

---

### 4.13.2 로그인 처리

```
POST /login
Content-Type: application/x-www-form-urlencoded
```

- **권한**: 공개
- **설명**: Spring Security 폼 로그인 엔드포인트입니다.
- **중요**: `ViewController` 메서드가 직접 처리하는 것이 아니라 `SecurityConfig.formLogin()` 설정으로 처리됩니다.

**Form Parameters:**

- `username` (required): 로그인 이메일
- `password` (required): 비밀번호
- `_csrf` (required): CSRF 토큰

**동작 규칙:**

- 성공 시 항상 `/admin/dashboard` 로 이동합니다.
- `defaultSuccessUrl("/admin/dashboard", true)` 설정이라 이전 요청 경로보다 대시보드로 강제 이동합니다.
- 실패 시 `/login?error` 로 리다이렉트됩니다.

**성공 응답:**

- `302 Redirect -> /admin/dashboard`
- 세션 쿠키 발급

**실패 응답:**

- `302 Redirect -> /login?error`

**구현상 주의사항:**

- 관리자 페이지 접근 권한은 `/admin/**` 에 대해 `ROLE_ADMIN` 이 필요합니다.
- 따라서 일반 사용자 계정은 인증에 성공하더라도 관리자 권한이 없으면 `/admin/**` 접근 시 차단될 수 있습니다.
- 로그인 페이지의 오류 문구는 이메일/비밀번호 오류 또는 관리자 권한 부재를 함께 안내합니다.

---

### 4.13.3 로그아웃 처리

```
POST /logout
Content-Type: application/x-www-form-urlencoded
Cookie: JSESSIONID={SESSION_ID}
```

- **권한**: 로그인 사용자
- **설명**: Spring Security 세션 로그아웃을 수행합니다.
- **중요**: 웹 체인에서 처리되며 API JWT 로그아웃과는 별개입니다.

**동작 규칙:**

- 세션을 무효화합니다.
- 성공 시 `/login?logout` 으로 리다이렉트됩니다.

**성공 응답:**

- `302 Redirect -> /login?logout`

---

### 4.13.4 관리자 페이지 접근 규칙

- `/admin/**` 는 `ROLE_ADMIN` 권한이 있어야 접근할 수 있습니다.
- 비로그인 사용자는 `/login` 으로 이동합니다.
- 로그인 성공 후 기본 진입점은 `/admin/dashboard` 입니다.
- `/`, `/login`, `/signup`, `/css/**`, `/js/**`, `/images/**`, `/uploads/**`, `/error` 는 공개 경로입니다.
- `/chat-test.html`, `/ws`, `/ws-test` 도 웹 체인에서 공개 허용됩니다.

---

## 5. API 전체 목록 요약

### 5.1 인증 API

| 메서드 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | 회원 가입 | 공개 |
| `POST` | `/api/auth/login` | 로그인 및 JWT 발급 | 공개 |
| `POST` | `/api/auth/refresh` | 액세스 토큰 재발급 | 공개 |
| `POST` | `/api/auth/logout` | 로그아웃 | MEMBER |

### 5.2 야구 경기 정보 API

| 메서드 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `GET` | `/api/baseball/season` | 시즌 일정 조회 | 공개 |
| `POST` | `/api/baseball/sync` | 시즌 일정 동기화 | 공개 |
| `GET` | `/api/baseball/live` | 일자별 라이브 경기 조회 | 공개 |
| `GET` | `/api/baseball/standings` | KBO 순위 조회 | 공개 |

### 5.3 팀 API

| 메서드 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `GET` | `/api/teams` | 전체 팀 목록 조회 | 공개 |
| `GET` | `/api/teams/{id}` | 단일 팀 조회 | 공개 |

### 5.4 게시글 API

| 메서드 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `GET` | `/api/posts` | 게시글 목록 조회 | 공개 |
| `GET` | `/api/posts/team/{teamId}` | 팀 전용 게시글 목록 조회 | 공개 |
| `GET` | `/api/posts/{id}` | 게시글 상세 조회 | 공개 |
| `GET` | `/api/posts/{id}/members` | 참여 멤버 조회 | 공개 |
| `POST` | `/api/posts/{id}/join-crew` | 크루 참여 신청 | MEMBER |
| `POST` | `/api/posts/{id}/join-mate` | 메이트 참여 신청 | MEMBER |
| `POST` | `/api/posts` | 게시글 작성 | MEMBER |
| `PUT` | `/api/posts/{id}` | 게시글 수정 | MEMBER |
| `DELETE` | `/api/posts/{id}` | 게시글 삭제 | MEMBER |
| `POST` | `/api/posts/{id}/approve/{memberId}` | 비공개 크루 승인 | MEMBER |
| `POST` | `/api/posts/{id}/reject/{memberId}` | 비공개 크루 거절 | MEMBER |
| `POST` | `/api/posts/{id}/leave` | 참여 중 게시글 나가기 | MEMBER |
| `POST` | `/api/posts/{id}/members/{memberId}/expel` | 참여자 강제 퇴장 | MEMBER |

### 5.5 티켓 게시글 API

| 메서드 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `GET` | `/api/tickets` | 티켓 게시글 목록 조회 | 공개 |
| `GET` | `/api/ticket-transfers` | 티켓 게시글 목록 조회 별칭 | 공개 |
| `GET` | `/api/tickets/{id}` | 티켓 게시글 상세 조회 | 공개 |
| `GET` | `/api/ticket-transfers/{id}` | 티켓 게시글 상세 조회 별칭 | 공개 |
| `POST` | `/api/tickets` | 티켓 게시글 작성 | MEMBER |
| `POST` | `/api/ticket-transfers` | 요청 스펙 기반 티켓 게시글 작성 | MEMBER |
| `PATCH` | `/api/{id}/status` | 티켓 상태 변경 | MEMBER |
| `DELETE` | `/api/{id}` | 티켓 게시글 삭제 | MEMBER |

### 5.6 양도 거래 API

| 메서드 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `POST` | `/api/transfers/{postId}/request` | 게시글 기반 양도 요청 | MEMBER |
| `POST` | `/api/transfers/{transferId}/pay` | 에스크로 결제 | MEMBER |
| `POST` | `/api/transfers/{transferId}/ticket-sent` | 티켓 전달 완료 | MEMBER |
| `POST` | `/api/transfers/{transferId}/confirm` | 인수 확정 및 정산 | MEMBER |
| `POST` | `/api/transfers/{transferId}/cancel` | 거래 취소 | MEMBER |
| `GET` | `/api/transfers/me` | 내 양도 내역 조회 | MEMBER |
| `GET` | `/api/transfers/room/{roomId}` | 채팅방 기준 거래 정보 조회 | MEMBER |
| `POST` | `/api/transfers/room/{roomId}/request` | 채팅방 기준 양도 요청 | MEMBER |

### 5.7 채팅 / 채팅방 API

| 프로토콜 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `STOMP` | `CONNECT /ws` | 채팅 WebSocket 연결 | 공개 |
| `STOMP` | `SEND /app/chat/{roomId}` | 채팅 메시지 발행 | 인증 세션 |
| `STOMP` | `SUBSCRIBE /topic/chat/{roomId}` | 채팅 메시지 구독 | 인증 세션 |
| `GET` | `/api/chat/rooms` | 내 채팅방 목록 조회 | MEMBER |
| `POST` | `/api/chat/rooms` | 그룹 채팅방 생성 | MEMBER |
| `POST` | `/api/chat/rooms/dm/user/{targetUserId}` | 직접 DM 생성/조회 | MEMBER |
| `GET` | `/api/chat/rooms/{roomId}` | 채팅방 상세 조회 | MEMBER |
| `GET` | `/api/chat/rooms/{roomId}/messages` | 채팅 메시지 내역 조회 | MEMBER |
| `POST` | `/api/chat/rooms/{roomId}/read` | 채팅방 읽음 처리 | MEMBER |
| `POST` | `/api/chat/rooms/transfer/{postId}` | 양도용 1:1 채팅방 생성/조회 | MEMBER |
| `DELETE` | `/api/chat/rooms/{roomId}/leave` | 채팅방 나가기 | MEMBER |

### 5.8 라이브 응원 API

| 프로토콜 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `STOMP` | `CONNECT /ws` | 라이브 응원 WebSocket 연결 | 공개 |
| `STOMP` | `SEND /app/live-cheer/{gameId}` | 라이브 응원 메시지 발행 | 인증 세션 권장 |
| `STOMP` | `SUBSCRIBE /topic/live-cheer/{gameId}` | 라이브 응원 메시지 구독 | 공개 연결 가능 |

### 5.9 회원 API

| 메서드 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `GET` | `/api/members/me` | 내 정보 조회 | MEMBER |
| `PUT` | `/api/members/me` | 닉네임 변경 | MEMBER |
| `PUT` | `/api/members/me/team` | 응원 팀 변경 | MEMBER |
| `PUT` | `/api/members/me/profile-image` | 프로필 이미지 변경 | MEMBER |
| `PUT` | `/api/members/me/password` | 비밀번호 변경 | MEMBER |
| `PUT` | `/api/members/me/alerts` | 알림 설정 변경 | MEMBER |
| `PUT` | `/api/members/me/charge` | 잔액 충전 | MEMBER |

### 5.10 직관 다이어리 API

| 메서드 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `POST` | `/api/attendances` | 직관 기록 등록 | MEMBER |
| `GET` | `/api/attendances` | 내 직관 기록 전체 조회 | MEMBER |
| `DELETE` | `/api/attendances/{id}` | 직관 기록 삭제 | MEMBER |

### 5.11 관리자 웹 API

| 메서드 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `GET` | `/admin/dashboard` | 관리자 대시보드 | ADMIN |
| `GET` | `/admin/members` | 회원 관리 화면 | ADMIN |
| `GET` | `/admin/posts` | 게시글 관리 화면 | ADMIN |
| `GET` | `/admin/transfers` | 거래 관리 화면 | ADMIN |
| `POST` | `/admin/members/{memberId}/deactivate` | 회원 비활성화 | ADMIN |
| `POST` | `/admin/members/{memberId}/activate` | 회원 활성화 | ADMIN |
| `POST` | `/admin/members/{memberId}/role` | 회원 권한 변경 | ADMIN |
| `POST` | `/admin/members/{memberId}/delete` | 회원 삭제 | ADMIN |
| `POST` | `/admin/posts/{postId}/delete` | 게시글 삭제 | ADMIN |
| `POST` | `/admin/transfers/{transferId}/ticket-sent` | 거래 티켓 전달 완료 처리 | ADMIN |
| `POST` | `/admin/transfers/{transferId}/complete` | 거래 완료 처리 | ADMIN |
| `POST` | `/admin/transfers/{transferId}/cancel` | 거래 취소 처리 | ADMIN |

### 5.12 뷰 API

| 메서드 | 경로 | 설명 | 권한 |
| --- | --- | --- | --- |
| `GET` | `/login` | 로그인 페이지 조회 | 공개 |
| `POST` | `/login` | 폼 로그인 처리 | 공개 |
| `POST` | `/logout` | 세션 로그아웃 처리 | 로그인 사용자 |

## 6. 프로토콜 및 인증 방식 요약

### 6.1 REST API

- 대상: `/api/**`
- 인증: `Authorization: Bearer {JWT_ACCESS_TOKEN}`
- 예외: `/api/auth/login`, `/api/auth/signup`, `/api/auth/refresh`, `GET /api/teams/**`, `GET /api/baseball/**` 는 공개
- 응답: `GlobalResponseAdvice` 기준 성공 응답 래핑, 예외 시 `ErrorResponse`

### 6.2 WebSocket / STOMP

- 엔드포인트: `/ws`, `/ws-test`
- 발행 prefix: `/app`
- 구독 prefix: `/topic`
- 인증 전달 방식: STOMP `CONNECT` 프레임의 `Authorization: Bearer {JWT_ACCESS_TOKEN}` 네이티브 헤더
- 대상 기능: 채팅, 라이브 응원

### 6.3 관리자 웹

- 대상: `/admin/**`, `/login`, `/logout`
- 인증: Spring Security 세션 로그인
- 권한: `/admin/**` 는 `ROLE_ADMIN`
- 응답: HTML View 또는 Redirect
- POST 폼 제출 시 CSRF 토큰 필요

## 7. 주요 에러 코드 요약

### 7.1 인증 / 공통

| 코드 | HTTP | 설명 |
| --- | --- | --- |
| `AUTH_001` | 401 | 인증이 필요합니다. |
| `AUTH_002` | 403 | 접근 권한이 없습니다. |
| `AUTH_003` | 401 | 이메일 또는 비밀번호가 올바르지 않습니다. |
| `AUTH_004` | 401 | 유효하지 않은 인증 토큰입니다. |
| `AUTH_005` | 401 | 만료된 인증 토큰입니다. |
| `SERVER_001` | 500 | 서버 내부 오류가 발생했습니다. |
| `SERVER_002` | 400 | 입력값이 올바르지 않습니다. |

### 7.2 회원 / 팀

| 코드 | HTTP | 설명 |
| --- | --- | --- |
| `MEM_001` | 404 | 존재하지 않는 회원입니다. |
| `MEM_003` | 409 | 이미 사용 중인 닉네임입니다. |
| `MEM_004` | 400 | 이번 시즌 팀 변경 횟수를 초과했습니다. |
| `MEM_005` | 400 | 이미 선택된 팀과 동일한 팀입니다. |
| `MEM_006` | 400 | 현재 비밀번호가 일치하지 않습니다. |
| `TEAM_001` | 404 | 존재하지 않는 팀입니다. |

### 7.3 게시글 / 티켓 / 거래

| 코드 | HTTP | 설명 |
| --- | --- | --- |
| `POST_001` | 404 | 존재하지 않는 게시글입니다. |
| `POST_002` | 400 | 수정/삭제 불가 게시글입니다. |
| `POST_005` | 400 | 유효하지 않은 게시글 타입 요청입니다. |
| `POST_006` | 400 | 모집 인원이 가득 찼습니다. |
| `POST_007` | 400 | 이미 참여 중입니다. |
| `POST_008` | 400 | 방장은 나갈 수 없습니다. |
| `TCK_001` | 404 | 존재하지 않는 티켓 양도 게시글입니다. |
| `TRF_001` | 404 | 존재하지 않는 거래입니다. |
| `TRF_002` | 400 | 현재 거래 상태에서 해당 작업을 수행할 수 없습니다. |
| `TRF_003` | 409 | 이미 거래가 진행 중입니다. |
| `TRF_004` | 400 | 자신의 게시글에는 양도 요청할 수 없습니다. |
| `TRF_005` | 400 | 결제 가능한 상태가 아닙니다. |
| `TRF_006` | 400 | 티켓 전달 가능한 상태가 아닙니다. |
| `TRF_007` | 400 | 인수 확정 가능한 상태가 아닙니다. |
| `PAY_001` | 400 | 잔액이 부족합니다. |

### 7.4 채팅

| 코드 | HTTP | 설명 |
| --- | --- | --- |
| `CHAT_001` | 404 | 존재하지 않는 채팅방입니다. |
| `CHAT_002` | 403 | 채팅방 접근 권한이 없습니다. |
| `CHAT_003` | 400 | 메시지 내용이 비어 있을 수 없습니다. |
| `CHAT_004` | 400 | 거래 진행 중에는 채팅방을 나갈 수 없습니다. |

## 8. **API 문서화**

### **8.1 API 문서 생성 도구 - Swagger**

```java
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("풀카운트 (Full Count) API")
                        .description("야구 팬 커뮤니티 + 에스크로 티켓 양도 플랫폼 REST API")
                        .version("v1.0"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}

```

### **8.2 Swagger Schema 사용 예시**

#### Controller

```java
@Slf4j
@Tag(name = "Chat", description = "채팅 API")
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomService chatRoomService;

    @Operation(summary = "내 채팅방 목록 조회", description = "로그인한 회원이 참여 중인 채팅방 목록을 페이징하여 조회합니다.")
    @GetMapping
    public ResponseEntity<PagedResponse<ChatDTO.ChatRoomResponse>> getMyChatRooms(
            @AuthenticationPrincipal Long memberId,
            @ParameterObject @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(chatRoomService.getMyChatRooms(memberId, pageable));
    }
    
    // 생략
    
 }
```

### **8.3 Swagger 화면**
<a href="https://ibb.co/xtcV1Mf4"><img src="https://i.ibb.co/Xrdm7z3w/2026-04-06-180730.png" alt="2026-04-06-180730" border="0"></a>
<a href="https://ibb.co/xqj03455"><img src="https://i.ibb.co/60PxNdss/2026-04-06-180748.png" alt="2026-04-06-180748" border="0"></a>
<a href="https://ibb.co/DHFjfrxq"><img src="https://i.ibb.co/wFq2hc9v/2026-04-06-180801.png" alt="2026-04-06-180801" border="0"></a>
<a href="https://ibb.co/5hM560VF"><img src="https://i.ibb.co/GQxV06jT/2026-04-06-180817.png" alt="2026-04-06-180817" border="0"></a>



## **9. 체크리스트 및 품질 관리**

### **9.1 API 설계 체크리스트**

```
□ RESTful 원칙을 준수하는가?
□ URL 네이밍 규칙이 일관되는가?
□ HTTP 메서드를 올바르게 사용하는가?
□ HTTP 상태 코드를 적절히 사용하는가?
□ 요청/응답 형식이 표준화되어 있는가?
□ 에러 응답이 명확하고 도움이 되는가?
□ 페이지네이션이 구현되어 있는가?
□ 적절한 인증/인가가 구현되어 있는가?
```

### **9.2 보안 체크리스트**

```
□ 입력값 검증이 충분한가?
□ JWT 토큰이 안전하게 관리되는가?
□ 권한 체크가 모든 엔드포인트에 적용되는가?
□ 에러 메시지에서 시스템 정보가 노출되지 않는가?
```

### **9.3 성능 체크리스트**

```
□ N+1 쿼리 문제가 해결되었는가?
□ 데이터베이스 인덱스가 적절한가?
```