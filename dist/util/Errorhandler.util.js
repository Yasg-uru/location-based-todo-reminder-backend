"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorhandlerMiddleware = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = require("jsonwebtoken");
// ✅ Custom Error Handler Class
class Errorhandler extends Error {
    constructor(statusCode, message) {
        super(message); // Pass message to built-in Error class
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
const ErrorhandlerMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    if (err instanceof Errorhandler) {
        return res.status(statusCode).json({ error: message });
    }
    if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
        statusCode = 401;
        message = "Invalid Token! Please log in again.";
    }
    else if (err instanceof jsonwebtoken_1.TokenExpiredError) {
        statusCode = 401;
        message = "Token expired! Please log in again.";
    }
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        statusCode = 400;
        const errors = Object.values(err.errors).map((e) => e.message);
        message = `Validation Error: ${errors.join(", ")}`;
    }
    if (err.code === 11000 && err.keyValue) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate Key Error: '${field}' already exists.`;
    }
    if (err instanceof mongoose_1.default.Error.CastError) {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }
    console.error("🚨 Error: ", err);
    return res.status(statusCode).json({ error: message });
};
exports.ErrorhandlerMiddleware = ErrorhandlerMiddleware;
exports.default = Errorhandler;
