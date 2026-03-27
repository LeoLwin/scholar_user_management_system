import {
  createFeature as createFeatureRepo,
  findFeatureById,
  findFeatureByName,
  findAllFeatures,
  updateFeature as updateFeatureRepo,
  deleteFeature as deleteFeatureRepo,
  CreateFeatureData,
  UpdateFeatureData,
} from '../repositories/featureRepository';
import StatusCode from '../helper/responseStatus';
import { ResponseStatus } from '../helper/responseStatus';

export const createFeature = async (data: CreateFeatureData): Promise<ResponseStatus> => {
  try {
    if (!data.name) {
      return StatusCode.INVALID_ARGUMENT('Feature name is required');
    }

    const existingFeature = await findFeatureByName(data.name);
    if (existingFeature) {
      return StatusCode.ALREADY_EXISTS('Feature already exists');
    }

    const feature = await createFeatureRepo(data) as any;

    return StatusCode.OK(
      {
        id: feature.id,
        name: feature.name,
        permissionCount: feature.permissions.length,
      },
      'Feature created successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const getFeatureById = async (id: number): Promise<ResponseStatus> => {
  try {
    const feature = await findFeatureById(id) as any;
    if (!feature) {
      return StatusCode.NOT_FOUND('Feature not found');
    }

    return StatusCode.OK({
      id: feature.id,
      name: feature.name,
      permissions: feature.permissions.map((permission: any) => ({
        id: permission.id,
        name: permission.name,
      })),
      permissionCount: feature.permissions.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const getFeatures = async (): Promise<ResponseStatus> => {
  try {
    const features = await findAllFeatures();

    const featureData = features.map((feature: any) => ({
      id: feature.id,
      name: feature.name,
      permissions: feature.permissions.map((permission: any) => ({
        id: permission.id,
        name: permission.name,
      })),
      permissionCount: feature.permissions.length,
    }));

    return StatusCode.OK(featureData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const updateFeature = async (id: number, data: UpdateFeatureData): Promise<ResponseStatus> => {
  try {
    const existingFeature = await findFeatureById(id) as any;
    if (!existingFeature) {
      return StatusCode.NOT_FOUND('Feature not found');
    }

    if (data.name && data.name !== existingFeature.name) {
      const nameExists = await findFeatureByName(data.name);
      if (nameExists) {
        return StatusCode.ALREADY_EXISTS('Feature name already exists');
      }
    }

    const updatedFeature = await updateFeatureRepo(id, data) as any;

    return StatusCode.OK(
      {
        id: updatedFeature.id,
        name: updatedFeature.name,
        permissionCount: updatedFeature.permissions.length,
      },
      'Feature updated successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const deleteFeature = async (id: number): Promise<ResponseStatus> => {
  try {
    const feature = await findFeatureById(id) as any;
    if (!feature) {
      return StatusCode.NOT_FOUND('Feature not found');
    }

    if (feature.permissions.length > 0) {
      return StatusCode.FAILED_PRECONDITION('Cannot delete feature with assigned permissions');
    }

    await deleteFeatureRepo(id);
    return StatusCode.OK(null, 'Feature deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};