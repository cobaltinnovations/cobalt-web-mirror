import React, { FC, PropsWithChildren, useRef } from 'react';
import Color from 'color';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';

const useFileInputButtonStyles = createUseThemedStyles((theme) => ({
	fileInputButton: {
		margin: 0,
		...theme.fonts.m,
		cursor: 'pointer',
		borderRadius: 500,
		overflow: 'hidden',
		color: theme.colors.white,
		padding: '10px 25px',
		position: 'relative',
		display: 'inline-block',
		...theme.fonts.primaryBold,
		backgroundColor: theme.colors.primary,
		'&:hover': {
			backgroundColor: Color(theme.colors.primary).lighten(0.16).hex(),
		},
		'&:active': {
			backgroundColor: Color(theme.colors.primary).darken(0.16).hex(),
		},
	},
	disabled: {
		color: theme.colors.gray500,
		backgroundColor: theme.colors.gray200,
		'&:hover': {
			color: theme.colors.gray500,
			backgroundColor: theme.colors.gray200,
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
