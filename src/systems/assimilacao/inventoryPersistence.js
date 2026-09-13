import { itemCatalogById } from "./inventoryCatalog";
import { createInventoryItemInstance } from "../../core/campaigns/campaignLocalDraftService";

const INVENTORY_STORAGE_KEY = "assimilation-inventory";

export function persistStartingEquipment(characterId, itemIds = []) {
  if (!characterId || typeof window === "undefined") return;
  const items = itemIds.map((itemId, index) => {
    const item = itemCatalogById[itemId];
    if (!item) return null;
    return {
      ...createInventoryItemInstance(item, {
        characterId,
        location: index < 3 ? "body" : "backpack",
        id: `inventory-${Date.now()}-${index}`,
      }),
      kind: index < 3 ? "Corpo" : "Mochila",
    };
  }).filter(Boolean);
  try {
    window.localStorage.setItem(`${INVENTORY_STORAGE_KEY}:${characterId}`, JSON.stringify(items));
  } catch {
    // O armazenamento local é opcional durante a criação da ficha.
  }
}

