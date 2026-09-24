import React, { useMemo } from 'react';

import InlineAlert from '@/components/inline-alert';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import { ScreeningQuestion } from '@/lib/models';

interface ScreeningQuestionFooterProps {
	footerText: string;
	metadata?: ScreeningQuestion['metadata'];
	renderQuestionHtml?: boolean;
}

const normalizeFooterCallout = (footerCallout: unknown) => {
	if (!footerCallout || typeof footerCallout !== 'object') {
		return;
	}

	const { displayTypeId, title } = footerCallout as Record<string, unknown>;
	if (displayTypeId !== 'PRIMARY' || typeof title !== 'string' || !title.trim()) {
		return;
	}

	return { title: title.trim() };
};

export const ScreeningQuestionFooter = ({ footerText, metadata, renderQuestionHtml }: ScreeningQuestionFooterProps) => {
	const footerCallout = useMemo(() => normalizeFooterCallout(metadata?.footerCallout), [metadata?.footerCallout]);
	const footerContent = renderQuestionHtml ? (
		<WysiwygDisplay className="wysiwyg-display" html={footerText} />
	) : (
		footerText
	);

	if (footerCallout) {
		return (
			<InlineAlert className="mb-6" variant="primary" title={footerCallout.title} description={footerContent} />
		);
	}

	return renderQuestionHtml ? (
		<WysiwygDisplay className="mb-6 wysiwyg-display" html={footerText} />
	) : (
		<p className="mb-6">{footerText}</p>
	);
};

export default ScreeningQuestionFooter;
