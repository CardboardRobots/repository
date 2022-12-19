import { ObjectId } from 'mongodb';
import { MixedSchema } from 'yup';

export function newObjectId(id: string): ObjectId;
export function newObjectId(id?: undefined): undefined;
export function newObjectId(id?: string | undefined): ObjectId |undefined;
export function newObjectId(id?: string): ObjectId | undefined {
  if (id) {
    return new ObjectId(id);
  } else {
    return undefined;
  }
}

export const yupObjectId = () => new ObjectIdSchema();

export class ObjectIdSchema extends MixedSchema<
  ObjectId,
  any,
  ObjectId | undefined
> {
  constructor() {
    super({ type: 'objectId' });

    this.withMutation((schema) => {
      schema.transform(function (value) {
        if (this.isType(value)) return value;
        if (!value) {
          return undefined;
        } else {
          return new ObjectId(value);
        }
      });
    });
  }

  _typeCheck(value: any): value is any {
    // TODO: Does this need to do both?
    return ObjectId.isValid(value) && value instanceof ObjectId;
  }
}
