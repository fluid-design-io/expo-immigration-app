import type { Doc } from '@/lib/api'

/** A stored vault document, typed from the Convex schema (server-driven types). */
export type Document = Doc<'documents'>
export type DocumentType = Document['type']
