import { ObjectId } from 'bson';
import {
  Collection,
  Db,
  Filter,
  MatchKeysAndValues,
  MongoClient,
  OptionalUnlessRequiredId,
  WithId,
} from 'mongodb';

import {
  ListResult,
  NotFoundError,
  Page,
  Sort,
} from '@cardboardrobots/repository';

export interface Model {}

export class MongoRepository<TModel extends Model> {
  protected db: Db;
  collection: Collection<TModel>;

  constructor(
    collectionName: string,
    dbName: string,
    mongoClient: MongoClient
  ) {
    this.db = mongoClient.db(dbName);
    this.collection = this.db.collection<TModel>(collectionName);
  }

  async list<TFilter extends Filter<TModel>>(
    filter: TFilter,
    { limit = 0, offset = 0 }: Page = { limit: 0, offset: 0 },
    sort?: Sort<TModel>
  ): Promise<ListResult<WithId<TModel>>> {
    const query: Record<string, any> = {};
    Object.entries(filter).reduce((query, [key, value]) => {
      if (value !== undefined) {
        query[key] = value;
      }
      return query;
    }, query);
    const [count, data] = await Promise.all([
      // @ts-expect-error TODO: Fix this
      this.collection.find({ ...query }).count(),
      this.collection
        // @ts-expect-error TODO: Fix this
        .find({ ...query })
        .skip(offset)
        .limit(limit)
        .collation({ locale: 'en' })
        .sort(sort as any)
        .toArray(),
    ]);
    return {
      count,
      data,
    };
  }

  async getById(_id: ObjectId): Promise<WithId<TModel> | null> {
    const result = await this.collection.findOne({ _id: _id as any });
    return result;
  }

  async create(data: OptionalUnlessRequiredId<TModel>): Promise<ObjectId> {
    const result = await this.collection.insertOne(data);
    if (result.acknowledged) {
      return result.insertedId;
    } else {
      throw new Error('not created');
    }
  }

  async update(
    _id: ObjectId,
    data: MatchKeysAndValues<TModel>
  ): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: _id as any },
      { $set: data }
    );
    if (result.acknowledged) {
      if (!result.matchedCount) {
        throw new NotFoundError();
      }
      return result.modifiedCount + result.upsertedCount > 0;
    } else {
      throw new Error('not updated');
    }
  }

  async deleteById(_id: ObjectId): Promise<void> {
    const result = await this.collection.deleteOne({ _id: _id as any });
    if (result.acknowledged) {
      if (!result.deletedCount) {
        throw new NotFoundError();
      }
    } else {
      throw new Error('not deleted');
    }
  }
}
