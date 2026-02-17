import { MONGODB_CONSTANTS } from '@shared/constants';
import { Schema, Types } from 'mongoose';
import { IRole } from './roles.interface';

export const ROLES_SCHEMA = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      uppercase: true
    },
    permissions: {
      type: [Types.ObjectId],
      ref: MONGODB_CONSTANTS.PERMISSIONS.MODEL,
      autopopulate: true,
      required: false,
      default: []
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

ROLES_SCHEMA.index({ name: 1 }, { unique: true });
ROLES_SCHEMA.plugin(require('mongoose-autopopulate'));