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

export const getPermissions = async (
  current: number,
  limit: number
): Promise<ResponseStatus> => {
  let connection;

  try {
    connection = await MySQL.getConnection();

    const offset = (current - 1) * limit;

    // total count
    const countQuery = `SELECT COUNT(*) AS total FROM permissions`;
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

    // get paginated data
    const query = `
      SELECT 
        p.id, 
        p.name, 
        f.name AS feature
      FROM permissions p
      JOIN features f ON f.id = p.feature_id
      LIMIT ? OFFSET ?
    `;

    const [rows]: [RowDataPacket[], any] = await connection.query(query, [limit, offset]);

    return StatusCode.OK({
      by: rows,
      pagination: {
        currentPage: current,
        limit: limit,
        totalRecords,
        totalPages
      }
    });

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