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
const dbHelper_1 = __importDefault(require("../helper/dbHelper"));
const responseStatus_1 = __importDefault(require("../helper/responseStatus"));
const create = (data) => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    try {
        const { name } = data;
        connection = yield dbHelper_1.default.getConnection();
        const query = `INSERT 
                    INTO role 
                      ( name )
                    VALUE 
                      (?)`;
        const [result] = yield connection.query(query, [
            name,
        ]);
        if (result.affectedRows === 0) {
            return responseStatus_1.default.UNKNOWN("Failed to create role.");
        }
        return responseStatus_1.default.OK(result);
    }
    catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : String(err);
        return responseStatus_1.default.UNKNOWN(msg);
    }
    finally {
        if (connection) {
            console.log("Connection release.");
            yield connection.release();
        }
    }
});
