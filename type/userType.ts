
import { Gender } from '../generated/prisma/client';


export type JwtUserInfoType = {
    id: string,
    name: string,
    email: string,
    roleId: number,
};


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
    isActive?: boolean;
}
