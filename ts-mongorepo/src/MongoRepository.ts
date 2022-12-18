import { MongoClient, WithId } from 'mongodb';

import {
  Page,
  Sort,
  ListResult,
  StringId,
  Model,
  Filter,
  Repository,
} from '@cardboardrobots/repository';
import { Document, MongoData } from './MongoData';
import { newObjectId } from './ObjectId';

export abstract class MongoRepository<
  TModel extends Model,
  TDocument extends Document,
  TFilter extends Filter
> implements Repository<TModel, TFilter>
{
  repository: MongoData<TDocument>;
  abstract toModel(document: WithId<TDocument>): StringId<TModel>;
  abstract fromModel(model: TModel): TDocument;
  abstract sortMap(sort: Sort<TModel>): Sort<TDocument>;

  constructor(
    collectionName: string,
    dbName: string,
    mongoClient: MongoClient
  ) {
    this.repository = new MongoData(collectionName, dbName, mongoClient);
  }

  async getList(
    filter: TFilter,
    page?: Page,
    sort?: Sort<TModel>
  ): Promise<ListResult<StringId<TModel>>> {
    const { count, data } = await this.repository.getList(
      filter,
      page,
      sort ? this.sortMap(sort) : undefined
    );
    return {
      count,
      data: data.map(this.toModel),
    };
  }

  async getById(id: string): Promise<StringId<TModel> | null> {
    const _id = newObjectId(id);
    const result = await this.repository.getById(_id);
    if (!result) {
      return null;
    }
    return this.toModel(result);
  }

  async create(data: TModel): Promise<string> {
    const model = this.fromModel(data);
    const _id = await this.repository.create(model);
    return _id.toHexString();
  }

  update(id: string, data: StringId<TModel>): Promise<boolean> {
    const _id = newObjectId(id);
    const model = this.fromModel(data);
    return this.repository.update(_id, model);
  }

  delete(id: string): Promise<void> {
    const _id = newObjectId(id);
    return this.repository.deleteById(_id);
  }
}
