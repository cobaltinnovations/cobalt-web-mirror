import FileInputButton from '@/components/file-input-button';
import React, { FC } from 'react';
import { Button, Card } from 'react-bootstrap';

import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import SvgIcon from './svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
	uploadIcon: {
		width: 44,
		height: 44,
		display: 'flex',
		cursor: 'pointer',
		alignItems: 'center',
		justifyContent: 'center',
		'& svg path': {
			fill: theme.colors.n500,
		},
	},
	progressBar: {
		flex: 1,
		height: 13,
		marginRight: 8,
		borderRadius: 7,
		overflow: 'hidden',
		backgroundColor: theme.colors.n300,
	},
	progressBarFill: ({ percentage }: { percentage: number }) => ({
		height: '100%',
		width: `${percentage}%`,
		transition: '0.3s width',
		backgroundColor: theme.colors.s500,
	}),
}));

interface ImageUploadCardProps {
	imagePreview?: string;
	placeholderImagePreview?: string;
	allowRemovePlaceholderImage?: boolean;
	isUploading: boolean;
	onChange(file: File): void;
	onRemove(): void;
	progress?: number;
	className?: string;
	disabled?: boolean;
}

const ImageUploadCard: FC<ImageUploadCardProps> = ({
	imagePreview,
	placeholderImagePreview,
	allowRemovePlaceholderImage = false,
	isUploading,
	progress,
	onChange,
	onRemove,
	className,
	disabled = false,
}) => {
	const classes = useStyles({
		percentage: progress || 0,
	});
	const displayImagePreview = imagePreview || placeholderImagePreview;
	const hasUploadedImage = !!imagePreview;
	const hasRemovableImage = hasUploadedImage || (!!placeholderImagePreview && allowRemovePlaceholderImage);

	return (
		<Card bsPrefix="form-card" className={className}>
			<Card.Body className="no-header border-0">
				{displayImagePreview && <img src={displayImagePreview} className="mb-3 w-100 d-block" alt="" />}

				<div className="text-center">
					{!hasUploadedImage && (
						<FileInputButton accept="image/*" onChange={onChange} disabled={isUploading || disabled}>
							<Button
								as="div"
								className={classNames(classes.uploadIcon, 'mx-auto mb-2 p-0')}
								variant="light"
								size="sm"
							>
								<SvgIcon kit="far" icon="upload" size={20} />
							</Button>

							<p className="mb-2">
								<Button
									className="d-inline p-0 text-decoration-none"
									as="span"
									variant="link"
									size="sm"
								>
									select a file
								</Button>
							</p>

							<p className="mb-0 text-muted">
								File must be a SVG, PNG, JPG or GIF, no larger than 200 MB
							</p>
						</FileInputButton>
					)}

					{isUploading && (
						<div className={classes.progressBar}>
							<div className={classes.progressBarFill} />
						</div>
					)}

					{hasRemovableImage && (
						<Button size="sm" variant="danger" className="mt-2" onClick={onRemove} disabled={disabled}>
							Remove Image
						</Button>
					)}
				</div>
			</Card.Body>
		</Card>
	);
};

export default ImageUploadCard;
