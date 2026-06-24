import React, { FC, useCallback, useRef, useState } from 'react';
import classNames from 'classnames';

import SvgIcon from '@/components/svg-icon';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { PresignedUploadResponse } from '@/lib/models';
import { imageUploader } from '@/lib/services';

const maxFileSizeDescription = '200 MB';
const progressSize = 58;
const progressStrokeWidth = 4;
const progressRadius = (progressSize - progressStrokeWidth) / 2;
const progressCircumference = 2 * Math.PI * progressRadius;

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
	dropzone: {
		cursor: 'pointer',
		textAlign: 'center',
		color: theme.colors.n900,
	},
	dropzoneActive: {
		backgroundColor: theme.colors.n50,
		borderColor: theme.colors.p500,
	},
	uploadIcon: {
		marginBottom: 28,
		color: theme.colors.n500,
	},
	uploadInstruction: {
		margin: 0,
		fontSize: 16,
		lineHeight: 1.4,
	},
	uploadButton: {
		padding: 0,
		border: 0,
		color: theme.colors.p500,
		backgroundColor: 'transparent',
	},
	uploadRequirement: {
		margin: '8px 0 0',
		fontSize: 16,
		lineHeight: 1.4,
		color: theme.colors.n700,
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
	presignedUploadGetter(blob: Blob, name: string): () => Promise<PresignedUploadResponse>;
	onUploadComplete?(fileUploadId: string, accessUrl: string): void;
	className?: string;
	disabled?: boolean;
}

const ImageRepositoryUploader: FC<ImageRepositoryUploaderProps> = ({
	presignedUploadGetter,
	onUploadComplete,
	className,
	disabled = false,
}) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);

	const handleUploadFile = useCallback(
		(file: File) => {
			if (disabled || isUploading) {
				return;
			}

			if (!file.type.startsWith('image/')) {
				handleError({
					message: 'Please upload an image file.',
				});
				return;
			}

			let fileUploadId = '';

			setProgress(0);
			setIsUploading(true);

			imageUploader(file, presignedUploadGetter(file, file.name))
				.onBeforeUpload(() => {})
				.onPresignedUploadObtained(({ fileUploadResult }) => {
					fileUploadId = fileUploadResult.fileUploadId;
				})
				.onProgress((percentage) => {
					setProgress(percentage);
				})
				.onComplete((accessUrl) => {
					setProgress(100);
					setIsUploading(false);
					onUploadComplete?.(fileUploadId, accessUrl);
				})
				.onError((error) => {
					setProgress(0);
					setIsUploading(false);
					handleError(error);
				})
				.start();
		},
		[disabled, handleError, isUploading, onUploadComplete, presignedUploadGetter]
	);

	const handleInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];

			if (!file) {
				return;
			}

			handleUploadFile(file);
		},
		[handleUploadFile]
	);

	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			setIsDragging(false);

			const file = event.dataTransfer.files?.[0];

			if (!file) {
				return;
			}

			handleUploadFile(file);
		},
		[handleUploadFile]
	);

	const handleUploadButtonClick = useCallback(() => {
		if (inputRef.current) {
			inputRef.current.value = '';
			inputRef.current.click();
		}
	}, []);

	const progressOffset = progressCircumference - (progress / 100) * progressCircumference;

	if (isUploading) {
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
					<p className={classes.progressTitle}>Uploading File</p>
					<p className={classes.progressDescription}>This may take a couple minutes</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className={classNames(classes.uploaderSurface, classes.dropzone, className, {
				[classes.dropzoneActive]: isDragging,
			})}
			onDragEnter={(event) => {
				event.preventDefault();
				setIsDragging(true);
			}}
			onDragLeave={(event) => {
				event.preventDefault();
				setIsDragging(false);
			}}
			onDragOver={(event) => {
				event.preventDefault();
			}}
			onDrop={handleDrop}
		>
			<input ref={inputRef} className="d-none" type="file" accept="image/*" onChange={handleInputChange} />
			<div>
				<SvgIcon className={classes.uploadIcon} kit="far" icon="cloud-arrow-up" size={36} />
				<p className={classes.uploadInstruction}>
					Drop a file here or{' '}
					<button className={classes.uploadButton} type="button" onClick={handleUploadButtonClick}>
						click to upload
					</button>
				</p>
				<p className={classes.uploadRequirement}>
					File must be a SVG, PNG, JPG or GIF, no larger than {maxFileSizeDescription}
				</p>
			</div>
		</div>
	);
};

export default ImageRepositoryUploader;
