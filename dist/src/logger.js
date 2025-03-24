"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (...args) => {
        if (process.env.NODE_ENV !== 'production') {
            process.stdout.write(args.map(String).join(' ') + '\n');
        }
    },
    error: (...args) => {
        process.stderr.write(args.map(String).join(' ') + '\n');
    }
};
