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
const dbHelper_1 = require("../helper/dbHelper");
const bcrypt_1 = __importDefault(require("bcrypt"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Start seeding...");
        // 1. Seed Features
        const userManagementFeature = yield dbHelper_1.prisma.feature.upsert({
            where: { id: 1 },
            update: {},
            create: {
                id: 1,
                name: "User Management",
            },
        });
        const roleManagementFeature = yield dbHelper_1.prisma.feature.upsert({
            where: { id: 2 },
            update: {},
            create: {
                id: 2,
                name: "Role Management",
            },
        });
        console.log("Features seeded.");
        // 2. Seed Permissions
        const permissionsData = [
            { id: 1, name: "CREATE_USER", feature_id: userManagementFeature.id },
            { id: 2, name: "READ_USER", feature_id: userManagementFeature.id },
            { id: 3, name: "UPDATE_USER", feature_id: userManagementFeature.id },
            { id: 4, name: "DELETE_USER", feature_id: userManagementFeature.id },
            { id: 5, name: "CREATE_ROLE", feature_id: roleManagementFeature.id },
            { id: 6, name: "READ_ROLE", feature_id: roleManagementFeature.id },
            { id: 7, name: "UPDATE_ROLE", feature_id: roleManagementFeature.id },
            { id: 8, name: "DELETE_ROLE", feature_id: roleManagementFeature.id },
        ];
        for (const permission of permissionsData) {
            yield dbHelper_1.prisma.permission.upsert({
                where: { id: permission.id },
                update: {},
                create: permission,
            });
        }
        console.log("Permissions seeded.");
        // 3. Seed Roles
        const superAdminRole = yield dbHelper_1.prisma.role.upsert({
            where: { id: 1 },
            update: {},
            create: {
                id: 1,
                name: "Super Admin",
            },
        });
        const adminRole = yield dbHelper_1.prisma.role.upsert({
            where: { id: 2 },
            update: {},
            create: {
                id: 2,
                name: "Admin",
            },
        });
        console.log("Roles seeded.");
        // 4. Seed RolePermissions (Link Super Admin to all permissions)
        for (const permission of permissionsData) {
            yield dbHelper_1.prisma.rolePermission.upsert({
                where: {
                    role_id_permissions_id: {
                        role_id: superAdminRole.id,
                        permissions_id: permission.id,
                    },
                },
                update: {},
                create: {
                    role_id: superAdminRole.id,
                    permissions_id: permission.id,
                },
            });
        }
        console.log("RolePermissions seeded.");
        // 5. Seed Super Admin User
        const hashedPassword = yield bcrypt_1.default.hash("Admin@123", 10);
        yield dbHelper_1.prisma.adminUser.upsert({
            where: { email: "admin@example.com" },
            update: {},
            create: {
                name: "Super Admin",
                username: "superadmin",
                email: "admin@example.com",
                password: hashedPassword,
                phone: "09123456789",
                address: "Yangon, Myanmar",
                role_id: superAdminRole.id,
                gender: "male",
                is_active: true,
            },
        });
        console.log("Super Admin user seeded.");
        console.log("Seeding finished.");
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield dbHelper_1.prisma.$disconnect();
}));
