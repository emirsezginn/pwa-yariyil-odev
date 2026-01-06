// /js/api.js
const API_BASE = 'https://pokeapi.co/api/v2';
const CACHE_DURATION = 5 * 60 * 1000; // 5 dk

class PokeAPI {
  constructor() {
    this.cache = new Map();
  }

  isCacheValid(key) {
    if (!this.cache.has(key)) return false;
    const { timestamp } = this.cache.get(key);
    return Date.now() - timestamp < CACHE_DURATION;
  }

  async getCached(key, fetchFn) {
    if (this.isCacheValid(key)) return this.cache.get(key).data;
    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  // Basit concurrency limiter (API'yi boğmamak için)
  async mapWithConcurrency(items, limit, mapper) {
    const results = [];
    let i = 0;

    const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
      while (i < items.length) {
        const idx = i++;
        try {
          results[idx] = await mapper(items[idx], idx);
        } catch (e) {
          results[idx] = null;
        }
      }
    });

    await Promise.all(workers);
    return results.filter(Boolean);
  }

  // API kullanım #1: liste (limit/offset parametreli)
  async getPokemonList(limit = 20, offset = 0) {
    const key = `list-${limit}-${offset}`;
    return this.getCached(key, async () => {
      const res = await fetch(`${API_BASE}/pokemon?limit=${limit}&offset=${offset}`, { cache: "no-store" });
      if (!res.ok) throw new Error('Pokemon list fetch failed');
      const data = await res.json();

      // Her pokemon için detay fetch (ama concurrency ile)
      const detailed = await this.mapWithConcurrency(
        data.results,
        8,
        (p) => this.getPokemonByName(p.name)
      );

      return { count: data.count, results: detailed };
    });
  }

  // API kullanım #2: tekli pokemon
  async getPokemonByName(nameOrId) {
    const key = `pokemon-${nameOrId}`;
    return this.getCached(key, async () => {
      const res = await fetch(`${API_BASE}/pokemon/${nameOrId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Pokemon fetch failed: ${nameOrId}`);
      const data = await res.json();

      const speciesData = await this.getPokemonSpecies(data.species.url);

      const mappedStats = data.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat
      }));

      return {
        id: data.id,
        name: data.name,
        image: data.sprites?.other?.['official-artwork']?.front_default || data.sprites?.front_default,
        types: data.types.map(t => t.type.name),
        stats: mappedStats,
        height: data.height,
        weight: data.weight,
        abilities: data.abilities.map(a => a.ability.name),
        description: speciesData.description,
        rarity: speciesData.rarity,
        // ✅ FIX: calculatePrice artık base_stat üzerinden doğru hesaplar
        price: this.calculatePrice(data.id, data.stats, speciesData.rarity)
      };
    });
  }

  async getPokemonSpecies(url) {
    const key = `species-${url}`;
    return this.getCached(key, async () => {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error('Species fetch failed');
      const data = await res.json();

      const flavor = data.flavor_text_entries?.find(e => e.language.name === 'en');
      const desc = flavor?.flavor_text
        ? flavor.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ')
        : 'Bu ürün için açıklama bulunamadı.';

      const rarity = data.is_legendary ? 'Legendary' : data.is_mythical ? 'Mythical' : 'Common';

      return { description: desc, rarity };
    });
  }

  // Tekli arama (endpoint #2)
  async searchPokemon(query) {
    try {
      const p = await this.getPokemonByName(query.toLowerCase());
      return [p];
    } catch {
      return [];
    }
  }

  // ✅ Fiyat: base_stat + rarity çarpanı + id etkisi
  calculatePrice(id, rawStats, rarity) {
    const basePrice = 75;

    const statTotal = (rawStats || []).reduce((sum, s) => sum + (s.base_stat || 0), 0);
    let rarityMult = 1.0;
    if (rarity === "Legendary") rarityMult = 1.35;
    if (rarity === "Mythical") rarityMult = 1.25;

    const price = (basePrice + (statTotal / 8) + (id * 1.8)) * rarityMult;
    return Math.round(price);
  }

  // Plan B: sample.json
  async loadFallbackData() {
    try {
      const res = await fetch('/data/sample.json', { cache: "no-store" });
      if (!res.ok) throw new Error('Fallback not available');
      return await res.json();
    } catch (e) {
      console.error('Fallback load failed:', e);
      return null;
    }
  }
}

const pokeAPI = new PokeAPI();
