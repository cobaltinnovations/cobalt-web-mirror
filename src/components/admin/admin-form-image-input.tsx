import useHandleError from '@/hooks/use-handle-error';
import { imageUploader } from '@/lib/services';
import React, { useEffect, useState } from 'react';
import ImageUploadCard from '../image-upload-card';
import SessionCropModal, { SIZE_SELECTIONS } from '../session-crop-modal';
import { PresignedUploadResponse } from '@/lib/models';

export interface AdminFormImageInputProps {
	imageSrc: string;
	placeholderImageSrc?: string;
	allowRemovePlaceholderImage?: boolean;
	onSrcChange: (newId: string, newSrc: string) => void;
	presignedUploadGetter: (blob: Blob, name: string) => () => Promise<PresignedUploadResponse>;
	className?: string;
	onUploadComplete?(fileUploadId: string): void;
	cropImage?: boolean;
	showSizeSelection?: boolean;
	lockSizeSelection?: SIZE_SELECTIONS;
}

export const AdminFormImageInput = ({
	imageSrc,
	placeholderImageSrc,
	allowRemovePlaceholderImage = false,
	onSrcChange,
	presignedUploadGetter,
	className,
	onUploadComplete,
	cropImage = true,
	showSizeSelection = true,
	lockSizeSelection,
}: AdminFormImageInputProps) => {
	const handleError = useHandleError();
	const [isCropModalOpen, setIsCropModalOpen] = useState(false);
	const [sessionCropModalImageConfig, setSessionCropModalImageConfig] = useState({ name: '', source: '', type: '' });
	const [imagePreviewSrc, setImagePreviewSrc] = useState('');
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		setImagePreviewSrc(imageSrc);
	}, [imageSrc]);

	return (
		<>
			<SessionCropModal
				cropImage={cropImage}
				showSizeSelection={showSizeSelection}
				lockSizeSelection={lockSizeSelection}
				imageName={sessionCropModalImageConfig.name}
				imageSource={sessionCropModalImageConfig.source}
				show={isCropModalOpen}
				onHide={() => {
					setIsCropModalOpen(false);
				}}
				onSave={async (blob, fileName) => {
					setIsCropModalOpen(false);

					let fileUploadId = '';
					let previewImageUrl = '';

					imageUploader(blob, presignedUploadGetter(blob, fileName))
						.onBeforeUpload((nextPreviewImageUrl) => {
							previewImageUrl = nextPreviewImageUrl;
							setImagePreviewSrc(nextPreviewImageUrl);
						})
						.onPresignedUploadObtained(({ fileUploadResult }) => {
							fileUploadId = fileUploadResult.fileUploadId;

							setIsUploading(true);
							onSrcChange(
								fileUploadResult.fileUploadId,
								previewImageUrl || fileUploadResult.presignedUpload.accessUrl
							);
						})
						.onProgress((percentage) => {
							setProgress(percentage);
						})
						.onComplete(() => {
							setIsUploading(false);
							onUploadComplete?.(fileUploadId);
						})
						.onError((error: any) => {
							handleError(error);
							setIsUploading(false);
							setImagePreviewSrc('');
						})
						.start();
				}}
			/>

			<ImageUploadCard
				className={className}
				imagePreview={imagePreviewSrc}
				placeholderImagePreview={placeholderImageSrc}
				allowRemovePlaceholderImage={allowRemovePlaceholderImage}
				isUploading={isUploading}
				progress={progress}
				onChange={(file) => {
					setSessionCropModalImageConfig({
						name: file.name,
						source: URL.createObjectURL(file),
						type: file.type,
					});
					setIsCropModalOpen(true);
				}}
				onRemove={() => {
					onSrcChange('', '');
					setImagePreviewSrc('');
				}}
			/>
		</>
	);
};
