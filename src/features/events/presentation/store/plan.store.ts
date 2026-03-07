import { create } from 'zustand';
import { Plan, PlanParticipant, PlanChatMessage } from '../../domain/entities/plan.entity';
import { PlanRepositoryImpl } from '../../data/repositories/plan.repository.impl';
import { GetPlansParams, CreatePlanRequest, SendMessageRequest } from '../../domain/repositories/plan.repository';
import { JoinPlanUseCase } from '../../domain/usecases/join_plan.usecase';
import { LeavePlanUseCase } from '../../domain/usecases/leave_plan.usecase';

const repository = new PlanRepositoryImpl();
const joinPlanUseCase = new JoinPlanUseCase(repository);
const leavePlanUseCase = new LeavePlanUseCase(repository);

interface PlanState {
  plans: Plan[];
  myPlans: Plan[];
  currentPlan: Plan | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchPlans: (params?: GetPlansParams) => Promise<void>;
  fetchMyPlans: () => Promise<void>;
  fetchPlanById: (planId: string) => Promise<Plan | null>;
  createPlan: (planData: CreatePlanRequest) => Promise<Plan | null>;
  updatePlan: (planId: string, updates: Partial<CreatePlanRequest>) => Promise<boolean>;
  deletePlan: (planId: string) => Promise<boolean>;
  cancelPlan: (planId: string) => Promise<boolean>;
  joinPlan: (planId: string) => Promise<boolean>;
  leavePlan: (planId: string) => Promise<boolean>;
  sendMessage: (planId: string, messageData: SendMessageRequest) => Promise<PlanChatMessage | null>;
  approveParticipant: (planId: string, userId: string) => Promise<boolean>;
  removeParticipant: (planId: string, userId: string) => Promise<boolean>;
  fetchChatMessages: (planId: string) => Promise<PlanChatMessage[]>;
  
  // Real-time
  subscribeToPlanChat: (planId: string, onMessage: (message: PlanChatMessage) => void) => () => void;
  subscribeToPlans: () => () => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  myPlans: [],
  currentPlan: null,
  isLoading: false,
  error: null,

  fetchPlans: async (params) => {
    set({ isLoading: true, error: null });
    const result = await repository.getPlans(params);
    result.fold(
      (failure) => set({ error: failure.message, isLoading: false }),
      (plans) => set({ plans, isLoading: false })
    );
  },

  fetchMyPlans: async () => {
    set({ isLoading: true, error: null });
    const result = await repository.getMyPlans();
    result.fold(
      (failure) => set({ error: failure.message, isLoading: false }),
      (myPlans) => set({ myPlans, isLoading: false })
    );
  },

  fetchPlanById: async (planId) => {
    set({ isLoading: true, error: null });
    const result = await repository.getPlanById(planId);
    return result.fold(
      (failure) => {
        set({ error: failure.message, isLoading: false });
        return null;
      },
      (plan) => {
        set({ currentPlan: plan, isLoading: false });
        set((state) => ({
          plans: state.plans.map((p) => (p.id === planId ? plan : p)),
        }));
        return plan;
      }
    );
  },

  createPlan: async (planData) => {
    set({ isLoading: true, error: null });
    const result = await repository.createPlan(planData);
    return result.fold(
      (failure) => {
        set({ error: failure.message, isLoading: false });
        return null;
      },
      (plan) => {
        set((state) => ({
          plans: [plan, ...state.plans],
          myPlans: [plan, ...state.myPlans],
          isLoading: false,
        }));
        return plan;
      }
    );
  },

  updatePlan: async (planId, updates) => {
    set({ isLoading: true, error: null });
    const result = await repository.updatePlan(planId, updates);
    return result.fold(
      (failure) => {
        set({ error: failure.message, isLoading: false });
        return false;
      },
      (plan) => {
        set((state) => ({
          plans: state.plans.map((p) => (p.id === planId ? plan : p)),
          myPlans: state.myPlans.map((p) => (p.id === planId ? plan : p)),
          currentPlan: state.currentPlan?.id === planId ? plan : state.currentPlan,
          isLoading: false,
        }));
        return true;
      }
    );
  },

  deletePlan: async (planId) => {
    set({ isLoading: true, error: null });
    const result = await repository.deletePlan(planId);
    return result.fold(
      (failure) => {
        set({ error: failure.message, isLoading: false });
        return false;
      },
      () => {
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== planId),
          myPlans: state.myPlans.filter((p) => p.id !== planId),
          currentPlan: state.currentPlan?.id === planId ? null : state.currentPlan,
          isLoading: false,
        }));
        return true;
      }
    );
  },

  cancelPlan: async (planId) => {
    set({ isLoading: true, error: null });
    const result = await repository.cancelPlan(planId);
    return result.fold(
      (failure) => {
        set({ error: failure.message, isLoading: false });
        return false;
      },
      () => {
        set((state) => ({
          plans: state.plans.map((p) => p.id === planId ? { ...p, status: 'CANCELLED' } : p) as any,
          myPlans: state.myPlans.map((p) => p.id === planId ? { ...p, status: 'CANCELLED' } : p) as any,
          isLoading: false,
        }));
        return true;
      }
    );
  },

  joinPlan: async (planId) => {
    const result = await joinPlanUseCase.execute(planId);
    if (result.isRight()) {
      await get().fetchPlanById(planId);
      await get().fetchMyPlans();
      return true;
    }
    set({ error: result.value.message });
    return false;
  },

  leavePlan: async (planId) => {
    const result = await leavePlanUseCase.execute(planId);
    if (result.isRight()) {
      await get().fetchPlanById(planId);
      await get().fetchMyPlans();
      return true;
    }
    set({ error: result.value.message });
    return false;
  },

  sendMessage: async (planId, messageData) => {
    const result = await repository.sendMessage(planId, messageData);
    return result.fold(
      (failure) => {
        set({ error: failure.message });
        return null;
      },
      (message) => message
    );
  },

  approveParticipant: async (planId, userId) => {
    const result = await repository.approveParticipant(planId, userId);
    if (result.isRight()) {
      await get().fetchPlanById(planId);
      return true;
    }
    set({ error: result.value.message });
    return false;
  },

  removeParticipant: async (planId, userId) => {
    const result = await repository.removeParticipant(planId, userId);
    if (result.isRight()) {
      await get().fetchPlanById(planId);
      return true;
    }
    set({ error: result.value.message });
    return false;
  },

  fetchChatMessages: async (planId) => {
    const result = await repository.getChatMessages(planId);
    return result.fold(
      (failure) => {
        set({ error: failure.message });
        return [];
      },
      (messages) => messages
    );
  },

  subscribeToPlanChat: (planId, onMessage) => {
    return repository.subscribeToPlanChat(planId, onMessage, (failure) => {
      set({ error: failure.message });
    });
  },

  subscribeToPlans: () => {
    return repository.subscribeToPlans(() => {
      get().fetchPlans();
      get().fetchMyPlans();
    }, (failure) => {
      set({ error: failure.message });
    });
  },
}));
