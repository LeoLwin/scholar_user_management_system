import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository, CreateUserData, UpdateUserData } from '../repositories/userRepository';
import { RoleRepository } from '../repositories/roleRepository';
import StatusCode from '../helper/responseStatus';
import { ResponseStatus } from '../helper/responseStatus';
import config from '../config/config';

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  roleId: number;
  role?: string;
}

export class UserService {
  private userRepository: UserRepository;
  private roleRepository: RoleRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.roleRepository = new RoleRepository();
  }

  async createUser(data: CreateUserData): Promise<ResponseStatus> {
    try {
      // Validate required fields
      if (!data.name || !data.username || !data.email || !data.password ||
          !data.roleId || !data.phone || !data.address) {
        return StatusCode.INVALID_ARGUMENT('Missing required fields');
      }

      // Check if email already exists
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        return StatusCode.ALREADY_EXISTS('Email already exists');
      }

      // Check if username already exists
      const existingUsername = await this.userRepository.findByUsername(data.username);
      if (existingUsername) {
        return StatusCode.ALREADY_EXISTS('Username already exists');
      }

      // Verify role exists
      const role = await this.roleRepository.findById(data.roleId);
      if (!role) {
        return StatusCode.NOT_FOUND('Role not found');
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      const userData = {
        ...data,
        password: hashedPassword,
      };

      const user = await this.userRepository.create(userData) as any;

      return StatusCode.OK({
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.role_id,
        role: user.role.name,
      }, 'User created successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async login(data: LoginData): Promise<ResponseStatus> {
    try {
      if (!data.email || !data.password) {
        return StatusCode.INVALID_ARGUMENT('Email and password are required');
      }

      const user = await this.userRepository.findByEmail(data.email) as any;
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

      return StatusCode.OK({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.role_id,
          role: user.role?.name,
        },
      }, 'Login successful');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async getUserById(id: number): Promise<ResponseStatus> {
    try {
      const user = await this.userRepository.findById(id) as any;
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
  }

  async getUsers(page: number = 1, limit: number = 10): Promise<ResponseStatus> {
    try {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.userRepository.findAll({ skip, take: limit }),
        this.userRepository.count(),
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
        role: user.role?.name,
      }));

      return StatusCode.OK({
        users: userData,
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

  async updateUser(id: number, data: UpdateUserData): Promise<ResponseStatus> {
    try {
      // Check if user exists
      const existingUser = await this.userRepository.findById(id) as any;
      if (!existingUser) {
        return StatusCode.NOT_FOUND('User not found');
      }

      // Check email uniqueness if email is being updated
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await this.userRepository.findByEmail(data.email) as any;
        if (emailExists) {
          return StatusCode.ALREADY_EXISTS('Email already exists');
        }
      }

      // Check username uniqueness if username is being updated
      if (data.username && data.username !== existingUser.username) {
        const usernameExists = await this.userRepository.findByUsername(data.username) as any;
        if (usernameExists) {
          return StatusCode.ALREADY_EXISTS('Username already exists');
        }
      }

      // Verify role exists if roleId is being updated
      if (data.roleId) {
        const role = await this.roleRepository.findById(data.roleId);
        if (!role) {
          return StatusCode.NOT_FOUND('Role not found');
        }
      }

      const updatedUser = await this.userRepository.update(id, data) as any;

      return StatusCode.OK({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        roleId: updatedUser.role_id,
        role: updatedUser.role?.name,
      }, 'User updated successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async deleteUser(id: number): Promise<ResponseStatus> {
    try {
      const user = await this.userRepository.findById(id) as any;
      if (!user) {
        return StatusCode.NOT_FOUND('User not found');
      }

      await this.userRepository.delete(id);
      return StatusCode.OK(null, 'User deleted successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }
}