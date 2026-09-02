import { LoaderFunctionArgs } from 'react-router-dom';

import { contentSnippetsService, institutionReferrersService } from '@/lib/services';
import { InstitutionReferrer } from '@/lib/models';
import { loader } from './institution-referrer';

jest.mock('@/lib/services', () => ({
	contentSnippetsService: {
		getContentSnippetsByKeys: jest.fn(),
	},
	institutionReferrersService: {
		getReferrerByUrlName: jest.fn(),
	},
}));

jest.mock('@/pages/screening/screening.hooks', () => ({
	useScreeningFlow: jest.fn(),
}));

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: jest.fn(),
}));

jest.mock('@/jss/theme', () => ({
	createUseThemedStyles: () => () => ({}),
}));

jest.mock('@/components/content-snippet', () => ({
	contentSnippetFromLegacySharedContent: jest.fn(),
	ContentSnippetView: () => null,
}));

const mockGetReferrerByUrlName = institutionReferrersService.getReferrerByUrlName as jest.MockedFunction<
	typeof institutionReferrersService.getReferrerByUrlName
>;

it('redirects a provider-backed legacy referrer URL and preserves its query string', async () => {
	const institutionReferrer = {
		institutionReferrerId: 'team-clinic-referrer-id',
		providerId: 'team-clinic-provider-id',
		urlName: 'team-clinic-pilot',
	} as InstitutionReferrer;
	mockGetReferrerByUrlName.mockReturnValue({
		fetch: jest.fn().mockResolvedValue({ institutionReferrer }),
	} as ReturnType<typeof institutionReferrersService.getReferrerByUrlName>);

	let redirectResponse: Response | undefined;
	try {
		await loader({
			params: { urlName: 'team-clinic-pilot' },
			request: new Request(
				'https://example.test/referrals/team-clinic-pilot?featureId=THERAPY&institutionLocationId=UPHS'
			),
		} as LoaderFunctionArgs);
	} catch (error) {
		redirectResponse = error as Response;
	}

	expect(redirectResponse?.status).toBe(302);
	expect(redirectResponse?.headers.get('Location')).toBe(
		'/provider-info/team-clinic-provider-id?featureId=THERAPY&institutionLocationId=UPHS'
	);
	expect(contentSnippetsService.getContentSnippetsByKeys).not.toHaveBeenCalled();
});
