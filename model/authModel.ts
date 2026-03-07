

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as repo from "./userModel"; // Adjust path to your repo
import StatusCode from "../helper/responseStatus";
import { ResponseStatus } from "../helper/responseStatus";
import config from "../config/config";


export const login = async (data: { email: string; password: string }): Promise<ResponseStatus> => {
  const { email, password } = data;

  if (!email || !password) {
    return StatusCode.INVALID_ARGUMENT("Email and password are required");
  }

  try {
    const user = await repo.findUserByEmail(email);
    
    if (!user || !user.password) {
      return StatusCode.UNAUTHENTICATED("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return StatusCode.UNAUTHENTICATED("Invalid email or password");
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId
      },
      config.jwtSecrete,
      { expiresIn: "1d" }
    );

    return StatusCode.OK(
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId
        },
      },
      "Login successful"
    );

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  }
};