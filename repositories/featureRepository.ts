import { Feature } from '../generated/prisma/client';
import prisma from '../helper/prismaClient';

export interface CreateFeatureData {
  name: string;
}

export interface UpdateFeatureData {
  name?: string;
}

export const createFeature = (data: CreateFeatureData): Promise<Feature> =>
  prisma.feature.create({
    data: { name: data.name },
    include: { permissions: true },
  });

export const findFeatureById = (id: number): Promise<Feature | null> =>
  prisma.feature.findUnique({
    where: { id },
    include: { permissions: true },
  });

export const findFeatureByName = (name: string): Promise<Feature | null> =>
  prisma.feature.findFirst({
    where: { name },
    include: { permissions: true },
  });

export const findAllFeatures = (options?: {
  skip?: number;
  take?: number;
  where?: any;
  include?: any;
}): Promise<Feature[]> =>
  prisma.feature.findMany({
    skip: options?.skip,
    take: options?.take,
    where: options?.where,
    include: {
      permissions: true,
      ...options?.include,
    } as any,
  });

export const updateFeature = (id: number, data: UpdateFeatureData): Promise<Feature> =>
  prisma.feature.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
    },
    include: { permissions: true },
  });

export const deleteFeature = (id: number): Promise<Feature> =>
  prisma.feature.delete({
    where: { id },
    include: { permissions: true },
  });

export const countFeatures = (where?: any): Promise<number> =>
  prisma.feature.count({ where });