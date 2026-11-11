'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ElasticDoc, ElasticHit, ElasticSearchResponse } from './types'

interface UseElasticSearchOptions {
  index?: string | string[]
  defaultQuery?: string
  docType?: string
  category?: string
  status?: string
  difficulty?: string
  debounceMs?: number
  size?: number
  initialAutoFetch?: boolean
}

export function useElasticSearch(options: UseElasticSearchOptions = {}) {
  const {
    index = 'all',
    defaultQuery = '',
    docType: initialDocType,
    category: initialCategory,
    status: initialStatus,
    difficulty: initialDifficulty,
    debounceMs = 150,
    size = 25,
    initialAutoFetch = true,
  } = options

  const [query, setQuery] = useState(defaultQuery)
  const [targetIndex, setTargetIndex] = useState<string | string[]>(index)
  const [docTypeFilter, setDocTypeFilter] = useState<string | undefined>(initialDocType)
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(initialCategory)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(initialStatus)
  const [difficultyFilter, setDifficultyFilter] = useState<string | undefined>(initialDifficulty)

  const [hits, setHits] = useState<ElasticHit[]>([])
  const [totalHits, setTotalHits] = useState(0)
  const [maxScore, setMaxScore] = useState(0)
  const [took, setTook] = useState(0)
  const [engine, setEngine] = useState<'remote-elasticsearch' | 'embedded-bm25'>('embedded-bm25')
  const [aggregations, setAggregations] = useState<ElasticSearchResponse['aggregations']>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const executeSearch = useCallback(
    async (overrideQuery?: string) => {
      const q = overrideQuery !== undefined ? overrideQuery : query

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (q.trim()) params.set('q', q.trim())
        if (Array.isArray(targetIndex)) {
          params.set('index', targetIndex.join(','))
        } else if (targetIndex) {
          params.set('index', targetIndex)
        }
        if (docTypeFilter) params.set('docType', docTypeFilter)
        if (categoryFilter) params.set('category', categoryFilter)
        if (statusFilter) params.set('status', statusFilter)
        if (difficultyFilter) params.set('difficulty', difficultyFilter)
        params.set('size', String(size))

        const res = await fetch(`/api/search/elasticsearch?${params.toString()}`, {
          signal: abortControllerRef.current.signal,
        })

        if (!res.ok) {
          throw new Error(`Elasticsearch query failed: ${res.statusText}`)
        }

        const data: ElasticSearchResponse = await res.json()
        setHits(data.hits.hits || [])
        setTotalHits(data.hits.total.value || 0)
        setMaxScore(data.hits.max_score || 0)
        setTook(data.took || 0)
        setEngine(data.engine || 'embedded-bm25')
        setAggregations(data.aggregations || {})
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('[useElasticSearch] Error:', err)
          setError(err.message || 'Search failed')
        }
      } finally {
        setIsLoading(false)
      }
    },
    [query, targetIndex, docTypeFilter, categoryFilter, statusFilter, difficultyFilter, size]
  )

  // Debounced search on query or filter changes
  useEffect(() => {
    if (!initialAutoFetch && !query.trim()) {
      setHits([])
      setTotalHits(0)
      return
    }

    const timer = setTimeout(() => {
      executeSearch()
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, targetIndex, docTypeFilter, categoryFilter, statusFilter, difficultyFilter, debounceMs, executeSearch, initialAutoFetch])

  // Synchronize dynamic documents into the Elasticsearch index
  const indexDoc = useCallback(async (indexName: string, doc: ElasticDoc) => {
    try {
      await fetch('/api/search/elasticsearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'index',
          index: indexName,
          doc,
        }),
      })
    } catch (e) {
      console.warn('[useElasticSearch] Failed to index document:', e)
    }
  }, [])

  return {
    query,
    setQuery,
    targetIndex,
    setTargetIndex,
    docTypeFilter,
    setDocTypeFilter,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    difficultyFilter,
    setDifficultyFilter,
    hits,
    totalHits,
    maxScore,
    took,
    engine,
    aggregations,
    isLoading,
    error,
    executeSearch,
    indexDoc,
  }
}

