import { Entity, Relationship, ShortestPathResult, ShortestPathStep, NetworkCluster, PriorityFactor, GraphValidationResult } from '../types';

/**
 * Finds the shortest relationship path between two entities using Breadth-First Search (BFS)
 */
export function findShortestPath(
  entities: Entity[],
  relationships: Relationship[],
  sourceId: string,
  targetId: string
): ShortestPathResult {
  if (sourceId === targetId) {
    const entity = entities.find(e => e.id === sourceId);
    if (!entity) {
      return {
        found: false,
        hops: 0,
        path: [],
        nodeIds: [],
        edgeIds: [],
        explanation: 'Source and target entities are identical.',
      };
    }
    return {
      found: true,
      hops: 0,
      path: [{ entity }],
      nodeIds: [sourceId],
      edgeIds: [],
      explanation: `Selected single entity: ${entity.name}`,
    };
  }

  // Build adjacency list
  const adj = new Map<string, Array<{ neighborId: string; edge: Relationship }>>();
  entities.forEach(e => adj.set(e.id, []));

  relationships.forEach(rel => {
    if (adj.has(rel.sourceId) && adj.has(rel.targetId)) {
      adj.get(rel.sourceId)!.push({ neighborId: rel.targetId, edge: rel });
      adj.get(rel.targetId)!.push({ neighborId: rel.sourceId, edge: rel });
    }
  });

  const queue: string[] = [sourceId];
  const visited = new Set<string>([sourceId]);
  const parentMap = new Map<string, { fromNode: string; edge: Relationship }>();

  let found = false;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetId) {
      found = true;
      break;
    }

    const neighbors = adj.get(current) || [];
    for (const { neighborId, edge } of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        parentMap.set(neighborId, { fromNode: current, edge });
        queue.push(neighborId);
      }
    }
  }

  if (!found) {
    const src = entities.find(e => e.id === sourceId)?.name || 'Source';
    const tgt = entities.find(e => e.id === targetId)?.name || 'Target';
    return {
      found: false,
      hops: 0,
      path: [],
      nodeIds: [],
      edgeIds: [],
      explanation: `No direct or indirect relationship path exists between "${src}" and "${tgt}" in the current intelligence dataset.`,
    };
  }

  // Reconstruct path backwards
  const nodeSequence: string[] = [];
  const edgeSequence: Relationship[] = [];

  let curr = targetId;
  nodeSequence.unshift(curr);

  while (curr !== sourceId) {
    const step = parentMap.get(curr);
    if (!step) break;
    edgeSequence.unshift(step.edge);
    nodeSequence.unshift(step.fromNode);
    curr = step.fromNode;
  }

  const pathSteps: ShortestPathStep[] = [];
  for (let i = 0; i < nodeSequence.length; i++) {
    const entity = entities.find(e => e.id === nodeSequence[i])!;
    const edge = edgeSequence[i];
    pathSteps.push({
      entity,
      relationshipToNext: edge
        ? {
            type: edge.type,
            evidence: edge.sourceEvidence,
            confidence: edge.confidence,
          }
        : undefined,
    });
  }

  const hops = edgeSequence.length;
  const srcName = entities.find(e => e.id === sourceId)?.name || 'Source';
  const tgtName = entities.find(e => e.id === targetId)?.name || 'Target';

  return {
    found: true,
    hops,
    path: pathSteps,
    nodeIds: nodeSequence,
    edgeIds: edgeSequence.map(e => e.id),
    explanation: `Found connection between "${srcName}" and "${tgtName}" across ${hops} link ${hops === 1 ? 'hop' : 'hops'}.`,
  };
}

/**
 * Detects connected clusters using graph components traversal
 */
export function detectClusters(entities: Entity[], relationships: Relationship[]): NetworkCluster[] {
  const adj = new Map<string, string[]>();
  entities.forEach(e => adj.set(e.id, []));

  relationships.forEach(rel => {
    if (adj.has(rel.sourceId) && adj.has(rel.targetId)) {
      adj.get(rel.sourceId)!.push(rel.targetId);
      adj.get(rel.targetId)!.push(rel.sourceId);
    }
  });

  const visited = new Set<string>();
  const clusters: NetworkCluster[] = [];
  let clusterIdx = 1;

  entities.forEach(entity => {
    if (!visited.has(entity.id)) {
      const clusterMembers: string[] = [];
      const queue: string[] = [entity.id];
      visited.add(entity.id);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        clusterMembers.push(curr);
        const neighbors = adj.get(curr) || [];
        for (const nbr of neighbors) {
          if (!visited.has(nbr)) {
            visited.add(nbr);
            queue.push(nbr);
          }
        }
      }

      // Determine predominant type
      const clusterEntities = entities.filter(e => clusterMembers.includes(e.id));
      const typeCounts: Record<string, number> = {};
      clusterEntities.forEach(e => {
        typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
      });
      const primaryType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'MIXED';

      const clusterName =
        clusterMembers.length > 1
          ? `Syndicate Sub-Network ${String.fromCharCode(64 + clusterIdx)}`
          : `Isolated Intelligence Node ${clusterIdx}`;

      clusters.push({
        clusterId: `cluster-${clusterIdx}`,
        name: clusterName,
        entityCount: clusterMembers.length,
        primaryType,
        entities: clusterMembers,
      });

      clusterIdx++;
    }
  });

  return clusters.sort((a, b) => b.entityCount - a.entityCount);
}

/**
 * Identifies bridge entities (cut vertices whose removal disconnects the graph or connects distinct clusters)
 */
export function identifyBridgeNodes(entities: Entity[], relationships: Relationship[]): Set<string> {
  const bridgeNodeIds = new Set<string>();
  if (entities.length < 3) return bridgeNodeIds;

  const adj = new Map<string, string[]>();
  entities.forEach(e => adj.set(e.id, []));

  relationships.forEach(rel => {
    if (adj.has(rel.sourceId) && adj.has(rel.targetId)) {
      adj.get(rel.sourceId)!.push(rel.targetId);
      adj.get(rel.targetId)!.push(rel.sourceId);
    }
  });

  // Base component count
  const countComponents = (excludedId?: string): number => {
    const visited = new Set<string>();
    let components = 0;

    entities.forEach(e => {
      if (e.id === excludedId || visited.has(e.id)) return;
      components++;
      const queue = [e.id];
      visited.add(e.id);
      while (queue.length > 0) {
        const curr = queue.shift()!;
        const neighbors = adj.get(curr) || [];
        for (const nbr of neighbors) {
          if (nbr !== excludedId && !visited.has(nbr)) {
            visited.add(nbr);
            queue.push(nbr);
          }
        }
      }
    });

    return components;
  };

  const baseComponents = countComponents();

  entities.forEach(entity => {
    const deg = (adj.get(entity.id) || []).length;
    if (deg >= 2) {
      const componentsWithoutEntity = countComponents(entity.id);
      if (componentsWithoutEntity > baseComponents) {
        bridgeNodeIds.add(entity.id);
      }
    }
  });

  return bridgeNodeIds;
}

/**
 * Transparently computes Priority / Risk Score and reasons based on objective graph metrics
 */
export function computePriorityFactors(
  entity: Entity,
  entities: Entity[],
  relationships: Relationship[],
  isBridge: boolean
): { score: number; reasons: PriorityFactor[] } {
  const reasons: PriorityFactor[] = [];
  let baseScore = 20; // baseline investigative priority

  // 1. Direct connections (degree)
  const directEdges = relationships.filter(r => r.sourceId === entity.id || r.targetId === entity.id);
  const directLinksCount = directEdges.length;

  if (directLinksCount >= 4) {
    const pts = Math.min(30, directLinksCount * 6);
    baseScore += pts;
    reasons.push({
      factor: 'High Degree Centrality',
      points: pts,
      description: `${directLinksCount} direct intelligence link connections identified.`,
    });
  } else if (directLinksCount >= 2) {
    const pts = directLinksCount * 5;
    baseScore += pts;
    reasons.push({
      factor: 'Network Link Centrality',
      points: pts,
      description: `${directLinksCount} direct intelligence connections.`,
    });
  }

  // 2. High-priority neighbors
  const neighborIds = new Set<string>();
  directEdges.forEach(r => {
    neighborIds.add(r.sourceId === entity.id ? r.targetId : r.sourceId);
  });
  const highPriorityNeighbors = entities.filter(e => neighborIds.has(e.id) && e.riskScore >= 75);

  if (highPriorityNeighbors.length > 0) {
    const pts = Math.min(25, highPriorityNeighbors.length * 10);
    baseScore += pts;
    reasons.push({
      factor: 'Proximity to High-Priority Nodes',
      points: pts,
      description: `Directly connected to ${highPriorityNeighbors.length} high-priority entities (${highPriorityNeighbors.map(h => h.name).join(', ')}).`,
    });
  }

  // 3. Bridge entity between network clusters
  if (isBridge) {
    baseScore += 20;
    reasons.push({
      factor: 'Syndicate Bridge Node',
      points: 20,
      description: 'Acts as an analytical bridge linking distinct intelligence clusters or sub-networks.',
    });
  }

  // 4. Multiple intelligence sources / provenance appearances
  const sourceCount = (entity.provenance || []).length;
  if (sourceCount > 1) {
    const pts = Math.min(20, sourceCount * 8);
    baseScore += pts;
    reasons.push({
      factor: 'Cross-Source Corroboration',
      points: pts,
      description: `Corroborated across ${sourceCount} distinct intelligence input files.`,
    });
  }

  // 5. Prior cases mentioned
  if (entity.priorCases && entity.priorCases.length > 0) {
    const pts = Math.min(15, entity.priorCases.length * 8);
    baseScore += pts;
    reasons.push({
      factor: 'Prior Case Record',
      points: pts,
      description: `Associated with ${entity.priorCases.length} prior recorded cases (${entity.priorCases.join(', ')}).`,
    });
  }

  const finalScore = Math.min(98, Math.max(15, baseScore));

  return {
    score: finalScore,
    reasons,
  };
}

/**
 * Validates the graph topology for a case:
 * - Checks that all relationship source and target IDs reference existing entities
 * - Detects duplicate entity IDs
 * - Detects duplicate relationship IDs
 * - Identifies self-loops (sourceId === targetId)
 * - Identifies empty / malformed IDs
 * - Computes connected component count & isolated entities
 */
export function validateCaseGraph(
  entities: Entity[] = [],
  relationships: Relationship[] = []
): GraphValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const entityIdSet = new Set<string>();
  const duplicateEntityIds: string[] = [];

  // Check duplicate entities
  entities.forEach(e => {
    if (!e.id || e.id.trim() === '') {
      errors.push(`Found entity with empty or undefined ID: "${e.name}"`);
    } else if (entityIdSet.has(e.id)) {
      duplicateEntityIds.push(e.id);
      errors.push(`Duplicate entity ID detected: "${e.id}" (${e.name})`);
    } else {
      entityIdSet.add(e.id);
    }
  });

  // Check duplicate relationships & invalid entity references
  const relIdSet = new Set<string>();
  const duplicateRelationshipIds: string[] = [];
  const invalidEntityReferences: Array<{ relationshipId: string; missingId: string; role: 'source' | 'target' }> = [];
  const selfLoops: string[] = [];
  const entityDegree = new Map<string, number>();

  entities.forEach(e => entityDegree.set(e.id, 0));

  relationships.forEach(rel => {
    if (!rel.id || rel.id.trim() === '') {
      errors.push(`Found relationship with empty ID from "${rel.sourceId}" to "${rel.targetId}"`);
    } else if (relIdSet.has(rel.id)) {
      duplicateRelationshipIds.push(rel.id);
      errors.push(`Duplicate relationship ID detected: "${rel.id}"`);
    } else {
      relIdSet.add(rel.id);
    }

    if (!rel.sourceId) {
      errors.push(`Relationship "${rel.id}" has missing sourceId`);
    } else if (!entityIdSet.has(rel.sourceId)) {
      invalidEntityReferences.push({ relationshipId: rel.id, missingId: rel.sourceId, role: 'source' });
      errors.push(`Relationship "${rel.id}" references nonexistent sourceId "${rel.sourceId}"`);
    }

    if (!rel.targetId) {
      errors.push(`Relationship "${rel.id}" has missing targetId`);
    } else if (!entityIdSet.has(rel.targetId)) {
      invalidEntityReferences.push({ relationshipId: rel.id, missingId: rel.targetId, role: 'target' });
      errors.push(`Relationship "${rel.id}" references nonexistent targetId "${rel.targetId}"`);
    }

    if (rel.sourceId && rel.targetId && rel.sourceId === rel.targetId) {
      selfLoops.push(rel.id);
      warnings.push(`Self-loop relationship detected: "${rel.id}" (${rel.sourceId} -> ${rel.targetId})`);
    }

    if (entityIdSet.has(rel.sourceId)) {
      entityDegree.set(rel.sourceId, (entityDegree.get(rel.sourceId) || 0) + 1);
    }
    if (entityIdSet.has(rel.targetId)) {
      entityDegree.set(rel.targetId, (entityDegree.get(rel.targetId) || 0) + 1);
    }
  });

  // Calculate isolated entities
  let isolatedCount = 0;
  entityDegree.forEach((deg, entId) => {
    if (deg === 0) {
      isolatedCount++;
      const entName = entities.find(e => e.id === entId)?.name || entId;
      warnings.push(`Isolated entity with 0 connections: "${entName}" (${entId})`);
    }
  });

  // Compute connected components
  const clusters = detectClusters(entities, relationships);
  const connectedComponents = clusters.length;

  return {
    isValid: errors.length === 0,
    entityCount: entities.length,
    relationshipCount: relationships.length,
    connectedComponents,
    errors,
    warnings,
    details: {
      invalidEntityReferences,
      duplicateEntityIds,
      duplicateRelationshipIds,
      selfLoops,
      isolatedEntityCount: isolatedCount,
    },
  };
}
