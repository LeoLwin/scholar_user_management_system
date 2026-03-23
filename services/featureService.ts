import { FeatureRepository, CreateFeatureData, UpdateFeatureData } from '../repositories/featureRepository';
import StatusCode from '../helper/responseStatus';
import { ResponseStatus } from '../helper/responseStatus';

export class FeatureService {
  private featureRepository: FeatureRepository;

  constructor() {
    this.featureRepository = new FeatureRepository();
  }

  async createFeature(data: CreateFeatureData): Promise<ResponseStatus> {
    try {
      if (!data.name) {
        return StatusCode.INVALID_ARGUMENT('Feature name is required');
      }

      // Check if feature already exists
      const existingFeature = await this.featureRepository.findByName(data.name);
      if (existingFeature) {
        return StatusCode.ALREADY_EXISTS('Feature already exists');
      }

      const feature = await this.featureRepository.create(data) as any;

      return StatusCode.OK({
        id: feature.id,
        name: feature.name,
        permissionCount: feature.permissions.length,
      }, 'Feature created successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async getFeatureById(id: number): Promise<ResponseStatus> {
    try {
      const feature = await this.featureRepository.findById(id) as any;
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
  }

  async getFeatures(): Promise<ResponseStatus> {
    try {
      const features = await this.featureRepository.findAll();

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
  }

  async updateFeature(id: number, data: UpdateFeatureData): Promise<ResponseStatus> {
    try {
      const existingFeature = await this.featureRepository.findById(id) as any;
      if (!existingFeature) {
        return StatusCode.NOT_FOUND('Feature not found');
      }

      // Check name uniqueness if name is being updated
      if (data.name && data.name !== existingFeature.name) {
        const nameExists = await this.featureRepository.findByName(data.name) as any;
        if (nameExists) {
          return StatusCode.ALREADY_EXISTS('Feature name already exists');
        }
      }

      const updatedFeature = await this.featureRepository.update(id, data) as any;

      return StatusCode.OK({
        id: updatedFeature.id,
        name: updatedFeature.name,
        permissionCount: updatedFeature.permissions.length,
      }, 'Feature updated successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async deleteFeature(id: number): Promise<ResponseStatus> {
    try {
      const feature = await this.featureRepository.findById(id) as any;
      if (!feature) {
        return StatusCode.NOT_FOUND('Feature not found');
      }

      // Check if feature has permissions
      if (feature.permissions.length > 0) {
        return StatusCode.FAILED_PRECONDITION('Cannot delete feature with assigned permissions');
      }

      await this.featureRepository.delete(id);
      return StatusCode.OK(null, 'Feature deleted successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }
}