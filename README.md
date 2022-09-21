# Boss Raid HTTP API Server

<p align="left">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>


### 🏹 기술 스택

![NestJS](https://img.shields.io/badge/NestJS-E0234E.svg?&style=for-the-badge&logo=NestJS&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6.svg?&style=for-the-badge&logo=TypeScript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1.svg?&style=for-the-badge&logo=MySQL&logoColor=white)

<br>

## 🛰️ 게임듀오 요구사항 분석

#### 보스 레이드 기록 엔티티 필요 속성 분석

- 보스 레이드 번호
- 보스 레이드 점수
- 보스 레이드 입장 시간(Date)
- 보스 레이드 종료 시간(Date)
- 클리어한 레벨
- 입장한 사용자

#### 유저 엔티티 필요 속성 분석

- 유저 번호
- 생성일
- 수정일

#### 요구사항 분석 및 구현 방법
##### 유저 생성 
- 중복되지 않는 userId 생성
- 생성된 userId 응답

##### 유저 조회 
- 해당 유저의 보스레이드 총 점수와 참여 보스 레이드 기록 응답

##### 보스레이드 상태 조회
- 보스레이드 현재 상태 응답
- canEnter: 입장 가능한지
- enteredUserId: 현재 진행중인 유저가 있다면, 해당 유저의 id
- 입장 가능 조건: 한 번에 한 명의 유저만 보스레이드 진행이 가능하다.
- 아무도 보스 레이드를 시작한 기록이 없다면 시작 가능하다.
- 시작한 기록이 있다면 마지막으로 시작한 유저가 보스레이드를 종료했거나,

  시작한 시간으로부터 레이드 제한시간만큼 경과되어야 한다.

##### 보스레이드 시작
- 한 번에 한 명의 유저만 보스레이드 진행이 가능하다.

  ( node-redlock을 사용하여 redis lock을 걸어서 동시성 고려하도록 구현 )
- 레이드 시작이 가능하다면 중복되지 않은 raidRecordId를 생성하여

  isEntered:true와 함께 응답
- 레이드 시작이 불가하다면 isEntered: false 반환

##### 보스레이드 종료
- raidRecordId 종료 처리
- 레이드 level에 따른 score 반영

  ( 보스 레이드 staticData는 Redis에 캐싱하여 사용 )
- 저장된 userId와 raidRecordId가 일치하지 않는다면 예외 처리
- 시작한 시간으로부터 레이드 제한시간이 지났다면 예외 처리

##### 랭킹 조회
- 보스레이드 totalScore 내림차순으로 랭킹 조회
- Redis에 캐싱하여 랭킹 기능 구현

  ( Redis Sorted set 자료구조를 활용하여 랭킹 기능 구현 )
- 탑 랭커 리스트 반환(1위부터 10위까지) 
- 나의 랭킹 반환

<br>

## 🛰️ API 명세서
추가 필요

<br>

## 🔀 ERD(Entity Relationship Diagram)
![image](https://user-images.githubusercontent.com/81298415/191271131-d680fafd-840a-4bf6-a340-defe0fd32c06.png)

## ✨ 프로젝트 구조
```
project/
├─ src/
│  ├─ boss-raid/
│  ├─ boss-raid-history
│  ├─ rank
│  ├─ common
│  ├─ database
│  ├─ users
├─ app.controller.ts
├─ app.module.ts
├─ app.service.ts
├─ main.ts
```

<br>
