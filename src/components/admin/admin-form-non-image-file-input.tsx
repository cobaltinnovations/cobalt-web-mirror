import useHandleError from '@/hooks/use-handle-error';
import { adminService, imageUploader } from '@/lib/services';
import React, { useState } from 'react';
import FileUploadCard from '../file-upload-card';
import InputHelper from '../input-helper';
import SvgIcon from '../svg-icon';

export interface AdminFormNonImageFileInputProps {
	defaultFileName?: string;
	defaultFileSize?: number;
	previewSrc?: string;
	uploadedFileSrc: string;
	onUploadedFileChange: (newfileUploadId: string, newFileSrc: string) => void;
}

export const AdminFormNonImageFileInput = ({
	defaultFileName,
	defaultFileSize,
	previewSrc,
	uploadedFileSrc,
	onUploadedFileChange,
}: AdminFormNonImageFileInputProps) => {
	const handleError = useHandleError();
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [fileInformation, setFileInformation] = useState<File>();

	return (
		<>
			<FileUploadCard
				accept="application/pdf, .pdf, application/vnd.ms-powerpoint, .ppt, application/vnd.openxmlformats-officedocument.presentationml.presentation, .pptx,"
				fileName={fileInformation?.name ?? defaultFileName}
				fileSize={fileInformation?.size ?? defaultFileSize}
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
							filesize: file.size,
						}).fetch
					)
						.onPresignedUploadObtained(({ fileUploadResult }) => {
							setIsUploading(true);
							onUploadedFileChange(
								fileUploadResult.fileUploadId,
								fileUploadResult.presignedUpload.accessUrl
							);
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
					onUploadedFileChange('', '');
				}}
			/>

			<InputHelper className="mt-3" disabled label="Web address to content" value={uploadedFileSrc || 'www.'} />

			<div className="d-flex  mt-2">
				<SvgIcon kit="fas" icon="circle-info" size={16} className="me-2 text-n500 flex-shrink-0" />
				<p className="mb-0">Only one file may be uploaded</p>
			</div>
		</>
	);
};
