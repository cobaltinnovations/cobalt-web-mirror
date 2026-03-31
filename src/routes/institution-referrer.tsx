import React from 'react';
import { LoaderFunctionArgs, useLoaderData, useLocation } from 'react-router-dom';
import { Button, Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { contentSnippetsService, institutionReferrersService } from '@/lib/services';
import { ContentSnippet, InstitutionReferrer, InstitutionReferrerPageContentSnippetSection } from '@/lib/models';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { contentSnippetFromLegacySharedContent, ContentSnippetView } from '@/components/content-snippet';

const useStyles = createUseThemedStyles((theme) => ({
	pilotHeroSection: {
		backgroundColor: theme.colors.n75,
		padding: '96px 0',
		[mediaQueries.lg]: {
			padding: '72px 0',
		},
	},
	pilotContentSection: {
		padding: '48px 0',
		[mediaQueries.lg]: {
			padding: '40px 0',
		},
	},
	pilotCtaSection: {
		backgroundColor: theme.colors.n75,
		padding: '96px 0',
		[mediaQueries.lg]: {
			padding: '72px 0',
		},
	},
	pilotInner: {
		margin: '0 auto',
		maxWidth: 628,
		width: '100%',
	},
	pilotHeroTitle: {
		marginBottom: 20,
		textAlign: 'center',
	},
	pilotHeroDescription: {
		...theme.fonts.bodyNormal,
		color: theme.colors.n700,
		fontSize: 14,
		lineHeight: '20px',
		margin: '0 auto 24px',
		maxWidth: 460,
		textAlign: 'center',
	},
	pilotCtaTitle: {
		marginBottom: 24,
		textAlign: 'center',
	},
	pilotCtaDescription: {
		...theme.fonts.bodyNormal,
		color: theme.colors.n900,
		fontSize: 18,
		lineHeight: '28px',
		margin: '0 auto 32px',
		maxWidth: 520,
		textAlign: 'center',
		[mediaQueries.lg]: {
			fontSize: 16,
			lineHeight: '24px',
		},
	},
	pilotButtonRow: {
		display: 'flex',
		justifyContent: 'center',
	},
	pageContent: {
		color: theme.colors.n900,
		'& > .pageContentMarkup > section, & > section': {
			borderBottom: `1px solid ${theme.colors.n100}`,
			padding: '40px 0',
		},
		'& > .pageContentMarkup > section:first-child': {
			paddingTop: 0,
		},
		'& > section:first-child': {
			paddingTop: 0,
		},
		'& > section:last-child': {
			paddingBottom: 0,
		},
		'& h2, & h3': {
			...theme.fonts.headingBold,
			...theme.fonts.h3.default,
			color: theme.colors.n900,
			margin: '0 0 24px',
			[mediaQueries.lg]: {
				...theme.fonts.h4.default,
			},
		},
		'& h4': {
			...theme.fonts.headingBold,
			...theme.fonts.h4.default,
			color: theme.colors.n900,
			margin: '0 0 16px',
		},
		'& p': {
			...theme.fonts.bodyNormal,
			color: theme.colors.n900,
			fontSize: 16,
			lineHeight: '24px',
			margin: 0,
		},
		'& p + p': {
			marginTop: 16,
		},
		'& strong': {
			...theme.fonts.bodyBold,
		},
		'& ul': {
			margin: 0,
			paddingLeft: 24,
		},
		'& li': {
			...theme.fonts.bodyNormal,
			color: theme.colors.n900,
			fontSize: 16,
			lineHeight: '24px',
		},
		'& li + li': {
			marginTop: 12,
		},
		'& hr': {
			border: 0,
			borderTop: `1px solid ${theme.colors.n100}`,
			margin: '40px 0',
			opacity: 1,
		},
		'& .pageContentMarkup .referrer-table-wrap': {
			marginTop: 24,
			overflowX: 'auto',
			width: '100%',
		},
		'& .pageContentMarkup table': {
			backgroundColor: theme.colors.n0,
			border: `1px solid ${theme.colors.n100}`,
			borderCollapse: 'separate',
			borderRadius: 4,
			borderSpacing: 0,
			minWidth: '100%',
			overflow: 'hidden',
		},
		'& .pageContentMarkup thead th': {
			...theme.fonts.bodyNormal,
			backgroundColor: theme.colors.n50,
			borderBottom: `1px solid ${theme.colors.n100}`,
			color: theme.colors.n900,
			fontSize: 16,
			fontWeight: theme.fonts.bodyNormal.fontWeight,
			lineHeight: '24px',
			padding: 12,
			textAlign: 'left',
		},
		'& .pageContentMarkup tbody td': {
			...theme.fonts.bodyNormal,
			borderBottom: `1px solid ${theme.colors.n100}`,
			color: theme.colors.n900,
			fontSize: 16,
			lineHeight: '24px',
			padding: 12,
			verticalAlign: 'top',
		},
		'& .pageContentMarkup tbody tr:last-child td': {
			borderBottom: 0,
		},
		'& .pageContentMarkup th:last-child, & .pageContentMarkup td:last-child': {
			textAlign: 'right',
		},
	},
	sharedContentBlock: {
		marginTop: 24,
	},
}));

const buildContentSnippetsByKey = (contentSnippets: ContentSnippet[]) =>
	contentSnippets.reduce((accumulator, contentSnippet) => {
		accumulator[contentSnippet.contentSnippetKey] = contentSnippet;
		return accumulator;
	}, {} as Record<string, ContentSnippet>);

const normalizeContentSnippetSections = (
	institutionReferrer: InstitutionReferrer
): InstitutionReferrerPageContentSnippetSection[] => {
	const contentSnippetSections = institutionReferrer.metadata?.page?.contentSnippetSections;

	if (contentSnippetSections && contentSnippetSections.length > 0) {
		return contentSnippetSections;
	}

	return (institutionReferrer.metadata?.page?.sharedContentSections ?? []).map((section) => ({
		contentSnippetKey: section.contentKey,
		title: section.title,
		leadHtml: section.leadHtml,
	}));
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { urlName } = params;

	if (!urlName) {
		throw new Error('urlName is undefined.');
	}

	const { institutionReferrer } = await institutionReferrersService.getReferrerByUrlName(urlName).fetch();
	const contentSnippetSections = normalizeContentSnippetSections(institutionReferrer);
	const contentSnippetKeys = Array.from(
		new Set(contentSnippetSections.map((section) => section.contentSnippetKey).filter(Boolean))
	);
	let contentSnippetsByKey: Record<string, ContentSnippet> = {};

	if (contentSnippetKeys.length > 0) {
		const { contentSnippets } = await contentSnippetsService.getContentSnippetsByKeys(contentSnippetKeys).fetch();
		contentSnippetsByKey = buildContentSnippetsByKey(contentSnippets);
	}

	return {
		institutionReferrer,
		contentSnippetsByKey,
	};
};

export const Component = () => {
	const classes = useStyles();
	const { institutionReferrer, contentSnippetsByKey } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const location = useLocation();
	const { institution } = useAccount();
	const usesFullscreenScreening = Boolean(institutionReferrer.metadata?.screening?.fullscreen);
	const featuresScreeningFlow = useScreeningFlow({
		screeningFlowId: institutionReferrer.intakeScreeningFlowId,
		instantiateOnLoad: false,
		screeningQuestionPathPrefix: usesFullscreenScreening ? '/screening-questions-fullscreen' : undefined,
		screeningQuestionSearch: usesFullscreenScreening
			? new URLSearchParams({
					returnTo: location.pathname + location.search,
			  }).toString()
			: undefined,
	});
	const { startScreeningFlow, renderedCollectPhoneModal, renderedPreScreeningLoader } = featuresScreeningFlow;
	const contentSnippetSections = normalizeContentSnippetSections(institutionReferrer);

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	const handleStart = () => {
		startScreeningFlow();
	};

	return (
		<>
			{renderedCollectPhoneModal}

			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Referral</title>
			</Helmet>

			<Container fluid className={classes.pilotHeroSection}>
				<Container>
					<div className={classes.pilotInner}>
						<h1 className={classes.pilotHeroTitle}>{institutionReferrer.title}</h1>
						<p className={classes.pilotHeroDescription}>{institutionReferrer.description}</p>
						<div className={classes.pilotButtonRow}>
							<Button onClick={handleStart}>Get Started</Button>
						</div>
					</div>
				</Container>
			</Container>
			<Container className={classes.pilotContentSection}>
				<div className={`${classes.pilotInner} ${classes.pageContent}`}>
					<div
						className="pageContentMarkup"
						dangerouslySetInnerHTML={{ __html: institutionReferrer.pageContent ?? '' }}
					/>
					{contentSnippetSections.map((section) => {
						const legacyContent = institutionReferrer.metadata?.sharedContent?.[section.contentSnippetKey];
						const contentSnippet =
							contentSnippetsByKey[section.contentSnippetKey] ??
							(legacyContent
								? contentSnippetFromLegacySharedContent(section.contentSnippetKey, legacyContent)
								: null);

						if (!contentSnippet) {
							return null;
						}

						return (
							<section key={section.contentSnippetKey}>
								<h2>{section.title}</h2>
								{section.leadHtml && <div dangerouslySetInnerHTML={{ __html: section.leadHtml }} />}
								<ContentSnippetView
									className={classes.sharedContentBlock}
									contentSnippet={contentSnippet}
								/>
							</section>
						);
					})}
				</div>
			</Container>
			<Container fluid className={classes.pilotCtaSection}>
				<Container>
					<div className={classes.pilotInner}>
						<h2 className={classes.pilotCtaTitle}>{institutionReferrer.ctaTitle}</h2>
						<p className={classes.pilotCtaDescription}>{institutionReferrer.ctaDescription}</p>
						<div className={classes.pilotButtonRow}>
							<Button onClick={handleStart}>Get Started</Button>
						</div>
					</div>
				</Container>
			</Container>
		</>
	);
};
