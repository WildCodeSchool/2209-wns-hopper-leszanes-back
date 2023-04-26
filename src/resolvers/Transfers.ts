import { Resolver, Query, Authorized } from "type-graphql";
import { transferRepository } from "../repositories/transfertRepository";
import { Transfer } from "../entities/Transfer/Transfer";

@Resolver()
export class TransferResolver {
  @Authorized("admin")
  @Query(() => [Transfer])
  async getTransfers(): Promise<Transfer[]> {
    const transfers = await transferRepository.find();
    return transfers;
  }
}
