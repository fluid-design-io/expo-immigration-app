import { useRequireAccount } from '@/components/account'
import { featherIcon, type StyledIconComponent } from '@/components/styled-icon'
import type { Id } from '@/lib/api'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { Button, Card, Radio, Typography } from 'heroui-native'
import { RadioButtonGroup } from 'heroui-native-pro'
import { useState } from 'react'
import { Alert, View } from 'react-native'
import { useAddDocument, useGenerateUploadUrl } from './documents.data'
import type { DocumentType } from './documents.types'

const DOCUMENT_TYPES: { value: DocumentType; label: string; Icon: StyledIconComponent }[] = [
	{ value: 'passport', label: 'Passport', Icon: featherIcon('book-open') },
	{ value: 'ead', label: 'EAD', Icon: featherIcon('briefcase') },
	{ value: 'greenCard', label: 'Green Card', Icon: featherIcon('credit-card') },
	{ value: 'i94', label: 'I-94', Icon: featherIcon('file-text') },
	{ value: 'ssnCard', label: 'SSN Card', Icon: featherIcon('hash') },
	{ value: 'other', label: 'Other', Icon: featherIcon('paperclip') },
]

/**
 * Reusable, account-gated document uploader. Pick a type, then choose a PDF or
 * photo; its bytes are POSTed to a one-time Convex upload URL and recorded as a
 * new version on `applicantId` (ADR-0007). No bytes leave the device while
 * anonymous — the account gate (#6) runs first, and a dismissal parks the upload
 * ("sign in to finish") without losing the chosen type.
 */
export function DocumentUpload({ applicantId }: { applicantId: Id<'applicants'> }) {
	const generateUploadUrl = useGenerateUploadUrl()
	const addDocument = useAddDocument()
	const requireAccount = useRequireAccount()
	const [type, setType] = useState<DocumentType>('passport')
	const [uploading, setUploading] = useState(false)
	const [parked, setParked] = useState(false)

	async function handleUpload(): Promise<void> {
		// Gate behind a credentialed account: a file must bind to a recoverable
		// identity, and no bytes leave the device while anonymous (ADR-0007, #6). A
		// successful upgrade resolves true and resumes; a dismiss parks the upload.
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
			// 2. Stream the picked file's bytes straight from disk. RN/Hermes can't
			// build a Blob from a file URI ("Creating blobs from 'ArrayBuffer'…"), so
			// upload with expo-file-system instead of fetch(uri).blob().
			const uploadResponse = await FileSystem.uploadAsync(uploadUrl, file.uri, {
				httpMethod: 'POST',
				uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
				headers: { 'Content-Type': file.mimeType ?? 'application/octet-stream' },
			})
			if (uploadResponse.status < 200 || uploadResponse.status >= 300) {
				throw new Error(`Upload failed (${uploadResponse.status})`)
			}
			// 3. Convex returns the new storage id; record it as a document version.
			const { storageId } = JSON.parse(uploadResponse.body) as { storageId: Id<'_storage'> }
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
		<Card className="gap-4 p-5">
			<Typography.Paragraph className="font-semibold">Upload a document</Typography.Paragraph>

			<View className="gap-2">
				<Typography.Paragraph className="text-sm font-medium">Document type</Typography.Paragraph>
				<RadioButtonGroup
					value={type}
					onValueChange={(value) => setType(value as DocumentType)}
					isDisabled={uploading}
					variant="secondary"
					className="gap-2"
				>
					{DOCUMENT_TYPES.map((option) => (
						<RadioButtonGroup.Item
							key={option.value}
							value={option.value}
							className="flex-row items-center gap-3 p-3"
						>
							{({ isSelected }) => (
								<>
									<View
										className={[
											'h-9 w-9 items-center justify-center rounded-full border',
											isSelected ? 'border-accent bg-accent' : 'border-border bg-surface',
										].join(' ')}
									>
										<option.Icon
											size={18}
											className={isSelected ? 'text-accent-foreground' : 'text-muted'}
										/>
									</View>
									<RadioButtonGroup.ItemContent>
										<Typography.Paragraph className="font-medium">
											{option.label}
										</Typography.Paragraph>
									</RadioButtonGroup.ItemContent>
									<Radio />
								</>
							)}
						</RadioButtonGroup.Item>
					))}
				</RadioButtonGroup>
			</View>

			<Button isDisabled={uploading} onPress={handleUpload}>
				<Button.Label>{uploading ? 'Uploading…' : 'Choose a PDF or photo'}</Button.Label>
			</Button>
			{parked ? (
				<Typography.Paragraph color="muted" className="text-sm">
					Sign in to finish — your document isn&rsquo;t uploaded yet. Tap “Choose a PDF or photo” to
					continue.
				</Typography.Paragraph>
			) : null}
		</Card>
	)
}
