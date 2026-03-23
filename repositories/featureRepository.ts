import { PrismaClient, Feature } from '../generated/prisma/client';
import prisma from '../helper/prismaClient';

export interface CreateFeatureData {
  name: string;
}

export interface UpdateFeatureData {
  name?: string;
}

export class FeatureRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async create(data: CreateFeatureData): Promise<Feature> {
    return this.prisma.feature.create({
      data: {
        name: data.name,
      },
      include: {
        permissions: true,
      },
    });
  }

  async findById(id: number): Promise<Feature | null> {
    return this.prisma.feature.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });
  }

  async findByName(name: string): Promise<Feature | null> {
    return this.prisma.feature.findFirst({
      where: { name },
      include: {
        permissions: true,
      },
    });
  }

  async findAll(options?: {
    skip?: number;
    take?: number;
    where?: any;
    include?: any;
  }): Promise<Feature[]> {
    return this.prisma.feature.findMany({
      skip: options?.skip,
      take: options?.take,
      where: options?.where,
      include: {
        permissions: true,
        ...options?.include,
      } as any,
    });
  }

  async update(id: number, data: UpdateFeatureData): Promise<Feature> {
    return this.prisma.feature.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
      },
      include: {
        permissions: true,
      },
    });
  }

  async delete(id: number): Promise<Feature> {
    return this.prisma.feature.delete({
      where: { id },
      include: {
        permissions: true,
      },
    });
  }

  async count(where?: any): Promise<number> {
    return this.prisma.feature.count({ where });
  }
}