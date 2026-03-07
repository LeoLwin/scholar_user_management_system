import MySQL from "../helper/dbHelper";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import StatusCode from "../helper/responseStatus";
import { ResponseStatus } from "../helper/responseStatus";
import bcrypt from "bcrypt";



export interface User {
  id?: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  roleId: number;
  phone: string;
  address: string;
  gender?: 'male' | 'female';
  is_active?: number;
}

export const createUser = async (data: User): Promise<ResponseStatus> => {
  let connection;
  try {
    const { name, username, email, password, roleId, phone, address, gender } = data;
    if(!name || !username || !email || !password || !roleId || !phone || !address) {
      return StatusCode.INVALID_ARGUMENT("Missing required fields");
    }

    connection = await MySQL.getConnection();

    const query = `
      INSERT INTO admin_users(name, username, email, password, role_id, phone, address, gender)
      VALUES(?,?,?,?,?,?,?,?)
    `;

    const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result]: [ResultSetHeader, any] = await connection.query(query, [
      name,
      username,
      email,
      hashedPassword,
      roleId,
      phone,
      address,
      gender || 'male', 
    ]);

    if (result.affectedRows === 0) {
      return StatusCode.UNKNOWN("Failed to create user.");
    }

    return StatusCode.OK({ insertId: result.insertId }, "User created");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const getUsers = async (): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `
      SELECT u.id, u.name, u.username, u.email, u.phone, u.address, u.gender, r.name as role
      FROM admin_users u
      JOIN roles r ON r.id = u.role_id
    `;

    const [rows]: [RowDataPacket[], any] = await connection.query(query);

    return StatusCode.OK(rows);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const getUserById = async (id: number): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `SELECT id, name, username, email, role_id, phone, address, gender FROM admin_users WHERE id=?`;
    const [rows]: [RowDataPacket[], any] = await connection.query(query, [id]);

    if (rows.length === 0) return StatusCode.NOT_FOUND("User not found");

    return StatusCode.OK(rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const updateUser = async (
  id: number,
  data: Partial<User>
): Promise<ResponseStatus> => {
  let connection;
  try {
    const { name, username, email, roleId, phone, address, gender } = data;

    connection = await MySQL.getConnection();

    const query = `
      UPDATE admin_users
      SET name=?, username=?, email=?, role_id=?, phone=?, address=?, gender=?
      WHERE id=?
    `;

    const [result]: [ResultSetHeader, any] = await connection.query(query, [
      name,
      username,
      email,
      roleId,
      phone,
      address,
      gender,
      id,
    ]);

    if (result.affectedRows === 0)
      return StatusCode.NOT_FOUND("User not found or no changes made");

    return StatusCode.OK(result, "User updated");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const deleteUser = async (id: number): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `DELETE FROM admin_users WHERE id=?`;
    const [result]: [ResultSetHeader, any] = await connection.query(query, [id]);

    if (result.affectedRows === 0)
      return StatusCode.NOT_FOUND("User not found");

    return StatusCode.OK(result, "User deleted");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};


export const findUserByEmail = async (email: string): Promise<User | null> => {
  let connection;
  try {
    connection = await MySQL.getConnection();
    const query = `
      SELECT id, name, username, email, password, role_id as roleId, phone, address, gender 
      FROM admin_users 
      WHERE email = ? LIMIT 1
    `;

    const [rows] = await connection.query<RowDataPacket[]>(query, [email]);

    if (rows.length === 0) return null;
    
    return rows[0] as User;
  } catch (err) {
    throw err;
  } finally {
    if (connection) await connection.release();
  }
};

export const initializeSystemData = async (): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();
    await connection.beginTransaction();

    const [roles]: [RowDataPacket[], any] = await connection.query("SELECT id FROM roles LIMIT 1");
    
    if (roles.length === 0) {
      console.log("Seed: Inserting Roles, Features, and Permissions...");

      await connection.query("INSERT INTO roles (id, name) VALUES (1, 'admin'), (2, 'operator'), (3, 'Cashier')");

      await connection.query("INSERT INTO features (id, name) VALUES (1, 'user'), (2, 'roles'), (3, 'product')");

      await connection.query(`
        INSERT INTO permissions (id, name, feature_id) VALUES 
        (1, 'create', 1), (2, 'read', 1), (3, 'update', 1), (4, 'delete', 1),
        (5, 'create', 2), (6, 'read', 2), (7, 'update', 2), (8, 'delete', 2)
      `);

      await connection.query(`
        INSERT INTO roles_permissions (role_id, permissions_id) VALUES 
        (1, '1'), (1, '2'), (1, '3'), (1, '4'), 
        (1, '5'), (1, '6'), (1, '7'), (1, '8')
      `);
    }

    const [adminUser]: [RowDataPacket[], any] = await connection.query(
      "SELECT id FROM admin_users WHERE username = 'admin' LIMIT 1"
    );

    if (adminUser.length === 0) {
      console.log("Seed:");
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);

      const insertUserQuery = `
        INSERT INTO admin_users(name, username, email, password, role_id, phone, address, gender)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      console.log()
      await connection.query(insertUserQuery, [
        'Admin', 
        'admin', 
        'admin@system.com', 
        hashedPassword, 
        1, 
        '091234567', 
        'System Office', 
        'male'
      ]);
    }

    await connection.commit();
    return StatusCode.OK(null, "System initialized successfully");

  } catch (err: unknown) {
    if (connection) await connection.rollback();
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Initialization Error:", msg);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};