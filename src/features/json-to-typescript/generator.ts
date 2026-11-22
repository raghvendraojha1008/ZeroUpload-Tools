export type GeneratorTarget = 'interfaces' | 'types' | 'zod'

export interface GeneratorOptions {
  target: GeneratorTarget
  rootName: string
  exportTypes: boolean
  readonlyFields: boolean
  optionalNulls: boolean
}

interface TypeNode {
  type: string
  subNodes?: Record<string, { node: TypeNode; optional: boolean }>
  arrayElement?: TypeNode
}

function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function sanitizeIdentifier(name: string): string {
  // If valid JS identifier, leave as is, otherwise quote it
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
    return name
  }
  return JSON.stringify(name)
}

function inferType(value: unknown, fieldName: string, subTypes: Map<string, TypeNode>): TypeNode {
  if (value === null) {
    return { type: 'null' }
  }
  if (value === undefined) {
    return { type: 'undefined' }
  }

  const t = typeof value
  if (t === 'string' || t === 'number' || t === 'boolean') {
    return { type: t }
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'array', arrayElement: { type: 'any' } }
    }
    // Merge array elements
    let mergedElement: TypeNode = { type: 'any' }
    const objectElements = value.filter((item) => item !== null && typeof item === 'object' && !Array.isArray(item))

    if (objectElements.length > 0) {
      const mergedFields: Record<string, { node: TypeNode; optional: boolean }> = {}
      const keyCounts: Record<string, number> = {}

      for (const obj of objectElements) {
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
          keyCounts[k] = (keyCounts[k] || 0) + 1
          const node = inferType(v, k, subTypes)
          if (!mergedFields[k]) {
            mergedFields[k] = { node, optional: false }
          }
        }
      }

      for (const [k, count] of Object.entries(keyCounts)) {
        if (count < objectElements.length) {
          mergedFields[k].optional = true
        }
      }

      const typeName = capitalize(fieldName.replace(/s$/, '')) || 'Item'
      subTypes.set(typeName, { type: 'object', subNodes: mergedFields })
      mergedElement = { type: typeName }
    } else {
      // Primitive array
      const types = [...new Set(value.map((v) => typeof v))]
      mergedElement = { type: types.length === 1 ? types[0] : types.join(' | ') }
    }

    return { type: 'array', arrayElement: mergedElement }
  }

  if (t === 'object') {
    const fields: Record<string, { node: TypeNode; optional: boolean }> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const node = inferType(v, k, subTypes)
      fields[k] = { node, optional: false }
    }
    const typeName = capitalize(fieldName) || 'SubItem'
    subTypes.set(typeName, { type: 'object', subNodes: fields })
    return { type: typeName }
  }

  return { type: 'unknown' }
}

export function jsonToCode(rawJson: string, options: GeneratorOptions): string {
  if (!rawJson.trim()) return ''

  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Invalid JSON: ${msg}`)
  }

  const rootName = capitalize(options.rootName.trim()) || 'Root'
  const subTypes = new Map<string, TypeNode>()
  const rootNode = inferType(parsed, rootName, subTypes)

  if (options.target === 'zod') {
    return generateZodCode(rootName, rootNode, subTypes, options)
  }

  return generateTypeScriptCode(rootName, rootNode, subTypes, options)
}

function generateTypeScriptCode(
  rootName: string,
  rootNode: TypeNode,
  subTypes: Map<string, TypeNode>,
  options: GeneratorOptions
): string {
  const lines: string[] = []
  const exp = options.exportTypes ? 'export ' : ''
  const ro = options.readonlyFields ? 'readonly ' : ''

  // Format helper for a struct
  const printStruct = (name: string, fields: Record<string, { node: TypeNode; optional: boolean }>) => {
    if (options.target === 'interfaces') {
      lines.push(`${exp}interface ${name} {`)
    } else {
      lines.push(`${exp}type ${name} = {`)
    }

    for (const [key, { node, optional }] of Object.entries(fields)) {
      const isOpt = optional || (options.optionalNulls && node.type === 'null')
      const optMarker = isOpt ? '?' : ''
      const ident = sanitizeIdentifier(key)
      let typeStr = node.type

      if (node.type === 'null') {
        typeStr = 'any'
      } else if (node.type === 'array' && node.arrayElement) {
        typeStr = `${node.arrayElement.type}[]`
      }

      lines.push(`  ${ro}${ident}${optMarker}: ${typeStr};`)
    }

    lines.push(options.target === 'interfaces' ? '}\n' : '};\n')
  }

  // Print all sub-types first
  for (const [name, node] of subTypes.entries()) {
    if (name === rootName) continue
    if (node.subNodes) {
      printStruct(name, node.subNodes)
    }
  }

  // Print root
  if (rootNode.type === rootName && subTypes.has(rootName)) {
    const rootSub = subTypes.get(rootName)
    if (rootSub?.subNodes) {
      printStruct(rootName, rootSub.subNodes)
    }
  } else if (rootNode.type === 'array' && rootNode.arrayElement) {
    lines.push(`${exp}type ${rootName} = ${rootNode.arrayElement.type}[];\n`)
  } else {
    lines.push(`${exp}type ${rootName} = ${rootNode.type};\n`)
  }

  return lines.join('\n').trim()
}

function generateZodCode(
  rootName: string,
  rootNode: TypeNode,
  subTypes: Map<string, TypeNode>,
  options: GeneratorOptions
): string {
  const lines: string[] = ["import { z } from 'zod';\n"]
  const exp = options.exportTypes ? 'export ' : ''

  const printZodObject = (name: string, fields: Record<string, { node: TypeNode; optional: boolean }>) => {
    lines.push(`${exp}const ${name}Schema = z.object({`)
    for (const [key, { node, optional }] of Object.entries(fields)) {
      const isOpt = optional || (options.optionalNulls && node.type === 'null')
      const ident = sanitizeIdentifier(key)
      let zodType = 'z.unknown()'

      if (node.type === 'string') zodType = 'z.string()'
      else if (node.type === 'number') zodType = 'z.number()'
      else if (node.type === 'boolean') zodType = 'z.boolean()'
      else if (node.type === 'null') zodType = 'z.null()'
      else if (node.type === 'array' && node.arrayElement) {
        const inner = node.arrayElement.type === 'string'
          ? 'z.string()'
          : node.arrayElement.type === 'number'
          ? 'z.number()'
          : subTypes.has(node.arrayElement.type)
          ? `${node.arrayElement.type}Schema`
          : 'z.any()'
        zodType = `z.array(${inner})`
      } else if (subTypes.has(node.type)) {
        zodType = `${node.type}Schema`
      }

      if (isOpt) {
        zodType += '.optional()'
      }

      lines.push(`  ${ident}: ${zodType},`)
    }
    lines.push(`});\n`)
    lines.push(`${exp}type ${name} = z.infer<typeof ${name}Schema>;\n`)
  }

  for (const [name, node] of subTypes.entries()) {
    if (name === rootName) continue
    if (node.subNodes) {
      printZodObject(name, node.subNodes)
    }
  }

  if (rootNode.type === rootName && subTypes.has(rootName)) {
    const rootSub = subTypes.get(rootName)
    if (rootSub?.subNodes) {
      printZodObject(rootName, rootSub.subNodes)
    }
  } else if (rootNode.type === 'array' && rootNode.arrayElement) {
    const inner = subTypes.has(rootNode.arrayElement.type)
      ? `${rootNode.arrayElement.type}Schema`
      : 'z.any()'
    lines.push(`${exp}const ${rootName}Schema = z.array(${inner});`)
    lines.push(`${exp}type ${rootName} = z.infer<typeof ${rootName}Schema>;\n`)
  }

  return lines.join('\n').trim()
}
