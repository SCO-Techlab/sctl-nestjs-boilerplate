import { titleCase } from "../helpers";
import { MAGIC_STRINGS } from "./magic-strings.constants";

export const MONGODB_CONSTANTS = {
  PERMISSIONS: {
    MODEL: titleCase(MAGIC_STRINGS.PERMISSIONS),
    COLLECTION: MAGIC_STRINGS.PERMISSIONS
  },
  ROLES: {
    MODEL: titleCase(MAGIC_STRINGS.ROLES),
    COLLECTION: MAGIC_STRINGS.ROLES
  },
  USERS: {
    MODEL: titleCase(MAGIC_STRINGS.USERS),
    COLLECTION: MAGIC_STRINGS.USERS
  }
}