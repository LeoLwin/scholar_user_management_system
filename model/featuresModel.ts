import MySQL from "../helper/dbHelper";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import StatusCode from "../helper/responseStatus";
import { ResponseStatus } from "../helper/responseStatus";


export const createFeature = async (data: { name: string }): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `INSERT INTO features(name) VALUES(?)`;
    const [result]: [ResultSetHeader, any] = await connection.query(query, [data.name]);

    if (result.affectedRows === 0) return StatusCode.UNKNOWN("Failed to create feature");

    return StatusCode.OK(result, "Feature created");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const getFeatures = async (): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `SELECT * FROM features`;
    const [rows]: [RowDataPacket[], any] = await connection.query(query);

    return StatusCode.OK(rows);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const updateFeature = async (id: number, data: { name: string }): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `UPDATE features SET name=? WHERE id=?`;
    const [result]: [ResultSetHeader, any] = await connection.query(query, [data.name, id]);

    if (result.affectedRows === 0) return StatusCode.NOT_FOUND("Feature not found");

    return StatusCode.OK(result, "Feature updated");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};

export const deleteFeature = async (id: number): Promise<ResponseStatus> => {
  let connection;
  try {
    connection = await MySQL.getConnection();

    const query = `DELETE FROM features WHERE id=?`;
    const [result]: [ResultSetHeader, any] = await connection.query(query, [id]);

    if (result.affectedRows === 0) return StatusCode.NOT_FOUND("Feature not found");

    return StatusCode.OK(result, "Feature deleted");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return StatusCode.UNKNOWN(msg);
  } finally {
    if (connection) await connection.release();
  }
};