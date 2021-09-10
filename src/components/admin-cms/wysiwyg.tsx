import React from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface WysiwygProps {
	initialValue?: string;
	onBlur(editorHtml: string): void;
	readOnly: boolean;
}
interface WysiwygState {
	editorHtml: string;
	theme: string;
}
const modules = {
	toolbar: [['bold', 'italic', 'underline', 'strike'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']],
};
const formats = ['bold', 'italic', 'underline', 'strike', 'list', 'bullet'];

class Wysiwyg extends React.Component<WysiwygProps, WysiwygState> {
	constructor(props: WysiwygProps) {
		super(props);
		this.state = { editorHtml: props.initialValue || '', theme: 'snow' };
		this.handleChange = this.handleChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
	}
	handleChange(html: string) {
		this.setState({ editorHtml: html });
	}
	handleBlur() {
		this.props.onBlur(this.state.editorHtml);
	}
	render() {
		return (
			<ReactQuill
				theme={'snow'}
				defaultValue={this.props.initialValue || ''}
				onChange={this.handleChange}
				value={this.state.editorHtml}
				modules={modules}
				formats={formats}
				onBlur={this.handleBlur}
				readOnly={this.props.readOnly}
			/>
		);
	}
}

export default Wysiwyg;
