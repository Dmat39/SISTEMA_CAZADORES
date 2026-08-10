// Mapeo de jurisdicción (nombre en el geojson de San Juan de Lurigancho) -> nivel de zona
const JURISDICTION_ZONE_TIER: Record<string, 'baja' | 'media' | 'alta'> = {
  'caja de agua': 'baja',
  'zarate': 'baja',
  'huayrona': 'baja',
  'canto rey': 'media',
  'santa elizabeth': 'media',
  'mariscal caceres': 'alta',
  '10 de octubre': 'alta',
  'bayovar': 'alta',
};

export const getZoneTierForJurisdiction = (jurisdictionName?: string | null) => {
  if (!jurisdictionName) return null;
  return JURISDICTION_ZONE_TIER[jurisdictionName.trim().toLowerCase()] ?? null;
};

// Empareja el nivel de zona ('baja'|'media'|'alta') con el registro real de zona del backend (id, name)
export const findZoneByTier = (zoneOptions: Array<{ id: string; name: string }>, tier: string | null) => {
  if (!tier) return null;
  return zoneOptions.find((z) => z.name?.toLowerCase().includes(tier)) ?? null;
};
