export type GraphEntity = { id: string; type: string; label: string; metadata?: Record<string, string> };
export type EvidenceEdgeType = 'lineage' | 'execution_ref' | 'replay_ref' | 'incident' | 'governance';
export type EvidenceEdge = { id: string; from: string; to: string; type: EvidenceEdgeType; evidenceId: string; createdAt: string; provenance: Readonly<Record<string, string>> };

export class OperationalKnowledgeGraph {
  private entities = new Map<string, GraphEntity>();
  private edges: EvidenceEdge[] = [];

  addEntity(entity: GraphEntity): void {
    if (this.entities.has(entity.id)) return;
    this.entities.set(entity.id, Object.freeze({ ...entity, metadata: entity.metadata ? Object.freeze({ ...entity.metadata }) : undefined }));
  }

  appendEvidenceEdge(edge: Omit<EvidenceEdge, 'id' | 'createdAt'>): EvidenceEdge {
    if (!this.entities.has(edge.from) || !this.entities.has(edge.to)) {
      throw new Error('All edges must connect explicit entities.');
    }
    const next: EvidenceEdge = Object.freeze({
      ...edge,
      id: `edge-${this.edges.length + 1}`,
      createdAt: new Date(0).toISOString(),
      provenance: Object.freeze({ ...edge.provenance })
    });
    this.edges.push(next);
    return next;
  }

  deterministicTraversal(seedEntityId: string): EvidenceEdge[] {
    return this.edges
      .filter((edge) => edge.from === seedEntityId || edge.to === seedEntityId)
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  serialize(): string {
    const entities = [...this.entities.values()].sort((a, b) => a.id.localeCompare(b.id));
    const edges = this.edges.slice().sort((a, b) => a.id.localeCompare(b.id));
    return JSON.stringify({ entities, edges }, null, 2);
  }

  static rebuild(serialized: string): OperationalKnowledgeGraph {
    const payload = JSON.parse(serialized) as { entities: GraphEntity[]; edges: EvidenceEdge[] };
    const graph = new OperationalKnowledgeGraph();
    payload.entities.forEach((entity) => graph.addEntity(entity));
    payload.edges.forEach((edge) => graph.edges.push(Object.freeze(edge)));
    return graph;
  }
}
