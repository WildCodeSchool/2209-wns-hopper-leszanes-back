import { ZeTransferSubscriptionPlan } from "../entities/ZeTransferSubscriptionPlan/ZeTransferSubscriptionPlan";
import { dataSource } from "../utils/dataSource";

export const zeTransferSubscriptionPlanRepository = dataSource.getRepository(
  ZeTransferSubscriptionPlan
);
