import MySQL from "../helper/dbHelper";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import StatusCode from "../helper/responseStatus";
import { ResponseStatus } from "../helper/responseStatus";
import { permission } from "process";


export const assignPermissionToRole = async (
  connection: any,
  data: { roleId: number; permissionId: number }
): Promise<ResponseStatus> => {
  try {
    const query = `
      INSERT INTO roles_permissions (role_id, permissions_id)
      VALUES (?, ?)
    `;

    const [result]: [ResultSetHeader, any] = await connection.query(query, [
      data.roleId,
      data.permissionId,
    ]);

    if (result.affectedRows === 0) {
      return StatusCode.UNKNOWN("Failed to assign permission");
    }

    return StatusCode.OK(result);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  }
};


export const deleteAssignPermissionRole = async (
  connection: any,
  data: { roleId: number; permissionId?: number }): Promise<ResponseStatus> => {
  try {
    let query = `DELETE FROM roles_permissions WHERE role_id = ?`

    const queryParams: any[] = [data.roleId];
    if (data.permissionId !== undefined) {
      query += ` AND permission_id = ?`;
      queryParams.push(data.permissionId);
    }
    const [result]: [ResultSetHeader, any] = await connection.query(
      query,
      queryParams
    );
    if (result.affectedRows === 0) {
      return StatusCode.NOT_FOUND("No permission found to delete");
    }

    return StatusCode.OK(
      { affectedRows: result.affectedRows },
      "Role permission deleted successfully"
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  }
}

export const getPermissionsByRole = async (roleId: number): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `
      SELECT p.id, p.name, f.name as feature
      FROM roles_permissions rp
      JOIN permissions p ON p.id = rp.permission_id
      JOIN features f ON f.id = p.feature_id
      WHERE rp.role_id = ?
    `;
    const [rows]: [any[], any] = await connection.query(query, [roleId]);

    return StatusCode.OK(rows);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

