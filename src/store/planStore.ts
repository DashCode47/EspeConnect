import { create } from 'zustand';
import { Plan, PlanCategory, PlanParticipant, PlanStatus, GetPlansParams } from '../types/plan.types';
import { planService } from '../services/plan.service';

interface PlanStore {
  // Public plans list
  plans: Plan[];
  plansLoading: boolean;
  plansCategory: PlanCategory | 'ALL';

  // My plans list
  myPlans: Plan[];
  myPlansLoading: boolean;

  // Actions - public plans
  fetchPlans: (category?: PlanCategory | 'ALL') => Promise<void>;
  setPlansCategory: (category: PlanCategory | 'ALL') => void;
  joinPlan: (planId: string) => Promise<void>;
  leavePlan: (planId: string) => Promise<void>;

  // Actions - my plans
  fetchMyPlans: () => Promise<void>;
  cancelPlan: (planId: string) => Promise<void>;
  deletePlan: (planId: string) => Promise<void>;

  // Actions - participant management (ManagePlanParticipantsScreen)
  approveParticipant: (planId: string, participantUserId: string) => Promise<void>;
  removeParticipant: (planId: string, participantUserId: string) => Promise<void>;

  // Real-time subscription
  subscribeToPlans: () => () => void;

  // Update a single plan in both lists (used by usePlanDetailSheet after refetch)
  updatePlanInStore: (plan: Plan) => void;
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  plans: [],
  plansLoading: false,
  plansCategory: 'ALL',

  myPlans: [],
  myPlansLoading: false,

  // ─── Public plans ────────────────────────────────────────────────────────────

  fetchPlans: async (category?: PlanCategory | 'ALL') => {
    const cat = category ?? get().plansCategory;
    set({ plansLoading: true });
    try {
      const today = new Date().toISOString().split('T')[0];
      const params: GetPlansParams = {
        status: PlanStatus.ACTIVE,
        dateFrom: today,
        ...(cat !== 'ALL' && { category: cat as PlanCategory }),
      };
      const data = await planService.getPlans(params);
      set({ plans: data, plansLoading: false });
    } catch (error) {
      console.error('Error fetching plans:', error);
      set({ plansLoading: false });
    }
  },

  setPlansCategory: (category) => {
    set({ plansCategory: category });
    get().fetchPlans(category);
  },

  joinPlan: async (planId: string) => {
    await planService.joinPlan(planId);
    // Refresh both lists so all subscribers stay in sync
    get().fetchPlans();
    if (get().myPlans.length > 0) {
      get().fetchMyPlans();
    }
  },

  leavePlan: async (planId: string) => {
    await planService.leavePlan(planId);
    get().fetchPlans();
    if (get().myPlans.length > 0) {
      get().fetchMyPlans();
    }
  },

  // ─── My plans ────────────────────────────────────────────────────────────────

  fetchMyPlans: async () => {
    set({ myPlansLoading: true });
    try {
      const data = await planService.getMyPlans();
      set({ myPlans: data, myPlansLoading: false });
    } catch (error) {
      console.error('Error fetching my plans:', error);
      set({ myPlansLoading: false });
    }
  },

  cancelPlan: async (planId: string) => {
    await planService.updatePlan(planId, { status: PlanStatus.CANCELLED });
    get().fetchMyPlans();
    get().fetchPlans();
  },

  deletePlan: async (planId: string) => {
    await planService.deletePlan(planId);
    get().fetchMyPlans();
    get().fetchPlans();
  },

  // ─── Participant management ───────────────────────────────────────────────────

  approveParticipant: async (planId: string, participantUserId: string) => {
    await planService.approveParticipant(planId, participantUserId);
    // Refresh my plans so participantsCount stays accurate
    get().fetchMyPlans();
  },

  removeParticipant: async (planId, participantUserId) => {
    await planService.removeParticipant(planId, participantUserId);
    get().fetchMyPlans();
  },

  // ─── Real-time ───────────────────────────────────────────────────────────────

  subscribeToPlans: () => {
    return planService.subscribeToPlans(() => {
      get().fetchPlans();
    });
  },

  // ─── Single plan update ───────────────────────────────────────────────────────

  updatePlanInStore: (plan: Plan) => {
    set(state => ({
      plans: state.plans.map(p => (p.id === plan.id ? plan : p)),
      myPlans: state.myPlans.map(p => (p.id === plan.id ? plan : p)),
    }));
  },
}));
