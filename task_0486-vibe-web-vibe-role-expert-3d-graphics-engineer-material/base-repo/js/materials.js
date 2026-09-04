// ═══════════════════════════════════════════════════
// MATERIAL DATABASE
// ═══════════════════════════════════════════════════
import { genOakTextures, genSlateTextures, genMarbleTextures, genCarpetTextures, genConcreteTextures, genBambooTextures, genCorkTextures, genCeramicTextures, genWalnutTextures, genTerrazzoTextures } from './textures.js';

export const flooringData = [
  { id:'oak',      name:'Brushed Oak',        roughness:6, durability:7, warmth:8, maintenance:4, color:'#a0764a',
    description:'Natural grain with a hand-brushed finish that reveals the wood\'s organic character.',
    texGen: genOakTextures },
  { id:'slate',    name:'Slate Tile',          roughness:8, durability:9, warmth:2, maintenance:3, color:'#5a6670',
    description:'Split-face slate with deep texture and exceptional durability for high-traffic areas.',
    texGen: genSlateTextures },
  { id:'marble',   name:'Polished Marble',     roughness:2, durability:6, warmth:3, maintenance:8, color:'#e0d8d0',
    description:'Carrara-inspired marble with a mirror-like polish and delicate gray veining.',
    texGen: genMarbleTextures },
  { id:'carpet',   name:'Woven Carpet',        roughness:4, durability:4, warmth:9, maintenance:7, color:'#8b6b5a',
    description:'Hand-tufted wool blend with a tight basketweave pattern for underfoot comfort.',
    texGen: genCarpetTextures },
  { id:'concrete', name:'Brushed Concrete',    roughness:7, durability:9, warmth:1, maintenance:2, color:'#9a9590',
    description:'Micro-textured concrete with a matte finish and industrial elegance.',
    texGen: genConcreteTextures },
  { id:'bamboo',   name:'Strand Bamboo',       roughness:5, durability:6, warmth:7, maintenance:5, color:'#c4a860',
    description:'Carbonized strand-woven bamboo with a rich golden tone and tight fiber structure.',
    texGen: genBambooTextures },
  { id:'cork',     name:'Natural Cork',         roughness:5, durability:3, warmth:9, maintenance:6, color:'#b08860',
    description:'Harvested cork oak bark with natural cellular texture and acoustic dampening.',
    texGen: genCorkTextures },
  { id:'ceramic',  name:'Ceramic Tile',         roughness:4, durability:8, warmth:2, maintenance:4, color:'#d4c8b8',
    description:'Glazed ceramic with subtle crackle finish reminiscent of artisan kilns.',
    texGen: genCeramicTextures },
  { id:'walnut',   name:'Herringbone Walnut',   roughness:5, durability:6, warmth:8, maintenance:5, color:'#6b4530',
    description:'American black walnut arranged in a classic herringbone parquet pattern.',
    texGen: genWalnutTextures },
  { id:'terrazzo', name:'Terrazzo',             roughness:6, durability:8, warmth:4, maintenance:3, color:'#c8beb4',
    description:'Venetian-style terrazzo with embedded marble and granite chips in a cement matrix.',
    texGen: genTerrazzoTextures },
];

export const AXIS_META = {
  roughness:   { label:'Tactile Roughness', shortLabel:'Roughness' },
  durability:  { label:'Durability Index',  shortLabel:'Durability' },
  warmth:      { label:'Thermal Warmth',    shortLabel:'Warmth' },
  maintenance: { label:'Maintenance Effort', shortLabel:'Maintenance' },
};
