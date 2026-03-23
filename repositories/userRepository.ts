import { PrismaClient, AdminUser, Gender } from '../generated/prisma/client';
import prisma from '../helper/prismaClient';

export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  password: string;
  roleId: number;
  phone: string;
  address: string;
  gender?: Gender;
}

export interface UpdateUserData {
  name?: string;
  username?: string;
  email?: string;
  roleId?: number;
  phone?: string;
  address?: string;
  gender?: Gender;
  is_active?: boolean;
}

export class UserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: CreateUserData): Promise<AdminUser> {
    return this.prisma.adminUser.create({
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
      include: {
        role: true,
      },
    });
  }

  async findById(id: number): Promise<AdminUser | null> {
    return this.prisma.adminUser.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.prisma.adminUser.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  async findByUsername(username: string): Promise<AdminUser | null> {
    return this.prisma.adminUser.findFirst({
      where: { username },
      include: {
        role: true,
      },
    });
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    where?: any;
    include?: any;
  }): Promise<AdminUser[]> {
    return this.prisma.adminUser.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      include: {
        role: true,
        ...options?.include,
      } as any,
    });
  }

  async update(id: number, data: UpdateUserData): Promise<AdminUser> {
    return this.prisma.adminUser.update({
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
      include: {
        role: true,
      },
    });
  }

  async delete(id: number): Promise<AdminUser> {
    return this.prisma.adminUser.delete({
      where: { id },
      include: {
        role: true,
      },
    });
  }

  async count(where?: any): Promise<number> {
    return this.prisma.adminUser.count({ where });
  }
}