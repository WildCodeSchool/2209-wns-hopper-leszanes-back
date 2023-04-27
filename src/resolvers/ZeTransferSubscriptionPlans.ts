import { Arg, Authorized, ID, Mutation, Query, Resolver } from "type-graphql";
import { ZeTransferSubscriptionPlan } from "../entities/ZeTransferSubscriptionPlan/ZeTransferSubscriptionPlan";
import { zeTransferSubscriptionPlanRepository } from "../repositories/zeTransferSubscriptionPlanRepository";
import { ZeTransferSubscriptionPlanCreateInput } from "../entities/ZeTransferSubscriptionPlan/ZeTransferSubscriptionPlanCreateInput";
import { ZeTransferSubscriptionPlanUpdateInput } from "../entities/ZeTransferSubscriptionPlan/ZeTransferSubscriptionPlanUpdateInput";

@Resolver()
export class ZeTransferSubscriptionPlansResolver {
  // get all plans
  @Query(() => [ZeTransferSubscriptionPlan])
  async getPlans(): Promise<ZeTransferSubscriptionPlan[]> {
    const plans = await zeTransferSubscriptionPlanRepository.find();
    return plans;
  }

  // get by id
  @Query(() => ZeTransferSubscriptionPlan, { nullable: true })
  async getPlan(
    @Arg("id", () => ID) id: number
  ): Promise<ZeTransferSubscriptionPlan | null> {
    const plan = await zeTransferSubscriptionPlanRepository.findOne({
      where: { id },
      relations: [],
    });

    if (!plan) {
      return null;
    }

    return plan;
  }

  // create
  @Authorized("admin")
  @Mutation(() => ZeTransferSubscriptionPlan, { nullable: true })
  async createPlan(
    @Arg("data", () => ZeTransferSubscriptionPlanCreateInput)
    data: ZeTransferSubscriptionPlanCreateInput
  ) {
    try {
      const newPlan = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const plan = await zeTransferSubscriptionPlanRepository.save(newPlan);

      return plan;
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }

  // update
  @Authorized("admin")
  @Mutation(() => ZeTransferSubscriptionPlan, { nullable: true })
  async updatePlan(
    @Arg("data") data: ZeTransferSubscriptionPlanUpdateInput
  ): Promise<ZeTransferSubscriptionPlan | null> {
    const plan = await zeTransferSubscriptionPlanRepository.findOne({
      where: { id: data.id },
    });

    if (!plan) {
      return null;
    }

    const planUpdated = {
      ...plan,
      ...data,
      updatedAt: new Date(),
    };

    const result = await zeTransferSubscriptionPlanRepository.save(planUpdated);
    return result;
  }

  // delete
  @Authorized("admin")
  @Mutation(() => Boolean)
  async deletePlan(@Arg("id", () => ID) id: number): Promise<boolean> {
    const plan = await zeTransferSubscriptionPlanRepository.findOne({
      where: { id },
    });

    if (plan) {
      try {
        await zeTransferSubscriptionPlanRepository.delete(id);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }
}
