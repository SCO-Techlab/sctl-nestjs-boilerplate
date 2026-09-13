import { setIncrementalVersion } from '@core/mongodb';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { COLLECTIONS } from '@shared/constants';
import { ITenant } from '@shared/interfaces';
import { IndexDirection, Schema, Types } from 'mongoose';

export const TENANTS_SCHEMA = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      required: true
    },
    owner: {
      type: Types.ObjectId,
      ref: COLLECTIONS.USERS.MODEL,
      autopopulate: true,
      required: true,
    },
    description: {
      type: String,
      required: false
    },
    members: {
      type: [Types.ObjectId],
      ref: COLLECTIONS.USERS.MODEL,
      autopopulate: true,
      required: false,
      default: []
    }
  },
  {
    timestamps: true,
  },
);

TENANTS_SCHEMA.index(
  {
    name: MAGIC_NUMBERS.N_1 as IndexDirection,
    owner: MAGIC_NUMBERS.N_1 as IndexDirection
  },
  { unique: true }
);
TENANTS_SCHEMA.plugin(require('mongoose-autopopulate'));
TENANTS_SCHEMA.plugin(setIncrementalVersion);