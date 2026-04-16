import { ContentSnippet } from '@/lib/models';
import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils/url-utils';

export const contentSnippetsService = {
	getContentSnippetsByKeys(contentSnippetKeys: string[]) {
		return httpSingleton.orchestrateRequest<{
			contentSnippets: ContentSnippet[];
		}>({
			method: 'get',
			url: buildQueryParamUrl('/content-snippets', {
				contentSnippetKey: contentSnippetKeys,
			}),
		});
	},
};
