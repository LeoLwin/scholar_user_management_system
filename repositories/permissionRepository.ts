import { Permission } from '../generated/prisma/client';
import prisma from '../helper/prismaClient';
import { CreatePermissionData, UpdatePermissionData } from '../type/permissionType';



const permissionInclude = {
  feature: true,
  roles: { include: { role: true } },
};

export const createPermission = (data: CreatePermissionData): Promise<Permission> =>
  prisma.permission.create({
    data: {
      name: data.name,
      feature_id: data.featureId,
    },
    include: permissionInclude,
  });

export const findPermissionById = (id: number): Promise<Permission | null> =>
  prisma.permission.findUnique({
    where: { id },
    include: permissionInclude,
  });

export const findPermissionByName = (name: string): Promise<Permission | null> =>
  prisma.permission.findFirst({
    where: { name },
    include: permissionInclude,
  });

export const findAllPermissions = (options?: {
  skip?: number;
  take?: number;
  where?: any;
  include?: any;
}): Promise<Permission[]> =>
  prisma.permission.findMany({
    skip: options?.skip,
    take: options?.take,
    where: options?.where,
    include: {
      ...permissionInclude,
      ...options?.include,
    } as any,
  });

export const updatePermission = (id: number, data: UpdatePermissionData): Promise<Permission> =>
  prisma.permission.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.featureId && { feature_id: data.featureId }),
    },
    include: permissionInclude,
  });

export const deletePermission = (id: number): Promise<Permission> =>
  prisma.permission.delete({
    where: { id },
    include: permissionInclude,
  });

export const countPermissions = (where?: any): Promise<number> =>
  prisma.permission.count({ where });

// permissions.repository.ts

export const findUnassignedPermissions = async (roleId: number) => {
  return await prisma.permission.findMany({
    where: {
      roles: {
        none: {
          role_id: roleId,
        },
      },
    },
  });
};


export const updatePermissionAtomic = async (
  id: number,
  data: { name: string; featureId: number; roleIds: number[] }
) => {
  return await prisma.$transaction(async (tx) => {
    const updatedPermission = await tx.permission.update({
      where: { id },
      data: {
        name: data.name,
        feature_id: data.featureId,
      },
    });

    await tx.rolePermission.deleteMany({
      where: { permissions_id: id },
    });

    if (data.roleIds.length > 0) {
      await tx.rolePermission.createMany({
        data: data.roleIds.map((roleId) => ({
          role_id: roleId,
          permissions_id: id,
        })),
      });
    }

    return updatedPermission;
  });
};