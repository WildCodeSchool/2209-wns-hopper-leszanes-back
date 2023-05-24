import {
  Arg,
  Authorized,
  Ctx,
  ID,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { zeTransferSubscriptionRepository } from "../repositories/zeTransferSubscriptionRepository";
import { ZeTransferSubscription } from "../entities/ZeTransferSubscription/ZeTransferSubscription";
import { AuthCheckerType } from "../auth";
import { ZeTransferSubscriptionUpdateInput } from "../entities/ZeTransferSubscription/ZeTransferSubscriptionUpdateInput";
import { ZeTransferSubscriptionCurrentUserUpdateInput } from "../entities/ZeTransferSubscription/ZeTransferSubscriptionCurrentUserUpdateInput";
import { zeTransferSubscriptionPlanRepository } from "../repositories/zeTransferSubscriptionPlanRepository";

@Resolver()
export class ZeTransferSubscriptionsResolver {
  // get all subs
  @Authorized("admin")
  @Query(() => [ZeTransferSubscription])
  async getSubscriptions(): Promise<ZeTransferSubscription[] | null> {
    const subs = await zeTransferSubscriptionRepository.find({
      relations: {
        zeTransferSubscriptionPlan: true,
      },
    });
    if (!subs) {
      return null;
    }
    return subs;
  }

  // get by id
  @Authorized("admin")
  @Query(() => ZeTransferSubscription, { nullable: true })
  async getSubscription(
    @Arg("id", () => ID) id: number
  ): Promise<ZeTransferSubscription | null> {
    const sub = await zeTransferSubscriptionRepository.findOne({
      where: { id },
      relations: { zeTransferSubscriptionPlan: true },
    });
    if (!sub) {
      return null;
    }
    return sub;
  }

  // create
  @Authorized()
  @Mutation(() => ZeTransferSubscription, { nullable: true })
  async createSubscription(
    @Arg("isActive", () => Boolean) isActive: boolean,
    @Arg("isYearly", () => Boolean) isYearly: boolean,
    @Arg("zeTransferSubscriptionPlanId", () => Number)
    zeTransferSubscriptionPlanId: number
  ): Promise<ZeTransferSubscription | null> {
    const newSub = new ZeTransferSubscription();
    newSub.isActive = isActive;
    newSub.isYearly = isYearly;
    const plan = await zeTransferSubscriptionPlanRepository.findOneBy({
      id: zeTransferSubscriptionPlanId,
    });
    if (plan) {
      newSub.zeTransferSubscriptionPlan = plan;
      newSub.createdAt = new Date();
      newSub.updatedAt = new Date();
      try {
        return zeTransferSubscriptionRepository.save(newSub);
      } catch (err) {
        throw new Error(JSON.stringify(err));
      }
    }
    return null;
  }

  // update
  @Authorized("admin")
  @Mutation(() => ZeTransferSubscription, { nullable: true })
  async updateSub(
    @Arg("data") data: ZeTransferSubscriptionUpdateInput
  ): Promise<ZeTransferSubscription | null> {
    const sub = await zeTransferSubscriptionRepository.findOne({
      where: { id: data.id },
    });

    if (!sub) {
      return null;
    }

    const subUpdated = {
      ...sub,
      ...data,
      updatedAt: new Date(),
    };

    const result = await zeTransferSubscriptionRepository.save(subUpdated);
    return result;
  }

  // update current user sub
  @Authorized()
  @Mutation(() => ZeTransferSubscription, { nullable: true })
  async updateCurrentUserSub(
    @Ctx() context: AuthCheckerType,
    @Arg("data") data: ZeTransferSubscriptionCurrentUserUpdateInput
  ): Promise<ZeTransferSubscription | null> {
    const { user } = context;

    if (!user) {
      return null;
    }

    const sub = await zeTransferSubscriptionRepository.findOne({
      where: { id: user.zeTransferSubscription.id },
    });

    if (!sub) {
      return null;
    }

    const subUpdated = {
      ...sub,
      ...data,
      updatedAt: new Date(),
    };

    const result = await zeTransferSubscriptionRepository.save(subUpdated);
    return result;
  }

  // delete
  @Authorized("admin")
  @Mutation(() => Boolean)
  async deleteSubscription(@Arg("id", () => ID) id: number): Promise<boolean> {
    const sub = await zeTransferSubscriptionRepository.findOne({
      where: { id },
    });

    if (sub) {
      try {
        await zeTransferSubscriptionRepository.delete(id);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }
}
