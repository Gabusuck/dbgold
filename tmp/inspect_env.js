const fs = require('fs')
const path = '.env.local'
const content = fs.readFileSync(path, 'utf8')
console.log('CONTENT:')
console.log(content)
console.log('--- LINES ---')
const lines = content.split(/\r?\n/)
lines.forEach((line, idx) => {
  console.log(idx + 1, JSON.stringify(line), line.length)
})
console.log('--- CHARS OF SERVICE KEY LINE ---')
const serviceLine = lines.find((l) => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))
if (!serviceLine) { process.exit(1) }
const key = serviceLine.split('=')[1]
console.log('KEY-LENGTH', key.length)
console.log(key)
console.log('HEX INDICES > 127:')
for (let i = 0; i < key.length; i++) {
  const code = key.charCodeAt(i)
  if (code > 127) console.log(i, code, key[i])
}
