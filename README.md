## Backend Issue Analyst Agent

### 1. 프로젝트 개요
QA 이슈, API 문서, 기획 문서, 에러 로그를 기반으로
원인 후보와 수정 범위를 분석하는 AI Agent 서비스

### 2. 개발 배경
운영/QA 과정에서 이슈 원인 파악에 많은 시간이 소요되는 문제를
RAG와 Tool Calling 기반 Agent Workflow로 줄이는 것을 목표로 함

### 3. 핵심 기능
- 문서 기반 RAG 검색
- QA 이슈 자동 분류
- 유사 이슈 검색
- 에러 로그 분석
- 원인 후보 도출
- 수정 범위 및 테스트 케이스 생성
- 근거 기반 리포트 생성

### 4. 아키텍처
NestJS API Server + LangGraph Agent + Vector DB + RDB(미정)

### 5. RAG Pipeline
문서 업로드 → chunking → embedding → vector 저장 → 검색 → reranking → 답변 생성

### 6. Agent Workflow
classify → retrieve → analyze → plan → report

### 7. Guardrail
- 검색 결과 score가 낮으면 답변 제한
- 출처 없는 답변 생성 방지
- confidence level 제공
- human review 필요 여부 표시

### 8. 기술 스택
Node.js, TypeScript, NestJS, LangGraph.js, LangChain.js, Vector DB(미정), RDB(미정), Redis, Docker

### 9. 실행 방법
```shell
$ docker-compose up -d
$ pnpm run start:dev
```

### 10. 회고
