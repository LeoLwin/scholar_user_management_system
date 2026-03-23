"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFeature = exports.updateFeature = exports.getFeatures = exports.createFeature = void 0;
const dbHelper_1 = __importDefault(require("../helper/dbHelper"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const createFeature = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `INSERT INTO features(name) VALUES(?)`;
        const [result] = yield connection.query(query, [data.name]);
        if (result.affectedRows === 0)
            return responseStatus_1.default.UNKNOWN("Failed to create feature");
        return responseStatus_1.default.OK(result, "Feature created");
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection)
            yield connection.release();
    }
});
exports.createFeature = createFeature;
const getFeatures = () => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `SELECT * FROM features`;
        const [rows] = yield connection.query(query);
        return responseStatus_1.default.OK(rows);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection)
            yield connection.release();
    }
});
exports.getFeatures = getFeatures;
const updateFeature = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `UPDATE features SET name=? WHERE id=?`;
        const [result] = yield connection.query(query, [data.name, id]);
        if (result.affectedRows === 0)
            return responseStatus_1.default.NOT_FOUND("Feature not found");
        return responseStatus_1.default.OK(result, "Feature updated");
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection)
            yield connection.release();
    }
});
exports.updateFeature = updateFeature;
const deleteFeature = (id) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        connection = yield dbHelper_1.default.getConnection();
        const query = `DELETE FROM features WHERE id=?`;
        const [result] = yield connection.query(query, [id]);
        if (result.affectedRows === 0)
            return responseStatus_1.default.NOT_FOUND("Feature not found");
        return responseStatus_1.default.OK(result, "Feature deleted");
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection)
            yield connection.release();
    }
});
exports.deleteFeature = deleteFeature;
