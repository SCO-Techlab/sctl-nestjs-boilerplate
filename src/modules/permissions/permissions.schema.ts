import { Schema } from 'mongoose';
import { IPermission } from './permissions.interface';

export const PERMISSIONS_SCHEMA = new Schema<IPermission>(
  {
    name: {
      type: String,
      required: true,
      uppercase: true
    },
    extension: {
      type: Schema.Types.Mixed,
      required: false,
      default: {},
    }
  },
  {
    timestamps: true,
  },
);

PERMISSIONS_SCHEMA.index({ name: 1 }, { unique: true });