export type ContentSnippetTypeId = 'HTML' | 'TABLE';

export interface ContentSnippetTableColumn {
	key: string;
	label: string;
	align?: 'left' | 'right';
}

export interface ContentSnippetTableContent {
	columns: ContentSnippetTableColumn[];
	rows: Array<Record<string, string>>;
}

interface ContentSnippetBase {
	contentSnippetId?: string;
	institutionId?: string;
	contentSnippetKey: string;
	contentSnippetTypeId: ContentSnippetTypeId;
	title?: string;
	bodyHtml?: string;
	dismissButtonText?: string;
}

export interface HtmlContentSnippet extends ContentSnippetBase {
	contentSnippetTypeId: 'HTML';
	content?: undefined;
}

export interface TableContentSnippet extends ContentSnippetBase {
	contentSnippetTypeId: 'TABLE';
	content: ContentSnippetTableContent;
}

export type ContentSnippet = HtmlContentSnippet | TableContentSnippet;
