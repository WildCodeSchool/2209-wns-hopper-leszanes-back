import {
  Resolver,
  Query,
  Authorized,
  Arg,
  ID,
  Ctx,
  Mutation,
} from "type-graphql";
import { In } from "typeorm";
import { transferRepository } from "../repositories/transfertRepository";
import { Transfer } from "../entities/Transfer/Transfer";
import { AuthCheckerType } from "../auth";
import { TransferUpdateInput } from "../entities/Transfer/TransferUpdateInput";
import { TransferCurrentUserUpdateInput } from "../entities/Transfer/TransferCurrentUserUpdateInput";

@Resolver()
export class TransferResolver {
  // get all transfers
  @Authorized("admin")
  @Query(() => [Transfer])
  async getTransfers(): Promise<Transfer[]> {
    const transfers = await transferRepository.find({
      relations: ["createdBy"],
    });
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
      where: {
        createdBy: {
          id: user.id,
        },
      },
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
      relations: ["createdBy"],
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
    @Arg("name", () => String) name: string,
    @Arg("description", () => String) description: string,
    @Arg("isPrivate", () => Boolean) isPrivate: boolean
  ): Promise<Transfer | null> {
    const { user } = context;

    if (!user) {
      return null;
    }

    try {
      const newTransfer = new Transfer();
      newTransfer.name = name;
      newTransfer.description = description;
      newTransfer.isPrivate = isPrivate;
      newTransfer.createdBy = user;
      newTransfer.createdAt = new Date();
      newTransfer.updatedAt = new Date();

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
      relations: ["createdBy"],
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
      where: {
        id: data.id,
        createdBy: {
          id: user.id,
        },
      },
      relations: ["createdBy", "users", "files"],
    });

    if (!transfer) {
      return null;
    }
    const transferUpdated = {
      ...transfer,
      ...data,
      updatedAt: new Date(),
    };

    try {
      const result = await transferRepository.save(transferUpdated);
      return result;
    } catch (error) {
      throw new Error(JSON.stringify(error));
    }
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

  // Bulk delete
  @Authorized("admin")
  @Mutation(() => Boolean)
  async bulkDeleteTransfers(
    @Arg("ids", () => [ID]) ids: number[]
  ): Promise<boolean> {
    const transfers = await transferRepository.find({
      where: { id: In(ids) },
    });

    if (transfers.length === 0) {
      return false;
    }

    try {
      await transferRepository.delete(ids);
      return true;
    } catch (error) {
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
      where: {
        id,
        createdBy: {
          id: user.id,
        },
      },
    });

    if (!transfer) {
      return false;
    }

    try {
      await transferRepository.delete(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Bulk delete current user transfers
  @Authorized()
  @Mutation(() => Boolean)
  async bulkDeleteCurrentUserTransfers(
    @Ctx() context: AuthCheckerType,
    @Arg("ids", () => [ID]) ids: number[]
  ): Promise<boolean> {
    const { user } = context;

    if (!user) {
      return false;
    }

    const transfers = await transferRepository.find({
      where: {
        id: In(ids),
        createdBy: {
          id: user.id,
        },
      },
    });

    if (transfers.length === 0) {
      return false;
    }

    try {
      await transferRepository.delete(ids);
      return true;
    } catch (error) {
      return false;
    }
  }
}
