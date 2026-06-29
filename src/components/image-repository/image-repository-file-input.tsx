import classNames from 'classnames';
import React, { FC, useCallback, useRef, useState } from 'react';

import SvgIcon from '@/components/svg-icon';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { CobaltError } from '@/lib/http-client';

const maxFileSizeDescription = '200 MB';
const maxFileSizeInBytes = 200000000;

const useStyles = createUseThemedStyles((theme) => ({
	fileInputSurface: {
		width: '100%',
		minHeight: 520,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		border: `1px dashed ${theme.colors.n300}`,
		backgroundColor: theme.colors.n0,
		cursor: 'pointer',
		textAlign: 'center',
		color: theme.colors.n900,
	},
	fileInputSurfaceActive: {
		backgroundColor: theme.colors.n50,
		borderColor: theme.colors.p500,
	},
	uploadIcon: {
		marginBottom: 28,
		color: theme.colors.n500,
	},
}));

interface ImageRepositoryFileInputProps {
	onFileSelected(file: File): void;
	className?: string;
	disabled?: boolean;
}

const ImageRepositoryFileInput: FC<ImageRepositoryFileInputProps> = ({
	onFileSelected,
	className,
	disabled = false,
}) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelected = useCallback(
		(file: File) => {
			if (disabled) {
				return;
			}

			if (!file.type.startsWith('image/')) {
				handleError(CobaltError.fromValidationFailed('Please upload an image file.'));
				return;
			}

			if (file.size > maxFileSizeInBytes) {
				handleError(CobaltError.fromValidationFailed(`File size exceeds limit of ${maxFileSizeDescription}.`));
				return;
			}

			onFileSelected(file);
		},
		[disabled, handleError, onFileSelected]
	);

	const handleInputChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];

			if (!file) {
				return;
			}

			handleFileSelected(file);
		},
		[handleFileSelected]
	);

	const handleDrop = useCallback(
		(event: React.DragEvent<HTMLDivElement>) => {
			event.preventDefault();
			setIsDragging(false);

			const file = event.dataTransfer.files?.[0];

			if (!file) {
				return;
			}

			handleFileSelected(file);
		},
		[handleFileSelected]
	);

	const handleUploadButtonClick = useCallback(() => {
		if (disabled || !inputRef.current) {
			return;
		}

		inputRef.current.value = '';
		inputRef.current.click();
	}, [disabled]);

	return (
		<div
			className={classNames(classes.fileInputSurface, className, {
				[classes.fileInputSurfaceActive]: isDragging,
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
			onClick={handleUploadButtonClick}
		>
			<input ref={inputRef} className="d-none" type="file" accept="image/*" onChange={handleInputChange} />
			<div>
				<SvgIcon className={classes.uploadIcon} kit="far" icon="cloud-arrow-up" size={36} />
				<p className="mb-0">
					Drop a file here or <span className="text-primary">click to upload</span>
				</p>
				<p className="mt-2 mb-0 text-muted">
					File must be a SVG, PNG, JPG or GIF, no larger than {maxFileSizeDescription}
				</p>
			</div>
		</div>
	);
};

export default ImageRepositoryFileInput;
