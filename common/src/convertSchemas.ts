import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import assert from 'assert';

// Directories
const yamlDir = path.join(__dirname, '..', 'schemas', 'yaml');
const tsDir = path.join(__dirname, '..', 'schemas', 'ts');


// Ensure the output directory exists
if (!fs.existsSync(tsDir)) {
    fs.mkdirSync(tsDir);
}

function yamlToTsType(yamlType: string): string {
    switch (yamlType) {
        case 'string':
            return 'string';
        case 'integer':
            return 'number';
        default:
            return yamlType;
    }
}

// Hacky function to convert YAML to TypeScript
const yamlToTs = (yamlContent: any, title: string | undefined): string => {
    let capitalTitle = undefined;
    if (title) {
        capitalTitle = (title as string).charAt(0).toUpperCase() + (title as string).slice(1);
    }

    let tsContent = 'export interface ' + (yamlContent.title || (capitalTitle ?? 'GeneratedInterface')) + ' {\n';
    const properties = yamlContent.properties || {};
    const required = new Set(yamlContent.required || []);

    interface typedProperty {
        type: string,
        items?: {
            type: string;
            properties?: Record<string, any>;
        }
    }

    for (const [key, _value] of Object.entries(properties)) {
        const optionalFlag = required.has(key) ? '' : '?';

        if (!_value) {
            continue;
        }

        const value = _value as typedProperty;

        switch ((value as typedProperty).type) {
            case 'string':
                tsContent += `    ${key}${optionalFlag}: string;\n`;
                break;
            case 'integer':
                tsContent += `    ${key}${optionalFlag}: number;\n`;
                break;
            case 'array':
                assert(value.items, 'Array type must have items')
                if (value.items.type === 'object') {
                    tsContent += `    ${key}${optionalFlag}: {\n`;
                    for (const [itemKey, itemValue] of Object.entries(value.items.properties || {})) {
                        tsContent += `        ${itemKey}: ${itemValue.type};\n`;
                    }
                    tsContent += '  }[];\n';
                } else {
                    tsContent += `    ${key}${optionalFlag}: ${yamlToTsType(value.items.type)}[];\n`;
                }
                break;
            case 'object':
                tsContent += `    ${key}${optionalFlag}: { [key: string]: any };\n`;
                break;
            default:
                tsContent += `    ${key}${optionalFlag}: any;\n`;
                break;
        }
    }

    tsContent += '}\n';
    return tsContent;
};

// Read all files in the yaml directory
fs.readdir(yamlDir, (err, files) => {
    /**
     * IMPORTANT NOTE:
     * 
     * The good quicktype script doesn't currently work as there is no easy existing tool to convert YAML specs to TypeScript.
     * 
     * One solution in the future is to go YAML -> RAML -> JSON -> TypeScript.
     * 
     * Currently trying hacky solution (need to manually verify)
     */
    if (err) {
        console.error(`Unable to read directory: ${err}`);
        process.exit(1);
    }

    // Filter YAML files
    const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

    // Convert each YAML file
    yamlFiles.forEach(file => {
        const inputPath = path.join(yamlDir, file);
        const fileName = path.basename(file).replace(/\.(yaml|yml)$/, '');
        const outputPath = path.join(tsDir, file.replace(/\.(yaml|yml)$/, '.ts'));

        // Convert YAML to JSON
        const fileContent = fs.readFileSync(inputPath, 'utf8');
        const yamlContent = yaml.parse(fileContent);

        // Generate TypeScript interface
        const tsContent = yamlToTs(yamlContent, fileName);

        // Write TypeScript content to file
        fs.writeFileSync(outputPath, tsContent, 'utf8');
        console.log(`Converted ${file} to ${outputPath}`);
    });
});