import {
  createFeature as createFeatureRepo,
  findFeatureById,
  findFeatureByName,
  findAllFeatures,
  updateFeature as updateFeatureRepo,
  deleteFeature as deleteFeatureRepo,
  countAllFeatures,

} from '../repositories/featureRepository';
import StatusCode from '../helper/responseStatus';
import { ResponseStatus } from '../helper/responseStatus';
import { CreateFeatureData, UpdateFeatureData } from '../type/featureType';

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

export const getFeatures = async (
  page: number = 1,
  limit: number = 10,
  filterName?: string
): Promise<ResponseStatus> => {
  try {
    const skip = (page - 1) * limit;

    const whereClause = filterName
      ? { name: { contains: filterName } }
      : {};

    const [features, totalCount] = await Promise.all([
      findAllFeatures({
        skip,
        take: limit,
        where: whereClause
      }),
      // Database တစ်ခုလုံးမှာရှိတဲ့ စုစုပေါင်းအရေအတွက်ကို repository ကနေ သီးသန့်ယူမယ်
      countAllFeatures(),
    ]);

    console.log("Features Total :", { features, totalCount })

    const featureData = features.map((feature: any) => ({
      id: feature.id,
      name: feature.name,
      permissions: feature.permissions.map((permission: any) => ({
        id: permission.id,
        name: permission.name,
      })),
      permissionCount: feature.permissions.length,
    }));

    return StatusCode.OK({
      features: featureData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit), // Filter ကြောင့် နည်းသွားတာမျိုးမဟုတ်ဘဲ absolute total နဲ့ တွက်တာဖြစ်လို့ page အရေအတွက် အပြည့်ပြနေမှာပါ
        totalRecords: totalCount, // Database ထဲက အားလုံးပေါင်း count
        limit,
      },
    });
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
export const getFeaturesNameAndValue = async (): Promise<ResponseStatus> => {
  try {
    const features = await findAllFeatures({ skip: 0, take: 1000 });
    const featureNameValueData = features.map((feature: any) => ({
      name: feature.name,
      value: feature.id,
    }));
    return StatusCode.OK(featureNameValueData, "Features fetched successfully");
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
}