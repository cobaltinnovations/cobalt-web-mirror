import useHandleError from '@/hooks/use-handle-error';
import { imageUploader } from '@/lib/services';
import React, { useState } from 'react';
import ImageUploadCard from '../image-upload-card';
import SessionCropModal from '../session-crop-modal';
import { PresignedUploadResponse } from '@/lib/models';

export interface AdminFormImageInputProps {
	imageSrc: string;
	onSrcChange: (newId: string, newSrc: string) => void;
	presignedUploadGetter: (blob: Blob) => () => Promise<PresignedUploadResponse>;
	className?: string;
}

export const AdminFormImageInput = ({
	imageSrc,
	onSrcChange,
	presignedUploadGetter,
	className,
}: AdminFormImageInputProps) => {
	const handleError = useHandleError();
	const [isCropModalOpen, setIsCropModalOpen] = useState(false);
	const [cropModalImageSrc, setCropModalImageSrc] = useState(imageSrc);
	const [imagePreviewSrc, setImagePreviewSrc] = useState(imageSrc);
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	return (
		<>
			<SessionCropModal
				imageSource={cropModalImageSrc}
				show={isCropModalOpen}
				onHide={() => {
					setIsCropModalOpen(false);
				}}
				onSave={async (blob) => {
					setIsCropModalOpen(false);

					imageUploader(blob, presignedUploadGetter(blob))
						.onBeforeUpload((previewImageUrl) => {
							setImagePreviewSrc(previewImageUrl);
						})
						.onPresignedUploadObtained(({ fileUploadResult }) => {
							setIsUploading(true);
							onSrcChange(fileUploadResult.fileUploadId, fileUploadResult.presignedUpload.accessUrl);
						})
						.onProgress((percentage) => {
							setProgress(percentage);
						})
						.onComplete((accessUrl) => {
							setIsUploading(false);
							setImagePreviewSrc(accessUrl);
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
				isUploading={isUploading}
				progress={progress}
				onChange={(file) => {
					const sourceUrl = URL.createObjectURL(file);

					setCropModalImageSrc(sourceUrl);
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
