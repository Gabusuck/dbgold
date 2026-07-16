const https = require('https')
const fs = require('fs')
const path = require('path')

function parseEnvFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    return raw.split(/\r?\n/).reduce((acc, line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return acc
      const [key, ...rest] = trimmed.split('=')
      acc[key.trim()] = rest.join('=').trim()
      return acc
    }, {})
  } catch (_err) {
    return {}
  }
}

const env = parseEnvFile(path.join(__dirname, '../.env.local'))
const SUPABASE_URL = (env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yplqgqwqllbpxpbnohwo.supabase.co').replace(/\/$/, '')
const url = `${SUPABASE_URL}/rest/v1/simulations?select=*`
const keys = [
  ['anon', env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
  ['service', env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY],
]

function test(key) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
    }, (res) => {
      let data = ''
      res.on('data', (d) => { data += d })
      res.on('end', () => resolve({ status: res.statusCode, body: data }))
    })
    req.on('error', reject)
    req.end()
  })
}

;(async () => {
  for (const [name, key] of keys) {
    if (!key) {
      console.log(name, 'SKIP - chave não encontrada em .env.local')
      continue
    }

    try {
      const r = await test(key)
      console.log(name, r.status, r.body.slice(0, 200))
    } catch (err) {
      console.error(name, 'ERR', err.message)
    }
  }
})()
