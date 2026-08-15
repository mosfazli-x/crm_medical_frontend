import { pipeline } from '@huggingface/transformers'
import { readFileSync } from 'node:fs'

const manifest = JSON.parse(readFileSync('C:\\Users\\Cursed Saint\\AppData\\Local\\Temp\\opencode\\ocr-bench\\real-manifest.json', 'utf8').replace(/^\uFEFF/, ''))
const dir = 'C:\\Users\\Cursed Saint\\AppData\\Local\\Temp\\opencode\\ocr-bench'

const modelId = process.env.MODEL_ID
const dtype = process.env.DTYPE || 'q8'
const numBeams = parseInt(process.env.NUM_BEAMS || '1', 10)
const maxTokens = parseInt(process.env.MAX_TOKENS || '64', 10)

function norm(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
}

function wordScore(pred, gt) {
  const p = norm(pred).split(' ').filter(Boolean)
  const g = norm(gt).split(' ').filter(Boolean)
  if (p.length === 0 || g.length === 0) return 0
  let hit = 0
  const used = new Array(g.length).fill(false)
  for (const pw of p) {
    for (let i = 0; i < g.length; i++) {
      if (!used[i] && g[i] === pw) { hit++; used[i] = true; break }
    }
  }
  return hit / g.length
}

function charScore(pred, gt) {
  const p = norm(pred).replace(/ /g, '')
  const g = norm(gt).replace(/ /g, '')
  if (!g.length) return 0
  let hit = 0
  const used = new Array(g.length).fill(false)
  for (const pc of p) {
    for (let i = 0; i < g.length; i++) {
      if (!used[i] && g[i] === pc) { hit++; used[i] = true; break }
    }
  }
  return hit / g.length
}

const gen = { max_new_tokens: maxTokens }
if (numBeams > 1) { gen.num_beams = numBeams; gen.early_stopping = true }

const t0 = Date.now()
const classifier = await pipeline('image-to-text', modelId, { dtype })
const loadMs = Date.now() - t0

const rows = []
for (const s of manifest) {
  const path = `${dir}\\${s.id}`
  const t1 = Date.now()
  const out = await classifier(path, gen)
  const ms = Date.now() - t1
  const text = out[0].generated_text
  rows.push({ id: s.id, pred: text, gt: s.gt, ws: wordScore(text, s.gt), cs: charScore(text, s.gt), ms })
}

const avgWs = rows.reduce((a, r) => a + r.ws, 0) / rows.length
const avgCs = rows.reduce((a, r) => a + r.cs, 0) / rows.length
const exact = rows.filter(r => norm(r.pred) === norm(r.gt)).length

console.log(`=== ${modelId} dtype=${dtype} beams=${numBeams} max_tokens=${maxTokens} ===`)
console.log(`load_ms=${loadMs}  avg_word_acc=${(avgWs * 100).toFixed(1)}%  avg_char_acc=${(avgCs * 100).toFixed(1)}%  exact_match=${exact}/${rows.length}`)
for (const r of rows) {
  console.log(`  [${r.id}] ws=${(r.ws * 100).toFixed(0).padStart(3)}% ${r.ms}ms  pred="${r.pred}"  gt="${r.gt}"`)
}
