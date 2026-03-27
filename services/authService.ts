import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/userRepository';
import StatusCode from '../helper/responseStatus';
import { ResponseStatus } from '../helper/responseStatus';
import config from '../config/config';

export interface LoginCredentials {
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

export interface JWTPayload {
  id: number;
  name: string;
  email: string;
  roleId: number;
  iat?: number;
  exp?: number;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(credentials: LoginCredentials): Promise<ResponseStatus> {
    try {
      const { email, password } = credentials;
      console.log("email", email);
      console.log("password", password);

      if (!email || !password) {
        return StatusCode.INVALID_ARGUMENT('Email and password are required');
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(email) as any;
      if (!user || !user.password) {
        return StatusCode.UNAUTHENTICATED('Invalid email or password');
      }
      console.log("user : ", user)

      // Check if user is active
      if (!user.is_active) {
        return StatusCode.UNAUTHENTICATED('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return StatusCode.UNAUTHENTICATED('Invalid email or password');
      }

      // Generate JWT token
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

  async verifyToken(token: string): Promise<ResponseStatus> {
    try {
      const decoded = jwt.verify(token, config.jwtSecrete) as JWTPayload;

      // Check if user still exists and is active
      const user = await this.userRepository.findById(decoded.id) as any;
      if (!user || !user.is_active) {
        return StatusCode.UNAUTHENTICATED('Token is invalid');
      }

      return StatusCode.OK({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.role_id,
          role: user.role?.name,
        },
      });

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return StatusCode.UNAUTHENTICATED('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return StatusCode.UNAUTHENTICATED('Invalid token');
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }

  async refreshToken(token: string): Promise<ResponseStatus> {
    try {
      // First verify the existing token
      const verificationResult = await this.verifyToken(token);
      if (verificationResult.code !== '200') {
        return verificationResult;
      }

      const user = verificationResult.data.user;

      // Generate new token
      const newToken = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
        },
        config.jwtSecrete,
        { expiresIn: '1d' }
      );

      return StatusCode.OK({
        token: newToken,
        user,
      }, 'Token refreshed successfully');

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return StatusCode.UNKNOWN(message);
    }
  }
}