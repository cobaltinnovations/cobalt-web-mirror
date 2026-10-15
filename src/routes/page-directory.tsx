import React, { Suspense, useEffect } from 'react';
import {
	Await,
	Link,
	useAsyncError,
	useLoaderData,
	useNavigation,
	useRevalidator,
	useSearchParams,
} from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import HeroContainer from '@/components/hero-container';
import InputHelperSearch from '@/components/input-helper-search';
import Loader from '@/components/loader';
import NoData from '@/components/no-data';
import { TablePagination } from '@/components/table';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { usePageDirectorySearch } from '@/hooks/use-page-directory-search';
import { usePageDirectoryAnalytics } from '@/hooks/use-page-directory-analytics';
import { createUseThemedStyles } from '@/jss/theme';
import NoMatch from '@/pages/no-match';
import { GetPublishedPagesResponse } from '@/lib/services/pages-service';
import {
	getPageDirectoryConfiguration,
	getPageDirectoryRequestParameters,
	PAGE_DIRECTORY_PAGE_SIZE,
	withPageDirectoryPage,
} from '@/lib/utils/page-directory-utils';

export { loader } from './page-directory-loader';

const useStyles = createUseThemedStyles((theme) => ({
	card: {
		display: 'block',
		height: '100%',
		overflow: 'hidden',
		borderRadius: 8,
		backgroundColor: theme.colors.n0,
		textDecoration: 'none',
		color: theme.colors.n900,
		'&:hover': { color: theme.colors.p700 },
	},
	image: {
		display: 'block',
		width: '100%',
		aspectRatio: '16 / 9',
		objectFit: 'cover',
		backgroundColor: theme.colors.n100,
	},
}));

interface DirectoryLoaderData {
	configuration: ReturnType<typeof getPageDirectoryConfiguration>;
	pagesResponse: Promise<GetPublishedPagesResponse>;
}

const DirectoryError = () => {
	const revalidator = useRevalidator();
	const error = useAsyncError();
	const handleError = useHandleError();
	useEffect(() => handleError(error), [error, handleError]);
	return (
		<NoData
			title="Unable to load pages"
			actions={[{ title: 'Retry', variant: 'primary', onClick: () => revalidator.revalidate() }]}
		/>
	);
};

export const Component = () => {
	const { institution } = useAccount();
	return institution.pageDirectoriesEnabled === true ? <PageDirectory /> : <NoMatch />;
};

const PageDirectory = () => {
	const classes = useStyles();
	const { institution } = useAccount();
	const { configuration, pagesResponse } = useLoaderData() as DirectoryLoaderData;
	const trackPageClick = usePageDirectoryAnalytics(configuration.pageLocationId, pagesResponse);
	const [searchParams, setSearchParams] = useSearchParams();
	const navigation = useNavigation();
	const searchQuery = searchParams.get('searchQuery') ?? '';
	const { searchInput, changeSearch, clearSearch } = usePageDirectorySearch(configuration.pageLocationId);
	const pageNumber = Number(getPageDirectoryRequestParameters(configuration.pageLocationId, searchParams).pageNumber);

	return (
		<>
			<Helmet>
				<title>
					{institution.platformName ?? 'Cobalt'} | {configuration.title}
				</title>
			</Helmet>
			<HeroContainer className="bg-n75">
				<h1 className="mb-6 text-center">{configuration.title}</h1>
				<div className="mx-auto" style={{ maxWidth: 400 }}>
					<InputHelperSearch
						aria-label={configuration.searchPlaceholder}
						placeholder={configuration.searchPlaceholder}
						value={searchInput}
						onChange={({ currentTarget }) => changeSearch(currentTarget.value)}
						onClear={clearSearch}
					/>
				</div>
			</HeroContainer>
			<Container className="py-12">
				<Suspense fallback={<Loader />}>
					<Await resolve={pagesResponse} errorElement={<DirectoryError />}>
						{({ pages, totalCount }: GetPublishedPagesResponse) => (
							<>
								{pages.length === 0 ? (
									<NoData
										title={searchQuery ? 'No matching pages' : configuration.emptyTitle}
										actions={[]}
									/>
								) : (
									<Row>
										{pages.map((page) => (
											<Col key={page.pageId} xs={12} md={6} lg={4} className="mb-6">
												<Link
													to={page.relativeUrl}
													className={classes.card}
													onClick={() => trackPageClick(page.pageId)}
												>
													{page.imageUrl ? (
														<img
															className={classes.image}
															src={page.imageUrl}
															alt={page.imageAltText ?? ''}
														/>
													) : (
														<div className={classes.image} />
													)}
													<h3 className="m-0 p-4 fs-large">{page.name}</h3>
												</Link>
											</Col>
										))}
									</Row>
								)}
								{totalCount > PAGE_DIRECTORY_PAGE_SIZE && (
									<div className="d-flex justify-content-center mt-6">
										<TablePagination
											page={pageNumber}
											size={PAGE_DIRECTORY_PAGE_SIZE}
											total={totalCount}
											disabled={navigation.state !== 'idle'}
											onClick={(page) =>
												setSearchParams((previous) => withPageDirectoryPage(previous, page))
											}
										/>
									</div>
								)}
							</>
						)}
					</Await>
				</Suspense>
			</Container>
		</>
	);
};
