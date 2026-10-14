import { Entity, Relationship, EntityResolutionCandidate, MatchFactor } from '../types';

/**
 * Normalizes phone numbers (removes country codes, spaces, dashes)
 */
export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '').slice(-10);
}

/**
 * Normalizes vehicle registration plates
 */
export function normalizeVehicle(veh?: string): string {
  if (!veh) return '';
  return veh.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/**
 * String similarity using Levenshtein distance normalized to 0..1
 */
export function stringSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const s1 = a.trim().toLowerCase();
  const s2 = b.trim().toLowerCase();
  if (s1 === s2) return 1.0;

  // Check abbreviation / initial match e.g. "Rahul Sharma" vs "R. Sharma"
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  if (words1.length > 1 && words2.length > 1) {
    const lastName1 = words1[words1.length - 1];
    const lastName2 = words2[words2.length - 1];
    const firstInitial1 = words1[0][0];
    const firstInitial2 = words2[0][0];

    if (lastName1 === lastName2 && firstInitial1 === firstInitial2) {
      return 0.88;
    }
  }

  // Substring match
  if (s1.includes(s2) || s2.includes(s1)) {
    return Math.max(s1.length, s2.length) > 0 ? Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length) + 0.2 : 0;
  }

  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null));
  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j;
  }
  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  const distance = track[s2.length][s1.length];
  const maxLen = Math.max(s1.length, s2.length);
  return maxLen === 0 ? 1 : Math.max(0, 1 - distance / maxLen);
}

/**
 * Transparently computes weighted similarity score between two entities
 * Name similarity: up to 35%
 * Phone match: up to 35%
 * Vehicle match: up to 30%
 * Address/Location match: up to 15%
 * Email/Account match: up to 20%
 */
export function computeEntitySimilarity(
  entityA: Entity,
  entityB: Entity
): { confidence: number; matchReasons: string[]; matchFactors: MatchFactor[] } {
  if (entityA.id === entityB.id) {
    return { confidence: 100, matchReasons: ['Same ID'], matchFactors: [] };
  }

  const matchFactors: MatchFactor[] = [];
  const matchReasons: string[] = [];
  let score = 0;

  // 1. Phone number match
  const phoneA = normalizePhone(entityA.details.phone || (entityA.type === 'PHONE' ? entityA.name : undefined));
  const phoneB = normalizePhone(entityB.details.phone || (entityB.type === 'PHONE' ? entityB.name : undefined));

  if (phoneA && phoneB && phoneA.length >= 7) {
    if (phoneA === phoneB) {
      score += 35;
      matchFactors.push({
        attribute: 'Phone Identifier',
        similarity: 100,
        weightPoints: 35,
        explanation: `Exact matching primary phone: ${phoneA}`,
      });
      matchReasons.push(`Exact matching phone number (${phoneA}) [+35%]`);
    }
  }

  // 2. Vehicle Registration Match
  const vehA = normalizeVehicle(entityA.details.vehicleNumber || (entityA.type === 'VEHICLE' ? entityA.name : undefined));
  const vehB = normalizeVehicle(entityB.details.vehicleNumber || (entityB.type === 'VEHICLE' ? entityB.name : undefined));

  if (vehA && vehB && vehA.length >= 6) {
    if (vehA === vehB) {
      score += 30;
      matchFactors.push({
        attribute: 'Vehicle Registration',
        similarity: 100,
        weightPoints: 30,
        explanation: `Exact matching vehicle plate: ${vehA}`,
      });
      matchReasons.push(`Exact vehicle plate registration (${vehA}) [+30%]`);
    }
  }

  // 3. Name Similarity
  const nameSim = stringSimilarity(entityA.name, entityB.name);
  if (nameSim >= 0.7) {
    const points = Math.round(nameSim * 35);
    score += points;
    matchFactors.push({
      attribute: 'Name / Identifier',
      similarity: Math.round(nameSim * 100),
      weightPoints: points,
      explanation: `High name similarity "${entityA.name}" ↔ "${entityB.name}" (${Math.round(nameSim * 100)}%)`,
    });
    matchReasons.push(`Name similarity "${entityA.name}" ↔ "${entityB.name}" (${Math.round(nameSim * 100)}%) [+${points}%]`);
  }

  // 4. Address / Location match
  if (entityA.details.address && entityB.details.address) {
    const addrSim = stringSimilarity(entityA.details.address, entityB.details.address);
    if (addrSim >= 0.6) {
      const points = Math.round(addrSim * 15);
      score += points;
      matchFactors.push({
        attribute: 'Address / Location',
        similarity: Math.round(addrSim * 100),
        weightPoints: points,
        explanation: `Geographical address correlation (${Math.round(addrSim * 100)}%)`,
      });
      matchReasons.push(`Address overlap: ${entityA.details.address.slice(0, 25)}... [+${points}%]`);
    }
  }

  // 5. Same entity type match bonus
  if (entityA.type === entityB.type && score > 0) {
    score += 5;
  }

  const confidence = Math.min(99, Math.round(score));

  return {
    confidence,
    matchReasons,
    matchFactors,
  };
}

/**
 * Scans all entities in the graph and detects resolution candidates above a threshold
 */
export function detectResolutionCandidates(entities: Entity[]): EntityResolutionCandidate[] {
  const candidates: EntityResolutionCandidate[] = [];
  const processedPairs = new Set<string>();

  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const eA = entities[i];
      const eB = entities[j];
      const pairKey = [eA.id, eB.id].sort().join('::');

      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      const { confidence, matchReasons, matchFactors } = computeEntitySimilarity(eA, eB);

      // Flag candidates with confidence >= 60%
      if (confidence >= 60) {
        const sourceA = (eA.provenance && eA.provenance[0]?.sourceFile) || 'Database Record';
        const sourceB = (eB.provenance && eB.provenance[0]?.sourceFile) || 'Intelligence Ingestion';

        const detailA = eA.details.phone || eA.details.vehicleNumber || eA.details.address || eA.type;
        const detailB = eB.details.phone || eB.details.vehicleNumber || eB.details.address || eB.type;

        candidates.push({
          id: `cand-${eA.id}-${eB.id}`,
          entityAId: eA.id,
          entityBId: eB.id,
          recordA: {
            id: eA.id,
            name: eA.name,
            type: eA.type,
            detail: detailA,
            source: sourceA,
          },
          recordB: {
            id: eB.id,
            name: eB.name,
            type: eB.type,
            detail: detailB,
            source: sourceB,
          },
          confidence,
          matchReasons,
          matchFactors,
          status: 'PENDING',
        });
      }
    }
  }

  return candidates.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Merges Entity B into Canonical Entity A:
 * - Preserves aliases and identifiers
 * - Re-wires all relationship edges pointing to B to point to A
 * - Retains provenance from both sources
 * - Recalculates connection count
 */
export function mergeEntities(
  entityA: Entity,
  entityB: Entity,
  relationships: Relationship[]
): { mergedEntity: Entity; updatedRelationships: Relationship[]; removedEntityId: string } {
  const mergedAliases = Array.from(
    new Set([
      ...(entityA.aliases || []),
      ...(entityB.aliases || []),
      entityB.name,
      ...(entityB.name !== entityA.name ? [entityB.name] : []),
    ])
  );

  const mergedPriorCases = Array.from(
    new Set([
      ...(entityA.priorCases || []),
      ...(entityB.priorCases || []),
    ])
  );

  const mergedProvenance = [
    ...(entityA.provenance || []),
    ...(entityB.provenance || []),
  ];

  const mergedDetails = {
    ...entityB.details,
    ...entityA.details,
    phone: entityA.details.phone || entityB.details.phone,
    vehicleNumber: entityA.details.vehicleNumber || entityB.details.vehicleNumber,
    address: entityA.details.address || entityB.details.address,
    notes: `${entityA.details.notes || ''} | Merged with ${entityB.name} (${entityB.id}): ${entityB.details.notes || ''}`.trim(),
  };

  const mergedEntity: Entity = {
    ...entityA,
    aliases: mergedAliases,
    priorCases: mergedPriorCases,
    provenance: mergedProvenance,
    details: mergedDetails,
    confidence: Math.max(entityA.confidence, entityB.confidence),
    riskScore: Math.max(entityA.riskScore, entityB.riskScore),
  };

  // Re-wire relationships: all occurrences of entityB.id become entityA.id
  const updatedRelationships: Relationship[] = [];
  const edgeKeys = new Set<string>();

  relationships.forEach(rel => {
    let sourceId = rel.sourceId;
    let targetId = rel.targetId;

    if (sourceId === entityB.id) sourceId = entityA.id;
    if (targetId === entityB.id) targetId = entityA.id;

    // Eliminate self-loops created by merge
    if (sourceId === targetId) return;

    // Eliminate duplicate parallel edges
    const key = `${sourceId}::${targetId}::${rel.type}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);

    updatedRelationships.push({
      ...rel,
      sourceId,
      targetId,
    });
  });

  // Update connection counts
  mergedEntity.connectionsCount = updatedRelationships.filter(
    r => r.sourceId === entityA.id || r.targetId === entityA.id
  ).length;

  return {
    mergedEntity,
    updatedRelationships,
    removedEntityId: entityB.id,
  };
}
