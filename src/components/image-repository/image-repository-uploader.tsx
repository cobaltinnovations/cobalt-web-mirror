import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';

import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { PresignedUploadResponse } from '@/lib/models';
import { imageUploader } from '@/lib/services';

const progressSize = 58;
const progressStrokeWidth = 4;
const progressRadius = (progressSize - progressStrokeWidth) / 2;
const progressCircumference = 2 * Math.PI * progressRadius;

enum IMAGE_REPOSITORY_UPLOAD_STATUS {
	UPLOADING = 'UPLOADING',
	COMPLETE = 'COMPLETE',
	ERROR = 'ERROR',
}

const useStyles = createUseThemedStyles((theme) => ({
	uploaderSurface: {
		width: '100%',
		minHeight: 520,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		border: `1px dashed ${theme.colors.n300}`,
		backgroundColor: theme.colors.n0,
	},
	progressContent: {
		textAlign: 'center',
	},
	progressSvg: {
		display: 'block',
		margin: '0 auto 28px',
	},
	progressTrack: {
		stroke: theme.colors.n50,
	},
	progressIndicator: {
		stroke: theme.colors.p500,
		transition: 'stroke-dashoffset 0.2s ease',
	},
	progressLabel: {
		fill: theme.colors.n900,
		fontSize: 16,
		fontWeight: 600,
	},
	progressTitle: {
		margin: 0,
		fontSize: 16,
		lineHeight: 1.4,
		color: theme.colors.n900,
	},
	progressDescription: {
		margin: '8px 0 0',
		fontSize: 16,
		lineHeight: 1.4,
		color: theme.colors.n700,
	},
}));

interface ImageRepositoryUploaderProps {
	blob: Blob;
	fileName: string;
	presignedUploadGetter(blob: Blob, name: string): () => Promise<PresignedUploadResponse>;
	onUploadComplete?(fileUploadId: string, accessUrl: string, fileName: string): void;
	onUploadStatusChange?(isUploading: boolean): void;
	className?: string;
}

const ImageRepositoryUploader: FC<ImageRepositoryUploaderProps> = ({
	blob,
	fileName,
	presignedUploadGetter,
	onUploadComplete,
	onUploadStatusChange,
	className,
}) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [progress, setProgress] = useState(0);
	const [uploadStatus, setUploadStatus] = useState<IMAGE_REPOSITORY_UPLOAD_STATUS>(
		IMAGE_REPOSITORY_UPLOAD_STATUS.UPLOADING
	);

	useEffect(() => {
		let fileUploadId = '';
		let isMounted = true;

		setProgress(0);
		setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.UPLOADING);
		onUploadStatusChange?.(true);

		imageUploader(blob, presignedUploadGetter(blob, fileName))
			.onBeforeUpload(() => {})
			.onPresignedUploadObtained(({ fileUploadResult }) => {
				if (isMounted) {
					fileUploadId = fileUploadResult.fileUploadId;
				}
			})
			.onProgress((percentage) => {
				if (isMounted) {
					setProgress(percentage);
				}
			})
			.onComplete((accessUrl) => {
				if (isMounted) {
					setProgress(100);
					setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.COMPLETE);
					onUploadStatusChange?.(false);
					onUploadComplete?.(fileUploadId, accessUrl, fileName);
				}
			})
			.onError((error) => {
				if (isMounted) {
					setProgress(0);
					setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.ERROR);
					onUploadStatusChange?.(false);
					handleError(error);
				}
			})
			.start();

		return () => {
			isMounted = false;
			onUploadStatusChange?.(false);
		};
	}, [blob, fileName, handleError, onUploadComplete, onUploadStatusChange, presignedUploadGetter]);

	const progressOffset = progressCircumference - (progress / 100) * progressCircumference;
	const isComplete = uploadStatus === IMAGE_REPOSITORY_UPLOAD_STATUS.COMPLETE;
	const hasError = uploadStatus === IMAGE_REPOSITORY_UPLOAD_STATUS.ERROR;

	return (
		<div className={classNames(classes.uploaderSurface, className)}>
			<div className={classes.progressContent}>
				<svg
					className={classes.progressSvg}
					width={progressSize}
					height={progressSize}
					viewBox={`0 0 ${progressSize} ${progressSize}`}
				>
					<circle
						className={classes.progressTrack}
						cx={progressSize / 2}
						cy={progressSize / 2}
						r={progressRadius}
						fill="none"
						strokeWidth={progressStrokeWidth}
					/>
					<circle
						className={classes.progressIndicator}
						cx={progressSize / 2}
						cy={progressSize / 2}
						r={progressRadius}
						fill="none"
						strokeWidth={progressStrokeWidth}
						strokeDasharray={progressCircumference}
						strokeDashoffset={progressOffset}
						strokeLinecap="round"
						transform={`rotate(-90 ${progressSize / 2} ${progressSize / 2})`}
					/>
					<text
						className={classes.progressLabel}
						x="50%"
						y="50%"
						textAnchor="middle"
						dominantBaseline="central"
					>
						{progress}%
					</text>
				</svg>
				<p className={classes.progressTitle}>
					{isComplete && 'Upload Complete'}
					{hasError && 'Upload Failed'}
					{!isComplete && !hasError && 'Uploading File'}
				</p>
				<p className={classes.progressDescription}>
					{isComplete && 'Your image has been uploaded.'}
					{hasError && 'Please return to the library and try again.'}
					{!isComplete && !hasError && 'This may take a couple minutes'}
				</p>
			</div>
		</div>
	);
};

export default ImageRepositoryUploader;
