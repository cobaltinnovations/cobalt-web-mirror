import React, { RefObject, useMemo } from 'react';
import ReactQuill from 'react-quill';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import 'react-quill/dist/quill.snow.css';

interface WysiwygProps {
	value: string;
	onChange(value: string, delta: unknown, source: unknown, editor: ReactQuill.UnprivilegedEditor): void;
	disabled?: boolean;
	className?: string;
}

const formats = ['size', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link'];

const WysiwygBasic = React.forwardRef(
	(
		{ value, onChange, disabled, className }: WysiwygProps,
		ref: ((instance: ReactQuill | null) => void) | RefObject<ReactQuill> | null | undefined
	) => {
		const quillModules = useMemo(
			() => ({
				toolbar: [
					[{ size: ['small', false, 'large', 'huge'] }],
					['bold', 'italic', 'underline', 'strike'],
					[{ list: 'ordered' }, { list: 'bullet' }],
					['link', 'clean'],
				],
			}),
			[]
		);

		return (
			<ReactQuill
				className={className}
				ref={ref}
				theme="snow"
				value={value}
				onChange={onChange}
				modules={quillModules}
				readOnly={disabled}
				formats={formats}
			/>
		);
	}
);

export const wysiwygIsValid = (
	ref: React.RefObject<ReactQuill> | null,
	options?: { shouldFocus: boolean; shouldScroll: boolean }
) => {
	if (!ref) {
		return false;
	}

	const editor = ref.current?.getEditor();

	if (!editor) {
		return false;
	}

	const userEnteredText = editor.getText();
	const textLength = userEnteredText.trim().length;

	if (textLength <= 0) {
		if (options?.shouldFocus) {
			ref.current?.editor?.focus();
		}

		if (options?.shouldScroll) {
			// react-quill TS types are incorrect here
			// `container` does exist on the `editor`
			// @ts-ignore
			editor.container.scrollIntoView({
				behavior: 'auto',
				block: 'center',
			});
		}

		return false;
	}

	return true;
};

const useWysiwygDisplayStyles = createUseThemedStyles((theme) => ({
	wysiwygDisplay: {
		'& p, & ol, & ul, & pre, & blockquote, & h1, & h2, & h3, & h4, & h5, & h6': {
			margin: 0,
			padding: 0,
			counterReset: 'list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9',
		},
		'& ol, & ul': {
			listStyle: 'none',
			paddingLeft: '1.5em',
			'& li': {
				paddingLeft: '1.5em',
				'&:before': {
					marginLeft: '-1.5em',
					marginRight: '0.3em',
					textAlign: 'right',
					display: 'inline-block',
					whiteSpace: 'nowrap',
					width: '1.2em',
				},
			},
		},
		'& ol li': {
			counterReset: 'list-1 list-2 list-3 list-4 list-5 list-6 list-7 list-8 list-9',
			counterIncrement: 'list-0',
		},
		'& ol li:before': {
			content: 'counter(list-0, decimal) ". "',
		},
		'& ul li:before': {
			content: '"\u2022"',
		},
		'& a': {
			...theme.fonts.bodyNormal,
		},
		'& .ql-size-small': {
			fontSize: '0.9rem',
		},
		'& .ql-size-large': {
			fontSize: '2.2rem',
		},
		'& .ql-size-huge': {
			fontSize: '3.5rem',
		},
	},
}));

interface WysiwygDisplayProps {
	html: string;
	className?: string;
}

export const WysiwygDisplay = ({ html, className }: WysiwygDisplayProps) => {
	const classes = useWysiwygDisplayStyles();

	return (
		<div
			className={classNames(classes.wysiwygDisplay, className)}
			dangerouslySetInnerHTML={{ __html: html ?? '' }}
		/>
	);
};

export default WysiwygBasic;
