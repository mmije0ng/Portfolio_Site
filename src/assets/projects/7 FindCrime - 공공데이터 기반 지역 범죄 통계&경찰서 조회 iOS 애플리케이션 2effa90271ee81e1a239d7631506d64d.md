# 7. FindCrime - 공공데이터 기반 지역 범죄 통계&경찰서 조회 iOS 애플리케이션

프로젝트 유형: 개인프로젝트
프로젝트 설명: 지역 범죄 통계&경찰서 조회 iOS 애플리케이션
사용 기술: JAVA, JWT, MySQL, OAuth2.0, QueryDSL, SpringBoot, Swift, SwiftUI, 공공데이터
담당 역할: 풀스택 (iOS, 백엔드)
작업기간: 2025년 6월 11일 → 2025년 6월 22일
GitHub 링크: SpringBoot: https://github.com/mmije0ng/FindCrime-SpringBoot
iOS: https://github.com/mmije0ng/FindCrime-iOS

![스크린샷 2025-09-30 오후 6.16.11.png](%E1%84%89%E1%85%B3%E1%84%8F%E1%85%B3%E1%84%85%E1%85%B5%E1%86%AB%E1%84%89%E1%85%A3%E1%86%BA_2025-09-30_%E1%84%8B%E1%85%A9%E1%84%92%E1%85%AE_6.16.11.png)

## ***Overview***

---

**공공데이터 기반 지역 범죄 통계 및 주변 경찰서 정보를 제공하는 iOS 애플리케이션**

- 공공데이터를 활용해 지역별, 범죄 유형별 통계를 다각도로 조회할 수 있는 기능 제공
- 사용자 현재 위치를 기반으로 인근 경찰서 정보를 지도상에 시각화

## *Tech Stack*

---

![image.png](image%2030.png)

| 구분 | 내용 |
| --- | --- |
| **Backend** | JAVA, SpringBoot, JPA, QueryDSL, SpringSecurity, JWT, OAuth2.0, 공공데이터 |
| **DataBase** | MySQL, Redis |
| **iOS** | Swift, SwiftUI, Kakao Map SDK |

## *P**articipants***

---

- **1명 (개인 프로젝트, 풀스택)**: 백엔드 서버 설계/구현 및 iOS 앱 개발 전 과정 수행

## *Contributions*

---

### **1. Full-Stack 개발**

- SwiftUI 기반 iOS 앱과 Spring Boot 기반 백엔드 서버를 독립적으로 설계 및 구축

### **2. OAuth2.0 기반 카카오 소셜 로그인**

![image.png](image%2031.png)

![image.png](image%2032.png)

- 카카오 OAuth 2.0 기반 소셜 로그인 기능을 구현하고, JWT를 활용한 사용자 인증·인가 프로세스 구축

### **3. 공공데이터 기반 범죄 통계 조회**

- 공공데이터는 지역, 범죄 대분류, 범죄 중분류를 기준으로 조회할 수 있습니다.
- 조회 조건이 '전국 전체'일 경우, 범죄 종류별 데이터를 전국 단위로 합산하여 제공하며,
- '서울 전체'와 같이 특정 시·도 전체를 선택한 경우에는 해당 지역 내 모든 구의 범죄 데이터를 범죄 종류별로 합산하여 제공합니다.

![image.png](image%2033.png)

![image.png](image%2034.png)

![image.png](image%2035.png)

![image.png](image%2036.png)

### **4. 주변 경찰서 찾기**

![image.png](image%2037.png)

![image.png](image%2038.png)

- 카카오맵의 키워드 기반 장소 검색 라이브러리를 활용하여, 지도를 통해 사용자 주변의 경찰서 위치 정보를 확인할 수 있습니다.

### **5. 지역 사건 제보**

![image.png](image%2039.png)

![image.png](image%2040.png)

![image.png](image%2041.png)

![image.png](image%2042.png)

## *Problem Solving*

---

### 1. 공공데이터 적재 및 범죄 통계 처리 성능 최적화

- **문제**: 수많은 공공데이터 레코드를 DB에 적재하고 통계를 산출하는 과정에서, 건별 중복 검증과 잦은 DB I/O 발생으로 인한 심각한 병목 현상 및 성능 저하 발생
- **해결**:
    - **In-Memory 캐싱 전략**: 적재 및 조회 시 필요한 데이터를 메모리에 1회 선로드한 뒤, `Map`/`Set` 자료구조를 활용한 캐시 구조로 전환
    - **연산 효율화**: 반복적인 DB 접근 대신 **O(1)** 시간 복잡도를 갖는 메모리 연산으로 중복 검증 및 통계 합산 처리
    - **Batch Insert 적용**: JPA Batch 저장 전략을 적용하여 수천 건의 데이터를 한 번의 쿼리로 처리함으로써 네트워크 및 DB 오버헤드 최소화
- **결과**
    - 데이터 적재 및 통계 조회 속도를 획기적으로 개선하고 대용량 데이터 처리의 안정성 확보
    - **DB 직접 호출(save, findAllByCrimeYear) → Map 캐시 & saveAll(batch)** 로 교체

### 1-1) CSV loop에서 통계 저장 부분

```java
*// ✅ 기존*
statisticRepository.findByCrimeAreaAndCrimeYear(crimeArea, year).ifPresentOrElse(
    stat -> {
        stat.setCrimeCount(count);
        statisticRepository.save(stat);
    },
    () -> statisticRepository.save(
        CrimeAreaStatistic.builder()
            .crimeArea(crimeArea)
            .crimeYear(year)
            .crimeCount(count)
            .build()
    )
);
```

```java
// ✅ 개선 (배치)// 기존 통계는 Map에서 조회 → 메모리 update
CrimeAreaStatistic stat = statByCrimeAreaId.get(crimeArea.getId());
if (stat == null) {
    stat = CrimeAreaStatistic.builder()
            .crimeArea(crimeArea)
            .crimeYear(year)
            .crimeCount(count)
            .build();
    statByCrimeAreaId.put(crimeArea.getId(), stat);
} else {
    stat.setCrimeCount(count);
}
buffer.add(stat);

// 배치 단위로 saveAll + flush/clearif (buffer.size() >= BATCH_SIZE) {
    statisticRepository.saveAll(buffer);
    em.flush();
    em.clear();
    buffer.clear();
}
```

### 1-2) 지역 전체(…전체) 합산 부분

```java
// ✅ 기존
List<CrimeAreaStatistic> partialStats = statisticRepository.findAllByCrimeYear(year).stream()
    .filter(stat -> {
        CrimeArea ca = stat.getCrimeArea();
        Area a = ca.getArea();
        return ca.getCrime().getId().equals(crime.getId())
            && a.getAreaName().equals(baseRegion)
            && !a.getAreaDetailName().endsWith("전체");
    })
    .toList();

int totalCount = partialStats.stream()
    .mapToInt(CrimeAreaStatistic::getCrimeCount)
    .sum();
```

```java
// ✅ 개선int totalCount = childAreaIds.stream()
    .map(childId -> {
        String key = crime.getId() + ":" + childId;
        CrimeArea ca = crimeAreaByKey.get(key);
        if (ca == null) return 0;
        CrimeAreaStatistic s = statByCrimeAreaId.get(ca.getId());
        return (s == null ? 0 : s.getCrimeCount());
    })
    .mapToInt(Integer::intValue)
    .sum();
```

### 1-3) 전국 전체 합산 부분

```java
// ✅ 기존
int totalNationalCount = statisticRepository.findAllByCrimeYear(year).stream()
    .filter(stat -> {
        CrimeArea ca = stat.getCrimeArea();
        Area a = ca.getArea();
        return ca.getCrime().getId().equals(crime.getId())
            && a.getAreaDetailName().endsWith("전체")
            && !a.getAreaName().equals("전국");
    })
    .mapToInt(CrimeAreaStatistic::getCrimeCount)
    .sum();
```

```java
*// ✅ 개선*
int nationalSum = provinceTotals.stream()
    .map(provTotalArea -> {
        String k = crime.getId() + ":" + provTotalArea.getId();
        CrimeArea ca = crimeAreaByKey.get(k);
        if (ca == null) return 0;
        CrimeAreaStatistic s = statByCrimeAreaId.get(ca.getId());
        return (s == null ? 0 : s.getCrimeCount());
    })
    .mapToInt(Integer::intValue)
    .sum();
```

### 1-4) 엔티티 저장 방식

```java
*// ✅ 기존*
statisticRepository.save(stat);
```

```java
// ✅ 개선
buffer.add(stat);
if (buffer.size() >= BATCH_SIZE) {
    statisticRepository.saveAll(buffer);
    em.flush();
    em.clear();
    buffer.clear();
}
```

### 1-5) 기존 코드

- **특징**
    - CSV 레코드를 돌면서 statisticRepository.findByCrimeAreaAndCrimeYear() → 있으면 update, 없으면 save.
    - 통계 합산 단계에서도 findAllByCrimeYear(year)를 여러 번 호출하면서 다시 filter.
    - 각 insert/update 때마다 statisticRepository.save() → SQL이 개별적으로 계속 발생.
    - 결국 대량 CSV(수천~수만 건)를 처리할 때 DB I/O가 **레코드 단위**로 일어나 병목 발생.
- **문제점**
    - 반복 루프마다 DB select & save 호출 → N+1 문제 유발.
    - 메모리 캐싱이나 1차 캐시 clear 없음 → 엔티티가 쌓이면 JPA dirty checking 부하 발생.
    - 전국/전체 합산 단계에서 매번 전체 findAllByCrimeYear() 다시 조회 → 불필요한 반복.

### 1-6) 개선 코드

- **사전 로드 & 캐시**:
        - 모든 Area, Crime, CrimeArea, CrimeAreaStatistic를 미리 Map에 적재.
        - CSV 처리 중 DB 조회 없음 (Map lookup만 수행).
- **배치 버퍼**:
        - 일정량(BATCH_SIZE=1000) 단위로 모아서 saveAll(buffer) 실행.
        - 이후 em.flush() + em.clear()로 1차 캐시 초기화 → 메모리 부하 방지.
- **업데이트/삽입(upsert)도 메모리에서 처리**:
        - statByCrimeAreaId 맵을 기준으로 존재하면 update, 없으면 새 엔티티 추가.
        - 마지막에 버퍼 플러시.
- **합산 단계도 캐시 기반**:
        - statByCrimeAreaId와 crimeAreaByKey Map을 이용해 in-memory 합산.
        - findAllByCrimeYear(year)를 중복 호출하지 않고 최초 로드 데이터 재활용.
- **장점**
    - DB round-trip 횟수 **수천→수십 회**로 급감.
    - flush/clear로 영속성 컨텍스트 부담 완화.
    - 전체 CSV 처리 시 속도 **수 배 이상 개선**.
    - CPU vs DB 부하 중 DB 부하가 크게 줄어듦.
    

| CSV 처리 중 DB 조회 | 각 레코드마다 findBy... 실행 | 최초 한 번 전체 로드 후 Map 캐시 |
| --- | --- | --- |
| 저장 방식 | 레코드마다 save() 호출 | 1000건 단위 saveAll(), flush/clear |
| 통계 합산 | 매번 findAllByCrimeYear(year) 다시 호출 | 최초 로드된 statByCrimeAreaId Map 재사용 |
| 영속성 컨텍스트 | 계속 엔티티 누적 → dirty checking 부하 | flush+clear 주기적 실행으로 부하 완화 |
| 성능 | 수천 레코드 처리 시 DB I/O 폭증 | 네트워크/DB 부하 최소화, 메모리 기반 처리 |

## *Resources*

---

프로젝트 링크

- GitHub (SpringBoot): [https://github.com/mmije0ng/FindCrime-SpringBoot](https://github.com/mmije0ng/FindCrime-SpringBoot)
- GitHub (iOS): [https://github.com/mmije0ng/FindCrime-iOS](https://github.com/mmije0ng/FindCrime-iOS)


관련 자료

- 발표 자료: [Google Slides](https://docs.google.com/presentation/d/16nGW47Y3lqN6Vt8GJisf7oHlXHSy_6LH/edit?usp=sharing&ouid=104382857428857441544&rtpof=true&sd=true)
- 기술 블로그 (최적화 과정): [공공데이터 Batch 처리 리팩토링 상세 보기](https://mmije0ng.tistory.com/entry/%EB%A6%AC%ED%8C%A9%ED%86%A0%EB%A7%81-%EA%B3%B5%EA%B3%B5%EB%8D%B0%EC%9D%B4%ED%84%B0-%ED%86%B5%EA%B3%84-CSV-JPA-%EB%B0%B0%EC%B9%98-%EC%B2%98%EB%A6%AC%EB%A1%9C-DB%EC%97%90-%EC%A0%81%EC%9E%AC%ED%95%98%EA%B8%B0)