import React, { FC, PropsWithChildren, useRef } from 'react';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';

const useFileInputButtonStyles = createUseThemedStyles((theme) => ({
	fileInputButton: {
		margin: 0,
		...theme.fonts.large,
		cursor: 'pointer',
		borderRadius: 500,
		overflow: 'hidden',
		color: theme.colors.n0,
		padding: '10px 25px',
		position: 'relative',
		display: 'inline-block',
		...theme.fonts.headingBold,
		backgroundColor: theme.colors.p500,
		'&:hover': {
			backgroundColor: theme.colors.p300,
		},
		'&:active': {
			backgroundColor: theme.colors.p700,
		},
	},
	disabled: {
		color: theme.colors.n500,
		backgroundColor: theme.colors.n75,
		'&:hover': {
			cursor: 'not-allowed',
			color: theme.colors.n500,
			backgroundColor: theme.colors.n75,
		},
	},
	fileInput: {
		display: 'none',
	},
}));

interface FileInputButtonProps extends PropsWithChildren {
	accept: string;
	onChange(file: File): void;
	className?: string;
	disabled?: boolean;
}

const FileInputButton: FC<FileInputButtonProps> = ({ accept, onChange, className, disabled, children }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const classes = useFileInputButtonStyles();

	function handleFileClick() {
		if (inputRef.current) {
			inputRef.current.value = '';
		}
	}

	function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		if (disabled) {
			return;
		}

		const { files } = event.target;

		if (!files || (files && files.length > 1)) {
			return;
		}

		const file = files[0];

		onChange(file);
	}

	return (
		<label className={classNames(classes.fileInputButton, className, { [classes.disabled]: disabled })}>
			<input
				ref={inputRef}
				className={classes.fileInput}
				type="file"
				accept={accept}
				onChange={handleFileChange}
				onClick={handleFileClick}
				disabled={disabled}
			/>
			{children}
		</label>
	);
};

export default FileInputButton;
