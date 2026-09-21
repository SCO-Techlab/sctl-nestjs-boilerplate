import { IAuthPayload, ITenant, IUser } from "@shared/interfaces";

export const createJwtPayload = (user: IUser, tenants: ITenant[], jti: string, refreshToken: boolean): IAuthPayload => {
  const payload: IAuthPayload = {
    _id: `${user._id}_${jti}`,
    jti,
    isRefreshToken: refreshToken,
    user: {
      _id: user._id,
      email: user.email,
      password: '',
      userName: user.userName,
      personalName: user.personalName,
      active: user.active,
      emailConfirmed: user.emailConfirmed,
      emailConfirmedAt: user.emailConfirmedAt,
      role: {
        name: user.role['name'],
        permissions: user.role?.['permissions']?.map(permission => ({
          name: permission.name,
          type: permission.type,
        })) ?? [],
      },
      pwdRecoveryToken: user.pwdRecoveryToken,
      pwdRecoveryDate: user.pwdRecoveryDate,
      avatar: user.avatar,
    },
    tenants: tenants?.map(tenant => ({
      _id: tenant._id,
      name: tenant.name,
      isActive: tenant.isActive,
      owner: tenant.owner,
      description: tenant.description,
      members: tenant.members?.map(member => {
        return {
          _id: member._id,
          email: member.email,
          userName: member.userName,
          personalName: member.personalName,
        }
      }) as any[] ?? [],
      avatar: tenant.avatar,
    })) ?? [],
  };

  return payload;
}