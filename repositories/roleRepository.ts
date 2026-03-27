import { Role, RolePermission } from '../generated/prisma/client';
import prisma from '../helper/prismaClient';
import { CreateRoleData, UpdateRoleData } from '../type/roleType';



const roleInclude = {
  adminUsers: true,
  permissions: {
    include: {
      permission: {
        include: { feature: true },
      },
    },
  },
};

export const createRole = (data: CreateRoleData): Promise<Role> =>
  prisma.role.create({
    data: { name: data.name },
  });

export const findRoleById = (id: number): Promise<Role | null> =>
  prisma.role.findUnique({
    where: { id },
    include: roleInclude,
  });

export const findRoleByName = (name: string): Promise<Role | null> =>
  prisma.role.findFirst({
    where: { name },
    include: roleInclude,
  });

export const findAllRoles = (options?: {
  skip?: number;
  take?: number;
  where?: any;
  include?: any;
}): Promise<Role[]> =>
  prisma.role.findMany({
    skip: options?.skip,
    take: options?.take,
    where: options?.where,
    include: {
      ...roleInclude,
      ...options?.include,
    } as any,
  });

export const updateRole = (id: number, data: UpdateRoleData): Promise<Role> =>
  prisma.role.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
    },
    include: roleInclude,
  });

export const deleteRole = (id: number): Promise<Role> =>
  prisma.role.delete({
    where: { id },
    include: roleInclude,
  });

export const countRoles = (where?: any): Promise<number> =>
  prisma.role.count({ where });

export const assignPermissionToRole = (roleId: number, permissionId: number): Promise<RolePermission> =>
  prisma.rolePermission.create({
    data: {
      role_id: roleId,
      permissions_id: permissionId,
    },
  });

export const removePermissionFromRole = (roleId: number, permissionId: number): Promise<RolePermission> =>
  prisma.rolePermission.delete({
    where: {
      role_id_permissions_id: {
        role_id: roleId,
        permissions_id: permissionId,
      },
    },
  });

export const getRolePermissions = (roleId: number): Promise<RolePermission[]> =>
  prisma.rolePermission.findMany({
    where: { role_id: roleId },
    include: {
      permission: {
        include: { feature: true },
      },
    },
  });