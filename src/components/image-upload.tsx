import React, { FC } from 'react';
import { Form, Button } from 'react-bootstrap';

import FileInputButton from '@/components/file-input-button';

import { createUseThemedStyles, useCobaltTheme } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	progressBar: {
		flex: 1,
		height: 13,
		marginRight: 8,
		borderRadius: 7,
		overflow: 'hidden',
		backgroundColor: theme.colors.gray300,
	},
	progressBarFill: ({ percentage }: { percentage: number }) => ({
		height: '100%',
		width: `${percentage}%`,
		transition: '0.3s width',
		backgroundColor: theme.colors.success,
	}),
}));

interface ImageUploadProps {
	imagePreview?: string;
	isUploading: boolean;
	onChange(file: any): void;
	onRemove(): void;
	progress?: number;
	className?: string;
	disabled?: boolean;
}

const ImageUpload: FC<ImageUploadProps> = ({
	imagePreview,
	isUploading,
	progress,
	onChange,
	onRemove,
	className,
	disabled = false,
}) => {
	const { fonts } = useCobaltTheme();
	const classes = useStyles({
		percentage: progress || 0,
	});

	return (
		<Form.Group className={className}>
			<Form.Label className="mb-2" style={{ ...fonts.xs }}>
				Lead Image
			</Form.Label>
			{!imagePreview && (
				<p className="mb-5">
					If you choose not to upload an image, a random image will be assigned to your post. Images that are
					free for use can be found at{' '}
					<a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer">
						unsplash.com
					</a>
				</p>
			)}
			{imagePreview && <img src={imagePreview} className="mb-3 w-100 d-block" alt="" />}
			<div className={`d-flex mb-3 ${imagePreview ? 'justify-content-end align-items-center' : ''}`}>
				{isUploading && (
					<div className={classes.progressBar}>
						<div className={classes.progressBarFill} />
					</div>
				)}
				<FileInputButton accept="image/*" onChange={onChange} disabled={isUploading || disabled}>
					{isUploading ? 'uploading...' : imagePreview ? 'upload new image' : 'upload image'}
				</FileInputButton>
				{imagePreview && (
					<Button size="sm" variant="danger" className="ml-2" onClick={onRemove} disabled={disabled}>
						remove image
					</Button>
				)}
			</div>
			{!imagePreview && (
				<>
					<p className="font-size-xxxs text-uppercase text-muted">Tips for choosing a good image</p>
					<ul className="mb-0 pl-4 font-size-xxs">
						<li>Is a minimum size of 800 x 450 px</li>
						<li>Features a warm, bold color palette</li>
						<li>
							Subject is either: 1) a headshot, 2) a calming piece of art, 3) an abstract image of nature
						</li>
						<li>Avoids scenes that depict low mood, anxiety, or other distress as well as clichés</li>
					</ul>
				</>
			)}
		</Form.Group>
	);
};

export default ImageUpload;
