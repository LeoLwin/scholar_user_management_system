import { AdminUser } from '../generated/prisma/client';
import prisma from '../helper/prismaClient';
import { CreateUserData, UpdateUserData } from '../type/userType';


export const createUser = (data: CreateUserData): Promise<AdminUser> =>
  prisma.adminUser.create({
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
      password: data.password,
      role_id: data.roleId,
      phone: data.phone,
      address: data.address,
      gender: data.gender || 'male',
    },
    include: { role: true },
  });

export const findUserById = (id: number): Promise<AdminUser | null> =>
  prisma.adminUser.findUnique({
    where: { id },
    include: { role: true },
  });

export const findUserByEmail = (email: string): Promise<AdminUser | null> =>
  prisma.adminUser.findUnique({
    where: { email },
    include: { role: true },
  });

export const findUserByUsername = (username: string): Promise<AdminUser | null> =>
  prisma.adminUser.findFirst({
    where: { username },
    include: { role: true },
  });

export const findAllUsers = (options?: {
  skip?: number;
  take?: number;
  where?: any;
  include?: any;
}): Promise<AdminUser[]> =>
  prisma.adminUser.findMany({
    skip: options?.skip,
    take: options?.take,
    where: options?.where,
    include: {
      role: true,
      ...options?.include,
    } as any,
  });

export const updateUser = (id: number, data: UpdateUserData): Promise<AdminUser> =>
  prisma.adminUser.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.username && { username: data.username }),
      ...(data.email && { email: data.email }),
      ...(data.roleId && { role_id: data.roleId }),
      ...(data.phone && { phone: data.phone }),
      ...(data.address && { address: data.address }),
      ...(data.gender && { gender: data.gender }),
      ...(data.is_active !== undefined && { is_active: data.is_active }),
    },
    include: { role: true },
  });

export const deleteUser = (id: number): Promise<AdminUser> =>
  prisma.adminUser.delete({
    where: { id },
    include: { role: true },
  });

export const countUsers = (where?: any): Promise<number> =>
  prisma.adminUser.count({ where });