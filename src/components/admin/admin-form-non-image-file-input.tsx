import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';
import useHandleError from '@/hooks/use-handle-error';
import { adminService, imageUploader } from '@/lib/services';
import React, { useState } from 'react';
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
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [fileInformation, setFileInformation] = useState<File>();

	return (
		<>
			<FileUploadCard
				accept="application/pdf, .pdf, application/vnd.ms-powerpoint, .ppt, application/vnd.openxmlformats-officedocument.presentationml.presentation, .pptx,"
				fileName={fileInformation?.name}
				fileSize={fileInformation?.size}
				imagePreview={previewSrc}
				isUploading={isUploading}
				progress={progress}
				onChange={(file) => {
					setFileInformation(file);

					imageUploader(
						file,
						adminService.getFilePresignedUpload({
							contentType: file.type,
							filename: file.name,
						}).fetch
					)
						.onPresignedUploadObtained((accessUrl) => {
							setIsUploading(true);
							onUploadedFileSrcChange(accessUrl);
						})
						.onProgress((percentage) => {
							setProgress(percentage);
						})
						.onComplete(() => {
							setIsUploading(false);
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
		</>
	);
};
