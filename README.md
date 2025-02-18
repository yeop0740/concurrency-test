# concurrency-test

패키지 다운로드

```shell
yarn
```

실험 환경 세팅

```shell
docker compose -f docker-compose.yml up -d
```

## CASE 1

.env 파일에서 DATABASE_URL 변수에 connection_limit = 15 설정

```.env
DATABASE_URL={db종류}://{db_user}:{password}@{db_host}:{db_port}/{db_name}?schema={schema}&connection_limit=15
```

select for update(명시적인 락을 적용한 purchase) 동시성 테스트 실행

```shell
yarn test:1
```

락을 적용하지 않은 purchase 동시성 테스트 실행

```shell
yarn test:2
```

테스트 및 데이터베이스 결과 확인

---

## CASE 2

.env 파일에서 DATABASE_URL 변수에 connection_limit = 1 설정

```.env
DATABASE_URL={db종류}://{db_user}:{password}@{db_host}:{db_port}/{db_name}?schema={schema}&connection_limit=1
```

select for update(명시적인 락을 적용한 purchase) 동시성 테스트 실행

```shell
yarn test:1
```

락을 적용하지 않은 purchase 동시성 테스트 실행

```shell
yarn test:2
```

테스트 및 데이터베이스 결과 확인
