import { SubscriptionPlan } from "../entities/SubscriptionPlan/SubscriptionPlan";
import { dataSource } from "../utils/dataSource";

export const subscriptionPlanRepository = dataSource.getRepository(SubscriptionPlan);
