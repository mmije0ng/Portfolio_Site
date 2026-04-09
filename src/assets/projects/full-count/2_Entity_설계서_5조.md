# 2. Entity 설계서 (5조)

## **문서 정보**

- **프로젝트명**: 풀카운트 (Full Count) - 야구 팬 커뮤니티 및 직관/티켓 양도 플랫폼
- **작성자**: [풀카운트/박미정]
- **작성일**: [2026-04-06]
- **버전**: [v1.0]
- **검토자**: [안진경, 김어진, 박미정, 이시연, 이준호]
- **승인자**: [안진경, 김어진, 박미정, 이시연, 이준호]

---

## **1. Entity 설계 개요**

## **1.1 설계 목적**

> 객체 지향 프로그래밍과 관계형 데이터베이스 간의 패러다임 불일치(Impedance Mismatch)를 해소하고, 비즈니스 도메인을 코드에 직관적으로 투영하는 것을 목적으로 한다. 이를 통해 데이터 무결성을 보장하고, 변경에 유연하게 대응할 수 있는 지속 가능한 데이터 레이어 아키텍처를 구축한다.
> 

### **1.2 설계 원칙**

- **단일 책임 원칙 (Single Responsibility):** 각 엔티티는 고유한 비즈니스 개념을 독립적으로 표현하며, 명확한 식별자를 통해 생명주기를 관리
- **의도 중심의 도메인 로직 캡슐화:** `Setter` 사용을 지양하고, 비즈니스 의미가 담긴 메서드(Rich Domain Model)를 엔티티 내부에 구현하여 데이터 상태 변경의 주도권을 엔티티가 직접 갖도록 함
- **불변성 및 정합성 유지:** 필드에 대한 무분별한 변경을 막고, 생성 시점에는 **정적 팩토리 메서드**나 **Builder 패턴**을 활용하여 완전한 상태의 객체 생성을 보장
- **지연 로딩 (Lazy Loading)**: 성능 최적화 및 N+1 문제 방지를 위해 모든 연관관계는 `FetchType.LAZY`를 기본으로 설정
- **생성자 접근 제어:** JPA 표준에 따라 기본 생성자의 접근 제어자를 `PROTECTED`로 제한하여, 외부에서의 무분별한 객체 생성을 방지하고 대리자(Proxy) 생성을 지원

### **1.3 기술 스택**

- **ORM 프레임워크**: Spring Data JPA 3.2.x (Spring Boot 3.2.5 내장)
- **데이터베이스**: MySQL 8.x (운영), H2 (개발/테스트)
- **검증 프레임워크**: Jakarta Bean Validation 3.0 (Hibernate Validator 8.0.x)
- **감사 기능**: Spring Data JPA Auditing (Jakarta Persistence 기반)

---

## 2. Entity 목록 및 분류

### 2.1 Entity 분류 매트릭스

프로젝트의 핵심 비즈니스 로직과 기술적 구현 난이도를 고려하여 엔티티를 분류하였습니다.

| Entity명 | 유형 | 비즈니스 중요도 | 기술적 복잡도 | 우선순위 |
| --- | --- | --- | --- | --- |
| **Member** | 핵심 | 높음 | 중간 | 1순위 |
| **Team** | 기준 | 높음 | 낮음 | 1순위 |
| **Post** | 핵심 | 높음 | 높음 | 1순위 |
| **Transfer** | 핵심 | 높음 | 높음 | 1순위 |
| **ChatRoom** | 서비스 | 중간 | 높음 | 2순위 |
| **Attendance** | 서비스 | 중간 | 중간 | 2순위 |
| **BaseballGame** | 지원 | 중간 | 중간 | 3순위 |
| **RefreshToken** | 기술 | 낮음 | 낮음 | 1순위 |
- **1순위 (Core):** 서비스 운영에 필수적인 회원, 팀, 통합 게시글 및 양도 프로세스
- **2순위 (Service):** 사용자 경험을 향상시키는 채팅 및 개인별 직관 기록 관리
- **3순위 (Support):** 외부 API 동기화 및 부가 정보 제공 데이터

### 2.2 Entity 상속 구조

모든 Entity는 공통 메타데이터 관리를 위해 PK와 생성일자를 포함합니다.

- `id` (Long): 전역 고유 식별자 (PK)
- `createdAt` (LocalDateTime): 생성 일시
- **설계 의도**: Spring Data JPA Auditing 기능을 활용하여 모든 레코드의 생성/수정 시점을 자동 기록함으로써 데이터 추적성을 확보합니다.

---

## 3. 공통 설계 규칙

### 3.1 네이밍 규칙

일관된 네이밍 컨벤션을 통해 코드 가독성과 데이터베이스 관리 효율을 높입니다.

| 구분 | 규칙 | 예시 | 비고 |
| --- | --- | --- | --- |
| **Entity 클래스명** | **PascalCase** | `Member`, `ChatMessage` | 단수형 명사 사용 |
| **테이블명** | **snake_case** | `members`, `chat_rooms` | **복수형** 명사 사용 |
| **컬럼명** | **snake_case** | `member_id`, `created_at` | 언더스코어로 단어 구분 |
| **연관관계 필드** | **camelCase** | `author`, `transfer` | 객체 참조 변수명으로 사용 |
| **Boolean 필드** | **is + 형용사** | `isActive`, `isPublic` | 상태를 나타내는 명확한 의미 |
| **Enum 타입** | **PascalCase** | `BoardType`, `PostStatus` | 범주형 데이터 정의 |

### 3.2 공**통 어노테이션 규칙**

```java
// 기본 Entity 구조
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "entity_name")
@Entity
public class EntityName {
	// 필드

}
```

### 3.3 ID 생성 전략

- MySQL 8.x 환경을 고려하여 **`GenerationType.IDENTITY`** (Auto Increment)를 기본 전략으로 채택합니다.

### 3.4 연관관계 설정 원칙

- **지연 로딩 (Lazy Loading)**: 성능 최적화 및 N+1 문제 방지를 위해 모든 연관관계는 `FetchType.LAZY`를 기본으로 설정

### 3.5 데이터 정합성 및 보안

- **Setter 사용 지양**: 엔티티의 상태 변경은 비즈니스 의미가 담긴 메서드(예: `closePost()`, `updateProfile()`)를 통해서만 수행
- **생성자 접근 제어**: 무분별한 객체 생성을 막기 위해 기본 생성자의 접근 제어자를 `PROTECTED`로 제한 (`@NoArgsConstructor(access = AccessLevel.PROTECTED)`)

### 3.6 데이터 타입 표준

- **날짜/시간**: `java.time.LocalDateTime`을 표준으로 사용

---

## **4. 상세 Entity 설계**

### 4.1 Member (회원)

- 플랫폼 사용자의 인증 정보, 프로필, 응원 팀, 에스크로 거래를 위한 잔액을 관리하는 핵심 엔티티임
- 응원 팀 변경 제한(시즌당 1회) 및 매너 온도 시스템과 같은 비즈니스 로직을 엔티티 내부에 캡슐화하여 데이터 정합성을 보장함
- 사용자별 알림 설정 정보를 포함하여 개인화된 서비스 경험을 제공함

#### **4.1.1 기본정보**

- Member 구현
    
    ```java
    @Entity
    @Table(name = "member")
    @EntityListeners(AuditingEntityListener.class)
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @Builder
    @AllArgsConstructor
    public class Member {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "올바른 이메일 형식이어야 합니다")
        @Column(name = "email", nullable = false, unique = true, length = 100)
        private String email;
    
        @NotBlank(message = "닉네임은 필수입니다")
        @Column(name = "nickname", nullable = false, unique = true, length = 30)
        private String nickname;
    
        @Column(name = "password", nullable = false)
        private String password;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "team_id")
        private Team team;
    
        @Enumerated(EnumType.STRING)
        @Column(name = "badge_level", nullable = false, length = 15)
        @Builder.Default
        private BadgeLevel badgeLevel = BadgeLevel.ROOKIE;
    
        /** 기본 36.5도 */
        @Column(name = "manner_temperature", nullable = false)
        @Builder.Default
        private Double mannerTemperature = 36.5;
    
        @Enumerated(EnumType.STRING)
        @Column(name = "role", nullable = false, length = 10)
        @Builder.Default
        private MemberRole role = MemberRole.USER;
    
        @Column(name = "is_active", nullable = false)
        @Builder.Default
        private Boolean isActive = true;
    
        /** 시즌 내 팀 변경 여부 */
        @Column(name = "team_changed_this_season", nullable = false)
        @Builder.Default
        private Boolean teamChangedThisSeason = false;
    
        @Column(name = "balance", nullable = false)
        private int balance = 0;
    
        @CreatedDate
        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;
    
        @LastModifiedDate
        @Column(name = "updated_at")
        private LocalDateTime updatedAt;
    
        @Column(name = "profile_image_url", length = 500)
        private String profileImageUrl;
    
        @Column(nullable = false)
        @Builder.Default
        private Boolean chatAlert = true; // 기본값 모두 켜짐(true)
    
        @Column(nullable = false)
        @Builder.Default
        private Boolean transferAlert = true;
    
        @Column(nullable = false)
        @Builder.Default
        private Boolean mannerAlert = true;
    
        // ────── 비즈니스 메서드 ──────
    
        public void updateNickname(String nickname) {
            this.nickname = nickname;
        }
    
        public void updatePassword(String encodedPassword) {
            this.password = encodedPassword;
        }
    
        /** 응원 팀 변경 (시즌당 1회 제한) */
        public void changeTeam(Team newTeam) {
            // 1. 이미 이번 시즌에 변경했는지 체크
            if (this.teamChangedThisSeason) {
                throw new BusinessException(ErrorCode.TEAM_CHANGE_LIMIT);
            }
    
            // 2. 현재 팀과 같은 팀으로 변경하려는지 체크
            if (this.team != null && this.team.getId().equals(newTeam.getId())) {
                throw new BusinessException(ErrorCode.ALREADY_IN_TEAM);
            }
    
            this.team = newTeam;
            this.teamChangedThisSeason = true;
        }
    
        /** 뱃지 승급 */
        public void upgradeBadge(BadgeLevel newLevel) {
            this.badgeLevel = newLevel;
        }
    
        /** 매너 온도 갱신 */
        public void updateMannerTemperature(double delta) {
            this.mannerTemperature = Math.min(99.9, Math.max(0.0, this.mannerTemperature + delta));
        }
    
        /** 시즌 초기화 (매 시즌 시작 시 팀 변경 가능하도록) */
        public void resetSeasonFlags() {
            this.teamChangedThisSeason = false;
        }
    
        /** 결제 시 충전 */
        public void charge(int amount) {
            this.balance += amount;
        }
    
        /** 결제 시 차감 */
        public void deduct(int amount) {
            if (this.balance < amount)
                throw new BusinessException(ErrorCode.INSUFFICIENT_BALANCE);
            this.balance -= amount;
        }
    
        public void updateProfileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
        }
    
        public void updateAlerts(Boolean chatAlert, Boolean transferAlert, Boolean mannerAlert) {
            this.chatAlert = chatAlert;
            this.transferAlert = transferAlert;
            this.mannerAlert = mannerAlert;
        }
    
        public void deactivate() {
            this.isActive = false;
        }
    
        public void activate() {
            this.isActive = true;
        }
    
        public void changeRole(MemberRole role) {
            this.role = role;
        }
    }
    ```
    

#### **4.1.2 필드 상세 명세**

| 필드명 | 데이터 타입 | 컬럼명 | 제약조건 | 설명 | 비즈니스 규칙 |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INCREMENT | 회원 고유 식별자 | 시스템 자동 생성 |
| **email** | String | `email` | UNIQUE, NOT NULL, 100자 | 이메일 (로그인 ID) | 중복 가입 불가 |
| **nickname** | String | `nickname` | UNIQUE, NOT NULL, 30자 | 서비스 활동 닉네임 | 중복 불가, 변경 가능 |
| **password** | String | `password` | NOT NULL | 암호화된 비밀번호 | BCrypt 암호화 저장 |
| **team** | Team | `team_id` | FK, LAZY | 응원 구단 | 시즌 내 1회 변경 제한 |
| **badgeLevel** | BadgeLevel | `badge_level` | ENUM, NOT NULL | 활동 등급 | ROOKIE(기본) ~ LEGEND |
| **mannerTemperature** | Double | `manner_temperature` | NOT NULL, DEFAULT(36.5) | 매너 온도 | 0.0 ~ 99.9 범위 관리 |
| **role** | MemberRole | `role` | ENUM, NOT NULL | 사용자 권한 | USER(기본), ADMIN |
| **isActive** | Boolean | `is_active` | NOT NULL, DEFAULT(TRUE) | 계정 활성화 상태 | 비활성 시 로그인 제한 |
| **balance** | int | `balance` | NOT NULL, DEFAULT(0) | 에스크로용 잔액 | 음수값 불가능 |
| **profileImageUrl** | String | `profile_image_url` | LONGTEXT | 프로필 이미지 경로 | - |
| **createdAt** | LocalDateTime | `created_at` | UP_FALSE, Auditing | 가입 일시 | 시스템 자동 기록 |
| **updatedAt** | LocalDateTime | `updated_at` | Auditing | 정보 수정 일시 | 시스템 자동 기록 |

#### 4.1.3 비즈니스 메서드 (Domain Logic)

엔티티 내부에 비즈니스 로직을 캡슐화하여 데이터 정합성을 유지

- **changeTeam(Team newTeam)**: 시즌당 1회에 한해 응원 팀을 변경. 이미 변경했거나 동일한 팀으로 변경 시 예외를 발생시킴
- **updateMannerTemperature(double delta)**: 매너 온도를 갱신. 온도는 0.0도에서 99.9도 사이를 유지하도록 보정
- **deduct(int amount)**: 잔액을 차감. 현재 잔액이 부족할 경우 `INSUFFICIENT_BALANCE` 예외를 발생시켜 데이터 무결성을 보장.
- **resetSeasonFlags()**: 매 시즌 시작 시 팀 변경 가능 여부 플래그(`teamChangedThisSeason`)를 초기화
- **deactivate() / activate()**: 관리자 기능 또는 회원 탈퇴 시 계정 상태를 안전하게 변경합

#### 4.1.4 연관관계 매핑

```java
// 1:N - 회원이 작성한 게시글 목록 (메이트/크루/양도 통합)
@OneToMany(mappedBy = "author", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
@OrderBy("createdAt DESC")
private List<Post> posts = new ArrayList<>();

// 1:N - 회원의 직관 기록 목록 (직관 달력)
@OneToMany(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
@OrderBy("matchDate DESC")
private List<Attendance> attendances = new ArrayList<>();

// 1:N - 크루/메이트 참여 내역
@OneToMany(mappedBy = "member", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
private List<CrewParticipant> crewParticipations = new ArrayList<>();
```

- **Team (N:1, 단방향)**:
    - 회원이 선택한 응원 구단을 참조함. `FetchType.LAZY`를 적용하여 회원 조회 시 구단 정보까지 즉시 조인되지 않도록 설계함
- **Post (1:N, 양방향)**:
    - 회원이 작성한 게시글 목록임. `author` 필드에 의해 매핑되며, 회원 탈퇴 시 작성글 처리 정책에 따라 `CascadeType`을 결정함
- **Attendance (1:N, 양방향)**:
    - 회원의 직관 기록 목록임. 직관 달력 기능을 위해 사용되며 최신순 정렬(`@OrderBy`)을 기본으로 함
- **CrewParticipant (1:N, 양방향)**:
    - 회원이 참여한 메이트/크루 내역임. 다대다 관계를 해소하는 연결 엔티티와 연동함

#### **4.1.5 알림 설정 (Value Object 성격)**

사용자별 푸시 알림 수신 여부를 개별적으로 관리

- **chatAlert**: 채팅 메시지 수신 알림 여부 (Default: true)
- **transferAlert**: 티켓 양도 관련(결제, 전송 등) 알림 여부 (Default: true)
- **mannerAlert**: 매너 평가 요청 및 피드백 알림 여부 (Default: true)

### 4.2 Team (구단)

- KBO 공식 10개 구단의 고유 정보(팀명, 약칭, 홈구장)를 담고 있는 마스터 데이터 엔티티
- 회원(Member)의 응원 팀 설정 및 경기(Post) 정보의 기준 데이터로 활용
- 시스템 전반에서 구단 정보를 식별하는 기준 데이터로 활용되며, 변경 빈도가 매우 낮은 정적 성격의 데이터를 관리함

#### **4.2.1 기본정보**

- Team 구현
    
    ```java
    @Entity
    @Table(name = "team")
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    @Builder
    public class Team {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @Column(name = "name", nullable = false, length = 30)
        private String name;          // 두산 베어스
    
        @Column(name = "short_name", nullable = false, length = 5)
        private String shortName;     // DU
    
        @Column(name = "home_stadium", nullable = false, length = 50)
        private String homeStadium;   // 잠실야구장
    }
    
    ```
    

#### **4.2.2 필드 상세 명세**

| 필드명 | 데이터 타입 | 컬럼명 | 제약조건 | 설명 | 비즈니스 규칙 |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INCREMENT | 구단 고유 식별자 | 시스템 자동 생성 |
| **name** | String | `name` | NOT NULL, 30자 | 구단 전체 명칭 | 예: 두산 베어스, LG 트윈스 |
| **shortName** | String | `short_name` | NOT NULL, 5자 | 구단 약칭 | 예: 두산, LG, SSG |
| **homeStadium** | String | `home_stadium` | NOT NULL, 50자 | 홈구장 명칭 | 예: 잠실야구장, 고척스카이돔 |

#### 4.2.3 비즈니스 메서드 (Domain Logic)

`Team` 엔티티는 주로 참조용 마스터 데이터로 사용되므로 상태 변경 로직은 최소화하며, 정보 수정이 필요한 경우에 대비한 편의 메서드를 구성

- **updateStadium(String newStadium)**: 구단의 홈구장 명칭이 변경될 경우(네이밍 라이츠 등) 정보를 갱신
- **생성자 제어**: `@Builder`를 통한 객체 생성을 지원하며, `@NoArgsConstructor(access = AccessLevel.PROTECTED)`를 통해 무분별한 기본 생성자 호출을 방지하고 JPA 프록시 객체 생성을 지원

#### 4.2.4 연관관계 매핑

```java
// 1:N - 해당 팀을 응원하는 회원 목록
@OneToMany(mappedBy = "team", fetch = FetchType.LAZY)
private List<Member> fans = new ArrayList<>();

// 1:N - 해당 팀이 연관된 게시글 (팀 전용 게시판)
@OneToMany(mappedBy = "team", fetch = FetchType.LAZY)
private List<Post> teamPosts = new ArrayList<>();
```

- **Member (1:N, 양방향)**:
    - 해당 구단을 응원 팀으로 선택한 팬들의 목록임. 구단별 팬 수 집계나 타겟 마케팅 정보를 추출할 때 활용함
- **Post (1:N, 양방향)**:
    - 특정 구단의 전용 게시판에 작성된 게시글 목록임. `team_id`를 외래 키로 가지는 게시글들을 참조함
- **설계 의도**:
    - `Team` 엔티티는 삭제가 발생하지 않으므로 영속성 전이(`Cascade`) 설정을 제외하여 하위 데이터에 영향을 주지 않도록 관리함
    - 모든 관계는 지연 로딩을 적용하여 마스터 데이터 로딩 시의 성능 부하를 최소화함

### 4.3 Post (통합 게시글)

- 직관 메이트 모집, 크루 모집, 티켓 양도, 팀 전용 게시글을 하나의 엔티티에서 통합 관리함
- `BoardType` 필드를 통해 게시글의 성격을 구분하며, 유형별로 필요한 필드를 선택적으로 사용함
- 대량의 게시글 조회를 고려하여 게시판 유형 및 상태값에 대한 복합 인덱스를 설정함

#### **4.3.1 기본정보**

- Post 구현
    
    ```java
    @Entity
    @Table(name = "post", indexes = {
            @Index(name = "idx_post_board_type_created_at", columnList = "board_type, created_at"),
            @Index(name = "idx_post_status_created_at", columnList = "status, created_at")
    })
    @EntityListeners(AuditingEntityListener.class)
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @Builder
    @AllArgsConstructor
    public class Post {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "author_id", nullable = false)
        private Member author;
    
        /** 작성자가 소속된 팀 (팀 전용 게시판 접근 제어용) */
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "team_id")
        private Team team;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "home_team_id")
        private Team homeTeam;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "away_team_id")
        private Team awayTeam;
    
        /** MEETUP / CREW 전용 - 응원 팀 */
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "support_team_id")
        private Team supportTeam;
    
        @Enumerated(EnumType.STRING)
        @Column(name = "board_type", nullable = false, length = 20)
        @Builder.Default
        private BoardType boardType = BoardType.CREW;
    
        @Column(name = "title", nullable = false, length = 200)
        private String title;
    
        @Column(name = "content", nullable = false, columnDefinition = "TEXT")
        private String content;
    
        /** MEETUP / TRANSFER / CREW 에 필수 */
        @Column(name = "match_date")
        private LocalDate matchDate;
    
        /** CREW 전용 - 경기 시간 */
        @Column(name = "match_time", length = 20)
        private String matchTime;
    
        /** CREW 전용 - 경기장 */
        @Column(name = "stadium", length = 100)
        private String stadium;
    
        /** CREW / TRANSFER 전용 - 좌석 구역 */
        @Column(name = "seat_area", length = 100)
        private String seatArea;
    
        /** TRANSFER 전용 - 티켓 가격 */
        @Column(name = "ticket_price")
        private Integer ticketPrice;
    
        /** CREW 전용 - 최대 모집 인원 */
        @Column(name = "max_participants")
        private Integer maxParticipants;
    
        /** CREW 전용 - 공개 여부 */
        @Column(name = "is_public", nullable = false)
        @Builder.Default
        private Boolean isPublic = true;
    
        /** CREW 전용 - 태그 (쉼표로 구분하여 저장) */
        @Column(name = "tags", length = 500)
        private String tags;
    
        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false, length = 20)
        @Builder.Default
        private PostStatus status = PostStatus.OPEN;
    
        @Column(name = "view_count", nullable = false)
        @Builder.Default
        private Integer viewCount = 0;
    
        /** 참여자 목록 (CREW 전용) */
        @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private java.util.List<CrewParticipant> participants = new java.util.ArrayList<>();
    
        @CreatedDate
        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;
    
        @LastModifiedDate
        @Column(name = "updated_at")
        private LocalDateTime updatedAt;
    
        // ────── 비즈니스 메서드 ──────
    
        public void reserve() {
            if (this.status != PostStatus.OPEN) {
                throw new IllegalStateException("OPEN 상태의 게시글만 예약할 수 있습니다.");
            }
            this.status = PostStatus.RESERVED;
        }
    
        public void close() {
            this.status = PostStatus.CLOSED;
        }
    
        public boolean isEditable() {
            return this.status == PostStatus.OPEN;
        }
    
        public void updateContent(String title, String content) {
            if (!isEditable()) {
                throw new IllegalStateException("예약 중이거나 마감된 게시글은 수정할 수 없습니다.");
            }
            this.title = title;
            this.content = content;
        }
    
        public void incrementViewCount() {
            this.viewCount++;
        }
    
        public void setTeams(Team homeTeam, Team awayTeam) {
            this.homeTeam = homeTeam;
            this.awayTeam = awayTeam;
        }
    
        public void setSupportTeam(Team supportTeam) {
            this.supportTeam = supportTeam;
        }
    
        public void setStadium(String stadium) {
            this.stadium = stadium;
        }
    
        public void setMatchDate(LocalDate matchDate) {
            this.matchDate = matchDate;
        }
    }
    
    ```
    

#### 4.3.2 필드 상세 명세

| 필드명 | 데이터 타입 | 컬럼명 | 제약조건 | 설명 | 비즈니스 규칙 |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INCREMENT | 게시글 고유 식별자 | 시스템 자동 생성함 |
| **author** | Member | `author_id` | FK, NOT NULL | 작성자 회원 | 작성자 본인만 수정/삭제 가능함 |
| **team** | Team | `team_id` | FK | 소속 팀 | 팀 전용 게시판 접근 권한 제어용임 |
| **homeTeam** | Team | `home_team_id` | FK | 경기 홈 팀 | 경기 정보 구성 시 참조함 |
| **awayTeam** | Team | `away_team_id` | FK | 경기 어웨이 팀 | 경기 정보 구성 시 참조함 |
| **supportTeam** | Team | `support_team_id` | FK | 응원 팀 | 모집글 작성 시 선택한 응원 팀임 |
| **boardType** | BoardType | `board_type` | ENUM, NOT NULL | 게시판 유형 | CREW, MATE, TRANSFER, TEAM_ONLY 중 택 1임 |
| **title** | String | `title` | NOT NULL, 200자 | 게시글 제목 | - |
| **content** | String | `content` | NOT NULL, TEXT | 게시글 본문 | - |
| **matchDate** | LocalDate | `match_date` | - | 경기 날짜 | 모집 및 양도 시 필수 정보임 |
| **ticketPrice** | Integer | `ticket_price` | - | 티켓 가격 | 양도(TRANSFER) 유형에서만 사용함 |
| **maxParticipants** | Integer | `max_participants` | - | 최대 모집 인원 | 크루/메이트 정원 설정용임 |
| **status** | PostStatus | `status` | ENUM, NOT NULL | 게시글 상태 | OPEN, RESERVED, CLOSED로 관리함 |
| **viewCount** | Integer | `view_count` | NOT NULL, DEFAULT 0 | 조회수 | 게시글 열람 시마다 1씩 증가함 |
| **createdAt** | LocalDateTime | `created_at` | UP_FALSE | 등록 일시 | Auditing 기능을 통해 자동 기록함 |

#### 4.3.3 비즈니스 메서드 (Domain Logic)

- **reserve()**: 게시글 상태를 'RESERVED(예약 중)'로 변경함. 단, 'OPEN' 상태일 때만 가능하도록 제어함
- **close()**: 모집 또는 양도 거래 완료 시 게시글 상태를 'CLOSED(마감)'로 변경함
- **updateContent(title, content)**: 제목과 본문을 수정함. 예약 중이거나 마감된 글은 수정할 수 없도록 정합성을 체크함
- **incrementViewCount()**: 게시글 상세 조회 시 조회수 필드를 1 증가시킴
- **setTeams / setStadium / setMatchDate**: 외부 API 또는 사용자 입력을 통해 경기 관련 정보를 동적으로 세팅함

#### 4.3.4 연관관계 매핑 및 성능 최적화

```java
// N:1 - 게시글 작성자 (회원)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "author_id", nullable = false)
private Member author;

// N:1 - 게시글 소속 구단 (팀 전용 게시판 접근 제어용)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "team_id")
private Team team;

// N:1 - 경기 홈 팀 정보
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "home_team_id")
private Team homeTeam;

// N:1 - 경기 어웨이 팀 정보
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "away_team_id")
private Team awayTeam;

// N:1 - 메이트/크루 모집 시 응원 팀 정보
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "support_team_id")
private Team supportTeam;

// 1:N - 크루 및 메이트 참여자 목록
@OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
private List<CrewParticipant> participants = new ArrayList<>();
```

- **지연 로딩 (FetchType.LAZY)**: 불필요한 조인을 방지하기 위해 지연 로딩을 적용함

#### 4.3.5 인덱스 및 데이터 제약 설계

**1) 설계 목적**

- **조회 성능 최적화**: 대량의 게시글 데이터 중 특정 게시판 유형(BoardType)이나 게시글 상태(Status)에 따른 최신순 필터링 성능을 보장함
- **복합 검색 지원**: 서비스 메인 화면 및 게시판 리스트에서 자주 사용되는 정렬 조건과 필터 조건을 결합한 복합 인덱스를 통해 쿼리 응답 속도를 향상시킴

**2) 주요 인덱스 명세**

조회 성능 향상을 위해 `Post` 테이블에 설정된 복합 인덱스(Composite Index) 내역

| 인덱스 명 | 컬럼 구성 | 설정 목적 |
| --- | --- | --- |
| **idx_post_board_type_created_at** | `board_type`, `created_at` | 크루, 메이트, 양도 등 게시판 유형별 최신순 목록 조회를 최적화하기 위함임 |
| **idx_post_status_created_at** | `status`, `created_at` | 모집 중(OPEN), 마감(CLOSED) 등 게시글 상태별 최신 게시글을 빠르게 필터링하기 위함임 |

**3) 데이터 제약 사항 (Data Constraints)**

- **외래 키 제약 (author_id)**: `Member` 엔티티와의 참조 무결성을 유지하며, 작성자가 존재하지 않는 게시글 생성을 차단함
- **상태 전이 제약**: 비즈니스 로직(`isEditable`)을 통해 `RESERVED` 또는 `CLOSED` 상태가 된 게시글은 제목과 본문 수정을 원천적으로 금지함
- **데이터 타입 제약**: `content` 필드는 `TEXT` 타입을 사용하여 긴 본문 내용을 수용하며, `title`은 200자로 제한하여 데이터 적정성을 유지함

**4) 인덱스 활용 가이드**

- **정렬 최적화**: `created_at` 컬럼이 복합 인덱스의 후행 컬럼으로 포함되어 있어, 별도의 `File Sort` 없이 인덱스 스캔만으로 최신순 정렬 결과 추출이 가능함
- **카디널리티 활용**: 게시판 유형(`board_type`)별로 데이터가 분산되어 있으므로, 검색 범위를 효과적으로 좁혀 전체 테이블 스캔 부하를 방지함
- **인덱스 확장성**: 추후 특정 팀(`team_id`) 전용 게시판의 조회 빈도가 높아질 경우, `team_id`를 포함한 추가 복합 인덱스 구성을 고려함

#### 4.3.6 게시판 유형별 필드 사용 규칙 (Constraint)

- **CREW/MATE**: `maxParticipants`, `stadium`, `supportTeam` 필드 활용함
- **TRANSFER**: `ticketPrice`, `seatArea`, `matchDate` 필드 활용함
- **TEAM_ONLY**: `team` 필드를 통해 작성자의 소속 팀 일치 여부를 검증함

### 4.4 CrewParticipant (크루&메이트 참여)

- 게시글(`Post`)과 회원(`Member`) 간의 다대다(N:M) 관계를 해소하기 위한 연결 엔티티(Mapping Entity)
- 동일한 회원이 같은 게시글에 중복 참여하는 것을 방지하기 위해 `post_id`와 `member_id`를 묶어 유니크 제약 조건(`UniqueConstraint`)을 설정함
- 참여자의 역할(방장 여부)뿐만 아니라 참여 승인 상태(`isApproved`)를 관리하여 모집 프로세스의 정교함을 높임

#### **4.4.1 기본정보**

- CrewParticipant 구현
    
    ```java
    @Entity
    @Table(name = "crew_participant",
            uniqueConstraints = @UniqueConstraint(name = "uk_crew_participant_post_member", columnNames = {"post_id", "member_id"}))
    @EntityListeners(AuditingEntityListener.class)
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @Builder
    @AllArgsConstructor
    public class CrewParticipant {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "post_id", nullable = false)
        private Post post;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "member_id", nullable = false)
        private Member member;
    
        @Column(name = "is_leader", nullable = false)
        @Builder.Default
        private Boolean isLeader = false;
    
        @Column(name = "apply_message", length = 300)
        private String applyMessage;
    
        @CreatedDate
        @Column(name = "joined_at", updatable = false)
        private LocalDateTime joinedAt;
    
        @Column(name = "is_approved")
        @Builder.Default
        private Boolean isApproved = true;
    
        public void approve() {
            this.isApproved = true;
        }
    }
    ```
    

#### 4.4.2 필드 상세 명세

| **필드명** | **데이터 타입** | **컬럼명** | **제약조건** | **설명** | **비즈니스 규칙** |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INCREMENT | 참여 고유 식별자 | 시스템 자동 생성함 |
| **post** | Post | `post_id` | FK, NOT NULL | 참여 대상 게시글 | 해당 게시글의 참여 인원으로 합류함 |
| **member** | Member | `member_id` | FK, NOT NULL | 참여 회원 | - |
| **isLeader** | Boolean | `is_leader` | NOT NULL, DEFAULT FALSE | 방장 여부 | 게시글 작성 시 true로 설정되어 권한을 가짐 |
| **applyMessage** | String | `apply_message` | 300자 | 참여 신청 메시지 | 참여 희망 시 작성하는 한 줄 인사임 |
| **joinedAt** | LocalDateTime | `joined_at` | UP_FALSE | 참여 일시 | Auditing 기능을 통해 자동 기록함 |

#### 4.4.3 비즈니스 로직 및 제약 사항

- **중복 참여 방지**: 데이터베이스 레벨에서 `uk_crew_participant_post_member` 제약을 통해 물리적인 중복 데이터를 원천 차단함
- **생성자 제어**: `@NoArgsConstructor(access = AccessLevel.PROTECTED)`를 사용하여 무분별한 객체 생성을 막고, 빌더 패턴을 통해 정합성 있는 객체 생성을 유도함
- **권한 식별**: `isLeader` 필드를 통해 채팅방 관리 및 참여자 승인 등의 비즈니스 권한 부여 여부를 판단함
- **approve()**: 참여 신청 상태를 승인(`isApproved = true`)으로 변경함. 크루장이 신청자를 확인하고 최종 멤버로 확정하는 시점에 호출함

#### 4.4.4 연관관계 매핑

```java
// N:1 - 참여 대상 게시글 (Post)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "post_id", nullable = false)
private Post post;

// N:1 - 참여한 회원 (Member)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "member_id", nullable = false)
private Member member;
```

- **Post(게시글) 및 Member(회원) 참조**:
    - 두 엔티티 모두 지연 로딩(`LAZY`)을 설정하여 불필요한 성능 저하를 방지함
    - 특히 크루/메이트 목록 조회 시 회원 정보나 게시글 정보가 즉시 필요하지 않은 경우를 대비하여 프록시 객체로 처리함

#### 4.4.6 인덱스 및 데이터 제약 설계

**1) 설계 목적**

- **중복 참여 방지**: 동일한 회원이 특정 모집 게시글(Post)에 중복으로 참여 신청을 하거나 멤버로 등록되는 것을 방지함
- **조회 성능 최적화**: 특정 게시글에 참여한 멤버 목록 조회 및 특정 회원이 참여한 활동 내역 조회 시의 성능을 보장함
- **데이터 무결성**: 애플리케이션 서비스 로직의 예외 상황에서도 데이터베이스 레벨에서 최종적인 정합성을 유지함

**2) 주요 인덱스 명세**

데이터 조회 효율성을 위해 `CrewParticipant` 테이블에 설정된 인덱스 내

| 인덱스 명 | 컬럼 구성 | 설정 목적 |
| --- | --- | --- |
| **idx_crew_participant_post_id** | `post_id` | 특정 게시글의 참여자 명단을 빠르게 로드하여 인원 현황을 파악하기 위함임 |
| **idx_crew_participant_member_id** | `member_id` | 회원의 '나의 참여 내역' 또는 활동 히스토리를 빠르게 조회하기 위함임 |

**3) 유니크 제약 조건 (Unique Constraint)**

- **대상 컬럼**: `post_id`, `member_id` (복합 컬럼)
- **제약 조건 명**: `uk_crew_participant_post_member`
- **비즈니스 효과**:
    - 한 명의 유저가 동일한 크루/메이트 모집글에 대해 한 번만 참여 상태를 가질 수 있도록 강제함
    - 동시성 이슈로 인해 다수의 참여 요청이 동시다발적으로 발생하더라도 물리적인 데이터 중복을 원천 차단함
    - 모집 정원 관리 시 데이터의 신뢰성을 보장함

**4) 제약 조건 활용 가이드**

- **상태 필드 활용**: `is_leader`와 `is_approved` 필드는 인덱스된 `post_id`와 함께 조회 조건으로 자주 사용되므로, 모집 현황(방장 식별, 승인된 멤버 수 합산 등)을 파악하는 비즈니스 로직에 최적화되어 있음
- **외래 키 참조 무결성**: `post_id`와 `member_id`에 대해 물리적인 FK(Foreign Key) 제약을 설정하여, 참조되는 게시글이나 회원이 삭제될 경우의 데이터 처리 정책을 명확히 함

### 4.5 Transfer (양도 거래)

- 티켓 양도 게시글(`Post`)과 1:1로 매핑되어 실제 금전 거래 및 티켓 전달 과정을 관리하는 에스크로 엔티티
- 거래의 안전성을 보장하기 위해 상태(`TransferStatus`) 머신을 내포하며, 정의된 비즈니스 로직에 의해서만 상태 전이가 발생하도록 설계함
- 판매자, 구매자, 상태별 조회가 빈번하므로 데이터베이스 레벨의 인덱스를 설정하여 성능을 최적화함

#### **4.5.1 기본정보**

- Transfer 구현
    
    ```java
    @Entity
    @Table(name = "transfer", indexes = {
            @Index(name = "idx_transfer_status", columnList = "status"),
            @Index(name = "idx_transfer_seller_id", columnList = "seller_id"),
            @Index(name = "idx_transfer_buyer_id", columnList = "buyer_id")
    })
    @EntityListeners(AuditingEntityListener.class)
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @Builder
    @AllArgsConstructor
    public class Transfer {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @OneToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "post_id", nullable = false, unique = true)
        private Post post;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "seller_id", nullable = false)
        private Member seller;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "buyer_id")
        private Member buyer;
    
        @Column(name = "price", nullable = false)
        private Integer price;
    
        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false, length = 20)
        @Builder.Default
        private TransferStatus status = TransferStatus.REQUESTED;
    
        @CreatedDate
        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;
    
        @LastModifiedDate
        @Column(name = "updated_at")
        private LocalDateTime updatedAt;
    
        // ────── 비즈니스 메서드 ──────
    
        /** 에스크로 결제 완료 처리 */
        public void payEscrow(Member buyer) {
            if (this.status != TransferStatus.REQUESTED) {
                throw new BusinessException(ErrorCode.TRANSFER_PAYMENT_NOT_ALLOWED);
            }
            this.buyer = buyer;
            this.status = TransferStatus.PAYMENT_COMPLETED;
        }
    
        /** 양도자가 티켓 전달 완료 처리 */
        public void markTicketSent() {
            if (this.status != TransferStatus.PAYMENT_COMPLETED) {
                throw new BusinessException(ErrorCode.TRANSFER_TICKET_SEND_NOT_ALLOWED);
            }
            this.status = TransferStatus.TICKET_SENT;
        }
    
        /** 양수자 인수 확정 → 정산 완료 */
        public void confirmTransfer() {
            if (this.status != TransferStatus.TICKET_SENT && this.status != TransferStatus.PAYMENT_COMPLETED) {
                throw new BusinessException(ErrorCode.TRANSFER_CONFIRM_NOT_ALLOWED);
            }
            this.status = TransferStatus.COMPLETED;
        }
    
        /** 거래 취소 */
        public void cancelTransfer() {
            if (this.status == TransferStatus.COMPLETED) {
                throw new BusinessException(ErrorCode.TRANSFER_CANCEL_NOT_ALLOWED);
            }
            this.status = TransferStatus.CANCELLED;
        }
    }
    
    ```
    

#### 4.5.2 필드 상세 명세

| **필드명** | **데이터 타입** | **컬럼명** | **제약조건** | **설명** | **비즈니스 규칙** |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INCREMENT | 거래 고유 식별자 | 시스템 자동 생성함 |
| **post** | Post | `post_id` | FK, UNIQUE, NOT NULL | 대상 양도 게시글 | 하나의 게시글에는 단 하나의 거래만 가능함 |
| **seller** | Member | `seller_id` | FK, NOT NULL | 판매자 (양도자) | 게시글 작성자와 동일 회원임 |
| **buyer** | Member | `buyer_id` | FK, NULLABLE | 구매자 (양수자) | 결제 완료 시점에 특정됨 |
| **price** | Integer | `price` | NOT NULL | 거래 가격 | 양도글의 티켓 가격과 연동됨 |
| **status** | TransferStatus | `status` | ENUM, NOT NULL | 거래 상태 | REQUESTED(기본) ~ COMPLETED/CANCELLED |
| **createdAt** | LocalDateTime | `created_at` | UP_FALSE | 거래 생성 일시 | Auditing 기능을 통해 자동 기록함 |
| **updatedAt** | LocalDateTime | `updated_at` | Auditing | 상태 변경 일시 | Auditing 기능을 통해 자동 기록함 |

#### 4.5.3 비즈니스 메서드 (Domain Logic)

- **payEscrow(buyer)**: 양수자가 결제를 완료했을 때 호출함. 거래 상태를 'PAYMENT_COMPLETED'로 변경하고 구매자 정보를 객체에 할당함. 요청(`REQUESTED`) 상태에서만 가능하도록 제어함
- **markTicketSent()**: 양도자가 티켓 전달(모바일 선물하기 등)을 완료했을 때 호출함. 결제 완료 상태에서만 전달 완료(`TICKET_SENT`)로 전이 가능함
- **confirmTransfer()**: 양수자가 최종적으로 티켓을 수령하고 인수 확정을 눌렀을 때 호출함. 상태를 'COMPLETED'로 변경하여 거래를 종결함
- **cancelTransfer()**: 거래를 취소함. 단, 이미 최종 완료(`COMPLETED`)된 거래는 취소할 수 없도록 예외 처리를 수행함

#### 4.5.4 연관관계 매핑

```java
// 1:1 - 대상 양도 게시글 (Post)
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "post_id", nullable = false, unique = true)
private Post post;

// N:1 - 티켓 판매자 (Seller)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "seller_id", nullable = false)
private Member seller;

// N:1 - 티켓 구매자 (Buyer)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "buyer_id")
private Member buyer;
```

- **Post (1:1, 단방향)**:
    - 하나의 양도 게시글은 반드시 하나의 실거래 기록과 매핑됨. `unique = true`를 설정하여 동일 게시글에 대한 중복 거래 생성을 원천 차단함
    - 양도 프로세스의 주체인 `Transfer`가 외래 키(`post_id`)를 관리하는 연관관계의 주인임
- **Member - seller (N:1, 단방향)**:
    - 티켓을 판매하는 회원 정보임. 게시글 작성자 정보를 직접 참조하여 거래의 주체를 명확히 함
- **Member - buyer (N:1, 단방향)**:
    - 티켓을 구매하는 회원 정보임. 거래 초기에는 미정이므로 `nullable = true`로 설정하며, 결제 로직 수행 시점에 연관관계가 형성됨
- **설계 의도**:
    - 모든 연관관계에 지연 로딩(`LAZY`)을 적용하여 거래 목록 조회 시 회원 및 게시글 본문 데이터가 불필요하게 로딩되는 성능 저하를 방지함

#### 4.5.6 인덱스 및 데이터 제약 설계

**1) 설계 목적**

- 양도 거래의 특성상 판매자, 구매자, 거래 상태에 따른 조회가 빈번하므로 데이터베이스 레벨의 인덱스를 통해 검색 성능을 최적화함
- 중복 거래 생성 및 데이터 결함을 방지하기 위해 물리적 제약 조건을 설정하여 데이터 무결성을 보장함

**2) 주요 인덱스 명세**

조회 성능 향상을 위해 `Transfer` 엔티티에 설정된 인덱스 내역

| **인덱스 명** | **컬럼 구성** | **설정 목적** |
| --- | --- | --- |
| **idx_transfer_status** | `status` | 결제 완료, 티켓 전달 등 특정 거래 단계의 목록을 빠르게 필터링하기 위함임 |
| **idx_transfer_seller_id** | `seller_id` | 회원의 '나의 판매 내역' 조회 시 검색 속도를 보장함 |
| **idx_transfer_buyer_id** | `buyer_id` | 회원의 '나의 구매 내역' 조회 시 검색 속도를 보장함 |

**3) 유니크 제약 조건 (Unique Constraint)**

- **대상 필드**: `post_id` (외래 키)
- **설정 내용**: `@OneToOne` 관계에서 `unique = true` 속성을 부여함
- **비즈니스 효과**:
    - 하나의 양도 게시글(`Post`)은 오직 하나의 거래 프로세스(`Transfer`)만 가질 수 있도록 강제함
    - 애플리케이션 로직 오류로 인해 동일한 티켓에 대해 여러 개의 결제 요청이나 거래가 생성되는 것을 데이터베이스 레이어에서 원천 차단함

**4) 인덱스 활용 가이드**

- **카디널리티 고려**: `status` 필드는 카디널리티가 낮을 수 있으나, 정산 대기나 취소 건 등 특정 상태의 데이터를 실시간으로 추출해야 하는 에스크로 시스템의 특성상 인덱스 유지가 필수적임
- **복합 쿼리 최적화**: 향후 판매자 ID와 상태를 동시에 조회하는 쿼리가 늘어날 경우, 상황에 맞춰 복합 인덱스(`seller_id`, `status`)로의 확장 가능성을 열어둠

### 4.6 ChatRoom (채팅방)

- 게시글 기반의 그룹 채팅(크루/메이트/양도)과 회원 간의 직접적인 DM(ONE_ON_ONE_DIRECT) 기능을 통합하여 관리하는 엔티티
- 채팅방의 성격에 따라 `post_id` 참조 여부가 결정되며, DM의 경우 발신자(`initiator`)와 수신자(`receiver`)를 명시적으로 식별함
- 참여자 목록과 메시지 내역에 대해 영속성 전이(`Cascade`)를 설정하여 채팅방의 라이프사이클을 효율적으로 관리함

#### **4.6.1 기본정보**

- ChatRoom 구현
    
    ```java
    @Entity
    @Table(name = "chat_room")
    @EntityListeners(AuditingEntityListener.class)
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @Builder
    @AllArgsConstructor
    public class ChatRoom {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        /** 게시글 기반 채팅방 (그룹/양도)에서만 사용. 유저 간 DM은 null. */
        @OneToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "post_id", nullable = true)
        private Post post;
    
        @Enumerated(EnumType.STRING)
        @Column(name = "room_type", nullable = false, length = 20)
        private ChatRoomType roomType;
    
        /** 유저 간 DM 발신자 (ONE_ON_ONE_DIRECT 전용) */
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "initiator_id", nullable = true)
        private Member initiator;
    
        /** 유저 간 DM 수신자 (ONE_ON_ONE_DIRECT 전용) */
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "receiver_id", nullable = true)
        private Member receiver;
    
        @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private List<ChatRoomParticipant> participants = new ArrayList<>();
    
        @OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
        @Builder.Default
        private List<ChatMessage> messages = new ArrayList<>();
    
        @CreatedDate
        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;
    
        @OneToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "ticket_post_id", nullable = true)
        private TicketPost ticketPost;
    
        public void addParticipant(Member member) {
            if (member == null) {
                return;
            }
    
            boolean alreadyJoined = participants.stream()
                    .anyMatch(participant -> participant.getMember().getId().equals(member.getId()));
            if (alreadyJoined) {
                return;
            }
    
            participants.add(ChatRoomParticipant.builder()
                    .chatRoom(this)
                    .member(member)
                    .build());
        }
    
        @Column(name = "initiator_left", nullable = false)
        @Builder.Default
        private boolean initiatorLeft = false;
    
        @Column(name = "receiver_left", nullable = false)
        @Builder.Default
        private boolean receiverLeft = false;
    
        public void markLeft(Long memberId) {
            if (initiator != null && initiator.getId().equals(memberId)) {
                this.initiatorLeft = true;
            } else if (receiver != null && receiver.getId().equals(memberId)) {
                this.receiverLeft = true;
            }
        }
    
    }
    ```
    

#### 4.6.2 필드 상세 명세

| **필드명** | **데이터 타입** | **컬럼명** | **제약조건** | **설명** | **비즈니스 규칙** |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INCREMENT | 채팅방 고유 식별자 | 시스템 자동 생성함 |
| **post** | Post | `post_id` | FK, 1:1, NULLABLE | 연관 게시글 | 게시글 기반 채팅방에서만 사용하며, 유저 간 DM은 null임 |
| **roomType** | ChatRoomType | `room_type` | ENUM, NOT NULL, LENGTH 20 | 채팅방 유형 | 게시글 기반 채팅방인지, 유저 간 1:1 DM인지 구분함 |
| **initiator** | Member | `initiator_id` | FK, NULLABLE | DM 발신자 | `ONE_ON_ONE_DIRECT` 유형에서만 사용함 |
| **receiver** | Member | `receiver_id` | FK, NULLABLE | DM 수신자 | `ONE_ON_ONE_DIRECT` 유형에서만 사용함 |
| **participants** | List<ChatRoomParticipant> | - | 1:N | 채팅방 참여자 목록 | 채팅방에 소속된 전체 참여자 정보를 관리함 |
| **messages** | List<ChatMessage> | - | 1:N | 채팅 메시지 목록 | 채팅방 내 송수신된 메시지 내역을 관리함 |
| **createdAt** | LocalDateTime | `created_at` | UP_FALSE | 채팅방 생성 일시 | Auditing 기능을 통해 자동 기록함 |
| **ticketPost** | TicketPost | `ticket_post_id` | FK, 1:1, NULLABLE | 연관 티켓 양도 게시글 | 티켓 양도 전용 채팅방에서 사용하며, 일반 채팅방은 null일 수 있음 |
| **initiatorLeft** | boolean | `initiator_left` | NOT NULL | 발신자 퇴장 여부 | DM 발신자가 채팅방을 나갔는지 여부를 저장함 |
| **receiverLeft** | boolean | `receiver_left` | NOT NULL | 수신자 퇴장 여부 | DM 수신자가 채팅방을 나갔는지 여부를 저장함 |

#### 4.6.3 비즈니스 메서드 (Domain Logic)

- **addParticipant(member)**:
    - 채팅방에 새로운 참여자를 추가하는 기능을 수행함
    - 전달받은 `member`가 null이면 아무 작업도 수행하지 않음
    - 이미 참여 중인 회원인지 `participants` 목록을 순회하여 중복 여부를 검증함
    - 아직 참여하지 않은 회원인 경우 `ChatRoomParticipant` 객체를 생성하여 참여자 목록에 추가함
    - 이를 통해 동일 회원의 중복 참여를 방지하고 채팅방 참여자 데이터의 정합성을 유지함
- **markLeft(memberId)**:
    - 특정 회원이 채팅방에서 나간 상태를 표시하는 기능을 수행함
    - 전달받은 `memberId`가 `initiator`와 일치하면 `initiatorLeft`를 `true`로 변경함
    - 전달받은 `memberId`가 `receiver`와 일치하면 `receiverLeft`를 `true`로 변경함
    - DM 채팅방에서 각 참여자의 퇴장 여부를 개별적으로 관리하기 위한 로직임

#### 4.6.4 연관관계 매핑

```java
// 1:1 - 연관된 일반 게시글 기반 채팅방
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "post_id", nullable = true)
private Post post;

// N:1 - DM 시작자 (발신자)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "initiator_id", nullable = true)
private Member initiator;

// N:1 - DM 대상자 (수신자)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "receiver_id", nullable = true)
private Member receiver;

// 1:N - 채팅방 참여자 상세 목록
@OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private List<ChatRoomParticipant> participants = new ArrayList<>();

// 1:N - 채팅방 내 발생한 메시지 내역
@OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
@Builder.Default
private List<ChatMessage> messages = new ArrayList<>();

// 1:1 - 연관된 티켓 양도 게시글 기반 채팅방
@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "ticket_post_id", nullable = true)
private TicketPost ticketPost;
```

**매핑 상세 설명**

- **Post(일반 게시글)와의 관계**:
    - 일반 모집글 또는 커뮤니티성 게시글을 기반으로 생성되는 채팅방과 1:1 관계를 형성함
    - 유저 간 직접 DM 채팅방에서는 게시글 참조가 필요 없으므로 `nullable = true`로 설정함
- **TicketPost(티켓 양도 게시글)와의 관계**:
    - 티켓 양도글을 기반으로 생성되는 채팅방과 1:1 관계를 형성함
    - 일반 게시글 채팅방 또는 DM 채팅방에서는 사용되지 않으므로 `nullable = true`로 설정함
    - 이를 통해 채팅방 생성 출처를 일반 게시글과 티켓 양도 게시글로 구분하여 관리할 수 있음
- **Member(발신자/수신자)와의 관계**:
    - 특정 게시글과 무관하게 회원 간 직접 대화를 시작하는 경우를 위해 `initiator`, `receiver` 필드를 별도로 구성함
    - `roomType`이 `ONE_ON_ONE_DIRECT`인 경우에만 의미를 가지며, 게시글 기반 채팅방에서는 null일 수 있음
    - 지연 로딩(`LAZY`)을 통해 실제 회원 정보가 필요한 시점까지 로딩을 유예하여 성능을 관리함
- **ChatRoomParticipant(참여자)와의 관계**:
    - 하나의 채팅방은 여러 참여자를 가질 수 있으므로 1:N 관계로 설계함
    - `CascadeType.ALL` 및 `orphanRemoval = true`를 적용하여 채팅방 생명주기와 참여자 데이터를 함께 관리함
    - 참여자 추가는 `addParticipant()` 메서드를 통해 중복을 방지하면서 처리함
- **ChatMessage(메시지)와의 관계**:
    - 하나의 채팅방에는 여러 개의 메시지가 누적되므로 1:N 관계로 설계함
    - 채팅방 삭제 시 연관된 메시지도 함께 삭제되도록 `CascadeType.ALL` 및 `orphanRemoval = true`를 적용함
    - 이를 통해 채팅방과 메시지 간 라이프사이클 일관성을 유지함

### 4.7 ChatRoomParticipant (채팅방 참여자)

- 채팅방(`ChatRoom`)과 회원(`Member`) 간의 다대다(N:M) 관계를 해소하기 위한 연결 엔티티(Mapping Entity)
- 특정 회원이 동일한 채팅방에 중복으로 참여하는 것을 물리적으로 차단하기 위해 복합 유니크 제약 조건을 설정함
- 지연 로딩을 통해 채팅 목록 조회 및 메시지 송수신 시 불필요한 연관 객체 로딩을 방지함

#### **4.7.1 기본정보**

- ChatRoomParticipant 구현
    
    ```java
    @Entity
    @Table(
            name = "chat_room_participant",
            uniqueConstraints = {
                    @UniqueConstraint(name = "uk_chat_room_participant_room_member", columnNames = {"chat_room_id", "member_id"})
            }
    )
    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    public class ChatRoomParticipant {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "chat_room_id", nullable = false)
        private ChatRoom chatRoom;
    
        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "member_id", nullable = false)
        private Member member;
    }
    
    ```
    

### 4.7.2 필드 상세 명세

| **필드명** | **데이터 타입** | **컬럼명** | **제약조건** | **설명** | **비즈니스 규칙** |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INCREMENT | 참여자 고유 식별자 | 시스템 자동 생성함 |
| **chatRoom** | ChatRoom | `chat_room_id` | FK, NOT NULL | 참여 대상 채팅방 | 해당 채팅방의 소속 멤버로 등록됨 |
| **member** | Member | `member_id` | FK, NOT NULL | 참여 회원 | - |

#### 4.7.3 비즈니스 로직 및 제약 사항

- **중복 참여 방지**: `uk_chat_room_participant_room_member` 제약을 통해 (채팅방 ID, 회원 ID) 조합의 유일성을 보장함. 이를 통해 동일한 유저가 한 채팅방에 두 번 입장하는 데이터 결함을 방지함
- **생성자 제어**: `@NoArgsConstructor(access = AccessLevel.PROTECTED)`를 적용하여 외부에서의 무분별한 객체 생성을 제한하고, JPA의 프록시 생성을 지원함
- **불변성 유지**: 필드에 대한 별도의 수정 메서드(Setter 등)를 제공하지 않으며, 참여 시점에 빌더 패턴을 통해 객체를 생성하여 데이터의 신뢰성을 높임

#### 4.7.4 연관관계 매핑

```java
// N:1 - 속해 있는 채팅방 (ChatRoom)
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "chat_room_id", nullable = false)
private ChatRoom chatRoom;

// N:1 - 채팅방에 참여한 회원 (Member)
@ManyToOne(fetch = FetchType.LAZY, optional = false)
@JoinColumn(name = "member_id", nullable = false)
private Member member;
```

**매핑 상세 설명**

- **ChatRoom(채팅방)과의 관계**:
    - 여러 명의 참여자가 하나의 채팅방에 속하는 N:1 관계임
    - `optional = false` 설정을 통해 참여 정보는 반드시 유효한 채팅방 정보를 포함해야 함을 명시함
    - 지연 로딩(`LAZY`)을 통해 참여자 목록 조회 시 채팅방의 상세 정보(게시글 정보 등)가 즉시 조회되지 않도록 성능을 관리함
- **Member(회원)과의 관계**:
    - 한 회원이 여러 채팅방에 참여할 수 있는 N:1 관계임
    - 지연 로딩을 적용하여 메시지 작성자 식별 시 필요한 시점에만 회원 데이터를 조회하도록 최적화함

#### **4.7.6 인덱스 및 데이터 제약 설계**

**1) 설계 목적**

- 특정 채팅방에 속한 모든 멤버를 빠르게 조회하거나, 특정 회원이 속한 채팅방 목록을 효율적으로 필터링하여 실시간 통신 성능을 보장함
- 데이터베이스 레벨에서 물리적 제약 조건을 설정하여 애플리케이션 계층의 동시성 이슈로 발생할 수 있는 데이터 중복을 방지함

**2) 주요 인덱스 명세**

조회 성능 향상을 위해 `ChatRoomParticipant` 엔티티에 설정된 인덱스 내역

| 인덱스 명 | 컬럼 구성 | 설정 목적 |
| --- | --- | --- |
| **uk_chat_room_participant_room_member** | `chat_room_id`, `member_id` | 채팅방별 멤버 조회 성능 향상 및 중복 참여 방지를 위한 복합 유니크 인덱스임 |
| **idx_chat_room_participant_member_id** | `member_id` | 회원이 참여 중인 채팅방 목록('나의 채팅')을 빠르게 조회하기 위함임 |

**3) 유니크 제약 조건 (Unique Constraint)**

- **대상 필드**: `chat_room_id`, `member_id` (복합 컬럼)
- **설정 내용**: `@Table` 수준에서 `uniqueConstraints`를 통해 설정함
- **비즈니스 효과**:
    - 특정 채팅방에 유저가 중복 입장하여 메시지 수신이 중복되거나 참여자 수가 부정확해지는 현상을 차단함
    - 데이터베이스 레이어에서 최종적인 정합성 가드 역할을 수행하여 시스템 신뢰도를 높임

**4) 인덱스 활용 가이드**

- **조인 성능 최적화**: 채팅방과 회원 테이블 간의 다대다 조인 시, 복합 인덱스를 활용하여 인덱스 스캔만으로 참여 여부를 판단할 수 있도록 설계함
- **데이터 무결성 가이드**: 서비스 레이어의 참여 로직 실행 전 중복 체크를 수행함과 동시에, DB 유니크 제약을 통해 예외 상황에서의 무결성을 최종 보장함

### 4.8 ChatMessage (채팅 메시지)

- 특정 채팅방에서 송수신된 메시지 내역을 저장하고 관리하는 엔티티
- 메시지 작성자, 본문 내용, 메시지 타입(입장, 퇴장, 대화 등) 및 발송 시점을 기록
- 대량의 메시지 데이터 조회를 고려하여 채팅방별 시간순 정렬 최적화를 위한 인덱스를 설정

#### 4.8.1 기본정보

- ChatMessage 구현
    
    ```java
    @Entity
    @Table(name = "chat_message")
    @EntityListeners(AuditingEntityListener.class)
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @Builder
    @AllArgsConstructor
    public class ChatMessage {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "chat_room_id", nullable = false)
        private ChatRoom chatRoom;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "sender_id", nullable = false)
        private Member sender;
    
        @Column(name = "content", nullable = false, columnDefinition = "TEXT")
        private String content;
    
        @Enumerated(EnumType.STRING)
        @Column(name = "message_type", nullable = false, length = 10)
        private ChatMessageType type;
    
        @CreatedDate
        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;
    }
    ```
    

#### 4.8.2 필드 상세 명세

| **필드명** | **데이터 타입** | **컬럼명** | **제약조건** | **설명** | **비즈니스 규칙** |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INC | 메시지 고유 식별자 | 시스템 자동 생성함 |
| **chatRoom** | ChatRoom | `chat_room_id` | FK, NOT NULL | 소속 채팅방 | 해당 메시지가 발송된 방을 참조함 |
| **sender** | Member | `sender_id` | FK, NOT NULL | 발신자 | 메시지를 작성한 회원 정보임 |
| **content** | String | `content` | NOT NULL, TEXT | 메시지 본문 | 시스템 메시지나 대화 내용을 포함함 |
| **type** | ChatMessageType | `message_type` | ENUM, NOT NULL | 메시지 유형 | TALK, ENTER, LEAVE 등으로 구분함 |
| **createdAt** | LocalDateTime | `created_at` | UP_FALSE | 발송 일시 | Auditing 기능을 통해 자동 기록함 |

#### 4.8.3 비즈니스 로직 및 제약 사항

- **메시지 불변성**: 채팅 메시지는 한 번 발송되면 내용을 수정할 수 없도록 설계하여 데이터의 신뢰성을 보장함
- **생성자 제어**: `@NoArgsConstructor(access = AccessLevel.PROTECTED)`를 적용하여 무분별한 객체 생성을 제한하고 JPA 프록시 객체 생성을 지원함
- **타입 기반 처리**: `message_type` 필드를 통해 단순 대화인지 시스템 공지(입장/퇴장)인지를 구분하여 UI 렌더링 시 활용함

#### 4.8.4 연관관계 매핑

```java
// N:1 - 메시지가 속한 채팅방 (ChatRoom)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "chat_room_id", nullable = false)
private ChatRoom chatRoom;

// N:1 - 메시지를 발송한 회원 (Member)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "sender_id", nullable = false)
private Member sender;
```

**매핑 상세 설명**

- **ChatRoom(채팅방)과의 관계**: 다수의 메시지가 하나의 채팅방에 속하는 N:1 관계임. 지연 로딩(LAZY)을 적용하여 메시지 목록 조회 시 채팅방의 상세 정보가 즉시 로딩되지 않도록 성능을 관리함
- **Member(발신자)와의 관계**: 한 회원이 여러 메시지를 작성할 수 있는 N:1 관계임. 메시지 작성자의 프로필 정보 등이 필요한 시점에만 데이터를 로드하도록 최적화함

#### 4.8.5 인덱스 및 데이터 제약 설계

**1) 설계 목적**

- 채팅방 진입 시 기존 메시지 내역을 시간순(과거순 또는 최신순)으로 빠르게 불러오기 위한 조회 성능을 확보함
- 채팅방 ID와 발송 시점을 결합한 인덱스를 통해 대량의 메시지 데이터 사이에서도 특정 방의 대화 내역만 효율적으로 추출함

**2) 주요 인덱스 명세**

조회 성능 향상을 위해 ChatMessage 엔티티에 설정된 인덱스 내역.

| **인덱스 명** | **컬럼 구성** | **설정 목적** |
| --- | --- | --- |
| **idx_chat_message_room_created_at** | `chat_room_id`, `created_at` | 특정 채팅방의 대화 내역을 시간순으로 정렬하여 조회하기 위함 |
| **idx_chat_message_sender_id** | `sender_id` | 특정 회원이 작성한 전체 메시지 이력을 추적하거나 관리하기 위함 |

**3) 유니크 제약 조건 (Unique Constraint)**

- 비즈니스 효과:
    - 채팅 메시지는 중복 발송(동일 내용, 동일 시간)이 비즈니스적으로 발생 가능하므로 유니크 제약을 설정하지 않음
    - 대신 PK(`id`)를 통해 각 메시지의 유일성을 물리적으로 보장함

**4) 인덱스 활용 가이드**

- 조회 최적화: 채팅 내역 로딩 시 `WHERE chat_room_id = ? ORDER BY created_at ASC` 쿼리가 주를 이루므로, 복합 인덱스(`chat_room_id`, `created_at`)를 활용하여 인덱스 스캔만으로 결과를 반환함
- 데이터 파티셔닝 고려: 향후 메시지 데이터가 기하급수적으로 늘어날 경우, `created_at`을 기준으로 한 테이블 파티셔닝이나 오래된 메시지의 아카이빙 전략을 고려함

### 4.9 **ChatReadStatus (채팅 메시지 읽음 여부)**

- 채팅방 내 회원별 마지막으로 읽은 메시지 위치를 추적하여 읽지 않은 메시지 수를 관리하는 엔티티
- 특정 회원이 채팅방에서 마지막으로 확인한 메시지 식별자와 갱신 시점을 기록
- 실시간 채팅 서비스에서 개별 사용자의 읽지 않은 메시지(Unread Count)를 정확히 산출하기 위한 기준 데이터로 활용

#### 4.9.1 기본 정보

- ChatReadStatus 구현
    
    ```java
    @Entity
    @Table(name = "chat_read_status",
            uniqueConstraints = @UniqueConstraint(
                    name = "uk_chat_read_status_room_member",
                    columnNames = {"chat_room_id", "member_id"}
            ))
    @EntityListeners(AuditingEntityListener.class)
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @Builder
    @AllArgsConstructor
    public class ChatReadStatus {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "chat_room_id", nullable = false)
        private ChatRoom chatRoom;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "member_id", nullable = false)
        private Member member;
    
        @Column(name = "last_read_message_id")
        private Long lastReadMessageId;
    
        @LastModifiedDate
        @Column(name = "updated_at")
        private LocalDateTime updatedAt;
    
        public void updateLastRead(Long messageId) {
            this.lastReadMessageId = messageId;
        }
    }
    ```
    

#### 4.9.2 필드 상세 명세

| **필드명** | **데이터 타입** | **컬럼명** | **제약조건** | **설명** | **비즈니스 규칙** |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INC | 상태 고유 식별자 | 시스템 자동 생성함 |
| **chatRoom** | ChatRoom | `chat_room_id` | FK, NOT NULL | 대상 채팅방 | 해당 채팅방의 읽음 상태를 관리함 |
| **member** | Member | `member_id` | FK, NOT NULL | 대상 회원 | 특정 회원의 읽음 위치를 식별함 |
| **lastReadMessageId** | Long | `last_read_message_id` | - | 마지막 읽은 메시지 ID | 읽지 않은 메시지 계산의 기준점임 |
| **updatedAt** | LocalDateTime | `updated_at` | Auditing |  |  |

#### 4.9.3 비즈니스 로직 및 제약 사항

- **updateLastRead(messageId)**: 회원이 새로운 메시지를 확인했을 때 마지막 읽은 메시지 식별자를 갱신함
- **중복 상태 방지**: `uk_chat_read_status_room_member` 제약을 통해 한 회원이 특정 채팅방에 대해 하나의 읽음 상태만 가질 수 있도록 보장함
- **데이터 최적화**: 메시지 엔티티 전체를 참조하는 대신 ID(Long)만을 저장하여 불필요한 연관관계 로딩 부하를 줄임

#### 4.9.4 연관관계 매핑

```java
// N:1 - 대상 채팅방 (ChatRoom)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "chat_room_id", nullable = false)
private ChatRoom chatRoom;

// N:1 - 대상 회원 (Member)
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "member_id", nullable = false)
private Member member;
```

- **ChatRoom(채팅방) 및 Member(회원) 참조**: 지연 로딩을 통해 읽음 상태 조회 시 불필요한 엔티티 데이터가 로드되지 않도록 설계함
- **배지 카운트 활용**: 특정 회원의 채팅 목록에서 미확인 메시지 수를 노출하기 위한 핵심 데이터로 활용함

#### 4.9.5 인덱스 및 데이터 제약 설계

**1) 설계 목적**

- 채팅 목록 진입 시마다 발생하는 읽음 위치 조회의 성능을 확보하고 데이터 무결성을 유지함

**2) 주요 인덱스 명세**

| **인덱스 명** | **컬럼 구성** | **설정 목적** |
| --- | --- | --- |
| **uk_chat_read_status_room_member** | `chat_room_id`, `member_id` | 채팅방별 멤버의 읽음 상태 중복 생성을 방지하고 빠른 조회를 위함 |

**3) 유니크 제약 조건 (Unique Constraint)**

- 대상 필드: `chat_room_id`, `member_id` (복합 컬럼)
- 설정 내용: `@Table` 수준에서 uniqueConstraints를 통해 설정함
- 비즈니스 효과: 특정 채팅방에 대해 유저별로 단 하나의 읽음 위치 기록만 존재하도록 물리적으로 강제함

### 4.10 RefreshToken (리프레시 토큰)

- 회원의 로그인 상태를 유지하고 액세스 토큰 재발급에 사용되는 리프레시 토큰 정보를 저장하고 관리하는 엔티티
- 토큰 값, 회원 식별자, 만료 시점을 기록하여 인증 시스템에서 재발급 및 만료 검증에 활용
- 회원당 하나의 리프레시 토큰만 유지하도록 설계하여 중복 발급 및 관리 복잡도를 방지함

#### 4.10.1 기본 정보

- RefreshToken 구현
    
    ```java
    @Entity
    @Table(name = "refresh_token")
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    @Builder
    public class RefreshToken {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @Column(name = "token", nullable = false, unique = true, length = 500)
        private String token;
    
        @Column(name = "member_id", nullable = false, unique = true)
        private Long memberId;
    
        @Column(name = "expiry_at", nullable = false)
        private LocalDateTime expiryAt;
    
        public void updateToken(String token, LocalDateTime expiryAt) {
            this.token = token;
            this.expiryAt = expiryAt;
        }
    }
    ```
    

#### 4.10.2 필드 상세 명세

| **필드명** | **데이터 타입** | **컬럼명** | **제약조건** | **설명** | **비즈니스 규칙** |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INC | 리프레시 토큰 고유 식별자 | 시스템이 자동 생성함 |
| **token** | String | `token` | NOT NULL, UNIQUE, LENGTH 500 | 리프레시 토큰 문자열 | 동일한 토큰 값은 중복 저장할 수 없음 |
| **memberId** | Long | `member_id` | NOT NULL, UNIQUE | 회원 식별자 | 회원당 하나의 리프레시 토큰만 저장함 |
| **expiryAt** | LocalDateTime | `expiry_at` | NOT NULL | 토큰 만료 일시 | 현재 시각이 만료 시점을 초과하면 사용할 수 없음 |

#### 4.10.3 비즈니스 로직 및 제약 사항

- **회원별 단일 토큰 관리**: `member_id`에 UNIQUE 제약을 적용하여 한 회원이 동시에 여러 개의 리프레시 토큰을 가지지 않도록 제한함
- **토큰 고유성 보장**: `token` 컬럼에 UNIQUE 제약을 적용하여 동일한 토큰 문자열이 중복 저장되지 않도록 보장함
- **토큰 갱신 지원**: `updateToken()` 메서드를 통해 기존 회원의 리프레시 토큰 값을 새로운 토큰으로 교체하고 만료 시점을 함께 갱신함
- **만료 기반 인증 제어**: `expiry_at` 값을 기준으로 토큰 유효 여부를 판단하며, 만료된 토큰은 재발급 요청에 사용할 수 없음
- **생성자 제어**: `@NoArgsConstructor(access = AccessLevel.PROTECTED)`를 적용하여 무분별한 객체 생성을 제한하고 JPA 기본 생성 요건을 만족시킴

#### 4.10.4 연관관계 매핑

```java
@Column(name = "member_id", nullable = false, unique = true)
private Long memberId;
```

**매핑 상세 설명**

- **Member와의 관계**: 현재 엔티티는 `Member` 엔티티와 직접적인 객체 연관관계를 맺지 않고, `member_id`를 값 타입으로 저장하는 구조임
- **설계 의도**: 인증 처리에서는 회원 객체 전체보다 회원 식별자 기반 조회가 더 단순하고 효율적이므로, 불필요한 조인과 연관 객체 로딩을 방지하기 위해 단방향 연관관계 대신 FK 값만 관리함
- **확장 고려사항**: 향후 회원 엔티티와의 직접 연관관계가 필요할 경우 `@ManyToOne` 또는 `@OneToOne` 매핑으로 확장할 수 있으나, 현재 구조에서는 인증 성능과 단순성을 우선함

#### 4.10.5 인덱스 및 데이터 제약 설계

**1) 설계 목적**

- 리프레시 토큰 기반 재발급 요청 시 빠르게 토큰 정보를 조회하고 검증하기 위함
- 회원별 단일 토큰 정책을 유지하여 인증 상태를 명확하게 관리하기 위함
- 만료 토큰 정리 및 재발급 처리 시 토큰 값과 회원 ID를 기준으로 효율적으로 접근하기 위함

**2) 주요 인덱스 명세**

조회 및 무결성 확보를 위해 RefreshToken 엔티티에 적용되는 주요 제약 및 인덱스 성격의 내역.

| **인덱스 명** | **컬럼 구성** | **설정 목적** |
| --- | --- | --- |
| **uk_refresh_token_token** | `token` | 토큰 문자열의 중복을 방지하고 토큰 기반 조회 성능을 확보하기 위함 |
| **uk_refresh_token_member_id** | `member_id` | 회원당 1개의 리프레시 토큰만 허용하고 회원 기준 조회를 빠르게 처리하기 위함 |

**3) 유니크 제약 조건 (Unique Constraint)**

- `token`
    - 각 리프레시 토큰 문자열의 유일성을 보장함
    - 토큰 탈취나 중복 저장으로 인한 인증 충돌 가능성을 줄임
- `member_id`
    - 한 회원이 여러 개의 리프레시 토큰을 동시에 보유하지 않도록 제어함
    - 재로그인 또는 재발급 시 기존 토큰을 갱신하는 구조를 자연스럽게 지원함

**4) 인덱스 활용 가이드**

- 조회 최적화: `WHERE token = ?` 형태로 리프레시 토큰을 검증하는 경우가 많으므로 `token`의 UNIQUE 인덱스를 활용하여 빠르게 조회함
- 회원 기준 관리: 로그아웃, 재로그인, 토큰 재발급 시 `WHERE member_id = ?` 조회가 빈번하므로 `member_id` 인덱스를 활용함
- 만료 데이터 관리: 만료 시각(`expiry_at`)은 현재 인덱스로 직접 관리되지 않으므로, 향후 만료 토큰 일괄 삭제 작업이 빈번해질 경우 `expiry_at` 단일 인덱스 추가를 고려할 수 있음
- 운영 확장성: 인증 서버 규모가 커지고 토큰 정리 배치가 빈번해질 경우, `expiry_at` 기준 배치 삭제 정책 또는 TTL 성격의 스케줄링 전략을 함께 고려함

### 4.11 Attendance (직관 기록)

- 회원이 야구 경기 직관 내역을 기록하고 관리하는 엔티티
- 직관한 날짜, 경기 결과, 인증 이미지, 메모 정보를 저장하여 개인별 직관 이력을 관리함
- 회원별 직관 기록 조회 및 추후 직관 통계, 회고, 인증 기능 등에 활용할 수 있도록 설계함

#### 4.11.1 기본 정보

- Attendance 구현
    
    ```java
    @Entity
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    @Builder
    public class Attendance {
    
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "member_id")
        private Member member; // 작성자
    
        private LocalDate matchDate; // 직관 날짜
    
        @Enumerated(EnumType.STRING)
        private MatchResult result; // 승패 결과
    
        private String imageUrl; // 로컬에 저장된 이미지 접근 주소 (예: /uploads/images/xxx.jpg)
    
        @Column(columnDefinition = "TEXT")
        private String memo;
    }
    ```
    

#### 4.11.2 필드 상세 명세

| **필드명** | **데이터 타입** | **컬럼명** | **제약조건** | **설명** | **비즈니스 규칙** |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INC | 직관 기록 고유 식별자 | 시스템이 자동 생성함 |
| **member** | Member | `member_id` | FK | 작성 회원 | 직관 기록을 등록한 회원을 참조함 |
| **matchDate** | LocalDate | `match_date` | - | 직관 날짜 | 실제 경기를 관람한 날짜를 저장함 |
| **result** | MatchResult | `result` | ENUM | 경기 결과 | WIN, LOSE, DRAW 등 경기 결과를 저장함 |
| **imageUrl** | String | `image_url` | - | 인증 이미지 경로 | 직관 인증 사진의 접근 경로를 저장함 |
| **memo** | String | `memo` | TEXT | 메모 | 직관 소감이나 특이사항을 자유롭게 기록함 |

#### 4.11.3 비즈니스 로직 및 제약 사항

- **직관 이력 관리**: 회원은 경기 관람 후 해당 날짜와 결과를 기록하여 자신의 직관 이력을 관리할 수 있음
- **인증 이미지 저장**: `imageUrl` 필드를 통해 직관 인증 사진 경로를 저장하며, 추후 이미지 업로드/조회 기능과 연계 가능함
- **메모 확장성**: `memo`는 `TEXT` 타입으로 설정하여 비교적 긴 소감이나 기록도 저장할 수 있도록 설계함
- **결과값 제한**: `result`는 `MatchResult` enum으로 관리하여 허용된 경기 결과만 저장되도록 제어함
- **생성자 제어**: `@NoArgsConstructor(access = AccessLevel.PROTECTED)`를 적용하여 무분별한 객체 생성을 제한하고 JPA 요구사항을 만족시킴

#### 4.11.4 연관관계 매핑

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "member_id")
private Member member;
```

**매핑 상세 설명**

- **Member(회원)과의 관계**: 하나의 회원은 여러 개의 직관 기록을 작성할 수 있으므로 N:1 관계로 설계함
- **지연 로딩 적용**: `fetch = FetchType.LAZY`를 통해 직관 기록 조회 시 회원 상세 정보를 즉시 불러오지 않고, 실제 필요한 시점에만 로딩하여 성능을 관리함
- **작성자 기준 데이터 관리**: 특정 회원의 직관 기록 목록 조회, 마이페이지 기능, 직관 통계 기능 등에 활용할 수 있음

#### 4.11.5 인덱스 및 데이터 제약 설계

**1) 설계 목적**

- 회원별 직관 기록을 빠르게 조회하고, 날짜순 정렬 기반의 이력 관리 기능을 지원하기 위함
- 추후 월별/연도별 직관 횟수 집계, 경기 결과 통계, 인증 이력 관리 기능에 활용하기 위함

**2) 주요 인덱스 명세**

현재 코드상 명시적 인덱스는 정의되어 있지 않으나, 서비스 확장을 고려할 때 아래 인덱스를 우선 검토할 수 있음.

| **인덱스 명** | **컬럼 구성** | **설정 목적** |
| --- | --- | --- |
| **idx_attendance_member_id** | `member_id` | 특정 회원의 직관 기록 목록을 빠르게 조회하기 위함 |
| **idx_attendance_member_match_date** | `member_id`, `match_date` | 회원별 직관 기록을 날짜순으로 조회하거나 기간별 필터링하기 위함 |

**3) 유니크 제약 조건 (Unique Constraint)**

- 현재 엔티티에는 유니크 제약 조건이 설정되어 있지 않음
- 비즈니스적으로 동일 회원이 동일 날짜에 여러 기록을 남길 가능성이 없다면, 추후 `member_id + match_date` 조합에 대한 유니크 제약을 검토할 수 있음
- 다만 더블헤더 경기, 중복 인증 등록 허용 여부 등 정책이 확정되지 않았으므로 현재는 유니크 제약 없이 설계함

**4) 인덱스 활용 가이드**

- 조회 최적화: `WHERE member_id = ? ORDER BY match_date DESC` 형태의 조회가 자주 발생할 수 있으므로, `member_id`, `match_date` 복합 인덱스를 고려할 수 있음
- 통계 처리: 특정 회원의 시즌별 직관 횟수, 승률 통계 등을 계산할 때 `member_id`, `result`, `match_date` 조합의 조회 패턴을 분석하여 추가 인덱스를 검토할 수 있음
- 이미지 관리: `image_url`은 일반적으로 검색 조건보다 단순 표시용으로 활용되므로 별도 인덱스는 필요하지 않음
- 운영 확장성: 직관 기록 수가 증가할 경우, 오래된 이미지 파일의 보관 정책과 함께 데이터 아카이빙 전략도 고려할 수 있음

### 4.12 BaseballGame (경기 데이터)

- 외부 API(예: 네이버 스포츠 API)로부터 수집한 야구 경기 정보를 저장하고 관리하는 엔티티
- 경기 고유 ID, 경기 일자/시간, 홈팀/원정팀, 점수, 경기장, 경기 상태, 취소 여부 등을 기록
- 경기 일정 조회, 경기 결과 확인, 직관 기록 연계, 팀별 경기 통계 등의 기능을 위한 기준 데이터로 활용함

#### 4.12.1 기본 정보

- BaseballGame 구현
    
    ```java
    @Entity
    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Table(name = "baseball_games")
    public class BaseballGame {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id; // DB 자체 고유 번호 (PK)
    
        @Column(name = "game_id", unique = true, nullable = false)
        private String gameId; // 네이버 API의 게임 고유 ID (중복 저장 방지용)
    
        @Column(name = "is_canceled")
        private boolean isCanceled;
        @Column(name = "game_date")
        private String gameDate;
        @Column(name = "game_time")
        private String gameTime;
        @Column(name = "home_team")
        private String homeTeam;
        @Column(name = "away_team")
        private String awayTeam;
        @Column(name = "home_score")
        private Integer homeScore;
        @Column(name = "away_score")
        private Integer awayScore;
        @Column(name = "stadium")
        private String stadium;
        @Column(name = "status")
        private String status;
    }
    
    ```
    

#### 4.12.2 필드 상세 명세

| **필드명** | **데이터 타입** | **컬럼명** | **제약조건** | **설명** | **비즈니스 규칙** |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INC | 경기 정보 고유 식별자 | 시스템이 자동 생성함 |
| **gameId** | String | `game_id` | NOT NULL, UNIQUE | 외부 API 경기 고유 ID | 동일 경기의 중복 저장을 방지함 |
| **isCanceled** | boolean | `is_canceled` | - | 경기 취소 여부 | 우천 취소, 노게임 등 경기 진행 불가 상태를 저장함 |
| **gameDate** | String | `game_date` | - | 경기 일자 | 외부 API 기준 경기 날짜를 문자열로 저장함 |
| **gameTime** | String | `game_time` | - | 경기 시작 시간 | 외부 API 기준 경기 시간을 문자열로 저장함 |
| **homeTeam** | String | `home_team` | - | 홈팀명 | 홈팀 정보를 문자열로 저장함 |
| **awayTeam** | String | `away_team` | - | 원정팀명 | 원정팀 정보를 문자열로 저장함 |
| **homeScore** | Integer | `home_score` | - | 홈팀 점수 | 경기 진행 중 또는 종료 후 점수를 저장함 |
| **awayScore** | Integer | `away_score` | - | 원정팀 점수 | 경기 진행 중 또는 종료 후 점수를 저장함 |
| **stadium** | String | `stadium` | - | 경기장명 | 경기가 열리는 구장 정보를 저장함 |
| **status** | String | `status` | - | 경기 상태 | 예정, 진행중, 종료, 취소 등의 상태를 저장함 |

#### 4.12.3 비즈니스 로직 및 제약 사항

- **외부 경기 식별자 관리**: `gameId`에 UNIQUE 제약을 두어 외부 API에서 동일 경기를 여러 번 수집하더라도 중복 저장되지 않도록 보장함
- **경기 상태 관리**: `status` 필드를 통해 경기 예정, 진행 중, 종료, 취소 등의 상태를 표현할 수 있음
- **취소 경기 구분**: `isCanceled` 필드를 별도로 두어 상태 문자열과 관계없이 취소 여부를 명확히 판단할 수 있도록 설계함
- **점수 정보 유연성 확보**: `homeScore`, `awayScore`는 경기 시작 전에는 null일 수 있고, 경기 진행 또는 종료 후 값이 채워질 수 있음
- **문자열 기반 일정 저장**: `gameDate`, `gameTime`을 문자열로 관리하여 외부 API 원본 형식을 그대로 저장할 수 있도록 구성함
- **확장 고려사항**: 향후 날짜/시간 기반 정렬 및 검색이 많아질 경우 `LocalDate`, `LocalTime`, `LocalDateTime` 기반으로 타입 변경을 검토할 수 있음

#### 4.12.4 연관관계 매핑

현재 BaseballGame 엔티티는 다른 엔티티와 직접적인 객체 연관관계를 맺고 있지 않음

#### 4.12.5 인덱스 및 데이터 제약 설계

**1) 설계 목적**

- 외부 API에서 수집한 경기 데이터를 중복 없이 저장하고 빠르게 조회하기 위함
- 일정 조회, 팀별 경기 조회, 경기 결과 확인 기능에서 기준 데이터로 활용하기 위함
- 향후 직관 기록 및 경기 통계 기능과 연계 가능한 공통 경기 마스터 데이터를 구성하기 위함

**2) 주요 인덱스 명세**

현재 코드상 명시적 인덱스는 정의되어 있지 않으나, `game_id`는 UNIQUE 제약을 통해 인덱스 성격을 가짐.

| **인덱스 명** | **컬럼 구성** | **설정 목적** |
| --- | --- | --- |
| **uk_baseball_games_game_id** | `game_id` | 외부 API 경기 ID의 중복 저장을 방지하고 단건 조회 성능을 확보하기 위함 |

**3) 유니크 제약 조건 (Unique Constraint)**

- 대상 필드: `game_id`
- 설정 내용: `@Column(name = "game_id", unique = true, nullable = false)`로 설정함
- 비즈니스 효과:
    - 외부 API에서 동일 경기 데이터를 반복 수집하더라도 하나의 경기만 저장되도록 보장함
    - 경기 동기화 및 업데이트 시 `gameId`를 기준으로 기존 데이터 존재 여부를 판단할 수 있음

**4) 인덱스 활용 가이드**

- 단건 조회 최적화: 외부 API 동기화 시 `WHERE game_id = ?` 형태의 조회가 자주 발생할 수 있으므로 `game_id` 유니크 인덱스를 활용함
- 일정 조회 확장: 향후 특정 날짜의 경기 목록을 자주 조회한다면 `game_date` 인덱스 추가를 고려할 수 있음
- 팀별 경기 조회 확장: 특정 팀의 홈/원정 경기 조회가 많아질 경우 `home_team`, `away_team` 인덱스 또는 복합 인덱스 설계를 검토할 수 있음
- 상태 기반 관리: 진행 중 경기, 종료 경기, 취소 경기 등 상태별 조회가 빈번할 경우 `status`, `is_canceled` 인덱스를 추가로 고려할 수 있음

### 4.13 TicketPost (별도 티켓 게시 모델)

- 회원이 야구 경기 티켓을 판매하거나 양도하기 위해 등록하는 게시글 엔티티
- 경기 정보, 좌석 정보, 가격, 판매 상태, 작성자 정보를 함께 관리하여 티켓 거래의 기준 데이터를 제공함
- 거래(Transfer), 채팅방(ChatRoom) 등 후속 기능과 연계되는 핵심 게시글 데이터로 활용함

#### 4.12.1 기본 정보

- TicketPost 구현
    
    ```java
    @Entity
    @Table(name = "ticket_post", indexes = {
            @Index(name = "idx_ticket_post_status", columnList = "status"),
            @Index(name = "idx_ticket_post_match_date", columnList = "match_date"),
            @Index(name = "idx_ticket_post_author_id", columnList = "author_id"),
            @Index(name = "idx_ticket_post_created_at", columnList = "created_at")
    })
    @EntityListeners(AuditingEntityListener.class)
    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @Builder
    @AllArgsConstructor
    public class TicketPost {
    
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
    
        @Column(name = "title", nullable = false, length = 200)
        private String title;
    
        @Column(name = "content", nullable = false, columnDefinition = "TEXT")
        private String content;
    
        @Column(name = "home_team", nullable = false, length = 30)
        private String homeTeam;
    
        @Column(name = "away_team", nullable = false, length = 30)
        private String awayTeam;
    
        @Column(name = "match_date", nullable = false)
        private LocalDate matchDate;
    
        @Column(name = "match_time", nullable = false)
        private LocalTime matchTime;
    
        @Column(name = "stadium", nullable = false, length = 100)
        private String stadium;
    
        @Column(name = "seat_area", nullable = false, length = 100)
        private String seatArea;
    
        @Column(name = "seat_block", length = 50)
        private String seatBlock;
    
        @Column(name = "seat_row", length = 50)
        private String seatRow;
    
        @Column(name = "price", nullable = false)
        private Integer price;
    
        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false, length = 20)
        @Builder.Default
        private TicketPostStatus status = TicketPostStatus.SELLING;
    
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "author_id", nullable = false)
        private Member author;
    
        @CreatedDate
        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;
    
        // ────── 비즈니스 메서드 ──────
    
        public void updateStatus(TicketPostStatus newStatus) {
            this.status = newStatus;
        }
    
        public void update(String title, String content, String homeTeam, String awayTeam,
                           LocalDate matchDate, LocalTime matchTime, String stadium,
                           String seatArea, String seatBlock, String seatRow, Integer price) {
            this.title = title;
            this.content = content;
            this.homeTeam = homeTeam;
            this.awayTeam = awayTeam;
            this.matchDate = matchDate;
            this.matchTime = matchTime;
            this.stadium = stadium;
            this.seatArea = seatArea;
            this.seatBlock = seatBlock;
            this.seatRow = seatRow;
            this.price = price;
        }
    
        public boolean isOwnedBy(Long memberId) {
            return this.author.getId().equals(memberId);
        }
    }
    
    ```
    

#### 4.13.2 필드 상세 명세

| **필드명** | **데이터 타입** | **컬럼명** | **제약조건** | **설명** | **비즈니스 규칙** |
| --- | --- | --- | --- | --- | --- |
| **id** | Long | `id` | PK, AUTO_INC | 티켓 양도 게시글 고유 식별자 | 시스템이 자동 생성함 |
| **title** | String | `title` | NOT NULL, LENGTH 200 | 게시글 제목 | 티켓 양도글의 핵심 내용을 요약하여 표현함 |
| **content** | String | `content` | NOT NULL, TEXT | 게시글 본문 | 티켓 상세 설명, 거래 조건, 안내사항 등을 포함함 |
| **homeTeam** | String | `home_team` | NOT NULL, LENGTH 30 | 홈팀명 | 경기의 홈팀 정보를 저장함 |
| **awayTeam** | String | `away_team` | NOT NULL, LENGTH 30 | 원정팀명 | 경기의 원정팀 정보를 저장함 |
| **matchDate** | LocalDate | `match_date` | NOT NULL | 경기 날짜 | 티켓이 해당하는 경기 일자를 저장함 |
| **matchTime** | LocalTime | `match_time` | NOT NULL | 경기 시간 | 티켓이 해당하는 경기 시작 시간을 저장함 |
| **stadium** | String | `stadium` | NOT NULL, LENGTH 100 | 경기장명 | 경기가 열리는 장소 정보를 저장함 |
| **seatArea** | String | `seat_area` | NOT NULL, LENGTH 100 | 좌석 구역 | 예매 좌석의 큰 구역 정보를 저장함 |
| **seatBlock** | String | `seat_block` | LENGTH 50 | 좌석 블록 | 세부 구역 또는 블록 정보를 저장함 |
| **seatRow** | String | `seat_row` | LENGTH 50 | 좌석 열 정보 | 좌석 열 또는 줄 정보를 저장함 |
| **price** | Integer | `price` | NOT NULL | 판매 가격 | 티켓 양도 금액을 저장함 |
| **status** | TicketPostStatus | `status` | ENUM, NOT NULL, LENGTH 20 | 게시글 상태 | 기본값은 `SELLING`이며 판매 가능 상태를 의미함 |
| **author** | Member | `author_id` | FK, NOT NULL | 작성자 | 티켓 양도 게시글을 등록한 회원을 참조함 |
| **createdAt** | LocalDateTime | `created_at` | UP_FALSE | 작성 일시 | Auditing 기능을 통해 자동 기록함 |

#### 4.13.3 비즈니스 로직 및 제약 사항

- **판매 상태 관리**: `status` 필드를 통해 판매중, 예약중, 거래완료 등 티켓 양도 게시글의 현재 상태를 관리함
- **상태 변경 기능**: `updateStatus(newStatus)` 메서드를 통해 게시글 상태를 명시적으로 변경할 수 있음
- **작성자 권한 검증**: `isOwnedBy(memberId)` 메서드를 통해 특정 회원이 해당 게시글의 작성자인지 간단하게 확인할 수 있음
- **경기 정보 내장 관리**: 홈팀, 원정팀, 날짜, 시간, 경기장 정보를 게시글 자체에 포함하여 외부 경기 정보와 분리된 독립적인 거래 기준 정보를 유지함
- **좌석 정보 세분화**: `seatArea`, `seatBlock`, `seatRow`를 통해 사용자가 거래 대상 좌석의 위치를 구체적으로 파악할 수 있도록 함
- **가격 필수 관리**: 티켓 양도 거래 특성상 가격은 필수 입력값으로 관리함
- **생성 시 기본 상태 부여**: 별도 상태 지정이 없을 경우 `SELLING` 상태로 초기화하여 생성 직후 판매 가능한 게시글로 간주함

#### 4.13.4 연관관계 매핑

```java
// N:1 - 티켓 양도 게시글 작성자
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "author_id", nullable = false)
private Member author;
```

- **Member(회원)와의 관계**: 하나의 회원은 여러 개의 티켓 양도 게시글을 작성할 수 있으므로 N:1 관계로 설계함
- **지연 로딩 적용**: `fetch = FetchType.LAZY`를 통해 게시글 목록 조회 시 작성자 상세 정보 로딩을 지연시켜 성능을 관리함
- **확장 연계성**:
    - `Transfer` 엔티티와 연결되어 실제 거래 흐름을 관리할 수 있음
    - `ChatRoom` 엔티티와 연결되어 구매 희망자와의 채팅을 지원할 수 있음
- **독립 데이터 보관**: 경기 정보와 좌석 정보를 문자열/값 타입으로 저장하여 외부 경기 데이터 변경과 무관하게 당시 거래 정보를 보존함

#### 4.13.5 인덱스 및 데이터 제약 설계

**1) 설계 목적**

- 판매중인 티켓 게시글 목록을 빠르게 조회하고, 경기 날짜 및 작성자 기준의 필터링 성능을 확보하기 위함
- 최신 등록순 정렬, 상태별 목록 조회, 작성자별 관리 페이지 조회를 효율적으로 지원하기 위함
- 티켓 거래 게시글이 증가하더라도 주요 조회 조건에 대응할 수 있도록 기본 인덱스를 선제적으로 설계함

**2) 주요 인덱스 명세**

| **인덱스 명** | **컬럼 구성** | **설정 목적** |
| --- | --- | --- |
| **idx_ticket_post_status** | `status` | 판매 상태별 게시글 목록을 빠르게 조회하기 위함 |
| **idx_ticket_post_match_date** | `match_date` | 경기 날짜별 게시글 검색 및 필터링을 지원하기 위함 |
| **idx_ticket_post_author_id** | `author_id` | 특정 회원이 작성한 티켓 양도 게시글 목록을 빠르게 조회하기 위함 |
| **idx_ticket_post_created_at** | `created_at` | 최신 등록순 정렬 및 최근 게시글 조회 성능을 확보하기 위함 |

**3) 유니크 제약 조건 (Unique Constraint)**

- 현재 엔티티에는 별도의 유니크 제약 조건이 정의되어 있지 않음
- 동일 경기, 동일 좌석, 동일 작성자 조건의 게시글 중복 등록 방지 정책이 필요하다면 추후 복합 유니크 제약을 검토할 수 있음
- 현재는 사용자가 동일 경기 티켓을 여러 장 등록하거나 조건이 유사한 게시글을 작성할 가능성을 고려하여 유니크 제약 없이 설계함

**4) 인덱스 활용 가이드**

- 상태별 조회 최적화: `WHERE status = ?` 형태의 목록 조회에서 `idx_ticket_post_status`를 활용함
- 경기 일정 기준 조회: `WHERE match_date = ?` 또는 기간 조건 기반 검색에서 `idx_ticket_post_match_date`를 활용함
- 작성자 기준 관리: 마이페이지에서 `WHERE author_id = ?` 조건으로 내 게시글을 조회할 때 `idx_ticket_post_author_id`를 활용함
- 최신순 정렬: `ORDER BY created_at DESC` 형태의 기본 목록 조회에서 `idx_ticket_post_created_at`가 도움될 수 있음
- 복합 검색 확장: 향후 `status + match_date`, `author_id + status`와 같은 복합 조건 조회가 많아질 경우 실제 쿼리 패턴에 맞는 복합 인덱스 추가를 검토할 수 있음

---

## **5. Enum 타입 정의**

### **5.1 MemberRole (역할)**

```java
public enum MemberRole {
    USER,  // 일반 유저
    ADMIN  // 관리자
}
```

### **5.2** BadgeLevel **(등급)**

```java
public enum BadgeLevel {
    ROOKIE,     // 루키 - 기본
    PRO,        // 프로
    ALL_STAR,   // 올스타
    LEGEND      // 레전드
}
```

### 5.3 BoardType (게시판 타입)

```java
public enum BoardType {
    CREW,       // 직관 크루
    MATE,       // 직관 동행(메이트) 모집
    TRANSFER,   // 티켓 양도
    TEAM_ONLY,  // 팀 전용 비밀 게시판
}

```

### 5.4 PostStatus (게시판 상태)

```java
public enum PostStatus {
    OPEN,       // 모집 중
    RESERVED,   // 예약 중 (수정 불가)
    CLOSED      // 마감
}
```

### 5.5 TransferStatus (거래 상태)

```java
public enum TransferStatus {
    REQUESTED,          // 양도 요청됨
    PAYMENT_COMPLETED,  // 에스크로 결제 완료
    TICKET_SENT,        // 티켓 전달 완료 (양도자 확인)
    COMPLETED,          // 인수 확정 및 정산 완료
    CANCELLED           // 거래 취소
}

```

### 5.6 ChatMessageType (채팅 메시지 타입)

```java
public enum ChatMessageType {
    CHAT,   // 일반 메시지
    ENTER,  // 입장
    LEAVE   // 퇴장
}
```

### 5.7 TicketPostStatus (양도 게시글 상태)

```java
public enum TicketPostStatus {
    SELLING,   // 판매중
    RESERVED,  // 예약중
    SOLD       // 판매완료
}
```

---

## 6. 연관관계 매핑 전략

본 프로젝트는 객체 그래프 탐색의 편의성과 조회 성능을 함께 고려하여 연관관계를 설계함.

특히 Spring Data JPA 기반 환경에서 발생하기 쉬운 N+1 문제와 불필요한 즉시 로딩을 방지하기 위해, 모든 연관관계는 기본적으로 `FetchType.LAZY`를 적용하는 것을 원칙으로 함.

또한 엔티티 간 결합도를 낮추고 데이터 생명주기를 명확히 관리하기 위해, 강한 소유 관계와 단순 참조 관계를 구분하여 `Cascade`, `orphanRemoval`, 양방향 연관관계 동기화 여부를 결정함.

이는 본 문서의 공통 설계 원칙인 지연 로딩 우선, Setter 지양, 도메인 메서드 중심 상태 관리와 동일한 방향성을 가짐.

### 6.1 연관관계 매핑 규칙

연관관계는 조회 빈도, 데이터 생명주기, 객체 그래프 복잡도, 성능 영향을 종합적으로 고려하여 다음 기준으로 설계함.

| 관계 유형 | 기본 전략 | 이유 | 예외 상황 |
| --- | --- | --- | --- |
| `@ManyToOne` | `LAZY` | 다수의 하위 엔티티 조회 시 상위 엔티티가 불필요하게 즉시 로딩되는 것을 방지함 | 화면/로직 특성상 항상 함께 조회되어야 하고 성능상 검증된 경우에 한해 Fetch Join 또는 DTO 조회로 최적화함 |
| `@OneToMany` | `LAZY` | 컬렉션 즉시 로딩 시 N+1 문제 및 메모리 사용량 증가 가능성이 큼 | 데이터 건수가 매우 적고 항상 함께 필요한 경우만 제한적으로 고려함 |
| `@OneToOne` | `LAZY` | 1:1 관계라도 실제 사용 시점이 다를 수 있으므로 일관성 있게 지연 로딩을 우선 적용함 | 도메인상 항상 함께 조회되는 구조라면 예외적으로 검토 가능하나, 우선은 `LAZY` 유지 후 쿼리 최적화로 대응함 |
| `@ManyToMany` | 사용 금지 | 중간 테이블에 추가 속성 확장이 어렵고, 연관관계 제어가 복잡해짐 | 연결 엔티티를 별도로 생성하여 `1:N`, `N:1` 조합으로 해소함 |

### 6.1.1 적용 원칙

- 모든 연관관계는 기본적으로 `FetchType.LAZY`를 적용함
- 단순히 “항상 필요해 보인다”는 이유만으로 `EAGER`를 사용하지 않음
- 조회 성능이 필요한 경우 엔티티 매핑 전략 변경보다 `fetch join`, EntityGraph, DTO Projection 등 조회 쿼리 최적화를 우선 고려함
- 다대다 관계는 직접 사용하지 않고 연결 엔티티를 통해 명시적으로 해소함

### 6.1.2 프로젝트 적용 예시

- `Member → Team`, `Post → Member`, `Transfer → seller/buyer`, `ChatMessage → ChatRoom/sender` 등 대부분의 참조 관계는 `@ManyToOne(fetch = FetchType.LAZY)`로 설계함
- `ChatRoom → participants`, `ChatRoom → messages`, `Post → participants`와 같은 컬렉션 관계는 모두 `@OneToMany(fetch = LAZY)` 기반으로 관리함
- `ChatRoom ↔ Post`, `ChatRoom ↔ TicketPost`, `Transfer ↔ Post`와 같은 1:1 성격 관계도 일관성 있게 `LAZY`를 적용함
- `CrewParticipant`, `ChatRoomParticipant`와 같은 연결 엔티티를 통해 N:M 관계를 명시적으로 분해하여 확장성과 정합성을 확보함

### 6.2 Cascade 옵션 가이드

`Cascade`는 부모 엔티티의 생명주기가 자식 엔티티의 생명주기를 직접적으로 지배하는 경우에만 제한적으로 사용함.

반대로 독립적인 의미를 가지는 참조 엔티티에는 `Cascade`를 적용하지 않음.

무분별한 영속성 전이는 의도하지 않은 삭제 및 저장 전파를 유발할 수 있으므로, 관계의 강도를 기준으로 엄격히 구분함.

### 6.2.1 강한 연결 관계

부모가 삭제되거나 분리될 때 자식도 함께 제거되어야 하는 관계에는 `CascadeType.ALL`과 `orphanRemoval = true`를 적용함.

```java
// 강한 연결 관계 예시
@OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
private List<ChatMessage> messages = new ArrayList<>();

@OneToMany(mappedBy = "chatRoom", cascade = CascadeType.ALL, orphanRemoval = true)
private List<ChatRoomParticipant> participants = new ArrayList<>();

@OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
private List<CrewParticipant> participants = new ArrayList<>();
```

적용 기준은 다음과 같음.

- 자식 엔티티가 부모 없이는 존재 의미가 없을 것
- 부모 삭제 시 자식도 함께 제거되는 것이 비즈니스적으로 자연스러울 것
- 자식이 다른 애그리거트에서 재사용되지 않을 것

프로젝트에서는 다음과 같은 경우에 사용함.

- `ChatRoom → ChatMessage`
    - 채팅방이 삭제되면 해당 방의 메시지도 함께 삭제되는 것이 자연스러움
- `ChatRoom → ChatRoomParticipant`
    - 채팅방이 사라지면 참여자 구성 정보도 함께 제거되어야 함
- `Post → CrewParticipant`
    - 모집글이 삭제되면 해당 참여 관계도 독립적으로 유지될 필요가 없음

### 6.2.2 약한 연결 관계

단순 참조 관계이거나, 참조 대상이 독립적인 생명주기를 가지는 경우에는 `Cascade`를 적용하지 않음.

```
// 약한 연결 관계 예시
@ManyToOne(fetch=FetchType.LAZY)
@JoinColumn(name="author_id",nullable=false)
privateMemberauthor;

@ManyToOne(fetch=FetchType.LAZY)
@JoinColumn(name="team_id")
privateTeamteam;

@ManyToOne(fetch=FetchType.LAZY)
@JoinColumn(name="seller_id",nullable=false)
privateMemberseller;
```

적용 이유는 다음과 같음.

- `Member`, `Team`, `Post`, `TicketPost` 등은 각각 독립적인 생명주기를 가짐
- 특정 엔티티 저장/삭제가 다른 핵심 엔티티의 저장/삭제로 연쇄 전파되면 위험함
- 참조 엔티티는 서비스 계층에서 명시적으로 조회하고 연결하는 것이 더 안전함

### 6.2.3 Cascade 설계 원칙 요약

| 관계 유형 | Cascade 적용 여부 | 적용 기준 |
| --- | --- | --- |
| 부모-자식 구성 관계 | 적용 (`ALL`, 필요 시 `orphanRemoval`) | 자식이 부모 생명주기에 완전히 종속될 때 |
| 참조 관계 | 미적용 | 참조 대상이 독립적인 도메인 의미와 생명주기를 가질 때 |
| 핵심 마스터 데이터 참조 | 미적용 | `Member`, `Team` 등 시스템 전역에서 재사용될 때 |
| 연결 엔티티 포함 컬렉션 | 선택 적용 | 부모 삭제 시 연결 정보도 반드시 제거되어야 할 때 |

### 6.3 양방향 연관관계 관리

양방향 연관관계는 객체 탐색 편의성을 높일 수 있으나, JPA에서는 연관관계의 주인과 비주인이 다르므로 두 객체 상태가 불일치할 수 있음.

따라서 양방향 관계를 사용하는 경우에는 반드시 도메인 메서드를 통해 양쪽 컬렉션과 참조 값을 함께 동기화해야 함.

### 6.3.1 관리 원칙

- 연관관계 편의 메서드를 엔티티 내부에 제공하여 객체 그래프 일관성을 유지함
- 외부 서비스 계층에서 컬렉션과 참조를 각각 따로 조작하지 않도록 함
- 연관관계의 주인이 아닌 쪽 컬렉션만 수정하는 방식은 지양함
- Setter를 통한 무분별한 관계 변경 대신, 의미 있는 도메인 메서드로만 연관관계를 변경함

### 6.3.2 기본 예시

```
publicvoidaddLoan(Loanloan) {
loans.add(loan);
loan.setMember(this);
}

publicvoidremoveLoan(Loanloan) {
loans.remove(loan);
loan.setMember(null);
}
```

위와 같은 방식은 부모 컬렉션과 자식 참조를 동시에 갱신하여 양방향 관계의 정합성을 유지하는 대표적인 패턴임.

### 6.3.3 프로젝트 적용 방향

현재 프로젝트에서는 모든 양방향 관계에 대해 완전한 편의 메서드를 두고 있지는 않지만, 다음과 같은 방향으로 관리함.

- `ChatRoom.addParticipant(member)`
    - 참여자 컬렉션에 `ChatRoomParticipant`를 추가하면서 `chatRoom`, `member`를 함께 세팅함
    - 동일 회원 중복 참여를 방지하는 검증까지 함께 수행함
- `Member ↔ Post`, `Member ↔ Attendance`, `Team ↔ Member` 등은 문서상 양방향 탐색 가능 구조를 설명하더라도, 실제 구현에서는 필요한 방향만 우선 유지하고 불필요한 컬렉션 매핑은 최소화할 수 있음
- 컬렉션 관리가 복잡하거나 조회 전용인 경우에는 무리하게 양방향으로 만들지 않고 단방향 매핑을 유지하는 것이 더 바람직함

### 6.3.4 양방향 설계 시 주의사항

- 연관관계의 편의보다 조회 성능과 유지보수성을 우선함
- 양방향 관계가 많아질수록 직렬화 문제, 무한 참조, 예기치 않은 로딩 문제가 발생할 수 있으므로 필요한 경우에만 제한적으로 사용함
- JSON 응답은 엔티티 직접 노출 대신 DTO로 변환하여 순환 참조 문제를 방지함
- 연결 엔티티(`CrewParticipant`, `ChatRoomParticipant`)를 사용하는 구조에서는 양방향 직접 매핑보다 연결 엔티티 중심 제어가 더 명확함

### 6.4 본 프로젝트의 적용 요약

본 프로젝트의 연관관계 매핑 전략은 다음과 같이 정리할 수 있음.

- 모든 연관관계는 기본적으로 `LAZY`를 사용함
- `ManyToMany`는 사용하지 않고 연결 엔티티로 해소함
- `Cascade`는 부모-자식 강한 종속 관계에만 적용함
- `Member`, `Team`, `Post`와 같은 핵심 엔티티에는 불필요한 cascade를 적용하지 않음
- 양방향 관계는 필요한 경우에만 사용하며, 도메인 메서드로 동기화함
- 성능 이슈는 매핑 전략 변경보다 조회 쿼리 최적화로 해결하는 것을 우선 원칙으로 함

---

## 7. 감사(Auditing) 및 Querydsl 설정

애플리케이션 전역에서 엔티티의 생성 및 수정 시점을 자동으로 기록하는 JPA Auditing 기능과 타입 세이프한 동적 쿼리 작성을 위한 Querydsl 설정을 통합 관리함.

### 7.1 JPA 설정 클래스

#### 7.1.1 JpaConfig 구현

```java
@Configuration
@EnableJpaAuditing
public class JpaConfig {

    @PersistenceContext
    private EntityManager entityManager;

    @Bean
    public JPAQueryFactory jpaQueryFactory() {
        return new JPAQueryFactory(entityManager);
    }
}
```

#### 7.1.2 설정 항목 상세 명세

| 설정 항목 | 어노테이션 / 빈 | 역할 및 설명 |
| --- | --- | --- |
| **JPA Auditing 활성화** | `@EnableJpaAuditing` | 엔티티의 `@CreatedDate`, `@LastModifiedDate` 기능을 활성화하여 변경 시점을 자동 추적함 |
| **영속성 컨텍스트 주입** | `@PersistenceContext` | JPA의 `EntityManager`를 주입받아 Querydsl 라이브러리가 DB에 접근할 수 있는 통로를 마련함 |
| **Querydsl 팩토리 빈** | `JPAQueryFactory` | 자바 코드로 SQL 쿼리를 작성할 수 있게 해주는 Querydsl의 핵심 클래스를 빈으로 등록함 |

#### 7.1.3 주요 기능 및 기대 효과

- **자동화된 데이터 감사(Auditing)**
    - 엔티티가 저장되거나 수정될 때 개발자가 직접 시간을 입력하지 않아도 DB 레벨에서 정확한 시계열 데이터를 보장함
    - 모든 도메인 엔티티에서 일관된 데이터 생성/수정 추적 로직을 적용할 수 있음
- **동적 쿼리 처리 능력 향상**
    - `JPAQueryFactory`를 빈으로 등록함으로써 Repository 레이어에서 의존성 주입을 통해 간편하게 Querydsl을 사용함
    - 복잡한 검색 조건이나 동적 조인 쿼리를 컴파일 타임에 체크 가능한 자바 코드로 구현하여 런타임 오류를 방지함
- **인프라 설정의 응집도 강화**
    - JPA와 직접적으로 연관된 외부 라이브러리(Querydsl) 및 설정 정보를 하나의 클래스(`JpaConfig`)에서 집중 관리함
    - 설정 정보가 분산되지 않아 유지보수 및 설정 변경 시 영향도 파악이 용이함

#### 7.1.4 활용 가이드

- **Auditing 적용**: 각 엔티티 클래스에 `@EntityListeners(AuditingEntityListener.class)`를 추가하여 설정이 동작하도록 함
- **Querydsl 사용**: 커스텀 Repository 구현체에서 생성자 주입을 통해 `JPAQueryFactory`를 참조하여 비즈니스 로직을 구현함

---

## 8. 조회 성능 최적화 전략

본 프로젝트는 채팅, 게시글, 양도 거래 등 조회 빈도가 높은 기능을 중심으로 JPA 조회 성능 최적화를 고려함.

특히 연관관계가 많은 도메인 특성상, 기본적인 `LAZY` 전략만으로는 실제 서비스 시점에 N+1 문제가 발생할 수 있으므로, 필요한 화면과 API에 한해 `fetch join`, 커서 기반 조회, 페이징 분리 전략 등을 적용함.

또한 엔티티 구조 자체를 단순화하는 것보다, 실제 조회 패턴에 맞는 쿼리 최적화를 통해 성능과 유지보수성의 균형을 확보하는 것을 원칙으로 함.

### 8.1 N+1 문제 해결

N+1 문제는 부모 엔티티를 조회한 뒤, 연관된 자식 또는 참조 엔티티를 추가로 개별 조회하면서 발생하는 대표적인 ORM 성능 문제임.

본 프로젝트에서는 연관관계 기본 전략을 `LAZY`로 유지하되, 실제 화면에서 반드시 함께 필요한 연관 데이터에 대해서만 `fetch join` 또는 `@EntityGraph`를 사용하는 방식으로 해결함.

### 8.1.1 적용 원칙

- 연관관계는 기본적으로 `LAZY`를 유지함
- N+1이 발생하는 실제 조회 API에 대해서만 선택적으로 `fetch join`을 적용함
- 컬렉션 fetch join과 페이징을 동시에 사용할 경우 중복 row 및 count 쿼리 문제를 유발할 수 있으므로 주의함
- 목록 화면은 요약 조회, 상세 화면은 fetch join 기반 조회로 역할을 분리함

### 8.1.2 ChatMessage 조회 최적화

채팅 메시지 조회 시 메시지 작성자 정보(`sender`)는 함께 필요한 경우가 많으므로, `JOIN FETCH m.sender`를 사용하여 메시지 목록과 작성자 정보를 한 번에 조회함.

```java
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    boolean existsBySenderId(Long senderId);

    @Query("SELECT m FROM ChatMessage m JOIN FETCH m.sender WHERE m.chatRoom.id = :roomId ORDER BY m.createdAt ASC")
    List<ChatMessage> findByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT m FROM ChatMessage m " +
            "JOIN FETCH m.sender " +
            "WHERE m.chatRoom.id = :roomId " +
            "AND (:lastId IS NULL OR m.id < :lastId) " +
            "ORDER BY m.id DESC")
    Slice<ChatMessage> findByRoomIdWithCursor(@Param("roomId") Long roomId, @Param("lastId") Long lastId, Pageable pageable);

    @Query("SELECT m FROM ChatMessage m " +
            "JOIN FETCH m.sender " +
            "WHERE m.chatRoom.id IN :roomIds " +
            "AND m.id = (" +
            "  SELECT MAX(m2.id) FROM ChatMessage m2 WHERE m2.chatRoom.id = m.chatRoom.id" +
            ")")
    List<ChatMessage> findLastMessagesByRoomIds(@Param("roomIds") List<Long> roomIds);

    @Query("SELECT DISTINCT m.sender FROM ChatMessage m WHERE m.chatRoom.id = :roomId")
    List<Member> findDistinctSendersByRoomId(@Param("roomId") Long roomId);
}
```

**적용 효과**

- `findByRoomId()`
    - 채팅방 진입 시 메시지 목록과 작성자 정보를 한 번의 쿼리로 조회함
    - 메시지별 작성자 조회 시 발생할 수 있는 N+1 문제를 방지함
- `findByRoomIdWithCursor()`
    - 커서 기반 무한 스크롤 조회에서 메시지와 작성자 정보를 함께 조회함
    - 오래된 메시지를 추가로 불러올 때도 동일한 N+1 방지 효과를 유지함
- `findLastMessagesByRoomIds()`
    - 여러 채팅방의 마지막 메시지를 한 번에 조회하여 채팅방 목록 화면의 성능을 개선함
    - 각 채팅방별 마지막 메시지를 개별 조회하는 반복 쿼리를 제거함
- `findDistinctSendersByRoomId()`
    - 특정 채팅방에서 발신자 목록만 추출할 때 불필요한 메시지 본문 전체를 로딩하지 않도록 분리 조회함

### 8.1.3 ChatRoom 조회 최적화

채팅방은 목록 조회, 상세 조회, 참여자 검증 등 조회 목적이 다양하므로 용도에 따라 fetch join 범위를 분리하여 설계함.

```java
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    @Query("SELECT c FROM ChatRoom c JOIN FETCH c.post WHERE c.post.id = :postId")
    Optional<ChatRoom> findByPostId(@Param("postId") Long postId);

    @Query(value = "SELECT DISTINCT c FROM ChatRoom c " +
            "LEFT JOIN FETCH c.post p " +
            "LEFT JOIN FETCH p.author a " +
            "WHERE (((c.roomType = com.fullcount.domain.ChatRoomType.ONE_ON_ONE " +
            "      OR c.roomType = com.fullcount.domain.ChatRoomType.ONE_ON_ONE_DIRECT) " +
            "   AND (c.initiator.id = :memberId OR c.receiver.id = :memberId)) " +
            "   AND NOT (c.initiator.id = :memberId AND c.initiatorLeft = true) " +
            "   AND NOT (c.receiver.id = :memberId AND c.receiverLeft = true)) " +
            "OR ((c.roomType <> com.fullcount.domain.ChatRoomType.ONE_ON_ONE " +
            "      AND c.roomType <> com.fullcount.domain.ChatRoomType.ONE_ON_ONE_DIRECT) " +
            "   AND EXISTS (SELECT 1 FROM ChatRoomParticipant cp WHERE cp.chatRoom = c AND cp.member.id = :memberId))",
            countQuery = "SELECT COUNT(DISTINCT c) FROM ChatRoom c " +
                    "WHERE (((c.roomType = com.fullcount.domain.ChatRoomType.ONE_ON_ONE " +
                    "      OR c.roomType = com.fullcount.domain.ChatRoomType.ONE_ON_ONE_DIRECT) " +
                    "   AND (c.initiator.id = :memberId OR c.receiver.id = :memberId)) " +
                    "   AND NOT (c.initiator.id = :memberId AND c.initiatorLeft = true) " +
                    "   AND NOT (c.receiver.id = :memberId AND c.receiverLeft = true)) " +
                    "OR ((c.roomType <> com.fullcount.domain.ChatRoomType.ONE_ON_ONE " +
                    "      AND c.roomType <> com.fullcount.domain.ChatRoomType.ONE_ON_ONE_DIRECT) " +
                    "   AND EXISTS (SELECT 1 FROM ChatRoomParticipant cp WHERE cp.chatRoom = c AND cp.member.id = :memberId))")
    Page<ChatRoom> findAllByMemberId(@Param("memberId") Long memberId, Pageable pageable);

    @Query("SELECT DISTINCT c FROM ChatRoom c " +
            "LEFT JOIN FETCH c.post p " +
            "LEFT JOIN FETCH p.author a " +
            "LEFT JOIN FETCH c.participants cp " +
            "LEFT JOIN FETCH cp.member " +
            "LEFT JOIN FETCH c.initiator " +
            "LEFT JOIN FETCH c.receiver " +
            "WHERE c.id = :roomId")
    Optional<ChatRoom> findByIdWithDetails(@Param("roomId") Long roomId);

    @Query("SELECT c FROM ChatRoom c " +
            "LEFT JOIN FETCH c.post p " +
            "LEFT JOIN FETCH c.initiator " +
            "LEFT JOIN FETCH c.receiver " +
            "WHERE c.id = :roomId")
    Optional<ChatRoom> findByIdWithSummary(@Param("roomId") Long roomId);
}
```

**적용 효과**

- `findByPostId()`
    - 게시글 기반 채팅방 조회 시 연관 게시글을 함께 조회하여 추가 select를 방지함
- `findAllByMemberId()`
    - 내 채팅방 목록 조회에서 게시글 및 작성자 요약 정보만 fetch join으로 함께 로딩함
    - 목록 조회에서 필요한 최소 연관 정보만 불러와 과도한 조인을 방지함
    - `countQuery`를 별도로 분리하여 페이징 정확성을 보장함
- `findByIdWithDetails()`
    - 채팅방 상세 진입 시 참여자, 참여 회원, 게시글 작성자, DM 상대방까지 한 번에 조회함
    - 상세 화면에서 발생할 수 있는 다수의 추가 쿼리를 제거함
- `findByIdWithSummary()`
    - 상세 전체가 아닌 요약 정보만 필요한 경우 사용하여 불필요한 컬렉션 fetch join을 피함

### 8.2 쿼리 최적화

조회 성능 최적화는 단순히 fetch join 사용에만 의존하지 않고, 페이징 방식, 정렬 기준, 조회 범위 최소화, count 쿼리 분리 등을 함께 고려해야 함.

본 프로젝트는 특히 채팅 메시지와 채팅방 목록에서 대량 데이터 누적 가능성이 높기 때문에, offset 기반 조회보다 커서 기반 조회를 우선 적용하는 방향으로 설계함.

### 8.2.1 페이징과 정렬

일반적인 목록 조회에서는 `Pageable`과 정렬 조건을 활용하여 필요한 데이터만 조회함.

```java
@Query("SELECT l FROM Loan l " +
       "WHERE l.member.id = :memberId " +
       "ORDER BY l.createdAt DESC")
Page<Loan> findByMemberIdOrderByCreatedAtDesc(
    @Param("memberId") Long memberId,
    Pageable pageable);
```

위와 같은 방식은 본 프로젝트에서도 동일하게 적용 가능하며, 예를 들어 티켓 양도 게시글 목록, 내 작성글 목록, 내 거래 내역 목록 등에 활용할 수 있음.

### 8.2.2 커서 기반 메시지 조회

채팅 메시지는 데이터가 빠르게 증가할 수 있으므로, 일반적인 offset 기반 페이징보다 커서 기반 조회가 더 적합함.

```java
@Query("SELECT m FROM ChatMessage m " +
        "JOIN FETCH m.sender " +
        "WHERE m.chatRoom.id = :roomId " +
        "AND (:lastId IS NULL OR m.id < :lastId) " +
        "ORDER BY m.id DESC")
Slice<ChatMessage> findByRoomIdWithCursor(@Param("roomId") Long roomId,
                                          @Param("lastId") Long lastId,
                                          Pageable pageable);
```

**적용 이유**

- 메시지 수가 많아질수록 offset 기반 paging은 뒤로 갈수록 성능이 저하될 수 있음
- `id` 기준 커서 조회는 인덱스를 활용하기 유리하고, 스크롤 기반 UX와도 잘 맞음
- `Slice`를 사용하여 전체 count 쿼리 없이 다음 페이지 존재 여부만 판단할 수 있어 성능상 유리함

### 8.2.3 마지막 메시지 일괄 조회

채팅방 목록 화면에서는 각 채팅방의 마지막 메시지 1건만 필요하므로, 채팅방마다 개별 조회하지 않고 한 번에 가져오도록 설계함.

```java
@Query("SELECT m FROM ChatMessage m " +
        "JOIN FETCH m.sender " +
        "WHERE m.chatRoom.id IN :roomIds " +
        "AND m.id = (" +
        "  SELECT MAX(m2.id) FROM ChatMessage m2 WHERE m2.chatRoom.id = m.chatRoom.id" +
        ")")
List<ChatMessage> findLastMessagesByRoomIds(@Param("roomIds") List<Long> roomIds);
```

**적용 효과**

- 채팅방 수만큼 반복 조회하는 구조를 제거함
- 채팅방 목록 화면 렌더링 시 DB round-trip 수를 크게 줄일 수 있음
- 최근 메시지, 최근 발신자, 최근 시간 정보를 함께 구성하기에 적합함

### 8.2.4 참여 여부 검증 최적화

단순 존재 여부 확인은 전체 엔티티를 조회하지 않고 boolean 기반 쿼리로 처리함.

```java
@Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END " +
        "FROM ChatRoom c " +
        "WHERE c.id = :roomId " +
        "AND (((c.roomType = com.fullcount.domain.ChatRoomType.ONE_ON_ONE " +
        "        OR c.roomType = com.fullcount.domain.ChatRoomType.ONE_ON_ONE_DIRECT) " +
        "       AND (c.initiator.id = :memberId OR c.receiver.id = :memberId)) " +
        "  OR ((c.roomType <> com.fullcount.domain.ChatRoomType.ONE_ON_ONE " +
        "        AND c.roomType <> com.fullcount.domain.ChatRoomType.ONE_ON_ONE_DIRECT) " +
        "       AND EXISTS (SELECT 1 FROM ChatRoomParticipant cp WHERE cp.chatRoom = c AND cp.member.id = :memberId)))")
boolean isParticipant(@Param("roomId") Long roomId, @Param("memberId") Long memberId);
```

**적용 효과**

- 채팅방 입장 권한 확인 시 전체 엔티티 로딩 없이 즉시 검증 가능함
- 인증/인가 로직에서 불필요한 객체 그래프 탐색을 줄일 수 있음

### 8.3 조회 최적화 설계 원칙 요약

| 최적화 항목 | 적용 방식 | 기대 효과 |
| --- | --- | --- |
| N+1 문제 방지 | `fetch join`, `@EntityGraph` | 연관 엔티티 개별 조회 제거 |
| 목록 조회 최적화 | 페이징 + 정렬 | 필요한 범위만 효율적으로 조회 |
| 대용량 메시지 조회 | 커서 기반 `Slice` 조회 | offset paging 대비 성능 개선 |
| 요약/상세 분리 | summary / details 전용 쿼리 분리 | 화면 목적에 맞는 최소 데이터 로딩 |
| 존재 여부 검증 | boolean / exists 쿼리 | 불필요한 엔티티 조회 제거 |
| 마지막 데이터 조회 | 그룹별 최신 데이터 일괄 조회 | 반복 조회 제거 및 채팅 목록 성능 향상 |

### 8.4 본 프로젝트의 적용 방향

- 엔티티 매핑은 단순하고 일관되게 유지하며, 실제 조회 최적화는 Repository 쿼리에서 해결함
- 목록 조회와 상세 조회를 분리하여 필요한 연관 데이터 범위를 명확히 구분함
- 채팅 메시지처럼 데이터가 빠르게 누적되는 영역은 커서 기반 조회를 우선 적용함
- `Page`가 필요한 경우에는 `countQuery`를 분리하고, `Slice`가 가능한 경우에는 count 쿼리를 생략하여 성능을 확보함
- 연관 엔티티가 많더라도 무조건 fetch join 하지 않고, 실제 응답 DTO 구성에 필요한 범위까지만 join

---

## 9. 검증 및 제약조건

본 프로젝트는 입력값 검증을 Controller 계층의 DTO 검증과 데이터베이스 제약조건, 그리고 엔티티 내부 비즈니스 검증으로 다층적으로 구성함.

이를 통해 잘못된 요청은 가능한 한 API 진입 시점에 빠르게 차단하고, 최종적으로는 데이터베이스 레벨에서 무결성을 보장하도록 설계함.

특히 회원가입, 로그인, 토큰 재발급과 같이 인증과 관련된 요청은 형식 검증과 존재 여부 검증, 중복 검증, 만료 검증을 단계적으로 수행하여 안정성을 확보함.

### 9.1 Bean Validation 어노테이션

사용자 입력값 검증은 엔티티보다 DTO 계층에서 우선 수행함.

이 방식은 API 요청 단계에서 잘못된 데이터를 조기에 차단할 수 있고, 엔티티를 순수한 도메인 모델로 유지하는 데에도 유리함.

본 프로젝트에서는 `jakarta.validation` 기반의 Bean Validation 어노테이션을 활용하여 이메일 형식, 공백 여부, 길이 제한, 필수 값 여부 등을 검증함.

### 9.1.1 적용 원칙

- 사용자 입력 검증은 Request DTO에서 우선 수행함
- 형식 오류, 공백 입력, 길이 초과/미만 등은 Bean Validation으로 처리함
- 비즈니스 규칙 검증(중복 이메일, 존재하지 않는 팀, 비활성 회원 등)은 서비스 계층에서 처리함
- 엔티티에는 불필요한 검증 어노테이션을 남발하지 않고, API 입력 모델과 도메인 모델의 책임을 구분함

### 9.1.2 회원가입/로그인 DTO 검증 예시

```java
public class AuthDto {

    @Getter
    @NoArgsConstructor
    @Schema(description = "회원가입 요청")
    public static class SignupRequest {

        @Schema(description = "이메일", example = "testemail@test.com")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @NotBlank(message = "이메일은 필수입니다.")
        private String email;

        @Schema(description = "닉네임", example = "testname")
        @NotBlank(message = "닉네임은 필수입니다.")
        @Size(min = 2, max = 20, message = "닉네임은 2~20자 입력해주세요.")
        private String nickname;

        @Schema(description = "비밀번호", example = "1q2w3e4r")
        @NotBlank(message = "비밀번호는 필수입니다.")
        @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
        private String password;

        @Schema(description = "응원 팀 ID", example = "1")
        @NotNull(message = "응원 팀을 선택해주세요.")
        private String teamId;
    }

    @Getter
    @NoArgsConstructor
    @Schema(description = "로그인 요청")
    public static class LoginRequest {

        @Schema(description = "이메일", example = "testemail@test.com")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @NotBlank(message = "이메일은 필수입니다.")
        private String email;

        @Schema(description = "비밀번호", example = "1q2w3e4r")
        @NotBlank(message = "비밀번호는 필수입니다.")
        private String password;
    }

    @Getter
    @NoArgsConstructor
    public static class RefreshTokenRequest {

        @NotBlank(message = "리프레시 토큰은 필수입니다.")
        private String refreshToken;
    }
}
```

### 9.1.3 검증 항목 상세

| 검증 대상 | 적용 어노테이션 | 설명 | 검증 목적 |
| --- | --- | --- | --- |
| `email` | `@Email`, `@NotBlank` | 이메일 형식 및 공백 여부 검증 | 로그인 ID의 형식 오류 방지 |
| `nickname` | `@NotBlank`, `@Size(min=2, max=20)` | 닉네임 필수 입력 및 길이 제한 검증 | UI/비즈니스 정책에 맞는 닉네임 유지 |
| `password` | `@NotBlank`, `@Size(min=8)` | 비밀번호 필수 입력 및 최소 길이 검증 | 지나치게 짧은 비밀번호 사용 방지 |
| `teamId` | `@NotNull` | 응원 팀 선택 여부 검증 | 회원가입 시 팀 선택 누락 방지 |
| `refreshToken` | `@NotBlank` | 토큰 재발급 요청 시 필수값 검증 | 빈 토큰 요청 차단 |

### 9.1.4 검증 설계 의도

- 형식 검증은 DTO에서 처리하여 API 진입 시점에 빠르게 실패하도록 구성함
- 서비스 계층은 형식이 올바른 데이터만 전달받아 비즈니스 검증에 집중할 수 있음
- Swagger `@Schema` 예시값과 Bean Validation을 함께 사용하여 API 문서성과 개발 편의성을 높임

### 9.2 데이터베이스 제약조건

애플리케이션 레벨 검증만으로는 동시성 상황이나 예외적인 저장 경로를 완전히 통제할 수 없으므로, 최종적인 데이터 무결성은 데이터베이스 제약조건으로 보장함.

본 프로젝트에서는 `NOT NULL`, `UNIQUE`, 길이 제한, FK 제약, 인덱스, 복합 유니크 제약 등을 적극 활용함.

### 9.2.1 적용 원칙

- 필수 데이터는 `nullable = false`로 명확히 제한함
- 중복되면 안 되는 식별값은 `unique = true` 또는 `@UniqueConstraint`로 제약함
- 연관 데이터는 외래 키로 참조 무결성을 보장함
- 서비스 계층에서 먼저 검증하더라도, DB 제약조건은 반드시 최종 방어선으로 유지함

### 9.2.2 주요 적용 예시

```java
@Entity
@Table(name = "refresh_token")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", nullable = false, unique = true, length = 500)
    private String token;

    @Column(name = "member_id", nullable = false, unique = true)
    private Long memberId;

    @Column(name = "expiry_at", nullable = false)
    private LocalDateTime expiryAt;
}
```

```java
@Entity
@Table(name = "chat_room_participant",
       uniqueConstraints = {
           @UniqueConstraint(
               name = "uk_chat_room_participant_room_member",
               columnNames = {"chat_room_id", "member_id"}
           )
       })
public class ChatRoomParticipant {
    // ...
}
```

```java
@Entity
@Table(name = "crew_participant",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_crew_participant_post_member",
           columnNames = {"post_id", "member_id"}
       ))
public class CrewParticipant {
    // ...
}
```

### 9.2.3 주요 제약조건 예시 정리

| 엔티티 | 대상 컬럼 | 제약조건 | 목적 |
| --- | --- | --- | --- |
| `Member` | `email` | UNIQUE, NOT NULL | 이메일 중복 가입 방지 |
| `Member` | `nickname` | UNIQUE, NOT NULL | 닉네임 중복 방지 |
| `RefreshToken` | `token` | UNIQUE, NOT NULL | 동일 리프레시 토큰 중복 저장 방지 |
| `RefreshToken` | `member_id` | UNIQUE, NOT NULL | 회원당 하나의 리프레시 토큰만 유지 |
| `CrewParticipant` | `post_id`, `member_id` | 복합 UNIQUE | 동일 게시글 중복 참여 방지 |
| `ChatRoomParticipant` | `chat_room_id`, `member_id` | 복합 UNIQUE | 동일 채팅방 중복 참여 방지 |
| `Transfer` | `post_id` | UNIQUE | 동일 게시글 기반 거래 중복 생성 방지 |
| `BaseballGame` | `game_id` | UNIQUE, NOT NULL | 외부 경기 데이터 중복 저장 방지 |

### 9.3 엔티티 내부 제약 검증

DTO 검증과 DB 제약 외에도, 도메인 규칙 자체는 엔티티 내부 메서드 또는 서비스 계층의 비즈니스 검증으로 보완함.

즉, “형식이 맞는 값”과 “비즈니스적으로 유효한 값”은 구분해서 처리함.

### 9.3.1 엔티티 내부 검증 예시

```java
public void changeTeam(Team newTeam) {
    if (this.teamChangedThisSeason) {
        throw new BusinessException(ErrorCode.TEAM_CHANGE_LIMIT);
    }

    if (this.team != null && this.team.getId().equals(newTeam.getId())) {
        throw new BusinessException(ErrorCode.ALREADY_IN_TEAM);
    }

    this.team = newTeam;
    this.teamChangedThisSeason = true;
}
```

```java
public void deduct(int amount) {
    if (this.balance < amount) {
        throw new BusinessException(ErrorCode.INSUFFICIENT_BALANCE);
    }
    this.balance -= amount;
}
```

```java
public void payEscrow(Member buyer) {
    if (this.status != TransferStatus.REQUESTED) {
        throw new BusinessException(ErrorCode.TRANSFER_PAYMENT_NOT_ALLOWED);
    }
    this.buyer = buyer;
    this.status = TransferStatus.PAYMENT_COMPLETED;
}
```

### 9.3.2 검증 역할 분리

| 검증 계층 | 검증 내용 | 예시 |
| --- | --- | --- |
| DTO 검증 | 입력 형식, 공백 여부, 길이 제한 | 이메일 형식, 비밀번호 최소 길이 |
| 서비스 검증 | 중복 여부, 존재 여부, 인증/인가 | 중복 이메일, 팀 존재 여부, 비활성 회원 |
| 엔티티 검증 | 상태 전이, 도메인 규칙 | 잔액 부족 차감 방지, 거래 상태 전이 제한 |
| DB 제약조건 | 최종 무결성 보장 | UNIQUE, NOT NULL, FK |

### 9.4 인증 도메인 검증 흐름

본 프로젝트의 인증 기능은 단순 형식 검증을 넘어서, 서비스 계층에서 비즈니스 검증을 함께 수행함.

특히 회원가입, 로그인, 토큰 재발급은 아래와 같은 단계로 검증함.

### 9.4.1 회원가입 검증 흐름

- DTO에서 이메일 형식, 닉네임 길이, 비밀번호 길이, 팀 선택 여부를 검증함
- 서비스 계층에서 이메일 중복 여부를 확인함
- 서비스 계층에서 닉네임 중복 여부를 확인함
- 서비스 계층에서 선택한 팀이 실제 존재하는지 검증함
- 검증 통과 후 비밀번호를 암호화하여 회원 엔티티를 저장함

```java
@Transactional
public void signup(AuthDto.SignupRequest req) {
    if (memberRepository.existsByEmail(req.getEmail())) {
        throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
    }

    if (memberRepository.existsByNickname(req.getNickname())) {
        throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME);
    }

    Team team = findTeam(req.getTeamId());
    String encodedPassword = passwordEncoder.encode(req.getPassword());

    memberRepository.save(MemberMapper.toMember(req, team, encodedPassword));
}
```

### 9.4.2 로그인 검증 흐름

- DTO에서 이메일/비밀번호 공백 및 이메일 형식을 검증함
- 서비스 계층에서 이메일 기준 회원 존재 여부를 검증함
- 계정 활성화 여부를 검증함
- 비밀번호와 암호화 값 일치 여부를 검증함
- 검증 통과 후 Access Token / Refresh Token을 발급함

```java
@Transactional
public AuthDto.TokenResponse login(AuthDto.LoginRequest req) {
    Member member = memberRepository.findByEmail(req.getEmail())
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

    if (!Boolean.TRUE.equals(member.getIsActive())) {
        throw new BusinessException(ErrorCode.INACTIVE_MEMBER);
    }

    if (!passwordEncoder.matches(req.getPassword(), member.getPassword())) {
        throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
    }

    return generateTokenSet(member.getId(), member.getEmail(), member.getRole());
}
```

### 9.4.3 토큰 재발급 검증 흐름

- DTO에서 refresh token 공백 여부를 검증함
- DB에 저장된 토큰인지 확인함
- DB 기준 만료 시각을 확인함
- 토큰 소유 회원이 존재하는지 확인함
- 검증 통과 후 새로운 토큰 세트를 발급함

```java
@Transactional
public AuthDto.TokenResponse refresh(AuthDto.RefreshTokenRequest req) {
    String token = req.getRefreshToken();

    RefreshToken savedToken = refreshTokenRepository.findByToken(token)
            .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_TOKEN));

    if (savedToken.getExpiryAt().isBefore(LocalDateTime.now())) {
        throw new BusinessException(ErrorCode.EXPIRED_TOKEN);
    }

    Member member = memberRepository.findById(savedToken.getMemberId())
            .orElseThrow(() -> new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

    return generateTokenSet(member.getId(), member.getEmail(), member.getRole());
}
```

### 9.5 검증 및 제약조건 설계 원칙 요약

| 구분 | 적용 위치 | 목적 |
| --- | --- | --- |
| 형식 검증 | Request DTO | 잘못된 입력을 API 진입 단계에서 차단 |
| 비즈니스 검증 | Service / Entity | 도메인 정책과 상태 전이 제어 |
| 무결성 제약 | Database | 동시성 상황 포함 최종 데이터 보호 |
| 오류 응답 일관성 | BusinessException / ErrorCode | 예외 상황을 표준화하여 처리 |

### 9.6 본 프로젝트의 적용 방향

- 입력 형식 검증은 DTO에서 수행함
- 비즈니스 규칙은 서비스 및 엔티티 메서드에서 검증함
- 최종 데이터 무결성은 데이터베이스 제약조건으로 보장함
- 동일한 검증을 한 계층에만 의존하지 않고, 역할을 나누어 다층 방어 구조로 설계함
- 인증, 채팅, 참여, 거래 도메인 모두에서 “사전 검증 + 상태 검증 + DB 제약” 구조를 일관되게 유지함

---

## 10. 테스트 전략

### 10.1 Entity 단위 테스트

엔티티 테스트에서는 도메인 객체가 생성되거나 상태가 변경될 때, 비즈니스 규칙이 올바르게 반영되는지를 검증함.

예를 들어 Member 엔티티 생성 시 기본 상태값, 기본 대출 가능 권수, 회원번호 생성 규칙 등이 정상적으로 설정되는지 확인함.

```java
@DisplayName("Member Entity 테스트")
class MemberTest {

    @Test
    @DisplayName("회원 생성 시 기본값이 올바르게 설정되어야 한다")
    void createMember_ShouldSetDefaultValues() {
        // given
        String name = "김철수";
        String email = "kim@test.com";
        String password = "password123";

        // when
        Member member = Member.createMember(name, email, password);

        // then
        assertThat(member.getStatus()).isEqualTo(MemberStatus.ACTIVE);
        assertThat(member.getMaxLoanCount()).isEqualTo(5);
        assertThat(member.getMemberNumber()).startsWith("M");
        assertThat(member.getMemberNumber()).hasSize(10);
    }
}
```

이와 같은 Entity 테스트를 통해 생성 메서드나 도메인 로직 내부에서 정의한 규칙이 항상 동일하게 적용되는지 보장할 수 있음.

### 10.2 Repository 테스트

Repository 테스트에서는 JPA 쿼리 메서드 및 커스텀 조회 로직이 의도한 조건대로 동작하는지를 검증함.

특히 회원 ID, 상태값, 연관관계 조건 등을 기준으로 올바른 데이터가 조회되는지 확인함.

```java
@DataJpaTest
@DisplayName("LoanRepository 테스트")
class LoanRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private LoanRepository loanRepository;

    @Test
    @DisplayName("회원 ID와 상태로 대출 목록을 조회해야 한다")
    void findByMemberIdAndStatus_ShouldReturnLoans() {
        // given
        Member member = createAndSaveMember();
        Book book = createAndSaveBook();
        Loan loan = createAndSaveLoan(member, book, LoanStatus.BORROWED);

        // when
        List<Loan> result = loanRepository.findByMemberIdAndStatus(
            member.getId(), LoanStatus.BORROWED);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(loan.getId());
    }
}
```

이를 통해 단순 CRUD뿐 아니라 조건 기반 조회 메서드가 정확히 동작하는지 검증할 수 있음.

### 10.3 Service 단위 테스트

Service 테스트에서는 비즈니스 로직이 여러 Repository와 연계될 때 예상한 흐름대로 처리되는지 검증함.

본 프로젝트에서는 Mockito 기반 단위 테스트를 활용하여 AdminService의 주요 관리 기능을 검증함. 실제 코드에서는 대시보드 집계, 회원 삭제, 게시글 삭제, 거래 완료·취소 처리 등 핵심 관리자 기능을 테스트하고 있음.

예를 들어, 대시보드 요약 정보가 여러 저장소의 집계 결과를 하나의 응답으로 올바르게 조합하는지 검증할 수 있음.

```java
@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService 테스트")
class AdminServiceTest {

    @Mock
    private AdminDashboardRepository adminDashboardRepository;

    @InjectMocks
    private AdminService adminService;

    @Test
    @DisplayName("대시보드 요약은 회원, 게시글, 양도 집계를 하나의 응답으로 합친다")
    void getDashboardSummary_aggregatesRepositorySummaries() {
        // given
        when(adminDashboardRepository.fetchDashboardSummary())
                .thenReturn(dashboardSummary(10, 8, 2, 1, 9, 5, 2, 2, 7, 4, 2, 1));

        // when
        DashboardSummary result = adminService.getDashboardSummary();

        // then
        assertThat(result.getMemberCount()).isEqualTo(10);
        assertThat(result.getPostCount()).isEqualTo(9);
        assertThat(result.getTransferCount()).isEqualTo(7);
        assertThat(result.getPendingTransferCount()).isEqualTo(4);
    }
}
```

또한 예외 상황도 함께 검증함. 예를 들어 관리자가 자기 자신의 계정을 비활성화하려고 할 때 예외가 발생해야 하며, 연관 데이터가 있는 회원은 삭제되지 않아야 함. 실제 테스트 코드에서도 이러한 예외 흐름을 검증하고 있음.

이를 통해 서비스 계층이 단순 조회를 넘어서 실제 업무 규칙을 정확히 수행하는지 확인할 수 있음.

### 10.4 외부 연동 및 크롤링 테스트

외부 사이트에서 경기 일정을 수집하는 기능은 일반적인 단위 테스트와 달리 외부 HTTP 요청과 응답 형식을 함께 검증해야 함.

본 프로젝트에서는 Jsoup를 사용하여 KBO 일정 AJAX 엔드포인트에 요청을 보내고, 응답 데이터가 정상적으로 수신되는지 확인하는 테스트를 수행함.

```java
public class ScrapeTest {

    @Test
    public void testScrape() throws Exception {
        String year = "2026";
        String month = "04";

        System.out.println("Fetching AJAX endpoint...");
        Document doc = Jsoup.connect("https://www.koreabaseball.com/ws/Schedule.asmx/GetScheduleList")
                .header("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
                .header("X-Requested-With", "XMLHttpRequest")
                .data("leId", "1")
                .data("srIdList", "0,9,6")
                .data("seasonId", year)
                .data("gameMonth", month)
                .data("teamId", "")
                .ignoreContentType(true)
                .post();

        System.out.println(doc.body().text().substring(0, Math.min(500, doc.body().text().length())));
    }
}
```

이 테스트는 다음 항목을 검증하는 데 의미가 있음.

- 외부 KBO 일정 API 엔드포인트 호출 가능 여부 확인
- 요청 파라미터(year, month, league 등) 전달 정상 여부 확인
- AJAX 응답 데이터가 비어 있지 않고 정상적으로 반환되는지 확인
- 이후 파싱 로직 구현 전, 원본 응답 형식을 사전 점검

즉, ScrapeTest는 외부 연동 기능에 대한 사전 검증 및 통합 테스트 성격을 가지며, 추후 일정 데이터 파싱 및 저장 기능의 안정성을 확보하는 기반이 됨.

### 10.5 테스트 전략 요약

본 프로젝트는 테스트 대상을 계층별로 구분하여 검증함.

- Entity 테스트: 도메인 객체의 생성 규칙과 상태값 검증
- Repository 테스트: 데이터 조회 및 조건 검색 검증
- Service 테스트: 비즈니스 로직 및 예외 처리 검증
- 외부 연동 테스트: KBO 일정 크롤링 요청 및 응답 형식 검증

이를 통해 도메인 규칙, 데이터 접근, 서비스 로직, 외부 시스템 연동까지 전반적인 안정성을 확보하도록 테스트 전략을 구성함.

---

## 11. 성능 모니터링

### 11.1 쿼리 성능 모니터링

본 프로젝트는 JPA 및 Hibernate 기반으로 데이터를 처리하므로, SQL 실행 여부와 쿼리 동작 방식을 확인할 수 있도록 로그 기반 쿼리 모니터링 설정을 적용함.

개발 환경에서는 SQL 출력과 정렬된 포맷을 활성화하여 실행되는 쿼리를 쉽게 확인할 수 있도록 구성하였으며, 필요 시 배치 조회 성능 개선을 위해 `default_batch_fetch_size` 옵션도 함께 적용함.

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        default_batch_fetch_size: 100

logging:
  level:
    org.hibernate.SQL: off
    org.hibernate.orm.jdbc.bind: off
    org.springframework.jdbc.core: off
    com.fullcount.service.AdminService: debug
```

각 설정의 의미는 다음과 같음.

- `spring.jpa.show-sql: true`
JPA가 실행하는 SQL을 콘솔에 출력하여 실제 어떤 쿼리가 수행되는지 확인할 수 있도록 함.
- `hibernate.format_sql: true`
SQL을 보기 좋은 형태로 정렬하여 출력함으로써, 복잡한 조인 쿼리나 조건문을 분석하기 쉽게 함.
- `hibernate.default_batch_fetch_size: 100`
지연 로딩 과정에서 연관 엔티티를 한 번에 묶어서 조회할 수 있도록 하여, N+1 문제 완화에 도움을 줌.
- `logging.level`
특정 패키지 및 SQL 로그 레벨을 조정하여 필요한 로그만 선택적으로 확인할 수 있도록 구성함.

즉, 개발 단계에서는 SQL 출력과 Hibernate 설정을 통해 쿼리 동작을 직접 확인하고, 성능 저하가 발생할 수 있는 비효율 쿼리를 빠르게 파악할 수 있도록 함.

### 11.2 환경별 데이터베이스 및 모니터링 설정

본 프로젝트는 `dev`와 `prod` 프로필을 분리하여 환경에 따라 서로 다른 데이터베이스와 설정을 적용함.

기본 활성 프로필은 `dev`이며, 개발 환경에서는 H2 인메모리 데이터베이스를 사용하여 테스트와 검증을 빠르게 수행하고, 운영 환경에서는 MySQL 데이터베이스를 사용하도록 구성함.

```yaml
spring:
  profiles:
    active: dev
```

개발 환경 설정은 다음과 같음.

```yaml
spring:
  config:
    activate:
      on-profile: dev

  datasource:
    url: jdbc:h2:mem:fullcountdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
    driver-class-name: org.h2.Driver
    username: sa
    password:

  h2:
    console:
      enabled: true
      path: /h2-console

  sql:
    init:
      mode: always
      data-locations: classpath:data.sql

  jpa:
    defer-datasource-initialization: true
```

개발 환경에서는 H2 콘솔을 활성화하여 데이터 상태를 즉시 확인할 수 있으며, 초기 데이터 삽입을 위해 `data.sql`을 자동 실행하도록 설정함. 이를 통해 기능 개발 중 쿼리 결과를 빠르게 검증할 수 있음.

운영 환경 설정은 다음과 같음.

```yaml
spring:
  config:
    activate:
      on-profile: prod

  datasource:
    url: jdbc:mysql://localhost:3306/fullcount?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

  jpa:
    hibernate:
      ddl-auto: update
```

운영 환경에서는 MySQL을 사용하며, 계정 정보는 환경 변수로 분리하여 보안을 강화함.

이처럼 프로필을 분리함으로써 개발 단계에서는 빠른 검증과 디버깅에 집중하고, 운영 단계에서는 실제 서비스 환경에 맞는 안정적인 데이터 처리를 수행할 수 있도록 구성함.

### 11.3 성능 모니터링 활용 방안

쿼리 성능 모니터링은 단순히 SQL을 출력하는 데 목적이 있는 것이 아니라, 실제 서비스 로직의 병목 구간을 파악하는 데 활용됨.

예를 들어 목록 조회 기능, 관리자 통계 조회, 게시글 및 거래 관련 조회에서 발생하는 SQL을 분석하여 다음과 같은 항목을 점검할 수 있음.

- 동일한 조회가 반복적으로 발생하는지 여부 확인
- 연관 엔티티 조회 과정에서 N+1 문제가 발생하는지 확인
- 불필요한 조인이나 중복 조회가 존재하는지 확인
- 페이징 처리 시 count 쿼리와 실제 조회 쿼리가 비효율적으로 동작하는지 확인

이러한 모니터링 결과를 기반으로 fetch join, DTO 조회, 배치 페치, 인덱스 점검 등의 최적화를 적용할 수 있음.

즉, 본 프로젝트의 쿼리 성능 모니터링은 개발 단계에서 문제를 사전에 발견하고, 운영 환경에서의 성능 저하 가능성을 줄이기 위한 기반 역할을 수행함.

### 11.4 성능 모니터링 요약

본 프로젝트는 JPA 및 Hibernate 설정을 통해 SQL 실행 로그를 확인할 수 있도록 구성하였으며, 개발 환경과 운영 환경을 분리하여 목적에 맞는 데이터베이스 설정을 적용함.

또한 배치 조회 옵션과 로그 레벨 조정을 통해 쿼리 분석과 성능 최적화가 가능하도록 설계함.

정리하면 다음과 같음.

- 개발 환경에서는 H2와 SQL 로그를 활용하여 빠른 검증 수행
- 운영 환경에서는 MySQL과 환경 변수 기반 설정으로 안정성 확보
- Hibernate 쿼리 로그와 배치 옵션을 통해 성능 병목 구간 분석 가능
- N+1 문제, 중복 조회, 비효율 쿼리 식별을 통해 성능 개선 기반 마련