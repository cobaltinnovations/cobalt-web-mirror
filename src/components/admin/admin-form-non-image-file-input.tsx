import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';
import useHandleError from '@/hooks/use-handle-error';
import { adminService, imageUploader } from '@/lib/services';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FileUploadCard from '../file-upload-card';
import InputHelper from '../input-helper';

export interface AdminFormNonImageFileInputProps {
	previewSrc?: string;
	uploadedFileSrc: string;
	onUploadedFileSrcChange: (newFileSrc: string) => void;
}

export const AdminFormNonImageFileInput = ({
	previewSrc,
	uploadedFileSrc,
	onUploadedFileSrcChange,
}: AdminFormNonImageFileInputProps) => {
	const handleError = useHandleError();
	const [imagePreviewSrc, setImagePreviewSrc] = useState(previewSrc);
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	return (
		<>
			<FileUploadCard
				imagePreview={imagePreviewSrc}
				isUploading={isUploading}
				progress={progress}
				onChange={(file) => {
					imageUploader(
						file,
						adminService.getPreSignedUploadUrl({
							contentType: file.type,
							filename: `${uuidv4()}.jpg`,
						}).fetch
					)
						.onBeforeUpload((previewImageUrl) => {
							// TODO: Preview state
						})
						.onPresignedUploadObtained((accessUrl) => {
							setIsUploading(true);

							onUploadedFileSrcChange(accessUrl);
						})
						.onProgress((percentage) => {
							setProgress(percentage);
						})
						.onComplete((accessUrl) => {
							setIsUploading(false);
							// TODO: Preview state
							setImagePreviewSrc(accessUrl);
						})
						.onError((error: any) => {
							handleError(error);

							setIsUploading(false);
						})
						.start();
				}}
				onRemove={() => {
					onUploadedFileSrcChange('');
				}}
			/>

			<InputHelper className="mt-3" disabled label="Web address to content" value={uploadedFileSrc || 'www.'} />

			<div className="d-flex  mt-2">
				<InfoIcon className="me-2 text-p500 flex-shrink-0" width={20} height={20} />
				<p className="mb-0">Only one file may be uploaded</p>
			</div>

			<div className="d-flex  mt-2">
				<InfoIcon className="me-2 text-p500 flex-shrink-0" width={20} height={20} />
				<p className="mb-0">TODO: This currently uploads images</p>
			</div>
		</>
	);
};
