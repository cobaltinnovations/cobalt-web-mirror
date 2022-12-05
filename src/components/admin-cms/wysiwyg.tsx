import React, { FC, useEffect } from 'react';

import 'quill/dist/quill.snow.css';
import { useQuill } from 'react-quilljs';

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

const Wysiwyg: FC<WysiwygProps> = ({ initialValue, onChange, readOnly = false, className, ...props }) => {
	const { quill, quillRef } = useQuill({
		theme: 'snow',
		modules,
		formats,
		readOnly,
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
		if (quill && initialValue) {
			quill.clipboard.dangerouslyPasteHTML(initialValue);
		}
	}, [quill, initialValue]);

	return <div className={className} ref={quillRef} />;
};

export default Wysiwyg;
