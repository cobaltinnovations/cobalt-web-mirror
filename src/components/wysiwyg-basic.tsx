import { v4 as uuidv4 } from 'uuid';
import React, { RefObject, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import 'react-quill/dist/quill.snow.css';

interface UseWysiwygStylesProps {
	height?: number;
}

const customFontSizes = [
	{
		title: 'Small',
		fontSize: 14,
		lineHeight: 20,
	},
	{
		title: 'Normal',
		fontSize: 16,
		lineHeight: 24,
	},
	{
		title: 'Large',
		fontSize: 18,
		lineHeight: 28,
	},
];

const customHeaderStyles = [
	{ title: 'Title 1', value: '1' },
	{ title: 'Title 2', value: '2' },
	{ title: 'Title 3', value: '3' },
	{ title: 'Subtitle 1', value: '4' },
	{ title: 'Subtitle 2', value: '5' },
	{ title: 'Subtitle 3', value: '6' },
];

type WysiwygToolbarPreset = 'default' | 'page-builder';

const useWysiwygStyles = createUseThemedStyles((theme) => ({
	quill: {
		'& .ql-toolbar': {
			borderTopLeftRadius: 8,
			borderTopRightRadius: 8,
			borderColor: theme.colors.n100,
			backgroundColor: theme.colors.n75,
			...customFontSizes.reduce(
				(accumulator, currentValue) => ({
					...accumulator,
					[`& .ql-picker.ql-size .ql-picker-label[data-value="${currentValue.fontSize}px"]::before`]: {
						content: `"${currentValue.title}" !important`,
					},
				}),
				{} as Record<string, object>
			),
			...customFontSizes.reduce(
				(accumulator, currentValue) => ({
					...accumulator,
					[`& .ql-picker.ql-size .ql-picker-item[data-value="${currentValue.fontSize}px"]::before`]: {
						content: `"${currentValue.title}" !important`,
						fontSize: `${currentValue.fontSize}px !important`,
						lineHeight: `${currentValue.lineHeight}px !important`,
					},
				}),
				{} as Record<string, object>
			),
			'& .ql-picker.ql-header .ql-picker-label:not([data-value])::before': {
				content: '"Body" !important',
			},
			'& .ql-picker.ql-header .ql-picker-item:not([data-value])::before': {
				content: '"Body" !important',
			},
			...customHeaderStyles.reduce(
				(accumulator, currentValue) => ({
					...accumulator,
					[`& .ql-picker.ql-header .ql-picker-label[data-value="${currentValue.value}"]::before`]: {
						content: `"${currentValue.title}" !important`,
					},
				}),
				{} as Record<string, object>
			),
			...customHeaderStyles.reduce(
				(accumulator, currentValue) => ({
					...accumulator,
					[`& .ql-picker.ql-header .ql-picker-item[data-value="${currentValue.value}"]::before`]: {
						content: `"${currentValue.title}" !important`,
					},
				}),
				{} as Record<string, object>
			),
		},
		'& .ql-container': {
			borderBottomLeftRadius: 8,
			borderBottomRightRadius: 8,
			borderColor: theme.colors.n100,
			backgroundColor: theme.colors.n0,
			'& .ql-editor': {
				minHeight: ({ height }: UseWysiwygStylesProps) => height ?? 400,
			},
		},
	},
}));

interface WysiwygProps {
	value: string;
	onChange(value: string, delta: unknown, source: unknown, editor: ReactQuill.UnprivilegedEditor): void;
	disabled?: boolean;
	className?: string;
	height?: number;
	toolbarPreset?: WysiwygToolbarPreset;
}

const SizeStyle = Quill.import('attributors/style/size');
SizeStyle.whitelist = customFontSizes.map((cfs) => `${cfs.fontSize}px`);
Quill.register(SizeStyle, true);
const defaultQuillModules = {
	toolbar: [
		[{ size: customFontSizes.map((cfs) => `${cfs.fontSize}px`) }],
		['bold', 'italic', 'underline', 'strike'],
		[{ list: 'ordered' }, { list: 'bullet' }],
		['link', 'clean'],
	],
};
const pageBuilderQuillModules = {
	toolbar: [
		[{ header: ['', ...customHeaderStyles.map((customHeaderStyle) => customHeaderStyle.value)] }],
		[{ size: customFontSizes.map((cfs) => `${cfs.fontSize}px`) }],
		[{ align: [] }],
		['bold', 'italic', 'underline', 'strike'],
		[{ list: 'ordered' }, { list: 'bullet' }],
		['link', 'clean'],
	],
};
const defaultQuillFormats = ['size', 'bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link'];
const pageBuilderQuillFormats = [
	'header',
	'size',
	'align',
	'bold',
	'italic',
	'underline',
	'strike',
	'list',
	'bullet',
	'link',
];

const WysiwygBasic = React.forwardRef(
	(
		{ value, onChange, disabled, className, height, toolbarPreset = 'default' }: WysiwygProps,
		ref: ((instance: ReactQuill | null) => void) | RefObject<ReactQuill> | null | undefined
	) => {
		const classes = useWysiwygStyles({ height });
		const reactQuillId = useRef(`quill-${uuidv4()}`).current;
		const modules = toolbarPreset === 'page-builder' ? pageBuilderQuillModules : defaultQuillModules;
		const formats = toolbarPreset === 'page-builder' ? pageBuilderQuillFormats : defaultQuillFormats;

		return (
			<ReactQuill
				id={reactQuillId}
				className={classNames(classes.quill, className)}
				ref={ref}
				theme="snow"
				value={value}
				onChange={onChange}
				modules={modules}
				formats={formats}
				readOnly={disabled}
				bounds={`#${reactQuillId}`}
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
	onClick?: ({ linkUrl, linkText }: { linkUrl: string; linkText: string }) => void;
	className?: string;
}

export const WysiwygDisplay = ({ html, onClick, className }: WysiwygDisplayProps) => {
	const classes = useWysiwygDisplayStyles();

	const handleDangerousHtmlClick = (event: React.MouseEvent<HTMLParagraphElement, MouseEvent>) => {
		const { nativeEvent } = event;
		const clickedElement = nativeEvent.target;

		if (clickedElement instanceof HTMLElement) {
			const link = clickedElement.closest('a');

			if (link) {
				onClick?.({ linkUrl: link.href, linkText: link.textContent ?? '' });
			}
		}
	};

	return (
		<div
			className={classNames(classes.wysiwygDisplay, className)}
			dangerouslySetInnerHTML={{ __html: html ?? '' }}
			onClick={handleDangerousHtmlClick}
		/>
	);
};

export default WysiwygBasic;
