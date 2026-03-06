# Project Scaffolding & Clean Architecture Transition Plan

This document outlines the strategy for refactoring the **EspeConnect** frontend codebase into a **Clean Architecture** structure. This transition aims to improve maintainability, testability, and scalability.

## 1. Core Principles
- **Independence of Frameworks**: The business logic (domain) shouldn't depend on Supabase, React, or any external library.
- **Testability**: Business rules can be tested without the UI, Database, or any other external element.
- **Dependency Rule**: Dependencies only point inwards. The inner layers (Domain) know nothing about the outer layers (Data, Presentation).

---

## 2. Proposed Directory Structure

We will adopt a **Feature-First + Layered** approach.

```text
src/
├── core/                  # Shared logic across features
│   ├── errors/            # Custom error classes
│   ├── utils/             # Helper functions
│   └── usecase/           # Base UseCase interface
│
├── features/              # Modularized features
│   ├── trips/             # Example Feature: Trips
│   │   ├── domain/        # Inner Layer (Business Rules)
│   │   │   ├── entities/  # Plain TS interfaces (e.g., Trip, Driver)
│   │   │   ├── repositories/# Interface definitions for data access
│   │   │   └── usecases/  # Orchestrators (e.g., JoinTripUseCase)
│   │   │
│   │   ├── data/          # Middle Layer (Infrastructure)
│   │   │   ├── datasources/# Supabase specialized calls
│   │   │   ├── repositories/# Implementation of domain repositories
│   │   │   ├── mappers/   # DTO (Database) to Entity (Domain) converters
│   │   │   └── models/    # Database row types (DTOs)
│   │   │
│   │   └── presentation/  # Outer Layer (UI/UX)
│   │       ├── screens/   # Screen components
│   │       ├── components/# Feature-specific UI components
│   │       ├── hooks/     # UI logic & state management (Zustand integration)
│   │       └── store/     # Feature-specific Zustand stores
│   │
│   └── auth/              # Another module...
│
├── shared/                # Global UI components & styles
│   ├── components/        # Buttons, Inputs, Modals
│   ├── theme/             # Styling/Colors
│   └── hooks/             # Generic hooks (e.g., useDebounce)
│
└── lib/                   # Third-party configurations (Supabase, Firebase)
```

---

## 3. Migration Strategy (Step-by-Step)

To avoid breaking the current development flow, we will follow a **gradual migration** starting with the `trips` module.

### Phase 1: Preparation (The Core)
1. Create the `src/core` and `src/features` directory structure.
2. Define base interfaces for `UseCase` and `Repository` results (e.g., `Either<Failure, Success>`).

### Phase 2: Domain Extraction
1. **Entities**: Move types from `trip.service.ts` to `features/trips/domain/entities/trip.entity.ts`.
2. **Repository Interface**: Define `ITripRepository` in `features/trips/domain/repositories/trip.repository.ts`.
   - *Example:* `getTrips(params: GetTripsParams): Promise<Trip[]>`

### Phase 3: Data Implementation
1. **Models**: Move `TripRow` and other DB types to `features/trips/data/models/trip.model.ts`.
2. **Mappers**: Move `mapRowToTrip` to `features/trips/data/mappers/trip.mapper.ts`.
3. **Repository Implementation**: Create `TripRepositoryImpl` in `features/trips/data/repositories/trip.repository.impl.ts`.
   - This class will use the `supabase` client from `src/lib/supabase.ts`.

### Phase 4: Presentation Refactor
1. **Hooks**: Create `src/features/trips/presentation/hooks/useTrips.ts`.
   - This hook will call the Repository or UseCase directly.
2. **Screens**: Update `RidesScreen`, `MyTripsScreen`, and `TripDetailScreen` to import from the new feature directory.
3. **Store**: Move/Refactor `src/store/tripStore.ts` into `src/features/trips/presentation/store/trip.store.ts`.

---

## 4. Key Refactor Example: The "Big Service" Problem

Currently, `trip.service.ts` (500+ lines) does everything. In Clean Architecture:

- **Logic for "Can join trip?"** -> Moves to a `JoinTripUseCase` in `domain/usecases`.
- **Logic for "Supabase Query"** -> Moves to `TripRepositoryImpl` in `data/repositories`.
- **Logic for "Formatting dates for UI"** -> Moves to `presentation/mappers` or stays in `presentation/components`.

---

## 5. Next Steps
1. [x] Create the new directory structure.
2. [ ] Identify and isolate the `Auth` module as it's the most widely used.
3. [x] Implement the `Trip` module refactor as a POC (Proof of Concept).
4. [ ] Deprecate `src/services/` folder once all features are migrated (Partially done: `trip.service.ts` removed).
