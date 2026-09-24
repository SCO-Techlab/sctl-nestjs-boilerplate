import { setIncrementalVersion } from '@core/mongodb';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { COLLECTIONS } from '@shared/constants';
import { IResidence } from '@shared/interfaces';
import { IndexDirection, Schema, Types } from 'mongoose';

export const RESIDENCES_SCHEMA = new Schema<IResidence>(
  {
    tenant: {
      type: Types.ObjectId,
      ref: COLLECTIONS.TENANTS.MODEL,
      autopopulate: true,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: true,
    },
    flat: {
      type: String,
      required: false,
    },
    door: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    cadastre: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
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

RESIDENCES_SCHEMA.index(
  {
    tenant: MAGIC_NUMBERS.N_1 as IndexDirection,
    street: MAGIC_NUMBERS.N_1 as IndexDirection,
    number: MAGIC_NUMBERS.N_1 as IndexDirection,
    door: MAGIC_NUMBERS.N_1 as IndexDirection,
    city: MAGIC_NUMBERS.N_1 as IndexDirection,
    province: MAGIC_NUMBERS.N_1 as IndexDirection,
    postalCode: MAGIC_NUMBERS.N_1 as IndexDirection,
  },
  { unique: true }
);
RESIDENCES_SCHEMA.plugin(require('mongoose-autopopulate'));
RESIDENCES_SCHEMA.plugin(setIncrementalVersion);
