import { Permission } from '../generated/prisma/client';
import prisma from '../helper/prismaClient';

export interface CreatePermissionData {
  name: string;
  featureId: number;
}

export interface UpdatePermissionData {
  name?: string;
  featureId?: number;
}

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