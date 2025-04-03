"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fastify = (0, fastify_1.default)();
fastify.get('/', async (request, reply) => {
    return 'Hello there! 👋';
});
const start = async () => {
    try {
        await fastify.listen({ port: 8080 });
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};
start();
