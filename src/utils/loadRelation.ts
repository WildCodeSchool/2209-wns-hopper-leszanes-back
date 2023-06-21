import { BaseEntity as TypeOrmBaseEntity } from "typeorm";

export abstract class BaseEntity extends TypeOrmBaseEntity {
  async loadRelation<Relation extends keyof this>(
    relationKey: Relation
  ): Promise<this[Relation]> {
    const relationName = relationKey as string;
    const itShouldLoadMany = relationName.endsWith("s");

    const staticAccessor: typeof TypeOrmBaseEntity = this
      .constructor as typeof TypeOrmBaseEntity;

    const relationQuery = staticAccessor
      .createQueryBuilder()
      .relation(staticAccessor, relationName)
      .of(this);

    const relationValue: this[Relation] = itShouldLoadMany
      ? ((await relationQuery.loadMany()) as this[Relation])
      : ((await relationQuery.loadOne()) as this[Relation]);

    if (!relationValue)
      throw new Error(`Cannot load relation ${relationName}.`);

    this[relationKey] = relationValue;

    return relationValue;
  }
}
