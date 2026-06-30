import { useRequireAccount } from '@/components/account'
import type { Id } from '@/lib/api'
import * as DocumentPicker from 'expo-document-picker'
import { Button, Card, ListGroup, Separator, Spinner, Typography } from 'heroui-native'
import { Fragment, useState } from 'react'
import { Alert, View } from 'react-native'
import {
	useAddDocument,
	useDeleteDocument,
	useDocuments,
	useGenerateUploadUrl,
} from './documents.data'
import type { Document, DocumentType } from './documents.types'

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
	{ value: 'passport', label: 'Passport' },
	{ value: 'ead', label: 'EAD' },
	{ value: 'greenCard', label: 'Green Card' },
	{ value: 'i94', label: 'I-94' },
	{ value: 'ssnCard', label: 'SSN Card' },
	{ value: 'other', label: 'Other' },
]

const TYPE_LABEL: Record<DocumentType, string> = {
	passport: 'Passport',
	ead: 'EAD',
	greenCard: 'Green Card',
	i94: 'I-94',
	ssnCard: 'SSN Card',
	other: 'Other',
}

/**
 * An applicant's Document Vault: upload a passport/EAD/etc. (PDF or image),
 * see every stored version, and delete one. Wired to the Convex `documents`
 * functions and Convex's built-in file storage (ADR-0007).
 */
export function DocumentVault({ applicantId }: { applicantId: Id<'applicants'> }) {
	const documents = useDocuments(applicantId)
	const generateUploadUrl = useGenerateUploadUrl()
	const addDocument = useAddDocument()
	const requireAccount = useRequireAccount()
	const [type, setType] = useState<DocumentType>('passport')
	const [uploading, setUploading] = useState(false)
	const [parked, setParked] = useState(false)

	async function handleUpload(): Promise<void> {
		// Gate behind a credentialed account: a file must bind to a recoverable
		// identity, and no bytes leave the device while anonymous (ADR-0007, #6).
		// A successful upgrade resolves true and auto-resumes the upload; a dismiss
		// parks it ("sign in to finish") and keeps any anonymous data.
		const ok = await requireAccount({
			title: 'Create an account to save documents',
			highlights: ['Keep your uploaded documents', 'Recover your data on any device'],
		})
		if (!ok) {
			setParked(true)
			return
		}
		setParked(false)
		setUploading(true)
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: ['application/pdf', 'image/*'],
				copyToCacheDirectory: true,
			})
			const file = result.assets?.[0]
			if (result.canceled || file === undefined) {
				return
			}

			// 1. Mint a one-time upload URL from Convex.
			const uploadUrl = await generateUploadUrl()
			// 2. Read the picked file as a Blob and POST its bytes to that URL.
			const blob = await (await fetch(file.uri)).blob()
			const uploadResponse = await fetch(uploadUrl, {
				method: 'POST',
				headers: { 'Content-Type': file.mimeType ?? 'application/octet-stream' },
				body: blob,
			})
			if (!uploadResponse.ok) {
				throw new Error(`Upload failed (${uploadResponse.status})`)
			}
			// 3. Convex returns the new storage id; record it as a document version.
			const { storageId } = (await uploadResponse.json()) as { storageId: Id<'_storage'> }
			await addDocument({ applicantId, type, storageId })
		} catch (err) {
			Alert.alert(
				'Could not upload document',
				err instanceof Error ? err.message : 'Please try again.',
			)
		} finally {
			setUploading(false)
		}
	}

	return (
		<View className="gap-4">
			<Card className="gap-4 p-5">
				<Typography.Paragraph className="font-semibold">Upload a document</Typography.Paragraph>

				<View className="gap-2">
					<Typography.Paragraph className="text-sm font-medium">Document type</Typography.Paragraph>
					<View className="flex-row flex-wrap gap-2">
						{DOCUMENT_TYPES.map((option) => {
							const selected = type === option.value
							return (
								<Button
									key={option.value}
									{...(selected ? {} : { variant: 'ghost' as const })}
									isDisabled={uploading}
									onPress={() => setType(option.value)}
								>
									<Button.Label>{option.label}</Button.Label>
								</Button>
							)
						})}
					</View>
				</View>

				<Button isDisabled={uploading} onPress={handleUpload}>
					<Button.Label>{uploading ? 'Uploading…' : 'Upload document'}</Button.Label>
				</Button>
				{parked ? (
					<Typography.Paragraph color="muted" className="text-sm">
						Sign in to finish — your document isn&rsquo;t uploaded yet. Tap Upload to continue.
					</Typography.Paragraph>
				) : null}
			</Card>

			<View className="gap-3">
				{documents === undefined ? (
					<View className="items-center py-8">
						<Spinner />
					</View>
				) : documents.length === 0 ? (
					<Typography.Paragraph color="muted" className="py-8 text-center">
						No documents yet. Upload one to get started.
					</Typography.Paragraph>
				) : (
					<ListGroup>
						{documents.map((document, index) => (
							<Fragment key={document._id}>
								<DocumentRow document={document} />
								{index !== documents.length - 1 && <Separator />}
							</Fragment>
						))}
					</ListGroup>
				)}
			</View>
		</View>
	)
}

/** One stored document in the vault, with its type, version, and a delete action. */
function DocumentRow({ document }: { document: Document }) {
	const deleteDocument = useDeleteDocument()
	const [deleting, setDeleting] = useState(false)

	async function handleDelete(): Promise<void> {
		setDeleting(true)
		try {
			await deleteDocument({ documentId: document._id })
		} catch (err) {
			setDeleting(false)
			Alert.alert(
				'Could not delete document',
				err instanceof Error ? err.message : 'Please try again.',
			)
		}
	}

	return (
		<ListGroup.Item>
			<ListGroup.ItemContent>
				<ListGroup.ItemTitle>{TYPE_LABEL[document.type]}</ListGroup.ItemTitle>
				<ListGroup.ItemDescription>
					Version {document.version}
					{document.expiryDate ? ` · Expires ${document.expiryDate}` : ''}
				</ListGroup.ItemDescription>
			</ListGroup.ItemContent>
			<ListGroup.ItemSuffix>
				<Button size="sm" variant="ghost" isDisabled={deleting} onPress={handleDelete}>
					<Button.Label>{deleting ? 'Deleting…' : 'Delete'}</Button.Label>
				</Button>
			</ListGroup.ItemSuffix>
		</ListGroup.Item>
	)
}
