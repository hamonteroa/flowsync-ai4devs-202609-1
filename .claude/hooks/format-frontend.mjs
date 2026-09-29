// Hook PostToolUse (Write|Edit): formatea con Prettier el archivo editado si está dentro de frontend/.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

let input = ''
for await (const chunk of process.stdin) input += chunk

const { tool_input: toolInput = {}, tool_response: toolResponse = {} } = JSON.parse(input || '{}')
const filePath = toolResponse.filePath ?? toolInput.file_path
if (!filePath) process.exit(0)

const frontendDir = path.resolve(import.meta.dirname, '..', '..', 'frontend')
const target = path.resolve(filePath)
const rel = path.relative(frontendDir, target)
if (rel.startsWith('..') || path.isAbsolute(rel) || !existsSync(target)) process.exit(0)

const prettierBin = path.join(frontendDir, 'node_modules', 'prettier', 'bin', 'prettier.cjs')
if (!existsSync(prettierBin)) process.exit(0)

try {
  execFileSync(process.execPath, [prettierBin, '--write', '--ignore-unknown', '--log-level', 'warn', target], {
    cwd: frontendDir,
    stdio: ['ignore', 'ignore', 'pipe'],
  })
} catch (error) {
  process.stderr.write(`Prettier no pudo formatear ${rel}: ${error.stderr ?? error.message}\n`)
}
