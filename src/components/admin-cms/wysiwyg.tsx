import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import 'quill/dist/quill.snow.css';
import { useQuill } from 'react-quilljs';
import Quill from 'quill';

interface WysiwygProps {
	className?: string;
	initialValue?: string;
	onChange(htmlContent: string): void;
	readOnly?: boolean;
}

const modules = {
	toolbar: [
		['bold', 'italic', 'underline', 'strike'],
		[{ list: 'ordered' }, { list: 'bullet' }],
		['link', 'clean'],
	],
};

const formats = ['bold', 'italic', 'underline', 'strike', 'list', 'bullet', 'link'];

export type WysiwygRef = { quill: Quill | undefined; quillRef: React.RefObject<HTMLDivElement> };

const Wysiwyg = forwardRef<WysiwygRef, WysiwygProps>(
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
					onChange(quill.root.innerHTML);
				};

				quill.on('text-change', handleChange);

				return () => {
					quill.off('text-change', handleChange);
				};
			}
		}, [onChange, quill]);

		useEffect(() => {
			if (quill && typeof initialValue === 'string') {
				quill.clipboard.dangerouslyPasteHTML(initialValue);
				setDidInit(true);
			}
		}, [quill, initialValue]);

		return <div style={{ display: didInit ? 'block' : 'none' }} className={className} ref={quillRef} />;
	}
);

export default Wysiwyg;
