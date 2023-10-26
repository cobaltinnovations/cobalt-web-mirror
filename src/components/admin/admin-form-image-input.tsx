import { v4 as uuidv4 } from 'uuid';
import useHandleError from '@/hooks/use-handle-error';
import { groupSessionsService, imageUploader } from '@/lib/services';
import React, { useState } from 'react';
import ImageUploadCard from '../image-upload-card';
import SessionCropModal from '../session-crop-modal';

export interface AdminFormImageInputProps {
	imageSrc: string;
	onSrcChange: (newSrc: string) => void;
}

export const AdminFormImageInput = ({ imageSrc, onSrcChange }: AdminFormImageInputProps) => {
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

					imageUploader(
						blob,
						groupSessionsService.getPresignedUploadUrl({
							contentType: blob.type,
							filename: `${uuidv4()}.jpg`,
						}).fetch
					)
						.onBeforeUpload((previewImageUrl) => {
							setImagePreviewSrc(previewImageUrl);
						})
						.onPresignedUploadObtained((accessUrl) => {
							setIsUploading(true);

							onSrcChange(accessUrl);
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
				imagePreview={imagePreviewSrc}
				isUploading={isUploading}
				progress={progress}
				onChange={(file) => {
					const sourceUrl = URL.createObjectURL(file);

					setCropModalImageSrc(sourceUrl);
					setIsCropModalOpen(true);
				}}
				onRemove={() => {
					onSrcChange('');
					setImagePreviewSrc('');
				}}
			/>
		</>
	);
};
