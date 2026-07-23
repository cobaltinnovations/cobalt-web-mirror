import React from 'react';
import { render, screen } from '@testing-library/react';
import WysiwygBasic from './wysiwyg-basic';

const mockGetSelection = jest.fn();
const mockGetFormat = jest.fn();
const mockEditorFocus = jest.fn();
const mockFormatLine = jest.fn();
const mockFormat = jest.fn();

jest.mock('react-quill', () => {
	const mockReact = require('react');
	const editor = {
		getSelection: (...args: unknown[]) => mockGetSelection(...args),
		getFormat: (...args: unknown[]) => mockGetFormat(...args),
		focus: (...args: unknown[]) => mockEditorFocus(...args),
		formatLine: (...args: unknown[]) => mockFormatLine(...args),
		format: (...args: unknown[]) => mockFormat(...args),
	};
	const MockReactQuill = mockReact.forwardRef(
		(
			{
				onChangeSelection,
			}: {
				onChangeSelection?(): void;
			},
			ref: React.ForwardedRef<{ getEditor(): typeof editor }>
		) => {
			mockReact.useImperativeHandle(
				ref,
				() => ({
					getEditor: () => editor,
				}),
				[]
			);

			return (
				<button type="button" onClick={onChangeSelection}>
					Change selection
				</button>
			);
		}
	);

	return {
		__esModule: true,
		default: MockReactQuill,
		Quill: {
			import: jest.fn(() => ({ whitelist: [] })),
			register: jest.fn(),
		},
	};
});

jest.mock('@/jss/theme', () => ({
	createUseThemedStyles: () => () =>
		new Proxy(
			{},
			{
				get: (_target, property) => String(property),
			}
		),
}));

jest.mock('@/components/svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

beforeEach(() => {
	jest.clearAllMocks();
});

it('does not ask Quill for formats when the editor has no selection', () => {
	mockGetSelection.mockReturnValue(null);
	const { rerender } = render(<WysiwygBasic toolbarPreset="page-builder" value="First" onChange={jest.fn()} />);

	expect(mockGetSelection).toHaveBeenCalledTimes(1);
	expect(mockGetFormat).not.toHaveBeenCalled();
	expect(mockEditorFocus).not.toHaveBeenCalled();

	rerender(<WysiwygBasic toolbarPreset="page-builder" value="Second" onChange={jest.fn()} />);

	expect(mockGetSelection).toHaveBeenCalledTimes(2);
	expect(mockGetFormat).not.toHaveBeenCalled();
	expect(mockEditorFocus).not.toHaveBeenCalled();
});

it("reads formats from the current selection without using Quill's focus-producing fallback", () => {
	const selection = { index: 3, length: 0 };
	mockGetSelection.mockReturnValue(selection);
	mockGetFormat.mockReturnValue({ header: 2 });

	render(<WysiwygBasic toolbarPreset="page-builder" value="Text" onChange={jest.fn()} />);

	expect(mockGetFormat).toHaveBeenCalledTimes(1);
	expect(mockGetFormat).toHaveBeenCalledWith(selection);
	expect(mockEditorFocus).not.toHaveBeenCalled();
	expect(screen.getByRole('button', { name: 'Title 2' })).toBeInTheDocument();
});
