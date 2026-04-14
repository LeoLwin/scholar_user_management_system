import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  createUser as createUserRepo,
  findUserById,
  findUserByEmail,
  findUserByUsername,
  findAllUsers,
  updateUser as updateUserRepo,
  deleteUser as deleteUserRepo,
  countUsers,
  // CreateUserData,
  // UpdateUserData,
} from '../repositories/userRepository';
import { findRoleById } from '../repositories/roleRepository';
import StatusCode from '../helper/responseStatus';
import { ResponseStatus } from '../helper/responseStatus';
import config from '../config/config';
import { CreateUserData, UpdateUserData } from '../type/userType';

export interface LoginData {
  email: string;
  password: string;
}

export const createUser = async (data: CreateUserData): Promise<ResponseStatus> => {
  try {
    console.log("data", data)
    if (!data.name || !data.email ||
      !data.roleId || !data.phone || !data.address) {
      return StatusCode.INVALID_ARGUMENT('Missing required fields');
    }

    const existingUser = await findUserByEmail(data.email);
    if (existingUser) {
      return StatusCode.ALREADY_EXISTS('Email already exists');
    }

    const existingUsername = await findUserByUsername(data.username);
    if (existingUsername) {
      return StatusCode.ALREADY_EXISTS('Username already exists');
    }

    const role = await findRoleById(data.roleId);
    if (!role) {
      return StatusCode.NOT_FOUND('Role not found');
    }

    const hashedPassword = await bcrypt.hash(config.defaultPassword, 10);
    const user = await createUserRepo({ ...data, password: hashedPassword }) as any;

    return StatusCode.OK(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.role_id,
        role: user.role.name,
      },
      'User created successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const login = async (data: LoginData): Promise<ResponseStatus> => {
  try {
    if (!data.email || !data.password) {
      return StatusCode.INVALID_ARGUMENT('Email and password are required');
    }

    const user = await findUserByEmail(data.email) as any;
    if (!user || !user.password) {
      return StatusCode.UNAUTHENTICATED('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return StatusCode.UNAUTHENTICATED('Invalid email or password');
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.role_id,
      },
      config.jwtSecrete,
      { expiresIn: '1d' }
    );

    return StatusCode.OK(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.role_id,
          role: user.role?.name,
        },
      },
      'Login successful'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const getUserById = async (id: number): Promise<ResponseStatus> => {
  try {
    const user = await findUserById(id) as any;
    if (!user) {
      return StatusCode.NOT_FOUND('User not found');
    }

    return StatusCode.OK({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      roleId: user.role_id,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      isActive: user.is_active,
      role: user.role?.name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const getUsers = async (page: number = 1, limit: number = 10): Promise<ResponseStatus> => {
  try {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      findAllUsers({ skip, take: limit }),
      countUsers(),
    ]);

    const userData = users.map((user: any) => ({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      roleId: user.role_id,
      phone: user.phone,
      address: user.address,
      gender: user.gender,
      isActive: user.is_active,
      role: user.role,
    }));

    return StatusCode.OK({
      users: userData,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit,
        current: page
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const updateUser = async (id: number, data: UpdateUserData): Promise<ResponseStatus> => {
  try {
    const existingUser = await findUserById(id) as any;
    if (!existingUser) {
      return StatusCode.NOT_FOUND('User not found');
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await findUserByEmail(data.email);
      if (emailExists) {
        return StatusCode.ALREADY_EXISTS('Email already exists');
      }
    }

    if (data.username && data.username !== existingUser.username) {
      const usernameExists = await findUserByUsername(data.username);
      if (usernameExists) {
        return StatusCode.ALREADY_EXISTS('Username already exists');
      }
    }

    if (data.roleId) {
      const role = await findRoleById(data.roleId);
      if (!role) {
        return StatusCode.NOT_FOUND('Role not found');
      }
    }

    const updatedUser = await updateUserRepo(id, data) as any;

    return StatusCode.OK(
      {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        roleId: updatedUser.role_id,
        role: updatedUser.role?.name,
      },
      'User updated successfully'
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};

export const deleteUser = async (id: number): Promise<ResponseStatus> => {
  try {
    const user = await findUserById(id);
    if (!user) {
      return StatusCode.NOT_FOUND('User not found');
    }

    await deleteUserRepo(id);
    return StatusCode.OK(null, 'User deleted successfully');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return StatusCode.UNKNOWN(message);
  }
};