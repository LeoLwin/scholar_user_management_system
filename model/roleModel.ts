import MySQL from "../helper/dbHelper";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import StatusCode from "../helper/responseStatus";
import { ResponseStatus } from "../helper/responseStatus";

export const createRole = async (
  data: { name: string }
): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `INSERT INTO roles(name) VALUES(?)`;
    const [result]: [ResultSetHeader, any] = await connection.query(query, [
      data.name,
    ]);

    if (result.affectedRows === 0) return StatusCode.UNKNOWN("Failed to create role");

    return StatusCode.OK(result, "Role created");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const getRoles = async (): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `SELECT * FROM roles`;
    const [rows]: [RowDataPacket[], any] = await connection.query(query);

    return StatusCode.OK(rows);
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

    const query = `SELECT * FROM roles WHERE id=?`;
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

export const deleteRole = async (id: number): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `DELETE FROM roles WHERE id=?`;
    const [result]: [ResultSetHeader, any] = await connection.query(query, [id]);

    if (result.affectedRows === 0) return StatusCode.NOT_FOUND("Role not found");

    return StatusCode.OK(result, "Role deleted");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};