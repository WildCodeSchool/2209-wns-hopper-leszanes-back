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
import { ZeTransferSubscriptionCreateInput } from "../entities/ZeTransferSubscription/ZeTransferSubscriptionCreateInput";
import { ZeTransferSubscriptionUpdateInput } from "../entities/ZeTransferSubscription/ZeTransferSubscriptionUpdateInput";
import { ZeTransferSubscriptionCurrentUserUpdateInput } from "../entities/ZeTransferSubscription/ZeTransferSubscriptionCurrentUserUpdateInput";

@Resolver()
export class ZeTransferSubscriptionsResolver {
  // get all subs
  @Authorized("admin")
  @Query(() => [ZeTransferSubscription])
  async getSubscriptions(): Promise<ZeTransferSubscription[]> {
    const subs = await zeTransferSubscriptionRepository.find();
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
      relations: [],
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
    @Arg("data", () => ZeTransferSubscriptionCreateInput)
    data: ZeTransferSubscriptionCreateInput
  ) {
    try {
      const newSub = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const sub = await zeTransferSubscriptionRepository.save(newSub);

      return sub;
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
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
    @Ctx("context") context: AuthCheckerType,
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
