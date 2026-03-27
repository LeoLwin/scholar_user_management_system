export interface CreatePermissionData {
    name: string;
    featureId: number;
}

export interface UpdatePermissionData {
    name?: string;
    featureId?: number;
}