import chalk from 'chalk';
import { join } from 'node:path';
import fs from 'fs/promises';
import util from 'node:util';

export class Logger {
    private authorColor = chalk.cyan;
    private author: string;
    private logDump: string;

    constructor(author: string) {
        this.author = author;
        this.logDump = '';
    }

    log(...data: any[]) {
        this.commonLog(chalk.white, 'LOG', ...data);
    }

    debug(...data: any[]) {
        this.commonLog(chalk.grey, 'DEBUG', ...data);
    }

    warn(...data: any[]) {
        this.commonLog(chalk.yellow, 'WARN', ...data);
    }

    error(...data: any[]) {
        this.commonLog(chalk.red, 'ERROR', ...data);
    }

    async dump() {
        const extension = 'txt';
        const fileName = new Date().toISOString() + '.' + extension;
        const logDir = join(process.cwd(), 'logs');

        if (!(await fs.exists(logDir))) {
            await fs.mkdir(logDir);
        }

        fs.writeFile(join(logDir, fileName), this.logDump);
    }

    private wrapWithSquareBrackets(data: any) {
        return chalk.whiteBright('[') + data + chalk.whiteBright(']');
    }

    private commonLog(
        applyColor: (...text: unknown[]) => string,
        prefix: string,
        ...data: any[]
    ) {
        console.log(
            `${this.wrapWithSquareBrackets(
                applyColor(prefix)
            )}${this.wrapWithSquareBrackets(this.authorColor(this.author))}`,
            ...data
        );
        this.logDump += util.format(
            `[${prefix}][${this.author}]`,
            ...data,
            '\n'
        );
    }
}
