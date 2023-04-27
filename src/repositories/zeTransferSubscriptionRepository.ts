import { ZeTransferSubscription } from "../entities/ZeTransferSubscription/ZeTransferSubscription";
import { dataSource } from "../utils/dataSource";

export const zeTransferSubscriptionRepository = dataSource.getRepository(
  ZeTransferSubscription
);
