import React, { FC, PropsWithChildren, useRef } from 'react';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';

const useFileInputButtonStyles = createUseThemedStyles(() => ({
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
		<label className={classNames(className)}>
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
