/**
 * Elasticsearch Query DSL and Response Types for ToggleDawn
 */

export interface ElasticDoc {
  id: string
  title: string
  slug?: string
  content?: string
  description?: string
  category?: string
  tags?: string[]
  formula?: string
  frontPrompt?: string
  backSolution?: string
  difficulty?: 'recruit' | 'operative' | 'veteran'
  docType: 'book' | 'chapter' | 'note' | 'flashcard' | 'intel' | 'project' | 'mission' | 'page'
  url?: string
  status?: string
  imageData?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

export interface ElasticHit<T = ElasticDoc> {
  _index: string
  _id: string
  _score: number
  _source: T
  highlight?: {
    [field: string]: string[]
  }
}

export interface ElasticSearchResponse<T = ElasticDoc> {
  took: number
  timed_out: boolean
  _shards?: {
    total: number
    successful: number
    skipped: number
    failed: number
  }
  hits: {
    total: {
      value: number
      relation: 'eq' | 'gte'
    }
    max_score: number
    hits: ElasticHit<T>[]
  }
  aggregations?: {
    [key: string]: {
      buckets: Array<{
        key: string
        doc_count: number
      }>
    }
  }
  engine: 'remote-elasticsearch' | 'embedded-bm25'
}

export interface ElasticSearchQuery {
  q?: string
  index?: string | string[]
  docType?: string
  category?: string
  status?: string
  difficulty?: string
  from?: number
  size?: number
  fuzziness?: 'AUTO' | number
  highlight?: boolean
}

