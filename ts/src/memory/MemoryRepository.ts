import { NotFoundError } from "../RepositoryError";
import {
  Model,
  Repository,
  ListResult,
  Page,
  Sort,
  Filter,
  StringId,
} from "../Repository";

import { DataToObjectId, Uuid } from "./Uuid";

export class MemoryRepository<TModel extends Model, TFilter extends Filter>
  implements Repository<TModel, TFilter>
{
  collection: Record<string, StringId<TModel>> = {};

  // TODO: Should we copy the object?
  _createId(document: TModel): StringId<TModel> {
    // @ts-expect-error TODO: Fix this type
    if (!document._id) {
      // @ts-expect-error TODO: Fix this type
      document._id = Uuid();
    }
    return document as any;
  }

  _insert<TData extends TModel[]>(...data: TData): DataToObjectId<TData> {
    const records = data.map(this._createId);
    this.collection = records.reduce(
      (collection, document) => ({
        ...collection,
        [document._id?.toString() || ""]: document,
      }),
      this.collection
    );
    return records.map(({ _id }) => _id) as any;
  }

  _clear(...data: TModel[]): string[] {
    this.collection = {};
    if (data.length) {
      return this._insert(...data);
    } else {
      return [];
    }
  }

  _getIds() {
    return Object.values(this.collection).map(({ _id }) => _id);
  }

  async getList(
    filter: TFilter,
    { offset = 0, limit = 0 }: Page = { offset: undefined, limit: undefined },
    // TODO: Fix this
    sort?: Sort<TModel>
  ): Promise<ListResult<StringId<TModel>>> {
    const data = Object.values(this.collection)
      .filter(
        (document) =>
          !Object.entries(filter)
            .filter(([_key, value]) => value !== undefined)
            .find(
              ([key, value]) => document[key as keyof typeof document] !== value
            )
      )
      .slice(offset, offset + limit);
    const count = data.length;
    return {
      count,
      data,
    };
  }

  async getById(_id: string): Promise<StringId<TModel> | null> {
    return this.collection[_id] ?? null;
  }

  async create(data: TModel): Promise<string> {
    const _id = Uuid();
    const record = {
      ...data,
      _id,
    };
    this.collection[_id] = record as any;
    return _id;
  }

  async update(_id: string, data: TModel): Promise<boolean> {
    const record = this.collection[_id];
    if (!record) {
      throw new NotFoundError();
    }
    const updatedRecord = {
      _id,
      ...data,
    };
    this.collection[_id.toString()] = updatedRecord;
    return true;
  }

  async delete(_id: string): Promise<void> {
    const record = this.collection[_id.toString()];
    if (!record) {
      throw new NotFoundError();
    }
    delete this.collection[_id.toString()];
  }
}
