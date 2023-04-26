import { Subscription } from "../entities/Subscription/Subscription";
import { dataSource } from "../utils/dataSource";

export const subscriptionRepository = dataSource.getRepository(Subscription);
