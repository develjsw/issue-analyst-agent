# 테스트 가이드

현재 구현된 기능(Issue/Document CRUD · Document 인덱싱·검색 · Issue 인덱싱 · Tool Calling 분류)을 직접 시연하는 방법
가장 편한 방법은 Swagger UI(`http://localhost:3000/docs`)에서 클릭
아래 curl은 git bash 기준 참고용

---

## 0. 준비

```bash
# 1) 인프라 기동 (MySQL 3307 / Qdrant / Redis)
docker compose up -d

# 2) .env 에 OPENAI_API_KEY 있는지 확인 (임베딩·분류가 실제 OpenAI 호출)

# 3) 개발 서버
pnpm run start:dev
```

- API 문서: http://localhost:3000/docs
- 모든 응답은 `{ data, meta }` 래퍼로 감싸짐

---

## 시나리오 A - Document 인덱싱·검색

> OPENAI_API_KEY 필요 (임베딩)

### A-1. 문서 등록

```bash
curl -X POST http://localhost:3000/document \
  -H "Content-Type: application/json" \
  -d '{
    "title": "결제 API v2 명세서",
    "content": "POST /payments 결제 승인 콜백 수신 시 order_status를 PAID로 갱신함. 콜백 누락 시 상태가 변경되지 않음.",
    "type": "API_DOC"
  }'
```

- 기대: `data.id` 발급, `isIndexed: false`

### A-2. 인덱싱 (청킹 → 임베딩 → Qdrant `documents` 컬렉션 저장)

```bash
curl -X POST http://localhost:3000/document/1/index   # 1 = 위에서 받은 문서 id
```

- 기대: 200, 서버 로그에 `청킹 완료` / `인덱싱 완료`
- 확인: `GET /document/1` → `isIndexed: true`

### A-3. 유사 청크 검색

```bash
curl -X POST http://localhost:3000/document/search \
  -H "Content-Type: application/json" \
  -d '{ "query": "결제 후 주문 상태가 안 바뀜", "topK": 5 }'
```

- 기대: `data`에 `{ score, payload: { documentId, chunkIndex, content, type } }` 배열
- 확인 포인트: 등록한 문서 청크가 상위에 score와 함께 반환되는지
- (옵션) `type` 필터: `{ "query": "...", "type": "API_DOC" }`

---

## 시나리오 B - Issue 벡터 인덱싱 (백필)

> OPENAI_API_KEY 필요 (임베딩)
> Step 1a 시점: 인덱싱은 백필 엔드포인트로 수동
> Step 1b에서 분류 완료 시 자동 인덱싱 도입 예정

### B-1. 이슈 인덱싱 (1이슈=1벡터 → Qdrant `issues` 컬렉션 저장)

```bash
curl -X POST http://localhost:3000/issue/3/index   # 3 = 등록된 이슈 id
```

- 기대: 200, 서버 로그에 `이슈 N 인덱싱 완료`
- 확인: `GET /issue/3` → `isIndexed: true`
- Qdrant: `issues` 컬렉션에 `{ issueId, title, category, status }` payload 점 1개

---

## 시나리오 C - Tool Calling 이슈 분류

> OPENAI_API_KEY 필요 (LLM)

### C-1. 이슈 등록

```bash
curl -X POST http://localhost:3000/issue \
  -H "Content-Type: application/json" \
  -d '{
    "title": "결제 완료 후 주문 상태가 변경되지 않음",
    "body": "결제 승인 콜백 이후 order_status가 PAID로 갱신되지 않음"
  }'
```

- 기대: `data.id` 발급, `category: null`, `status: "OPEN"`

### C-2. 분류 실행

```bash
curl -X POST http://localhost:3000/tool/classify/1   # 1 = 위 이슈 id
```

- 기대: `data` = `{ category, reason }` (예: `category: "BUG"`)
- 확인 포인트: `GET /issue/1` → `category`가 분류값으로 저장됐는지 (분류는 순수 반환, 저장은 컨트롤러가 수행)

---

## CRUD 단독 확인 (OpenAI 키 불필요)

- 이슈: `GET /issue`, `GET /issue/:id`, `PATCH /issue/:id`, `DELETE /issue/:id`
- 문서: `GET /document?type=API_DOC&page=1&limit=20`, `PATCH /document/:id`, `DELETE /document/:id`

---

## 종료

```bash
docker compose down        # 데이터 유지하며 중지하려면 down 대신 stop
```

## 막히면 체크
- 404/검색 결과 없음 → A-2 인덱싱을 먼저 했는지
- 500 (분류·검색) → `.env` OPENAI_API_KEY 확인
- DB 연결 실패 → MySQL 포트 3307, `docker compose ps`로 컨테이너 상태 확인
