import classNames from 'classnames';
import React, { FC } from 'react';
import { Button } from 'react-bootstrap';

import { createUseThemedStyles } from '@/jss/theme';

const progressSize = 58;
const progressStrokeWidth = 4;
const progressRadius = (progressSize - progressStrokeWidth) / 2;
const progressCircumference = 2 * Math.PI * progressRadius;

export enum IMAGE_REPOSITORY_UPLOAD_STATUS {
	PREPARING = 'PREPARING',
	UPLOADING = 'UPLOADING',
	COMPLETE = 'COMPLETE',
	ERROR = 'ERROR',
}

const useStyles = createUseThemedStyles((theme) => ({
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
	cancelButton: {
		marginTop: 24,
		borderColor: theme.colors.d500,
		color: theme.colors.d500,
		fontWeight: 700,
		'&:hover, &:focus': {
			borderColor: theme.colors.d500,
			backgroundColor: theme.colors.d500,
			color: theme.colors.n0,
		},
	},
}));

interface ImageRepositoryUploaderProps {
	progress: number;
	uploadStatus: IMAGE_REPOSITORY_UPLOAD_STATUS;
	onCancelUpload?(): void;
	className?: string;
}

const ImageRepositoryUploader: FC<ImageRepositoryUploaderProps> = ({
	progress,
	uploadStatus,
	onCancelUpload,
	className,
}) => {
	const classes = useStyles();
	const progressOffset = progressCircumference - (progress / 100) * progressCircumference;
	const isComplete = uploadStatus === IMAGE_REPOSITORY_UPLOAD_STATUS.COMPLETE;
	const hasError = uploadStatus === IMAGE_REPOSITORY_UPLOAD_STATUS.ERROR;

	return (
		<div className={classNames(classes.progressContent, className)}>
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
				<text className={classes.progressLabel} x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
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
			{onCancelUpload && !isComplete && !hasError && (
				<Button className={classes.cancelButton} variant="outline-danger" onClick={onCancelUpload}>
					Cancel Upload
				</Button>
			)}
		</div>
	);
};

export default ImageRepositoryUploader;
