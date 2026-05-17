// ═══ LOCALDB — IndexedDB local ════════════════════════════════════
import { openDB } from 'idb'

const DB_NAME    = 'fazendinha-local'
const DB_VERSION = 1
const STORES     = ['pastos','animais','fin','movs','sal','manejos','adubacoes','cfg','meta']

let _db = null
const getDB = async () => {
  if (!_db) {
    _db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        STORES.forEach(s => { if (!db.objectStoreNames.contains(s)) db.createObjectStore(s) })
      }
    })
  }
  return _db
}

export const localGet    = async (store, key = 'data') => { try { return (await getDB()).get(store, key) ?? null } catch { return null } }
export const localSet    = async (store, value, key = 'data') => { try { await (await getDB()).put(store, value, key) } catch {} }
export const localClear  = async () => { try { const db = await getDB(); await Promise.all(STORES.map(s => db.clear(s))) } catch {} }
