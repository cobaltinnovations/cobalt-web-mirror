import React, { ReactNode, useEffect, useMemo } from 'react';

type HelmetProps = {
	children?: ReactNode;
};

const collectText = (node: ReactNode): string => {
	if (node === null || node === undefined || typeof node === 'boolean') {
		return '';
	}

	if (typeof node === 'string' || typeof node === 'number') {
		return String(node);
	}

	if (Array.isArray(node)) {
		return node.map(collectText).join('');
	}

	if (React.isValidElement(node)) {
		return collectText(node.props.children);
	}

	return '';
};

const extractTitle = (children: ReactNode): string | undefined => {
	let title: string | undefined;

	React.Children.forEach(children, (child) => {
		if (title !== undefined) {
			return;
		}

		if (!React.isValidElement(child)) {
			return;
		}

		if (child.type === 'title') {
			const text = collectText(child.props.children).trim();
			title = text.length > 0 ? text : '';
			return;
		}

		if (child.type === React.Fragment) {
			const nestedTitle = extractTitle(child.props.children);
			if (nestedTitle !== undefined) {
				title = nestedTitle;
			}
		}
	});

	return title;
};

export const Helmet = ({ children }: HelmetProps) => {
	const title = useMemo(() => extractTitle(children), [children]);

	useEffect(() => {
		if (title !== undefined) {
			document.title = title;
		}
	}, [title]);

	return null;
};

export default Helmet;
