# CLAUDE.md — Backend Issue Analyst Agent

프로젝트의 단일 진실 원천(Single Source of Truth)이자, Claude가 작업 시 반드시 따라야 하는
작업 틀(operating framework)임. 모든 구현은 이 문서의 규칙·컨벤션 안에서만 이루어짐

---

## 1. 프로젝트 정체성

QA 이슈·API 문서·기획 문서·에러 로그를 기반으로 **원인 후보와 수정 범위를 분석**하는
AI Agent 백엔드 서비스. 운영/QA 과정에서 반복되는 이슈 분석 업무를 **RAG + Tool Calling +
Agent Workflow**로 자동화함

---

## 2. 기술 스택 + 선택 근거

학습용 프로젝트임. 각 선택의 **근거를 명시**해 "왜 이 기술을 쓰는가",
"대안 대비 어떤 트레이드오프가 있는가"를 이해하고 넘어가는 것을 목표로 함

| 영역 | 선택 | 근거 |
|------|------|------|
| 런타임 | Node.js 22 / TypeScript | 기존 백엔드 경험과의 연속성, 타입 안정성 |
| 패키지 매니저 | pnpm | 디스크 효율, 모노레포 확장 대비 |
| 프레임워크 | NestJS | 모듈/DI 구조로 AI 기능을 백엔드 서비스로 구조화 |
| RDB | MySQL | 사내 표준 RDB라 실무와 호환·연속성 확보. 익숙한 도구로 학습 부담 최소화 |
| ORM | Prisma | 타입 안정성·마이그레이션·DX 우위, 스키마 단일 파일 |
| Vector DB | Qdrant | 수천~수만 chunk 규모에 적합, docker 한 줄, 메타 필터링 강력 |
| 임베딩 | OpenAI text-embedding-3-small (1536차원) | 한+영 혼합 데이터에 적합한 다국어 모델, API라 호스팅 부담 0 |
| 캐시/큐 | Redis | LLM/임베딩 응답 캐싱, BullMQ 작업 큐, rate limiting |
| Agent | LangGraph.js | 상태 기반 워크플로우를 노드로 명시적 관리 |
| LLM 연동 | LangChain.js | Tool Calling·프롬프트·LLM 추상화 |
| 문서화 | Swagger | API 시연·계약 명시 |
| 로깅 | Pino | 구조화 로그(JSON), 성능 |
| 인프라 | Docker Compose | `up -d` 한 방 시연 |

### 핵심 설계 결정 (학습 포인트)
- **MySQL vs PostgreSQL+pgvector**: MySQL을 메인으로 택했기에 단일 DB 통합(pgvector)은 포기,
  대신 관계형은 MySQL·벡터는 Qdrant로 역할 분리해 책임을 명확히 함
- **전용 벡터 DB(Qdrant) 선택**: 이 규모에서 전용 벡터 DB가 정당화되는지 검토 → 메타 필터링·
  생태계 성숙도·로컬 시연성을 근거로 채택
- **VectorStore 추상화 필수**: 코드는 `VectorStore` 인터페이스에만 의존하고 `QdrantVectorStore`는
  구현체로 둠. 규모/요구가 바뀌면 교체 가능하도록 설계 (이 부분이 핵심)
- **임베딩 모델**: OpenAI `text-embedding-3-small` (**1536차원**) 확정. 데이터는 한국어 본문 +
  영어 기술용어(API명·에러코드·코드)가 섞인 형태로 가정해 다국어 모델 채택. **Qdrant 컬렉션은
  1536차원으로 생성**하며, 모델 변경으로 차원이 바뀌면 재인덱싱 필요
- **임베딩과 LLM은 별개**: 답변 생성 LLM은 임베딩과 독립적으로 선택(미정). 특히 Claude는
  임베딩을 제공하지 않으므로 LLM을 무엇으로 정하든 임베딩은 OpenAI를 사용함

---

## 3. 아키텍처 원칙

- **Agent는 Tool을 통해서만 행동함** — DB/외부 직접 조회 금지, 모든 행동은 명시적 Tool 단위로 분리
- **RAG는 근거 기반(grounded)임** — 출처 없는 답변 생성 금지, score·confidence·needHumanReview를
  응답에 포함
- **상태는 명시적으로 관리** — Agent 워크플로우 상태(`IssueAnalysisState`)를 타입으로 정의
- **계층 분리** — Controller(입출력) → Service(도메인 로직) → Repository(데이터), LLM/벡터 접근은
  전용 서비스로 격리

```
[Client / Swagger]
      │
[NestJS API Server]
      ├─ issue / document / rag / agent / tool / evaluation 모듈
      ├─ MySQL (Prisma)
      ├─ Redis (cache/queue)
      ├─ Qdrant (VectorStore 인터페이스)
      └─ LLM API
```

---

## 4. Directory 구조

```
prisma/
 └─ schema.prisma          # Prisma 스키마 (중앙 관리)
src/
 ├─ app.module.ts
 ├─ common/                # config, logger, exception, response, prisma
 ├─ issue/                 # dto, controller, service, repository
 ├─ document/
 ├─ rag/                   # chunker, embedding, retriever, reranker
 ├─ agent/
 │   ├─ graph/             # issue-analysis.graph.ts, *.state.ts
 │   └─ node/              # classify, retrieve, analyze, plan, report
 ├─ tool/                  # tool-registry + tools/*
 ├─ vector/                # VectorStore 인터페이스 + QdrantVectorStore 구현
 └─ evaluation/            # 검색/응답 품질 평가, dataset
```

새 파일은 이 구조 안에만 생성, 구조 변경이 필요하면 먼저 제안·승인받음

---

## 5. 코딩 컨벤션

- **네이밍**: 파일 `kebab-case.role.ts` (예: `classify-issue.tool.ts`), 클래스 `PascalCase`,
  변수/함수 `camelCase`, 상수 `UPPER_SNAKE_CASE`
- **DTO**: 모든 입출력은 DTO + `class-validator`로 검증
- **예외 처리**: 전역 ExceptionFilter 사용, 에러는 삼키지 말고 컨텍스트와 함께 로깅·전파
- **응답 포맷**: 공통 응답 래퍼로 일관 (`{ data, meta }` 형태)
- **로깅**: Pino 구조화 로그, 민감정보(키·PII) 로깅 금지
- **타입**: `any` 지양, 외부 응답은 명시적 타입/스키마 검증
- **문서·주석 문체**: 개조식(`~함`/`~임`)으로 작성, 문장 끝 마침표 생략

---

## 6. 커밋 컨벤션 (Conventional Commits)

형식: `type`은 **영어**, subject·body는 **한글**

```
<type>(<scope>): <한글 subject>

<한글 body, 선택>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

- **type**: `feat` `fix` `docs` `refactor` `test` `chore` `perf` `build` `ci`
- **scope**: `issue` `document` `rag` `agent` `tool` `vector` `eval` `infra`
- **예시**: `feat(rag): 문서 chunking·embedding 파이프라인 구현`
- **작업 단위 커밋**: 많은 양을 몰아서 커밋하지 않고 의미 있는 작업 단위마다 나눠서 커밋함.
  하나의 커밋은 하나의 목적(기능/수정/리팩터링)만 담고, 변경 이력이 곧 학습 기록이 되도록
  작게·자주 커밋하는 것을 원칙으로 함
- **커밋 시점**: 작업 단위가 끝나면 Claude가 커밋 메시지를 제안하고 사용자 승인을 받아 커밋함.
  승인 없는 자동 커밋·푸시는 하지 않음

---

## 7. MVP 범위

**1차** — NestJS 서버 / MySQL(Prisma) / Qdrant docker-compose / Swagger /
Issue·Document CRUD / 문서 chunking·embedding·벡터 저장 / RAG 검색·답변 /
Tool Calling 기반 이슈 분류 / 분석 리포트 생성

**2차** — LangGraph Workflow / 유사 이슈·로그 분석·테스트케이스 Tool /
confidence·needHumanReview 필드

**3차** — MCP 서버로 Tool 노출 / 외부 연동(Jira/Slack/GitHub 중 1) 흉내 /
평가 데이터셋 / 검색 정확도 개선 기록 / Docker Compose 배포 가이드

---

## 8. Claude 작업 규칙 (제한된 틀 — 강도: 중간)

> Claude는 아래 틀 안에서만 동작함

- **계획 승인(중간 강도)**: ① 새 모듈/기능 추가 ② 큰 구조 변경 ③ 새 의존성 추가 시 구현 전
  계획을 제시하고 승인받음. 단순 수정·버그픽스·소규모 변경은 바로 진행
- **단일 모듈 집중**: 한 번에 한 모듈/관심사만 작업
- **의존성 통제**: 새 라이브러리 추가는 사전 승인 필수 (YAGNI 준수)
- **검증 강제**: `typecheck` · `lint` · `test`가 통과하기 전에는 "완료"라고 선언하지 않음
- **응답 형식**: 작업 보고는 `[목표] → [변경 파일] → [검증 방법]` 구조를 따름
- **진행 추적**: 다단계 작업은 할 일 목록으로 진행상황을 표시
- **소통 언어**: 한국어, 코드 주석/커밋은 위 컨벤션을 따름
- **구조 준수**: 4번 디렉터리 구조 밖에 파일을 만들지 않음

---

## 9. 절대 하지 말 것 (Don't)

- ❌ 요청하지 않은 기능·라이브러리·추상화를 임의로 추가
- ❌ 자동 커밋·푸시 (승인 시에만)
- ❌ Agent가 Tool을 우회해 DB/외부를 직접 조회
- ❌ 출처/근거 없는 RAG 답변 생성
- ❌ 정의된 디렉터리 구조 이탈
- ❌ 검증 없이 "완료" 선언
- ❌ 민감정보(API 키·PII) 로깅/커밋
