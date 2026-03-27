import {
  createPermission as createPermissionRepo,
  findPermissionById,
  findPermissionByName,
  findAllPermissions,
  updatePermission as updatePermissionRepo,
  deletePermission as deletePermissionRepo,
  countPermissions,
  CreatePermissionData,
  UpdatePermissionData,
} from '../repositories/permissionRepository';
import { findFeatureById } from '../repositories/featureRepository';
import StatusCode from '../helper/responseStatus';
import { ResponseStatus } from '../helper/responseStatus';

export const createPermission = async (data: CreatePermissionData): Promise<ResponseStatus> => {
  try {
    if (!data.name || !data.featureId) {
      return StatusCode.INVALID_ARGUMENT('Permission name and feature ID are required');
    }

    const existingPermission = await findPermissionByName(data.name);
    if (existingPermission) {
      return StatusCode.ALREADY_EXISTS('Permission already exists');
    }

    const feature = await findFeatureById(data.featureId);
    if (!feature) {
      return StatusCode.NOT_FOUND('Feature not found');
    }

    const permission = await createPermissionRepo(data) as any;

    return StatusCode.OK(
      {
        id: permission.id,
        name: permission.name,
        featureId: permission.feature_id,
        feature: permission.feature.name,
      },
      'Permission created successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const getPermissionById = async (id: number): Promise<ResponseStatus> => {
  try {
    const permission = await findPermissionById(id) as any;
    if (!permission) {
      return StatusCode.NOT_FOUND('Permission not found');
    }

    return StatusCode.OK({
      id: permission.id,
      name: permission.name,
      featureId: permission.feature_id,
      feature: permission.feature.name,
      roleCount: permission.roles.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const getPermissions = async (page: number = 1, limit: number = 10): Promise<ResponseStatus> => {
  try {
    const skip = (page - 1) * limit;
    const [permissions, total] = await Promise.all([
      findAllPermissions({ skip, take: limit }),
      countPermissions(),
    ]);

    const permissionData = permissions.map((permission: any) => ({
      id: permission.id,
      name: permission.name,
      featureId: permission.feature_id,
      feature: permission.feature.name,
      roleCount: permission.roles.length,
    }));

    return StatusCode.OK({
      permissions: permissionData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const updatePermission = async (id: number, data: UpdatePermissionData): Promise<ResponseStatus> => {
  try {
    const existingPermission = await findPermissionById(id) as any;
    if (!existingPermission) {
      return StatusCode.NOT_FOUND('Permission not found');
    }

    if (data.name && data.name !== existingPermission.name) {
      const nameExists = await findPermissionByName(data.name);
      if (nameExists) {
        return StatusCode.ALREADY_EXISTS('Permission name already exists');
      }
    }

    if (data.featureId) {
      const feature = await findFeatureById(data.featureId);
      if (!feature) {
        return StatusCode.NOT_FOUND('Feature not found');
      }
    }

    const updatedPermission = await updatePermissionRepo(id, data) as any;

    return StatusCode.OK(
      {
        id: updatedPermission.id,
        name: updatedPermission.name,
        featureId: updatedPermission.feature_id,
        feature: updatedPermission.feature.name,
      },
      'Permission updated successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const deletePermission = async (id: number): Promise<ResponseStatus> => {
  try {
    const permission = await findPermissionById(id) as any;
    if (!permission) {
      return StatusCode.NOT_FOUND('Permission not found');
    }

    if (permission.roles.length > 0) {
      return StatusCode.FAILED_PRECONDITION('Cannot delete permission assigned to roles');
    }

    await deletePermissionRepo(id);
    return StatusCode.OK(null, 'Permission deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};