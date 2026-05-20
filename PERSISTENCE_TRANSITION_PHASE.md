# LVTP Persistence Transition Phase

## Objective
Transition LVTP from partially in-memory operational state handling into persistent realtime orchestration.

## Current Situation
- lifecycle engine operational
- websocket propagation operational
- event bus operational
- realtime snapshots operational
- synchronization partially persistent
- some services still rely on in-memory repositories

## Critical Targets
1. booking persistence
2. driver state persistence
3. realtime recovery integrity
4. websocket replay consistency
5. dispatch continuity after restart
6. operational crash recovery

## Required Architecture
- persistent booking store
- persistent driver states
- event replay safety
- lifecycle restoration after restart
- synchronization integrity
- realtime operational resilience

## Forbidden
- fake recovery
- mock persistence
- duplicated lifecycle transitions
- websocket desynchronization
- in-memory operational dependency

## Goal
Stabilize LVTP as a resilient founder-operated realtime mobility orchestration platform capable of controlled pilot operations.
