import { Failure } from '../../../../core/errors/failure';
import { Either } from '../../../../core/utils/either';
import {
  Plan,
  PlanCategory,
  PlanVisibility,
  PlanStatus,
  PlanParticipant,
  PlanChatMessage,
} from '../entities/plan.entity';

export interface GetPlansParams {
  status?: PlanStatus;
  category?: PlanCategory;
  visibility?: PlanVisibility;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface CreatePlanRequest {
  title: string;
  description?: string;
  category: PlanCategory;
  date: string;
  startTime: string;
  endTime?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  visibility?: PlanVisibility;
  maxParticipants?: number;
  requiresApproval?: boolean;
}

export interface SendMessageRequest {
  message: string;
  messageType?: string;
}

export interface IPlanRepository {
  getPlans(params?: GetPlansParams): Promise<Either<Failure, Plan[]>>;
  getPlanById(planId: string): Promise<Either<Failure, Plan>>;
  createPlan(planData: CreatePlanRequest): Promise<Either<Failure, Plan>>;
  updatePlan(planId: string, updates: Partial<CreatePlanRequest>): Promise<Either<Failure, Plan>>;
  deletePlan(planId: string): Promise<Either<Failure, void>>;
  cancelPlan(planId: string): Promise<Either<Failure, void>>;
  joinPlan(planId: string): Promise<Either<Failure, void>>;
  leavePlan(planId: string): Promise<Either<Failure, void>>;
  getParticipants(planId: string): Promise<Either<Failure, PlanParticipant[]>>;
  getChatMessages(planId: string): Promise<Either<Failure, PlanChatMessage[]>>;
  sendMessage(planId: string, messageData: SendMessageRequest): Promise<Either<Failure, PlanChatMessage>>;
  subscribeToPlanChat(
    planId: string,
    onMessage: (message: PlanChatMessage) => void,
    onError?: (error: Failure) => void,
    onRealtimeStatus?: (connected: boolean) => void,
  ): () => void;
  /** onUpdate receives planId when only one plan changed (participant join/leave),
   *  or undefined when a full list refresh is needed (plan created/cancelled). */
  subscribeToPlans(onUpdate: (planId?: string) => void, onError?: (error: Failure) => void): () => void;
  getMyPlans(): Promise<Either<Failure, Plan[]>>;
  approveParticipant(planId: string, userId: string): Promise<Either<Failure, void>>;
  removeParticipant(planId: string, userId: string): Promise<Either<Failure, void>>;
}
