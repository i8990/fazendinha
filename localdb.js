// ═══ LOCALDB — IndexedDB local para cache offline ═════════════════
import { openDB } from 'idb'

const DB_NAME    = 'fazendinha-local'
const DB_VERSION = 1
const STORES     = ['pastos','animais','fin','movs','sal','manejos','adubacoes','cfg']

let dbPromise = null

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        STORES.forEach(name => {
          if (!db.objectStoreNames.contains(name))
            db.createObjectStore(name)
        })
      }
    })
  }
  return dbPromise
}

export const localGet = async (store) => {
  try {
    const db = await getDB()
    return await db.get(store, 'data') ?? null
  } catch(e) {
    console.warn('localGet erro:', e)
    return null
  }
}

export const localSet = async (store, value) => {
  try {
    const db = await getDB()
    await db.put(store, value, 'data')
  } catch(e) {
    console.warn('localSet erro:', e)
  }
}

export const localClear = async () => {
  try {
    const db = await getDB()
    await Promise.all(STORES.map(s => db.clear(s)))
  } catch(e) {
    console.warn('localClear erro:', e)
  }
}
