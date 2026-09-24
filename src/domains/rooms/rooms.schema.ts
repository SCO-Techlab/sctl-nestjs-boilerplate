import { setIncrementalVersion } from '@core/mongodb';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { COLLECTIONS } from '@shared/constants';
import { IRoom } from '@shared/interfaces';
import { IndexDirection, Schema, Types } from 'mongoose';

export const ROOMS_SCHEMA = new Schema<IRoom>(
  {
    tenant: {
      type: Types.ObjectId,
      ref: COLLECTIONS.TENANTS.MODEL,
      autopopulate: true,
      required: true,
    },
    residence: {
      type: Types.ObjectId,
      ref: COLLECTIONS.RESIDENCES.MODEL,
      autopopulate: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    beds: {
      type: Number,
      required: true,
      min: 1,
    },
    images: {
      type: [Types.ObjectId],
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

ROOMS_SCHEMA.index(
  {
    name: MAGIC_NUMBERS.N_1 as IndexDirection,
    tenant: MAGIC_NUMBERS.N_1 as IndexDirection,
    residence: MAGIC_NUMBERS.N_1 as IndexDirection,
  },
  { unique: false }
);
ROOMS_SCHEMA.plugin(require('mongoose-autopopulate'));
ROOMS_SCHEMA.plugin(setIncrementalVersion);
