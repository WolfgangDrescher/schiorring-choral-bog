import fs from 'node:fs';
import { execSync } from 'node:child_process';

export function tokenIsDataRecord(line, includeNullToken = false) {
    return !line.startsWith('!') && !line.startsWith('*') && !line.startsWith('=') && !(!includeNullToken && line === '.');
}

const files = fs.readdirSync('./kern');
files.forEach((file) => {
    const kern = execSync(`cat ./kern/${file}`).toString().trim();
    const lines = kern.split('\n');
    let outputLines = lines;
    let hasMeasureNumberBeforeFirstDataToken = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!hasMeasureNumberBeforeFirstDataToken && tokenIsDataRecord(line)) {
            const numberOfSpines = line.split('\t').length;
            outputLines = [
                ...lines.slice(0, i),
                Array.from(Array(numberOfSpines).keys()).map(() => '=0').join('\t'),
                ...lines.slice(i)
            ]
        }
        if (line.match(/^=[^=]/)) {
            hasMeasureNumberBeforeFirstDataToken = true;
            const tokens = line.split('\t');
        }
    }
    let measureNumber = 1;
    for (let i = 0; i < outputLines.length; i++) {
        const line = outputLines[i];
        if (line.match(/^=[^=]/)) {
            hasMeasureNumberBeforeFirstDataToken = true;
            const tokens = line.split('\t');
            for (let j = 0; j < tokens.length; j++) {
                tokens[j] = tokens[j].replaceAll(/^(=\D*)(\d*)(\D*)/g, `$1${measureNumber}$3`);
            }
            outputLines[i] = tokens.join('\t');
            measureNumber++;
        }
    }
    fs.writeFileSync(`./kern/${file}`, outputLines.join('\n'), 'utf8');
});