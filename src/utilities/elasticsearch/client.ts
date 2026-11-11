import { Client } from '@elastic/elasticsearch'
import { globalElasticEngine } from './engine'
import { ElasticDoc, ElasticSearchQuery, ElasticSearchResponse } from './types'

let esClient: Client | null = null
let isRemoteHealthy = false
let healthChecked = false

export function getElasticsearchClient(): Client | null {
  if (esClient) return esClient
  const nodeUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200'

  try {
    esClient = new Client({
      node: nodeUrl,
      auth: process.env.ELASTICSEARCH_API_KEY
        ? { apiKey: process.env.ELASTICSEARCH_API_KEY }
        : process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD
        ? {
            username: process.env.ELASTICSEARCH_USERNAME,
            password: process.env.ELASTICSEARCH_PASSWORD,
          }
        : undefined,
      tls: {
        rejectUnauthorized: false,
      },
      maxRetries: 1,
      requestTimeout: 2000,
    })
    return esClient
  } catch (err) {
    console.warn('[ToggleDawn Elastic] Remote client init failed, using embedded BM25 engine:', err)
    return null
  }
}

// Check if remote Elasticsearch is accessible
export async function checkRemoteHealth(): Promise<boolean> {
  const client = getElasticsearchClient()
  if (!client) {
    isRemoteHealthy = false
    healthChecked = true
    return false
  }

  try {
    const ping = await client.ping()
    isRemoteHealthy = Boolean(ping)
  } catch {
    isRemoteHealthy = false
  }
  healthChecked = true
  return isRemoteHealthy
}

// Main Elasticsearch Query Executor
export async function searchElastic(params: ElasticSearchQuery): Promise<ElasticSearchResponse> {
  const {
    q = '',
    index = 'all',
    docType,
    category,
    status,
    difficulty,
    from = 0,
    size = 20,
    fuzziness = 'AUTO',
  } = params

  if (!healthChecked) {
    await checkRemoteHealth()
  }

  // Attempt remote Elasticsearch execution if healthy
  if (isRemoteHealthy && esClient) {
    try {
      const targetIndex =
        index === 'all'
          ? 'toggledawn_*'
          : Array.isArray(index)
          ? index.map((i) => (i.startsWith('toggledawn_') ? i : `toggledawn_${i}`)).join(',')
          : index.startsWith('toggledawn_')
          ? index
          : `toggledawn_${index}`

      const mustClauses: any[] = []
      const filterClauses: any[] = []

      if (q.trim()) {
        mustClauses.push({
          multi_match: {
            query: q,
            fields: [
              'title^3.5',
              'frontPrompt^3.5',
              'formula^2.8',
              'tags^2.2',
              'category^2.0',
              'backSolution^1.8',
              'description^1.6',
              'content^1.0',
            ],
            fuzziness: fuzziness,
          },
        })
      } else {
        mustClauses.push({ match_all: {} })
      }

      if (docType) filterClauses.push({ term: { 'docType.keyword': docType } })
      if (category) filterClauses.push({ term: { 'category.keyword': category } })
      if (status) filterClauses.push({ term: { 'status.keyword': status } })
      if (difficulty) filterClauses.push({ term: { 'difficulty.keyword': difficulty } })

      const response = await esClient.search({
        index: targetIndex,
        from,
        size,
        query: {
          bool: {
            must: mustClauses,
            filter: filterClauses,
          },
        },
        highlight: {
          pre_tags: ['<mark class="hud-search-match">'],
          post_tags: ['</mark>'],
          fields: {
            title: {},
            content: {},
            frontPrompt: {},
            formula: {},
            description: {},
          },
        },
      })

      const rawHits = response.hits?.hits || []
      const totalHits =
        typeof response.hits?.total === 'number'
          ? response.hits.total
          : response.hits?.total?.value || 0

      return {
        took: response.took || 1,
        timed_out: response.timed_out || false,
        hits: {
          total: {
            value: totalHits,
            relation: 'eq',
          },
          max_score: Number(response.hits?.max_score) || 0,
          hits: rawHits.map((h: any) => ({
            _index: h._index,
            _id: h._id,
            _score: h._score || 0,
            _source: h._source,
            highlight: h.highlight,
          })),
        },
        engine: 'remote-elasticsearch',
      }
    } catch (remoteError) {
      console.warn('[ToggleDawn Elastic] Remote search call failed, falling back to embedded BM25:', remoteError)
      isRemoteHealthy = false
    }
  }

  // Fallback to Embedded BM25 Engine
  return globalElasticEngine.search(params)
}

// Sync document into Elasticsearch
export async function syncDocumentToElastic(index: string, doc: ElasticDoc): Promise<void> {
  // Always update embedded index
  globalElasticEngine.indexDocument(index, doc)

  // Also send to remote if available
  if (isRemoteHealthy && esClient) {
    try {
      const indexName = index.startsWith('toggledawn_') ? index : `toggledawn_${index}`
      await esClient.index({
        index: indexName,
        id: doc.id,
        document: doc,
      })
    } catch (err) {
      console.warn('[ToggleDawn Elastic] Remote doc sync failed:', err)
    }
  }
}

// Bulk sync documents into Elasticsearch
export async function bulkSyncToElastic(index: string, docs: ElasticDoc[]): Promise<void> {
  globalElasticEngine.bulkIndex(index, docs)

  if (isRemoteHealthy && esClient && docs.length > 0) {
    try {
      const indexName = index.startsWith('toggledawn_') ? index : `toggledawn_${index}`
      const operations = docs.flatMap((doc) => [{ index: { _index: indexName, _id: doc.id } }, doc])
      await esClient.bulk({ operations })
    } catch (err) {
      console.warn('[ToggleDawn Elastic] Remote bulk sync failed:', err)
    }
  }
}

