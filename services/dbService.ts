import { MediaItem } from '../types';

const DB_NAME = 'YourImageProDB';
const DB_VERSION = 2; // Upgraded version
const MEDIA_STORE_NAME = 'media';
const LEGACY_STORE_NAME = 'generatedImages';


let db: IDBDatabase;

const initDB = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(true);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject(false);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      
      if (event.oldVersion < 1) {
          if (!dbInstance.objectStoreNames.contains(LEGACY_STORE_NAME)) {
            const store = dbInstance.createObjectStore(LEGACY_STORE_NAME, { keyPath: 'id', autoIncrement: true });
            store.createIndex('userEmail', 'userEmail', { unique: false });
          }
      }
      if (event.oldVersion < 2) {
          if (!dbInstance.objectStoreNames.contains(MEDIA_STORE_NAME)) {
            const store = dbInstance.createObjectStore(MEDIA_STORE_NAME, { keyPath: 'id', autoIncrement: true });
            store.createIndex('userEmail', 'userEmail', { unique: false });
          }
      }
    };
  });
};

export const addMedia = (userEmail: string, type: 'image' | 'video', content: string | Blob): Promise<number> => {
    return new Promise((resolve, reject) => {
        initDB().then(() => {
            const transaction = db.transaction([MEDIA_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(MEDIA_STORE_NAME);
            const request = store.add({ userEmail, type, content, timestamp: new Date().getTime() });

            request.onerror = () => {
                console.error("Add media transaction error:", request.error);
                reject("Failed to save media to the database.");
            };
            
            request.onsuccess = () => {
                resolve(request.result as number);
            };

        }).catch(reject);
    });
};

export const getMediaPaginated = (userEmail: string, page: number, limit: number): Promise<{ media: MediaItem[], hasMore: boolean }> => {
    return new Promise((resolve, reject) => {
        initDB().then(() => {
            const transaction = db.transaction([MEDIA_STORE_NAME], 'readonly');
            const store = transaction.objectStore(MEDIA_STORE_NAME);
            const index = store.index('userEmail');
            
            const results: MediaItem[] = [];
            let hasMore = false;
            let advanced = false;
            const lowerBound = (page - 1) * limit;

            // Open a cursor to iterate over the items in reverse chronological order (newest first)
            const cursorRequest = index.openCursor(IDBKeyRange.only(userEmail), 'prev');
            let count = 0;

            cursorRequest.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (!advanced && lowerBound > 0) {
                    advanced = true;
                    cursor?.advance(lowerBound);
                    return;
                }

                if (cursor) {
                    if (count < limit) {
                        results.push(cursor.value as MediaItem);
                        count++;
                    } else {
                        hasMore = true;
                    }

                    if (count <= limit) {
                      cursor.continue();
                    } else {
                        // Reached limit and found one more, we can stop.
                        resolve({ media: results, hasMore: true });
                    }
                } else {
                    // Cursor is done
                    resolve({ media: results, hasMore });
                }
            };

            cursorRequest.onerror = (event) => {
                console.error("Pagination cursor error:", (event.target as IDBRequest).error);
                reject("Failed to paginate media.");
            };

        }).catch(reject);
    });
};


export const getMediaById = (id: number): Promise<MediaItem | null> => {
    return new Promise((resolve, reject) => {
        initDB().then(() => {
            const transaction = db.transaction([MEDIA_STORE_NAME], 'readonly');
            const store = transaction.objectStore(MEDIA_STORE_NAME);
            const request = store.get(id);

            request.onerror = () => {
                console.error("Get media by ID error:", request.error);
                reject("Failed to load media from the database.");
            };

            request.onsuccess = () => {
                resolve(request.result as MediaItem | null);
            };
        }).catch(reject);
    });
};
