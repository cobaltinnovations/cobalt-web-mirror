import React, { FC } from 'react';
import * as Quill from 'quill';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface WysiwygProps {
	className?: string;
	value: string;
	onChange(content: string, delta: Quill.Delta, source: Quill.Sources /* editor: UnprivilegedEditor */): void;
	onBlur?(previousRange: Quill.RangeStatic, source: Quill.Sources /* editor: UnprivilegedEditor */): void;
	readOnly: boolean;
}

const modules = {
	toolbar: [['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']],
};

const formats = ['bold', 'italic', 'underline', 'strike', 'list', 'bullet'];

const Wysiwyg: FC<WysiwygProps> = ({ value, onChange, onBlur, readOnly, className }) => {
	return (
		<ReactQuill
			className={className}
			theme={'snow'}
			onChange={onChange}
			value={value}
			modules={modules}
			formats={formats}
			onBlur={onBlur}
			readOnly={readOnly}
		/>
	);
};

export default Wysiwyg;
