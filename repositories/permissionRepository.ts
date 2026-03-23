import { PrismaClient, Permission } from '../generated/prisma/client';
import prisma from '../helper/prismaClient';

export interface CreatePermissionData {
  name: string;
  featureId: number;
}

export interface UpdatePermissionData {
  name?: string;
  featureId?: number;
}

export class PermissionRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: CreatePermissionData): Promise<Permission> {
    return this.prisma.permission.create({
      data: {
        name: data.name,
        feature_id: data.featureId,
      },
      include: {
        feature: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findById(id: number): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: { id },
      include: {
        feature: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.prisma.permission.findFirst({
      where: { name },
      include: {
        feature: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    where?: any;
    include?: any;
  }): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      include: {
        feature: true,
        roles: {
          include: {
            role: true,
          },
        },
        ...options?.include,
      } as any,
    });
  }

  async update(id: number, data: UpdatePermissionData): Promise<Permission> {
    return this.prisma.permission.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.featureId && { feature_id: data.featureId }),
      },
      include: {
        feature: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async delete(id: number): Promise<Permission> {
    return this.prisma.permission.delete({
      where: { id },
      include: {
        feature: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async count(where?: any): Promise<number> {
    return this.prisma.permission.count({ where });
  }
}