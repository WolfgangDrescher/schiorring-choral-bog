import fs from 'node:fs';
import { execSync } from 'node:child_process';

const readme = fs.readFileSync('README.md', 'utf8');
const choralesTitleIndex = readme.indexOf('## Chorales')
const start = choralesTitleIndex == -1 ? readme.trim() : readme.substring(0, choralesTitleIndex).trim();

function parseHumdrumReferenceRecords(humdrum) {
    let lines = humdrum.split(/\r?\n/);
    let output = {};
    for (let i = 0; i < lines.length; i++) {
        const matches = lines[i].match(/^!!!\s*([^:]+)\s*:\s*(.*)\s*$/);
        if (matches) {
            const existingValue = output[matches[1]];
            if (Array.isArray(existingValue)) {
                output[matches[1]].push(matches[2])
            } else if (!Array.isArray(existingValue) && typeof existingValue !== 'undefined') {
                output[matches[1]] = [existingValue, matches[2]]
            } else {
                output[matches[1]] = matches[2];
            }
        }
    }
    return output;
}

function arrayToTable(data, columns, alignment = 'center') {
    let table = '';
    const separator = {
        left: ':---',
        right: '---:',
        center: '---'
    };
    
    const cols = columns ? columns.split(','): Object.keys(data[0]);

    table += cols.join(' | ');
    table += '\n';

    table += cols.map(() => {
        return separator[alignment] || separator.center;
    }).join(' | ');
    table += "\n";

    data.forEach((item) => {
        table += cols.map((key) => {
            return String(item[key] || '');
        }).join(' | ') + '\n';
    });

    return table;
}

const data = [];

const files = fs.readdirSync('./kern');
files.forEach((file) => {
    const path = `./kern/${file}`;
    const kern = execSync(`cat ${path}`).toString().trim();
    const refs = parseHumdrumReferenceRecords(kern);
    data.push({
        'No.': refs['ONM'],
        'Title': `[${refs['OTL@@DA']}](https://github.com/WolfgangDrescher/schiorring-choral-bog/blob/master/kern/${file})`,
        'VHV': `[open](https://verovio.humdrum.org/?file=${encodeURIComponent(`https://raw.githubusercontent.com/WolfgangDrescher/schiorring-choral-bog/master/kern/${file}`)})`
    });
});

const fileContent = `${start}


## Chorales

${arrayToTable(data)}
`;

fs.writeFileSync(`README.md`, fileContent, 'utf8');

execSync('npx --yes markdown-table-prettify < README.md > _README.md && mv _README.md README.md');
