import { ElasticDoc, ElasticHit, ElasticSearchQuery, ElasticSearchResponse } from './types'

// Common English stop words
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with'
])

// Field weights for BM25 multi-field matching
const FIELD_WEIGHTS: Record<string, number> = {
  title: 3.5,
  frontPrompt: 3.5,
  formula: 2.8,
  tags: 2.2,
  category: 2.0,
  backSolution: 1.8,
  description: 1.6,
  content: 1.0,
  slug: 1.2,
}

// Compute Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix: number[][] = []
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  return matrix[b.length][a.length]
}

// Tokenize text into normalized tokens
function tokenize(text: string): string[] {
  if (!text) return []
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
}

export class EmbeddedElasticEngine {
  private indices: Map<string, Map<string, ElasticDoc>> = new Map()
  // Inverted index: indexName -> (token -> Set of docIds)
  private invertedIndex: Map<string, Map<string, Set<string>>> = new Map()
  // Average document length per index for BM25
  private avgDocLengths: Map<string, number> = new Map()

  constructor() {
    this.createIndex('toggledawn_codex')
    this.createIndex('toggledawn_intel')
    this.createIndex('toggledawn_flashcards')
    this.createIndex('toggledawn_missions')
    this.createIndex('toggledawn_projects')
    this.seedDefaultCorpus()
  }

  public createIndex(indexName: string) {
    if (!this.indices.has(indexName)) {
      this.indices.set(indexName, new Map())
      this.invertedIndex.set(indexName, new Map())
      this.avgDocLengths.set(indexName, 0)
    }
  }

  public indexDocument(indexName: string, doc: ElasticDoc) {
    const canonicalIndex = this.normalizeIndexName(indexName)
    this.createIndex(canonicalIndex)

    const docStore = this.indices.get(canonicalIndex)!
    const invStore = this.invertedIndex.get(canonicalIndex)!

    // Remove old tokens if updating
    if (docStore.has(doc.id)) {
      this.deleteDocument(canonicalIndex, doc.id)
    }

    docStore.set(doc.id, doc)

    // Index all string and array fields
    const docTokens = new Set<string>()
    for (const [key, val] of Object.entries(doc)) {
      if (typeof val === 'string') {
        const tokens = tokenize(val)
        tokens.forEach((t) => docTokens.add(t))
      } else if (Array.isArray(val)) {
        val.forEach((item) => {
          if (typeof item === 'string') {
            tokenize(item).forEach((t) => docTokens.add(t))
          }
        })
      }
    }

    // Populate inverted index
    docTokens.forEach((token) => {
      if (!invStore.has(token)) {
        invStore.set(token, new Set())
      }
      invStore.get(token)!.add(doc.id)
    })

    this.recomputeAvgLength(canonicalIndex)
  }

  public bulkIndex(indexName: string, docs: ElasticDoc[]) {
    docs.forEach((doc) => this.indexDocument(indexName, doc))
  }

  public deleteDocument(indexName: string, docId: string) {
    const canonicalIndex = this.normalizeIndexName(indexName)
    const docStore = this.indices.get(canonicalIndex)
    const invStore = this.invertedIndex.get(canonicalIndex)

    if (docStore && docStore.has(docId)) {
      docStore.delete(docId)
      if (invStore) {
        invStore.forEach((set) => set.delete(docId))
      }
      this.recomputeAvgLength(canonicalIndex)
    }
  }

  private recomputeAvgLength(indexName: string) {
    const docs = Array.from(this.indices.get(indexName)?.values() || [])
    if (docs.length === 0) {
      this.avgDocLengths.set(indexName, 0)
      return
    }
    const totalWords = docs.reduce((acc, d) => {
      const text = `${d.title} ${d.content || ''} ${d.description || ''} ${d.frontPrompt || ''}`
      return acc + tokenize(text).length
    }, 0)
    this.avgDocLengths.set(indexName, totalWords / docs.length)
  }

  private normalizeIndexName(index: string): string {
    if (index.startsWith('toggledawn_')) return index
    switch (index) {
      case 'codex':
      case 'books':
      case 'chapters':
      case 'notes':
        return 'toggledawn_codex'
      case 'intel':
      case 'drafts':
      case 'vault':
        return 'toggledawn_intel'
      case 'flashcards':
      case 'cards':
        return 'toggledawn_flashcards'
      case 'missions':
        return 'toggledawn_missions'
      case 'projects':
        return 'toggledawn_projects'
      default:
        return `toggledawn_${index}`
    }
  }

  // Okapi BM25 Multi-Field Relevance Search
  public search(params: ElasticSearchQuery): ElasticSearchResponse {
    const startTime = performance.now()
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

    const targetIndices: string[] = []
    if (index === 'all' || Array.isArray(index) && index.includes('all')) {
      targetIndices.push(
        'toggledawn_codex',
        'toggledawn_intel',
        'toggledawn_flashcards',
        'toggledawn_missions',
        'toggledawn_projects'
      )
    } else if (Array.isArray(index)) {
      index.forEach((i) => targetIndices.push(this.normalizeIndexName(i)))
    } else {
      targetIndices.push(this.normalizeIndexName(index))
    }

    const queryTokens = tokenize(q)
    const rawQuery = q.trim().toLowerCase()
    const scoredHits: ElasticHit[] = []

    // Collect candidate documents across targeted indices
    targetIndices.forEach((idxName) => {
      const docStore = this.indices.get(idxName)
      if (!docStore) return

      const invStore = this.invertedIndex.get(idxName) || new Map()
      const totalDocsInIndex = docStore.size
      const avgDl = this.avgDocLengths.get(idxName) || 10
      const k1 = 1.2
      const b = 0.75

      docStore.forEach((doc) => {
        // Filter checks
        if (docType && doc.docType !== docType) return
        if (category && doc.category && doc.category.toLowerCase() !== category.toLowerCase()) return
        if (status && doc.status && doc.status.toLowerCase() !== status.toLowerCase()) return
        if (difficulty && doc.difficulty && doc.difficulty !== difficulty) return

        // If no query string, return all matching filters with base score
        if (queryTokens.length === 0) {
          scoredHits.push({
            _index: idxName,
            _id: doc.id,
            _score: 1.0,
            _source: doc,
          })
          return
        }

        // BM25 calculation
        let score = 0
        const highlights: Record<string, string[]> = {}
        let matchCount = 0

        // Check each query token
        queryTokens.forEach((qToken) => {
          let tokenMatched = false

          // Check inverted index exact token match
          const matchingDocIds = invStore.get(qToken)
          let idf = 1.0
          if (matchingDocIds) {
            const df = matchingDocIds.size
            idf = Math.log(1 + (totalDocsInIndex - df + 0.5) / (df + 0.5))
          }

          // Evaluate score contribution across doc fields
          for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
            const fieldValue = (doc as any)[field]
            if (!fieldValue) continue

            const fieldText = Array.isArray(fieldValue) ? fieldValue.join(' ') : String(fieldValue)
            const lowerField = fieldText.toLowerCase()

            // Exact token occurrence in field
            const fieldTokens = tokenize(fieldText)
            const termFreq = fieldTokens.filter((t) => t === qToken).length

            if (termFreq > 0) {
              tokenMatched = true
              matchCount++
              const docLen = fieldTokens.length
              const numerator = termFreq * (k1 + 1)
              const denominator = termFreq + k1 * (1 - b + (b * docLen) / avgDl)
              score += idf * (numerator / denominator) * weight

              // Highlight snippet
              if (!highlights[field]) highlights[field] = []
              const highlighted = this.createHighlightSnippet(fieldText, qToken)
              if (highlighted && !highlights[field].includes(highlighted)) {
                highlights[field].push(highlighted)
              }
            } else if (fuzziness !== 0) {
              // Fuzzy check using Levenshtein distance
              const maxDist =
                fuzziness === 'AUTO'
                  ? qToken.length <= 4
                    ? 1
                    : 2
                  : Number(fuzziness) || 1

              for (const fToken of fieldTokens) {
                if (Math.abs(fToken.length - qToken.length) <= maxDist) {
                  const dist = levenshteinDistance(qToken, fToken)
                  if (dist <= maxDist) {
                    tokenMatched = true
                    matchCount += 0.6
                    const fuzzyPenalty = 1 - dist * 0.3
                    score += idf * 0.7 * fuzzyPenalty * weight
                    if (!highlights[field]) highlights[field] = []
                    const highlighted = this.createHighlightSnippet(fieldText, fToken)
                    if (highlighted && !highlights[field].includes(highlighted)) {
                      highlights[field].push(highlighted)
                    }
                    break
                  }
                }
              }
            }
          }
        })

        // Exact phrase bonus if user entered multiple words and they appear sequentially
        const combinedText = `${doc.title} ${doc.frontPrompt || ''} ${doc.formula || ''} ${doc.content || ''} ${doc.description || ''}`.toLowerCase()
        if (queryTokens.length > 1 && combinedText.includes(rawQuery)) {
          score += 4.5
        } else if (doc.title.toLowerCase().includes(rawQuery)) {
          score += 3.0
        }

        if (score > 0) {
          scoredHits.push({
            _index: idxName,
            _id: doc.id,
            _score: Number(score.toFixed(3)),
            _source: doc,
            highlight: Object.keys(highlights).length > 0 ? highlights : undefined,
          })
        }
      })
    })

    // Sort descending by relevance score
    scoredHits.sort((a, b) => b._score - a._score)

    // Compute aggregations (facets by index and category)
    const indexBuckets: Record<string, number> = {}
    const categoryBuckets: Record<string, number> = {}
    const typeBuckets: Record<string, number> = {}

    scoredHits.forEach((hit) => {
      indexBuckets[hit._index] = (indexBuckets[hit._index] || 0) + 1
      if (hit._source.category) {
        categoryBuckets[hit._source.category] = (categoryBuckets[hit._source.category] || 0) + 1
      }
      if (hit._source.docType) {
        typeBuckets[hit._source.docType] = (typeBuckets[hit._source.docType] || 0) + 1
      }
    })

    const paginatedHits = scoredHits.slice(from, from + size)
    const maxScore = scoredHits.length > 0 ? scoredHits[0]._score : 0
    const took = Math.round(performance.now() - startTime)

    return {
      took,
      timed_out: false,
      _shards: {
        total: targetIndices.length,
        successful: targetIndices.length,
        skipped: 0,
        failed: 0,
      },
      hits: {
        total: {
          value: scoredHits.length,
          relation: 'eq',
        },
        max_score: maxScore,
        hits: paginatedHits,
      },
      aggregations: {
        by_index: {
          buckets: Object.entries(indexBuckets).map(([key, doc_count]) => ({ key, doc_count })),
        },
        by_category: {
          buckets: Object.entries(categoryBuckets).map(([key, doc_count]) => ({ key, doc_count })),
        },
        by_type: {
          buckets: Object.entries(typeBuckets).map(([key, doc_count]) => ({ key, doc_count })),
        },
      },
      engine: 'embedded-bm25',
    }
  }

  private createHighlightSnippet(text: string, matchToken: string): string {
    const idx = text.toLowerCase().indexOf(matchToken.toLowerCase())
    if (idx === -1) return ''

    const start = Math.max(0, idx - 40)
    const end = Math.min(text.length, idx + matchToken.length + 50)
    let snippet = text.substring(start, end)
    if (start > 0) snippet = '...' + snippet
    if (end < text.length) snippet = snippet + '...'

    const regex = new RegExp(`(${matchToken})`, 'gi')
    return snippet.replace(regex, '<mark class="hud-search-match">$1</mark>')
  }

  // Seeds default comprehensive corpus so search has instant rich intelligence
  private seedDefaultCorpus() {
    // 1. CODEX (Books, Chapters, Notes)
    const codexDocs: ElasticDoc[] = [
      {
        id: 'note-1',
        title: 'Rotational Dynamics & Torque Equilibrium',
        slug: 'rotational-dynamics',
        docType: 'note',
        category: 'Physics',
        tags: ['Physics', 'Mechanics', 'Torque', 'JEE Advanced'],
        formula: '\\tau = I \\alpha, \\quad L = I \\omega',
        content: 'Rigid body rotation, parallel axis theorem I = I_cm + Md^2, conservation of angular momentum in isolated systems. Moment of inertia derivations for cylinders and spheres.',
        description: 'Comprehensive study note covering rotational kinematics, angular momentum, and gyroscopic precession.',
        url: '/books/hc-verma-physics',
      },
      {
        id: 'note-2',
        title: 'Calculus of Infinitesimals & Taylor Series',
        slug: 'taylor-series',
        docType: 'note',
        category: 'Mathematics',
        tags: ['Calculus', 'Limits', 'Series', 'Analysis'],
        formula: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!} (x - a)^n',
        content: 'Convergence radii, Cauchy criterion, power series expansions for trigonometric and exponential functions. Error bounds and Lagrange remainder term.',
        description: 'Deep dive into analytical series expansions and convergence diagnostics.',
        url: '/books/thomas-calculus',
      },
      {
        id: 'note-3',
        title: 'Next.js 16 React Server Components & Turbopack',
        slug: 'react-server-components',
        docType: 'note',
        category: 'Computer Science',
        tags: ['React', 'Next.js', 'Turbopack', 'SSR'],
        formula: 'RSC + Server Actions = Zero Bundle Drift',
        content: 'Streaming SSR, Suspense boundary hierarchies, selective hydration, server-only data fetching patterns with Payload CMS 3 local API.',
        description: 'Architectural blueprints for modern high-performance full-stack web applications.',
        url: '/books/fullstack-react',
      },
      {
        id: 'book-1',
        title: 'HC Verma — Concepts of Physics Vol 1 & 2',
        slug: 'hc-verma-physics',
        docType: 'book',
        category: 'Physics',
        tags: ['Physics', 'Textbook', 'Mechanics', 'Electrodynamics'],
        description: 'Foundational textbook covering classical Newtonian mechanics, thermodynamics, fluid dynamics, and modern physics.',
        url: '/books/hc-verma-physics',
      },
      {
        id: 'book-2',
        title: 'Thomas Calculus 14th Edition',
        slug: 'thomas-calculus',
        docType: 'book',
        category: 'Mathematics',
        tags: ['Calculus', 'Differential', 'Integral', 'Vectors'],
        description: 'Standard university calculus curriculum: single-variable limits, multivariable calculus, and vector fields.',
        url: '/books/thomas-calculus',
      },
      {
        id: 'book-3',
        title: 'Fullstack React & Next.js Architecture',
        slug: 'fullstack-react',
        docType: 'book',
        category: 'Computer Science',
        tags: ['Architecture', 'TypeScript', 'Payload CMS'],
        description: 'Production patterns for server components, PostgreSQL database layer, and GSAP spatial animations.',
        url: '/books/fullstack-react',
      },
      {
        id: 'chap-1',
        title: 'Rotational Mechanics — Conservation Laws',
        slug: 'rotational-mechanics',
        docType: 'chapter',
        category: 'Physics',
        tags: ['Kinematics', 'Angular Momentum'],
        description: 'Chapter 10: Angular velocity, torque calculation, rolling without slipping on inclined planes.',
        url: '/books/hc-verma-physics',
      },
    ]

    // 2. FLASH CARDS
    const flashcardDocs: ElasticDoc[] = [
      {
        id: 'fc-1',
        title: 'Moment of Inertia of a Solid Sphere',
        frontPrompt: 'What is the moment of inertia of a solid sphere about its central diameter axis?',
        backSolution: 'I = (2/5) M R^2. For a hollow spherical shell it is (2/3) M R^2.',
        formula: 'I_{solid} = \\frac{2}{5} M R^2',
        docType: 'flashcard',
        category: 'Physics',
        difficulty: 'recruit',
        tags: ['Physics', 'Mechanics', 'Formula'],
        url: '/flash-cards',
      },
      {
        id: 'fc-2',
        title: 'Parallel Axis Theorem',
        frontPrompt: 'State the Parallel Axis Theorem equation and condition.',
        backSolution: 'I = I_cm + M d^2. The initial axis must strictly pass through the center of mass (cm).',
        formula: 'I = I_{cm} + M d^2',
        docType: 'flashcard',
        category: 'Physics',
        difficulty: 'operative',
        tags: ['Physics', 'Theorems'],
        url: '/flash-cards',
      },
      {
        id: 'fc-3',
        title: 'L’Hôpital’s Rule Prerequisites',
        frontPrompt: 'When can L’Hôpital’s Rule be applied to evaluate limits?',
        backSolution: 'Only when the direct limit substitution results in indeterminate forms 0/0 or ±∞/±∞ and both f and g are differentiable.',
        docType: 'flashcard',
        category: 'Mathematics',
        difficulty: 'recruit',
        tags: ['Calculus', 'Limits'],
        url: '/flash-cards',
      },
      {
        id: 'fc-4',
        title: 'React 19 Server Actions Mutation Pattern',
        frontPrompt: 'How do React Server Actions trigger revalidation without full page reload?',
        backSolution: 'By invoking revalidatePath() or revalidateTag() on the server, which signals Next.js router cache to refresh the affected RSC payload.',
        docType: 'flashcard',
        category: 'Computer Science',
        difficulty: 'veteran',
        tags: ['Next.js', 'React', 'SSR'],
        url: '/flash-cards',
      },
    ]

    // 3. INTEL & CAPTURED ASSETS
    const intelDocs: ElasticDoc[] = [
      {
        id: 'intel-1',
        title: 'Mechanics Free Body Diagram Scan',
        docType: 'intel',
        category: 'Physics',
        status: 'structured',
        formula: '\\Sigma F_x = m a_x, \\quad \\Sigma F_y = 0',
        tags: ['Mechanics', 'FBD', 'Forces', 'Field Scan'],
        content: 'FBD showing friction coefficient \\mu = 0.35 on a 30-degree ramp. Normal reaction force balance and tension vectors.',
        description: 'Whiteboard diagram snapshot detailing incline friction balancing.',
        url: '/drafts',
      },
      {
        id: 'intel-2',
        title: 'Integral Substitution Blueprint',
        docType: 'intel',
        category: 'Mathematics',
        status: 'structured',
        formula: '\\int \\frac{dx}{x^2 + a^2} = \\frac{1}{a} \\arctan\\left(\\frac{x}{a}\\right) + C',
        tags: ['Calculus', 'Integrals', 'Formulas'],
        content: 'Handwritten trigonometric substitution table for secant and tangent replacements in radical integrals.',
        description: 'Quick scan of trigonometric substitution lookup tables.',
        url: '/drafts',
      },
      {
        id: 'intel-3',
        title: 'Neon PostgreSQL Schema Diagram',
        docType: 'intel',
        category: 'Computer Science',
        status: 'draft',
        tags: ['PostgreSQL', 'Architecture', 'Draft'],
        content: 'Entity relation diagram between Users, Notes, Flashcards, and Time Logs with foreign key cascades.',
        description: 'Quick-saved camera capture of system architecture schematics.',
        url: '/drafts',
      },
    ]

    // 4. MISSIONS & PROJECTS
    const missionDocs: ElasticDoc[] = [
      {
        id: 'proj-1',
        title: 'JEE Advanced 2027 Mastery Sprint',
        docType: 'project',
        category: 'Competitive Exam',
        tags: ['JEE', 'Physics', 'Mathematics'],
        description: 'Year-long intense preparation curriculum targeting top 100 all-India rank.',
        url: '/#operations',
      },
      {
        id: 'proj-2',
        title: 'ToggleDawn Cyberpunk Command Platform',
        docType: 'project',
        category: 'Computer Science',
        tags: ['Next.js', 'Payload', 'GSAP', 'PWA'],
        description: 'High-efficiency personal telemetry and neurodivergent study command cockpit.',
        url: '/#operations',
      },
      {
        id: 'mis-1',
        title: 'Master Classical Rotational Mechanics',
        docType: 'mission',
        category: 'Physics',
        tags: ['Milestone', 'Physics'],
        description: 'Complete 100 challenging problems from HC Verma and Irodov Chapter 1.',
        url: '/#operations',
      },
    ]

    this.bulkIndex('toggledawn_codex', codexDocs)
    this.bulkIndex('toggledawn_flashcards', flashcardDocs)
    this.bulkIndex('toggledawn_intel', intelDocs)
    this.bulkIndex('toggledawn_missions', missionDocs)
    this.bulkIndex('toggledawn_projects', missionDocs)
  }
}

// Global singleton instance
export const globalElasticEngine = new EmbeddedElasticEngine()

