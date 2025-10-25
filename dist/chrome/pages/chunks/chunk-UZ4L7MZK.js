import {
  parseJson
} from "./chunk-6EVUB3DE.js";

// src/api/getSmiles.ts
var getSmiles = /* @__PURE__ */ (() => {
  let cachedSmiles = null;
  let isLoading = false;
  let loadPromise = null;
  return async () => {
    if (cachedSmiles) return cachedSmiles;
    if (isLoading && loadPromise) return loadPromise;
    isLoading = true;
    loadPromise = (async () => {
      try {
        const response = await parseJson("/replies/get_smiles", {});
        cachedSmiles = {
          categories: response.smiles.categories ?? [],
          smiles: Object.values(response.smiles.smiles).flat()
        };
        return cachedSmiles;
      } finally {
        isLoading = false;
        loadPromise = null;
      }
    })();
    return loadPromise;
  };
})();

export {
  getSmiles
};
//# sourceMappingURL=chunk-UZ4L7MZK.js.map
