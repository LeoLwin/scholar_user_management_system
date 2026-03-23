import { PermissionRepository, CreatePermissionData, UpdatePermissionData } from '../repositories/permissionRepository';
import { FeatureRepository } from '../repositories/featureRepository';
import StatusCode from '../helper/responseStatus';
import { ResponseStatus } from '../helper/responseStatus';

export class PermissionService {
  private permissionRepository: PermissionRepository;
  private featureRepository: FeatureRepository;

  constructor() {
    this.permissionRepository = new PermissionRepository();
    this.featureRepository = new FeatureRepository();
  }

  async createPermission(data: CreatePermissionData): Promise<ResponseStatus> {
    try {
      if (!data.name || !data.featureId) {
        return StatusCode.INVALID_ARGUMENT('Permission name and feature ID are required');
      }

      // Check if permission already exists
      const existingPermission = await this.permissionRepository.findByName(data.name);
      if (existingPermission) {
        return StatusCode.ALREADY_EXISTS('Permission already exists');
      }

      // Verify feature exists
      const feature = await this.featureRepository.findById(data.featureId);
      if (!feature) {
        return StatusCode.NOT_FOUND('Feature not found');
      }

      const permission = await this.permissionRepository.create(data) as any;

      return StatusCode.OK({
        id: permission.id,
        name: permission.name,
        featureId: permission.feature_id,
        feature: permission.feature.name,
      }, 'Permission created successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async getPermissionById(id: number): Promise<ResponseStatus> {
    try {
      const permission = await this.permissionRepository.findById(id) as any;
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
  }

  async getPermissions(page: number = 1, limit: number = 10): Promise<ResponseStatus> {
    try {
      const skip = (page - 1) * limit;
      const [permissions, total] = await Promise.all([
        this.permissionRepository.findAll({ skip, take: limit }),
        this.permissionRepository.count(),
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
  }

  async updatePermission(id: number, data: UpdatePermissionData): Promise<ResponseStatus> {
    try {
      const existingPermission = await this.permissionRepository.findById(id) as any;
      if (!existingPermission) {
        return StatusCode.NOT_FOUND('Permission not found');
      }

      // Check name uniqueness if name is being updated
      if (data.name && data.name !== existingPermission.name) {
        const nameExists = await this.permissionRepository.findByName(data.name) as any;
        if (nameExists) {
          return StatusCode.ALREADY_EXISTS('Permission name already exists');
        }
      }

      // Verify feature exists if featureId is being updated
      if (data.featureId) {
        const feature = await this.featureRepository.findById(data.featureId);
        if (!feature) {
          return StatusCode.NOT_FOUND('Feature not found');
        }
      }

      const updatedPermission = await this.permissionRepository.update(id, data) as any;

      return StatusCode.OK({
        id: updatedPermission.id,
        name: updatedPermission.name,
        featureId: updatedPermission.feature_id,
        feature: updatedPermission.feature.name,
      }, 'Permission updated successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async deletePermission(id: number): Promise<ResponseStatus> {
    try {
      const permission = await this.permissionRepository.findById(id) as any;
      if (!permission) {
        return StatusCode.NOT_FOUND('Permission not found');
      }

      // Check if permission is assigned to any roles
      if (permission.roles.length > 0) {
        return StatusCode.FAILED_PRECONDITION('Cannot delete permission assigned to roles');
      }

      await this.permissionRepository.delete(id);
      return StatusCode.OK(null, 'Permission deleted successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }
}