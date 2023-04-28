import {
  Resolver,
  Query,
  Authorized,
  Arg,
  ID,
  Ctx,
  Mutation,
} from "type-graphql";
import { transferRepository } from "../repositories/transfertRepository";
import { Transfer } from "../entities/Transfer/Transfer";
import { AuthCheckerType } from "../auth";
import { TransferCreateInput } from "../entities/Transfer/TransferCreateInput";
import { TransferUpdateInput } from "../entities/Transfer/TransferUpdateInput";
import { TransferCurrentUserUpdateInput } from "../entities/Transfer/TransferCurrentUserUpdateInput";

@Resolver()
export class TransferResolver {
  // get all transfers
  @Authorized("admin")
  @Query(() => [Transfer])
  async getTransfers(): Promise<Transfer[]> {
    const transfers = await transferRepository.find();
    return transfers;
  }

  // get all transfers
  @Authorized()
  @Query(() => [Transfer], { nullable: true })
  async getCurrentUserTransfers(
    @Ctx() context: AuthCheckerType
  ): Promise<Transfer[] | null> {
    const { user } = context;

    if (!user) {
      return null;
    }

    const myTransfers = await transferRepository.find({
      where: { createdBy: user },
      relations: ["createdBy", "users", "files"],
    });
    const sharedTransfers = await transferRepository
      .createQueryBuilder("transfer")
      .leftJoinAndSelect("transfer.users", "users")
      .leftJoinAndSelect("transfer.files", "files")
      .leftJoinAndSelect("transfer.createdBy", "createdBy")
      .where("users.id = :id", { id: user.id })
      .getMany();
    const data = [...myTransfers, ...sharedTransfers].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    return data;
  }

  // get by id
  @Authorized("admin")
  @Query(() => Transfer, { nullable: true })
  async getTransfer(@Arg("id", () => ID) id: number): Promise<Transfer | null> {
    const transfer = await transferRepository.findOne({
      where: { id },
      relations: [],
    });

    if (!transfer) {
      return null;
    }

    return transfer;
  }

  // create
  @Authorized()
  @Mutation(() => Transfer, { nullable: true })
  async createTransfer(
    @Ctx() context: AuthCheckerType,
    @Arg("data", () => TransferCreateInput)
    data: TransferCreateInput
  ): Promise<Transfer | null> {
    const { user } = context;

    if (!user) {
      return null;
    }
    try {
      const newTransfer = {
        ...data,
        createdBy: user,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const transfer = await transferRepository.save(newTransfer);

      return transfer;
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
  }

  // update
  @Authorized("admin")
  @Mutation(() => Transfer, { nullable: true })
  async updateTransfer(
    @Arg("data") data: TransferUpdateInput
  ): Promise<Transfer | null> {
    const transfer = await transferRepository.findOne({
      where: { id: data.id },
    });

    if (!transfer) {
      return null;
    }

    const transferUpdated = {
      ...transfer,
      ...data,
      updatedAt: new Date(),
    };

    const result = await transferRepository.save(transferUpdated);
    return result;
  }

  // update current user transfer
  @Authorized()
  @Mutation(() => Transfer, { nullable: true })
  async updateCurrentUserTransfer(
    @Ctx() context: AuthCheckerType,
    @Arg("data") data: TransferCurrentUserUpdateInput
  ): Promise<Transfer | null> {
    const { user } = context;

    if (!user) {
      return null;
    }

    const transfer = await transferRepository.findOne({
      where: { createdBy: user },
    });

    if (!transfer) {
      return null;
    }

    const transferUpdated = {
      ...transfer,
      ...data,
      updatedAt: new Date(),
    };

    const result = await transferRepository.save(transferUpdated);
    return result;
  }

  // delete
  @Authorized("admin")
  @Mutation(() => Boolean)
  async deleteTransfer(@Arg("id", () => ID) id: number): Promise<boolean> {
    const transfer = await transferRepository.findOne({
      where: { id },
    });

    if (transfer) {
      try {
        await transferRepository.delete(id);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }

  // delete current user
  @Authorized()
  @Mutation(() => Boolean)
  async deleteCurrentUserTransfer(
    @Ctx() context: AuthCheckerType,
    @Arg("id", () => ID) id: number
  ): Promise<boolean> {
    const { user } = context;
    if (!user) {
      return false;
    }
    const transfer = await transferRepository.findOne({
      where: { createdBy: user, id },
    });

    if (transfer) {
      try {
        await transferRepository.delete(id);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  }
}
