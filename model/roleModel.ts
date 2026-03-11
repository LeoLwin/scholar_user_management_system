import MySQL from "../helper/dbHelper";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import StatusCode from "../helper/responseStatus";
import { ResponseStatus } from "../helper/responseStatus";
import { assignPermissionToRole, deleteAssignPermissionRole } from "./rolePermissionModel";

export const createRole = async (
  data: { name: string; permissionId: number }
): Promise<ResponseStatus> => {
  let connection;

  try {
    connection = await MySQL.getConnection();
    await connection.beginTransaction();

    const roleQuery = `INSERT INTO roles (name) VALUES (?)`;

    const [roleResult]: [ResultSetHeader, any] = await connection.query(
      roleQuery,
      [data.name]
    );

    if (roleResult.affectedRows === 0) {
      await connection.rollback();
      return StatusCode.UNKNOWN("Failed to create role");
    }

    const roleId = roleResult.insertId;

    const permResult = await assignPermissionToRole(connection, {
      roleId,
      permissionId: data.permissionId,
    });

    if (permResult.code !== "200") {
      await connection.rollback();
      return permResult;
    }

    await connection.commit();

    return StatusCode.OK(
      { roleId, permissionId: data.permissionId },
      "Role created successfully"
    );

  } catch (err: unknown) {

    if (connection) await connection.rollback();

    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);

  } finally {
    if (connection) await connection.release();
  }
};

export const getRoles = async (
  current: number,
  limit: number
): Promise<ResponseStatus> => {
  let connection;

  try {
    connection = await MySQL.getConnection();

    const offset = (current - 1) * limit;
    console.log("hit the getRoles")

    // total count
    const countQuery = `SELECT COUNT(*) AS total FROM roles`;
    const [countRows]: [RowDataPacket[], any] = await connection.query(countQuery);

    const totalRecords = countRows[0].total;

    if (totalRecords === 0) {
      return StatusCode.OK({
        by: [],
        pagination: {
          currentPage: current,
          limit: limit,
          totalRecords: 0,
          totalPages: 0
        }
      });
    }

    const totalPages = Math.ceil(totalRecords / limit);

    const query = `
      SELECT 
        r.id,
        r.name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
             'id', p.id, 
              'name', p.name, 
              'feature_id', p.feature_id
          )
        ) AS permissions
      FROM roles r
      LEFT JOIN roles_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permissions_id
      GROUP BY
        r.id,
        r.name
      LIMIT ? OFFSET ?
    `;

    const [rows]: [RowDataPacket[], any] = await connection.query(query, [
      limit,
      offset
    ]);

    return StatusCode.OK({
      by: rows,
      pagination: {
        currentPage: current,
        limit: limit,
        totalRecords: totalRecords,
        totalPages: totalPages
      }
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const getRoleById = async (id: number): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    // const query = `SELECT * FROM roles WHERE id=?`;
    const query = `
     SELECT 
        r.id,
        r.name,
        JSON_ARRAYAGG(
          JSON_OBJECT(
             'id', p.id, 
              'name', p.name, 
              'feature_id', p.feature_id
          )
        ) AS permissions
      FROM roles r
      JOIN roles_permissions rp ON rp.role_id = r.id
      JOIN permissions p ON p.id = rp.permissions_id
      WHERE r.id = ?
      GROUP BY
        r.id,
        r.name`
    const [rows]: [RowDataPacket[], any] = await connection.query(query, [id]);

    if (rows.length === 0) return StatusCode.NOT_FOUND("Role not found");

    return StatusCode.OK(rows[0]);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const updateRole = async (
  id: number,
  data: { name: string }
): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `UPDATE roles SET name=? WHERE id=?`;
    const [result]: [ResultSetHeader, any] = await connection.query(query, [
      data.name,
      id,
    ]);

    if (result.affectedRows === 0) return StatusCode.NOT_FOUND("Role not found");

    return StatusCode.OK(result, "Role updated");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const deleteRole = async (id: number, permissionId?: number): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();
    await connection.beginTransaction();


    const deletePermResult = await deleteAssignPermissionRole(connection, {
      roleId: id,
      permissionId,
    });

    if (deletePermResult.code !== "200" && deletePermResult.code !== "404") {
      // 404 means no permissions existed, okay to continue
      await connection.rollback();
      return deletePermResult;
    }

    const query = `DELETE FROM roles WHERE id=?`;
    const [result]: [ResultSetHeader, any] = await connection.query(query, [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return StatusCode.NOT_FOUND("Role not found");
    }


    await connection.commit();

    return StatusCode.OK(result, "Role deleted successfully");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};