import { PrismaClient, Role, RolePermission } from '../generated/prisma/client';
import prisma from '../helper/prismaClient';

export interface CreateRoleData {
  name: string;
}

export interface UpdateRoleData {
  name?: string;
}

export class RoleRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: CreateRoleData): Promise<Role> {
    return this.prisma.role.create({
      data: {
        name: data.name,
      },
    });
  }

  async findById(id: number): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        adminUsers: true,
        permissions: {
          include: {
            permission: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: { name },
      include: {
        adminUsers: true,
        permissions: {
          include: {
            permission: {
              include: {
                feature: true,
              },
            },
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
  }): Promise<Role[]> {
    return this.prisma.role.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      include: {
        adminUsers: true,
        permissions: {
          include: {
            permission: {
              include: {
                feature: true,
              },
            },
          },
        },
        ...options?.include,
      } as any,
    });
  }

  async update(id: number, data: UpdateRoleData): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
      },
      include: {
        adminUsers: true,
        permissions: {
          include: {
            permission: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });
  }

  async delete(id: number): Promise<Role> {
    return this.prisma.role.delete({
      where: { id },
      include: {
        adminUsers: true,
        permissions: {
          include: {
            permission: {
              include: {
                feature: true,
              },
            },
          },
        },
      },
    });
  }

  async count(where?: any): Promise<number> {
    return this.prisma.role.count({ where });
  }

  async assignPermission(roleId: number, permissionId: number): Promise<RolePermission> {
    return this.prisma.rolePermission.create({
      data: {
        role_id: roleId,
        permissions_id: permissionId,
      },
    });
  }

  async removePermission(roleId: number, permissionId: number): Promise<RolePermission> {
    return this.prisma.rolePermission.delete({
      where: {
        role_id_permissions_id: {
          role_id: roleId,
          permissions_id: permissionId,
        },
      },
    });
  }

  async getPermissions(roleId: number): Promise<RolePermission[]> {
    return this.prisma.rolePermission.findMany({
      where: { role_id: roleId },
      include: {
        permission: {
          include: {
            feature: true,
          },
        },
      },
    });
  }
}