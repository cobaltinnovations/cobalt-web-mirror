import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Col, Container, Form, Row } from 'react-bootstrap';

import {
	ACTION_LINK_TYPE_ID,
	CallToActionModel,
	CALL_TO_ACTION_DISPLAY_AREA_ID,
	ResourceLibraryContentModel,
	TagGroupModel,
	TagModel,
} from '@/lib/models';
import { callToActionService, resourceLibraryService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useAnalytics from '@/hooks/use-analytics';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { useScreeningFlow } from './screening/screening.hooks';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import Carousel from '@/components/carousel';
import ResourceLibraryCard from '@/components/resource-library-card';
import InputHelperSearch from '@/components/input-helper-search';
import Loader from '@/components/loader';
import ActionSheet from '@/components/action-sheet';
import CallToAction from '@/components/call-to-action';

const carouselConfig = {
	externalMonitor: {
		breakpoint: { max: 3000, min: 1201 },
		items: 2,
		partialVisibilityGutter: 60,
	},
	desktopExtraLarge: {
		breakpoint: { max: 1200, min: 993 },
		items: 2,
		partialVisibilityGutter: 40,
	},
	desktop: {
		breakpoint: { max: 992, min: 769 },
		items: 2,
		partialVisibilityGutter: 0,
	},
	tablet: {
		breakpoint: { max: 768, min: 575 },
		items: 2,
		partialVisibilityGutter: 0,
	},
	mobile: {
		breakpoint: { max: 575, min: 0 },
		items: 1,
		partialVisibilityGutter: 0,
	},
};

const ResourceLibrary = () => {
	const { mixpanel } = useAnalytics();
	const { institution } = useAccount();
	const { renderedCollectPhoneModal, didCheckScreeningSessions } = useScreeningFlow(
		institution?.contentScreeningFlowId
	);

	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = searchParams.get('searchQuery') ?? '';

	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);

	const [callsToAction, setCallsToAction] = useState<CallToActionModel[]>([]);
	const [searchInputValue, setSearchInputValue] = useState('');
	const [tagGroups, setTagGroups] = useState<TagGroupModel[]>([]);
	const [contents, setContents] = useState<ResourceLibraryContentModel[]>([]);
	const [findResultTotalCount, setFindResultTotalCount] = useState(0);
	const [findResultTotalCountDescription, setFindResultTotalCountDescription] = useState('');
	const [contentsByTagGroupId, setContentsByTagGroupId] = useState<Record<string, ResourceLibraryContentModel[]>>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, TagModel>>();

	useEffect(() => {
		if (!didCheckScreeningSessions) {
			return;
		}

		if (!hasTouchScreen) {
			searchInputRef.current?.focus();
		}
	}, [didCheckScreeningSessions, hasTouchScreen]);

	const fetchCallsToAction = useCallback(async () => {
		const response = await callToActionService
			.getCallsToAction({ callToActionDisplayAreaId: CALL_TO_ACTION_DISPLAY_AREA_ID.CONTENT_LIST })
			.fetch();

		setCallsToAction(response.callsToAction);
	}, []);

	const fetchData = useCallback(async () => {
		if (!didCheckScreeningSessions) {
			return;
		}

		if (searchQuery) {
			setSearchInputValue(searchQuery);

			const searchResponse = await resourceLibraryService
				.searchResourceLibrary({ searchQuery, pageNumber: 0, pageSize: 100 })
				.fetch();

			setContents(searchResponse.findResult.contents);
			setFindResultTotalCount(searchResponse.findResult.totalCount);
			setFindResultTotalCountDescription(searchResponse.findResult.totalCountDescription);
			setTagGroups([]);
			setContentsByTagGroupId(undefined);
			setTagsByTagId(searchResponse.tagsByTagId);

			return;
		}

		const response = await resourceLibraryService.getResourceLibrary().fetch();

		setContents([]);
		setFindResultTotalCount(0);
		setFindResultTotalCountDescription('');
		setTagGroups(response.tagGroups);
		setContentsByTagGroupId(response.contentsByTagGroupId);
		setTagsByTagId(response.tagsByTagId);
	}, [didCheckScreeningSessions, searchQuery]);

	const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (searchInputValue) {
			searchParams.set('searchQuery', searchInputValue);
		} else {
			searchParams.delete('searchQuery');
		}

		setSearchParams(searchParams, { replace: true });
	};

	const clearSearch = useCallback(() => {
		setSearchInputValue('');

		searchParams.delete('searchQuery');
		setSearchParams(searchParams, { replace: true });

		if (!hasTouchScreen) {
			searchInputRef.current?.focus();
		}
	}, [hasTouchScreen, searchParams, setSearchParams]);

	const handleKeydown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== 'Escape') {
				return;
			}

			clearSearch();
		},
		[clearSearch]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeydown, false);

		return () => {
			document.removeEventListener('keydown', handleKeydown, false);
		};
	}, [handleKeydown]);

	if (!didCheckScreeningSessions) {
		return (
			<>
				{renderedCollectPhoneModal}
				<Loader />
			</>
		);
	}

	return (
		<>
			<HeroContainer className="bg-n75">
				<h1 className="mb-4 text-center">Resource Library</h1>
				<p className="mb-6 text-center fs-large">
					A variety of self-directed digital resources, including articles, podcasts, apps, videos, worksheets
					and more, that help support general wellness and mental health education.
				</p>
				<Form onSubmit={handleSearchFormSubmit}>
					<InputHelperSearch
						ref={searchInputRef}
						placeholder="Search Resources"
						value={searchInputValue}
						onChange={({ currentTarget }) => {
							setSearchInputValue(currentTarget.value);
						}}
						onClear={clearSearch}
					/>
				</Form>
			</HeroContainer>

			<AsyncPage fetchData={fetchCallsToAction}>
				{callsToAction.length > 0 && (
					<Container className="pt-16">
						<Row>
							<Col>
								{callsToAction.map((cta, index) => {
									const isLast = callsToAction.length - 1 === index;
									return (
										<CallToAction
											key={`cta-${index}`}
											className={!isLast ? 'mb-4' : ''}
											callToAction={cta}
										/>
									);
								})}
							</Col>
						</Row>
					</Container>
				)}
			</AsyncPage>

			<AsyncPage fetchData={fetchData}>
				{institution?.userSubmittedContentEnabled && (
					<ActionSheet
						show={false}
						onShow={() => {
							mixpanel.track('Patient-Sourced Add Content Click', {});
							navigate('/cms/on-your-time/create');
						}}
						onHide={() => {
							return;
						}}
					/>
				)}

				<Container className="pt-5 pt-lg-16 pb-6 pb-lg-32">
					{tagGroups.map((tagGroup) => {
						return (
							<Row key={tagGroup.tagGroupId} className="mb-11 mb-lg-18">
								<Col lg={3} className="mb-10 mb-lg-0 pt-4 pb-2">
									<ResourceLibrarySubtopicCard
										className="h-100"
										colorId={tagGroup.colorId}
										title={tagGroup.name}
										description={tagGroup.description}
										to={`/resource-library/tag-groups/${tagGroup.urlName}`}
									/>
								</Col>
								<Col lg={9}>
									<Carousel
										responsive={carouselConfig}
										trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
										floatingButtonGroup
									>
										{contentsByTagGroupId?.[tagGroup.tagGroupId]?.map((content) => {
											return (
												<ResourceLibraryCard
													key={content.contentId}
													contentId={content.contentId}
													className="h-100"
													imageUrl={content.imageUrl}
													badgeTitle={content.newFlag ? 'New' : ''}
													title={content.title}
													author={content.author}
													description={content.description}
													tags={
														tagsByTagId
															? content.tagIds.map((tagId) => {
																	return tagsByTagId[tagId];
															  })
															: []
													}
													contentTypeId={content.contentTypeId}
													duration={content.durationInMinutesDescription}
												/>
											);
										})}
									</Carousel>
								</Col>
							</Row>
						);
					})}
					{searchQuery && (
						<>
							<Row className="mb-10">
								<h3 className="mb-0">
									{findResultTotalCountDescription} result{findResultTotalCount === 1 ? '' : 's'}
								</h3>
							</Row>
							<Row>
								{contents.map((content, resourceIndex) => {
									return (
										<Col key={resourceIndex} xs={6} lg={4} className="mb-8">
											<ResourceLibraryCard
												contentId={content.contentId}
												className="h-100"
												imageUrl={content.imageUrl}
												badgeTitle={content.newFlag ? 'New' : ''}
												title={content.title}
												author={content.author}
												description={content.description}
												tags={
													tagsByTagId
														? content.tagIds.map((tagId) => {
																return tagsByTagId[tagId];
														  })
														: []
												}
												contentTypeId={content.contentTypeId}
												duration={content.durationInMinutesDescription}
											/>
										</Col>
									);
								})}
							</Row>
						</>
					)}
				</Container>
			</AsyncPage>
		</>
	);
};

export default ResourceLibrary;
