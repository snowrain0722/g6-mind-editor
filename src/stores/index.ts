import initEditorStore from './editor';

export function initStore() {
  const initEditorStores = initEditorStore();
  return {
    ...initEditorStores
  }
}

export const stores = initStore();