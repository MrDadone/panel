import { pascalCase, snakeCase } from "change-case"
import fs from "fs"
import { oas31 } from "openapi3-ts"
import generateSchemaObject from "@/generate-schema-object"

export function convertType(object: oas31.SchemaObject | oas31.ReferenceObject): string {
    if (object.$ref) {
        return object.$ref.split('/').at(-1)!
    }

    object = object as oas31.SchemaObject

    if (!Array.isArray(object.type)) {
        switch (object.type) {
            case 'boolean': return 'bool'
            case 'integer': {
                switch (object.format ?? 'int64') {
                    case 'int32': return (object.minimum ?? -1) >= 0 ? 'u32' : 'i32'
                    case 'int64': return (object.minimum ?? -1) >= 0 ? 'u64' : 'i64'
                }
            }
            case 'number': return 'f64'
            case 'string': {
                switch (object.format) {
                    case 'uuid': return 'uuid::Uuid'
                    case 'date-time': return 'chrono::DateTime<chrono::Utc>'
                }

                return 'String'
            }
            case 'array': return `Vec<${convertType(object.items!)}>`
        }
    } else {
        return `Option<${convertType({ ...object, type: object.type.find((t) => t !== 'null') })}>`
    }

    return 'serde_json::Value'
}

export default function generateSchemaProperty(output: fs.WriteStream, _spaces: number, parent: string, name: string, object: oas31.SchemaObject | oas31.ReferenceObject) {
    const spaces = ' '.repeat(_spaces)

    output.write(`${spaces}#[schema(inline)]\n`)
    output.write(`${spaces}${name !== snakeCase(name) ? `#[serde(rename = "${name}")] ` : ''}`)
    output.write(`pub ${snakeCase(name)}: `)

    if (object.$ref) {
        output.write(`${object.$ref.split('/').at(-1)},\n`)

        return;
    }

    object = object as oas31.SchemaObject

    if (!object.type && object.oneOf) {
        const schema = object.oneOf.find(((t: oas31.SchemaObject) => t.type !== 'null') as any)!

        output.write('Option<')
        generateSchemaObject(output, _spaces + 4, parent, pascalCase(parent) + pascalCase(name), schema as any, true)
        output.write('>,\n')

        return
    }

    if (!Array.isArray(object.type)) {
        switch (object.type) {
            case 'boolean': return output.write('bool,\n')
            case 'integer': return output.write(`${convertType(object)},\n`)
            case 'number': return output.write('f64,\n')
            case 'string': return output.write(`${convertType(object)},\n`)
            case 'object': return generateSchemaObject(output, _spaces + 4, parent, pascalCase(parent) + pascalCase(name), object)
            case 'array': return output.write(`Vec<${convertType(object.items!)}>,\n`)
        }
    } else {
        return output.write(`Option<${convertType({ ...object, type: object.type.find((t) => t !== 'null')! })}>,\n`)
    }

    output.write('serde_json::Value,\n')
}
