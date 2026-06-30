import { useMutation, useQuery } from 'convex/react'
import { api, type Doc, type Id } from '@/lib/api'

/** A case document, typed from the Convex schema (server-driven types). */
export type Case = Doc<'cases'>
export type CaseStatus = Case['currentStatus']
export type CaseHistoryEntry = Case['history'][number]

/**
 * The current account holder's cases. `undefined` while the query is loading;
 * `[]` once resolved with no cases (or when unauthenticated, since the backend
 * read-path returns empty rather than throwing).
 */
export function useCases(): Case[] | undefined {
	return useQuery(api.cases.listCases, {})
}

/** Start tracking a new case owned by the current account holder. */
export function useCreateCase() {
	return useMutation(api.cases.createCase)
}

/** A single case by id (`undefined` while loading, `null` if not found/owned). */
export function useCase(caseId: Id<'cases'>): Case | null | undefined {
	return useQuery(api.cases.getCase, { caseId })
}

/** Advance a case the caller owns to a new status (appends to its history). */
export function useUpdateCaseStatus() {
	return useMutation(api.cases.updateCaseStatus)
}
