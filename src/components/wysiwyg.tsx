import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import 'quill/dist/quill.snow.css';
import { useQuill } from 'react-quilljs';
import Quill from 'quill';
import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';

interface WysiwygProps {
	className?: string;
	initialValue?: string;
	onChange(htmlContent: string): void;
	readOnly?: boolean;
}

const modules = {
	toolbar: [
		//	[{ size: ['small', false, 'large', 'huge'] }],
		['bold', 'italic', 'underline', 'strike'],
		[{ list: 'ordered' }, { list: 'bullet' }],
		['link', 'clean'],
	],
};

const formats = ['bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link'];

export type WysiwygRef = { quill: Quill | undefined; quillRef: React.RefObject<HTMLDivElement> };

export const Wysiwyg = forwardRef<WysiwygRef, WysiwygProps>(
	({ initialValue, onChange, readOnly = false, className, ...props }, ref) => {
		const [didInit, setDidInit] = useState(false);
		const { quill, quillRef } = useQuill({
			theme: 'snow',
			modules,
			formats,
			readOnly,
		});

		useImperativeHandle(ref, () => {
			return { quill, quillRef };
		});

		useEffect(() => {
			if (quill && onChange) {
				const handleChange = () => {
					if (!didInit) {
						return;
					}

					console.log(quill.root.innerHTML);

					onChange(quill.root.innerHTML);
				};

				quill.on('text-change', handleChange);

				return () => {
					quill.off('text-change', handleChange);
				};
			}
		}, [didInit, onChange, quill]);

		useEffect(() => {
			if (quill && typeof initialValue === 'string') {
				quill.clipboard.dangerouslyPasteHTML(initialValue);
				setDidInit(true);
			}
		}, [quill, initialValue]);

		return <div style={{ display: didInit ? 'block' : 'none' }} className={className} ref={quillRef} />;
	}
);

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

export default Wysiwyg;
