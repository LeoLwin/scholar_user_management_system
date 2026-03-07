import MySQL from "../helper/dbHelper";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import StatusCode from "../helper/responseStatus";
import { ResponseStatus } from "../helper/responseStatus";

export const createPermission = async (
  data: { name: string; featureId: number }
): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `INSERT INTO permissions(name, feature_id) VALUES(?,?)`;
    const [result]: [ResultSetHeader, any] = await connection.query(query, [
      data.name,
      data.featureId,
    ]);

    if (result.affectedRows === 0) return StatusCode.UNKNOWN("Failed to create permission");

    return StatusCode.OK(result, "Permission created");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const getPermissions = async (): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `
      SELECT p.id, p.name, f.name as feature
      FROM permissions p
      JOIN features f ON f.id = p.feature_id
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

export const deletePermission = async (id: number): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `DELETE FROM permissions WHERE id=?`;
    const [result]: [ResultSetHeader, any] = await connection.query(query, [id]);

    if (result.affectedRows === 0) return StatusCode.NOT_FOUND("Permission not found");

    return StatusCode.OK(result, "Permission deleted");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};