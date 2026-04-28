import { v4 as uuidv4 } from 'uuid';
import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from '@/components/svg-icon';
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

const customTitleStyles = [
	{ title: 'Title 1', value: '1' },
	{ title: 'Title 2', value: '2' },
	{ title: 'Title 3', value: '3' },
];

type WysiwygToolbarPreset = 'default' | 'page-builder';
type PageBuilderTextStyleId = 'TITLE_1' | 'TITLE_2' | 'TITLE_3' | 'BODY_SMALL' | 'BODY_NORMAL' | 'BODY_LARGE';

const pageBuilderTextStyles: Array<
	| {
			type: 'option';
			id: PageBuilderTextStyleId;
			title: string;
			header?: number;
			size?: string;
	  }
	| {
			type: 'divider';
	  }
> = [
	{ type: 'option', id: 'TITLE_1', title: 'Title 1', header: 1 },
	{ type: 'option', id: 'TITLE_2', title: 'Title 2', header: 2 },
	{ type: 'option', id: 'TITLE_3', title: 'Title 3', header: 3 },
	{ type: 'divider' },
	{ type: 'option', id: 'BODY_SMALL', title: 'Small', size: '14px' },
	{ type: 'option', id: 'BODY_NORMAL', title: 'Normal' },
	{ type: 'option', id: 'BODY_LARGE', title: 'Large', size: '18px' },
];

const pageBuilderTextStyleOptions = pageBuilderTextStyles.filter(
	(
		pageBuilderTextStyle
	): pageBuilderTextStyle is Extract<(typeof pageBuilderTextStyles)[number], { type: 'option' }> =>
		pageBuilderTextStyle.type === 'option'
);

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
			...customTitleStyles.reduce(
				(accumulator, currentValue) => ({
					...accumulator,
					[`& .ql-picker.ql-header .ql-picker-label[data-value="${currentValue.value}"]::before`]: {
						content: `"${currentValue.title}" !important`,
					},
				}),
				{} as Record<string, object>
			),
			...customTitleStyles.reduce(
				(accumulator, currentValue) => ({
					...accumulator,
					[`& .ql-picker.ql-header .ql-picker-item[data-value="${currentValue.value}"]::before`]: {
						content: `"${currentValue.title}" !important`,
					},
				}),
				{} as Record<string, object>
			),
			'& .ql-snow .ql-color-picker .ql-picker-label svg, & .ql-snow .ql-icon-picker .ql-picker-label svg': {
				display: 'flex',
			},
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
	pageBuilderToolbar: {
		display: 'flex',
		flexWrap: 'wrap',
		alignItems: 'center',
	},
	pageBuilderStyleControl: {
		position: 'relative',
		display: 'inline-flex',
	},
	pageBuilderStyleButton: {
		gap: 8,
		border: 0,
		height: 24,
		display: 'inline-flex',
		padding: '0 8px',
		minWidth: 112,
		cursor: 'pointer',
		fontSize: 14,
		alignItems: 'center',
		borderRadius: 3,
		justifyContent: 'space-between',
		backgroundColor: 'transparent',
		color: theme.colors.n700,
		'&:hover': {
			backgroundColor: theme.colors.n100,
		},
	},
	pageBuilderStyleMenu: {
		left: 0,
		top: 'calc(100% + 6px)',
		zIndex: 20,
		width: 180,
		padding: 6,
		position: 'absolute',
		borderRadius: 8,
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
		boxShadow: theme.elevation.e200,
	},
	pageBuilderStyleMenuItem: {
		width: '100% !important',
		border: 0,
		padding: '8px 10px',
		fontSize: 14,
		textAlign: 'left',
		float: 'none !important',
		display: 'block !important',
		borderRadius: 6,
		backgroundColor: 'transparent',
		color: theme.colors.n700,
		'&:hover': {
			backgroundColor: theme.colors.n50,
		},
		'&.active': {
			backgroundColor: theme.colors.n75,
			fontWeight: 600,
		},
	},
	pageBuilderStyleMenuDivider: {
		margin: '6px 0',
		borderTop: `1px solid ${theme.colors.n100}`,
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

const getPageBuilderTextStyleIdForFormats = (formats: Record<string, unknown>): PageBuilderTextStyleId => {
	if (formats.header === 1) {
		return 'TITLE_1';
	}

	if (formats.header === 2) {
		return 'TITLE_2';
	}

	if (formats.header === 3) {
		return 'TITLE_3';
	}

	if (formats.size === '14px') {
		return 'BODY_SMALL';
	}

	if (formats.size === '18px') {
		return 'BODY_LARGE';
	}

	return 'BODY_NORMAL';
};

const WysiwygBasic = React.forwardRef(
	(
		{ value, onChange, disabled, className, height, toolbarPreset = 'default' }: WysiwygProps,
		forwardedRef: ((instance: ReactQuill | null) => void) | RefObject<ReactQuill> | null | undefined
	) => {
		const classes = useWysiwygStyles({ height });
		const reactQuillId = useRef(`quill-${uuidv4()}`).current;
		const pageBuilderToolbarId = `${reactQuillId}-toolbar`;
		const quillRef = useRef<ReactQuill | null>(null);
		const pageBuilderStyleMenuRef = useRef<HTMLDivElement | null>(null);
		const [isPageBuilderStyleMenuOpen, setIsPageBuilderStyleMenuOpen] = useState(false);
		const [activePageBuilderTextStyleId, setActivePageBuilderTextStyleId] =
			useState<PageBuilderTextStyleId>('BODY_NORMAL');
		const modules = useMemo(
			() =>
				toolbarPreset === 'page-builder'
					? {
							toolbar: {
								container: `#${pageBuilderToolbarId}`,
							},
					  }
					: defaultQuillModules,
			[pageBuilderToolbarId, toolbarPreset]
		);
		const formats = toolbarPreset === 'page-builder' ? pageBuilderQuillFormats : defaultQuillFormats;
		const activePageBuilderTextStyle = pageBuilderTextStyleOptions.find(
			(pageBuilderTextStyleOption) => pageBuilderTextStyleOption.id === activePageBuilderTextStyleId
		);

		const setRefs = useCallback(
			(instance: ReactQuill | null) => {
				quillRef.current = instance;

				if (typeof forwardedRef === 'function') {
					forwardedRef(instance);
				} else if (forwardedRef) {
					forwardedRef.current = instance;
				}
			},
			[forwardedRef]
		);

		const syncActivePageBuilderTextStyle = useCallback(() => {
			if (toolbarPreset !== 'page-builder' || !quillRef.current) {
				return;
			}

			const editor = quillRef.current.getEditor();
			const selection = editor.getSelection();
			const selectionFormats = selection ? editor.getFormat(selection) : editor.getFormat();

			setActivePageBuilderTextStyleId(getPageBuilderTextStyleIdForFormats(selectionFormats));
		}, [toolbarPreset]);

		const applyPageBuilderTextStyle = useCallback((pageBuilderTextStyleId: PageBuilderTextStyleId) => {
			if (!quillRef.current) {
				return;
			}

			const selectedPageBuilderTextStyle = pageBuilderTextStyleOptions.find(
				(pageBuilderTextStyleOption) => pageBuilderTextStyleOption.id === pageBuilderTextStyleId
			);

			if (!selectedPageBuilderTextStyle) {
				return;
			}

			const editor = quillRef.current.getEditor();
			const selection = editor.getSelection(true);

			editor.focus();

			if (selectedPageBuilderTextStyle.header) {
				editor.formatLine(
					selection.index,
					selection.length,
					'header',
					selectedPageBuilderTextStyle.header,
					'user'
				);
				editor.format('size', false, 'user');
			} else {
				editor.formatLine(selection.index, selection.length, 'header', false, 'user');
				editor.format('size', selectedPageBuilderTextStyle.size ?? false, 'user');
			}

			setActivePageBuilderTextStyleId(pageBuilderTextStyleId);
			setIsPageBuilderStyleMenuOpen(false);
		}, []);

		useEffect(() => {
			if (toolbarPreset !== 'page-builder' || !isPageBuilderStyleMenuOpen) {
				return undefined;
			}

			const handleDocumentMouseDown = (event: MouseEvent) => {
				if (!pageBuilderStyleMenuRef.current?.contains(event.target as Node)) {
					setIsPageBuilderStyleMenuOpen(false);
				}
			};

			document.addEventListener('mousedown', handleDocumentMouseDown);

			return () => {
				document.removeEventListener('mousedown', handleDocumentMouseDown);
			};
		}, [isPageBuilderStyleMenuOpen, toolbarPreset]);

		useEffect(() => {
			syncActivePageBuilderTextStyle();
		}, [syncActivePageBuilderTextStyle, value]);

		return (
			<>
				{toolbarPreset === 'page-builder' && (
					<div
						id={pageBuilderToolbarId}
						className={classNames('ql-toolbar ql-snow', classes.pageBuilderToolbar)}
					>
						<span className="ql-formats">
							<div ref={pageBuilderStyleMenuRef} className={classes.pageBuilderStyleControl}>
								<button
									type="button"
									className={classes.pageBuilderStyleButton}
									onClick={() => {
										if (!disabled) {
											setIsPageBuilderStyleMenuOpen((previousValue) => !previousValue);
										}
									}}
									disabled={disabled}
								>
									<span>{activePageBuilderTextStyle?.title ?? 'Normal'}</span>
									<SvgIcon kit="far" icon="chevron-down" size={12} />
								</button>
								{isPageBuilderStyleMenuOpen && (
									<div className={classes.pageBuilderStyleMenu}>
										{pageBuilderTextStyles.map((pageBuilderTextStyle, index) =>
											pageBuilderTextStyle.type === 'divider' ? (
												<div
													key={`divider-${index}`}
													className={classes.pageBuilderStyleMenuDivider}
												/>
											) : (
												<button
													key={pageBuilderTextStyle.id}
													type="button"
													className={classNames(classes.pageBuilderStyleMenuItem, {
														active:
															pageBuilderTextStyle.id === activePageBuilderTextStyleId,
													})}
													onClick={() => {
														applyPageBuilderTextStyle(pageBuilderTextStyle.id);
													}}
												>
													{pageBuilderTextStyle.title}
												</button>
											)
										)}
									</div>
								)}
							</div>
						</span>
						<span className="ql-formats">
							<select className="ql-align" defaultValue="">
								<option value="" />
								<option value="center" />
								<option value="right" />
								<option value="justify" />
							</select>
						</span>
						<span className="ql-formats">
							<button type="button" className="ql-bold" />
							<button type="button" className="ql-italic" />
							<button type="button" className="ql-underline" />
							<button type="button" className="ql-strike" />
						</span>
						<span className="ql-formats">
							<button type="button" className="ql-list" value="ordered" />
							<button type="button" className="ql-list" value="bullet" />
						</span>
						<span className="ql-formats">
							<button type="button" className="ql-link" />
							<button type="button" className="ql-clean" />
						</span>
					</div>
				)}
				<ReactQuill
					id={reactQuillId}
					className={classNames(classes.quill, className)}
					ref={setRefs}
					theme="snow"
					value={value}
					onChange={(nextValue, delta, source, editor) => {
						onChange(nextValue, delta, source, editor);
						syncActivePageBuilderTextStyle();
					}}
					onChangeSelection={() => {
						syncActivePageBuilderTextStyle();
					}}
					modules={modules}
					formats={formats}
					readOnly={disabled}
					bounds={`#${reactQuillId}`}
				/>
			</>
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
