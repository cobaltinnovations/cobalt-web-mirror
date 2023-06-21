import React, { FC, useState, useCallback, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { contentService, assessmentService, ContentListFormat, callToActionService } from '@/lib/services';
import {
	Content,
	PersonalizationQuestion,
	PersonalizationChoice,
	CALL_TO_ACTION_DISPLAY_AREA_ID,
	CallToActionModel,
} from '@/lib/models';

import AsyncPage from '@/components/async-page';
import OnYourTimeSectionHeader from '@/components/on-your-time-section-header';
import OnYourTimeItem from '@/components/on-your-time-item';
import PersonalizeRecommendationsModal from '@/components/personalize-recommendations-modal';
import Loader from '@/components/loader';
import FilterPill from '@/components/filter-pill';
import FilterFormat from '@/components/filter-format';
import FilterLength from '@/components/filter-length';
import ActionSheet from '@/components/action-sheet';
import InputHelper from '@/components/input-helper';
import useAccount from '@/hooks/use-account';
import HeroContainer from '@/components/hero-container';
import useAnalytics from '@/hooks/use-analytics';
import { ContentAnalyticsEvent } from '@/contexts/analytics-context';
import { useScreeningFlow } from './screening/screening.hooks';
import CallToAction from '@/components/call-to-action';
import useDebouncedState from '@/hooks/use-debounced-state';

const OnYourTime: FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { trackEvent, mixpanel } = useAnalytics();
	const { institution } = useAccount();
	const { renderedCollectPhoneModal, didCheckScreeningSessions } = useScreeningFlow({
		screeningFlowId: institution?.contentScreeningFlowId,
	});

	const [searchParams, setSearchParams] = useSearchParams();
	const selectedFormatIds = searchParams.getAll('formatId');
	const joinedSelectedFormatIds = selectedFormatIds.join(',') ?? '';
	const selectedLength = searchParams.get('length') ?? '';
	const searchQuery = searchParams.get('searchQuery') ?? '';

	const [searchTerm, setSearchTerm] = useState(searchQuery);
	const [debouncedSearchValue] = useDebouncedState(searchTerm);

	const [callsToAction, setCallsToAction] = useState<CallToActionModel[]>([]);

	const [showFilterFormatModal, setShowFilterFormatModal] = useState(false);
	const [showFilterLengthModal, setShowFilterLengthModal] = useState(false);
	const [showPersonalizeModal, setShowPersonalizeModal] = useState(
		(location?.state as { personalize: boolean })?.personalize ?? false
	);

	const [questions, setQuestions] = useState<PersonalizationQuestion[]>([]);
	const [choices, setChoices] = useState<Record<string, PersonalizationChoice['selectedAnswers']>>({});
	const [availableFormatFilters, setAvailableFormatFilters] = useState<ContentListFormat[]>([]);

	const [items, setItems] = useState<Content[]>([]);
	const [additionalItems, setAdditionalItems] = useState<Content[]>([]);

	const hasFilters = useMemo(() => {
		return Object.values(choices).some((answers) => answers.length > 0);
	}, [choices]);

	const fetchCallsToAction = useCallback(async () => {
		const response = await callToActionService
			.getCallsToAction({ callToActionDisplayAreaId: CALL_TO_ACTION_DISPLAY_AREA_ID.CONTENT_LIST })
			.fetch();

		setCallsToAction(response.callsToAction);
	}, []);

	const fetchPersonalizationDetails = useCallback(() => {
		return assessmentService
			.getPersonalizationDetails()
			.fetch()
			.then((response) => {
				const selectedChoices = extractChoices(response.assessment.assessmentQuestions);

				setChoices(selectedChoices);
				setQuestions(response.assessment.assessmentQuestions);
			});
	}, []);

	const fetchFormatFilters = useCallback(async () => {
		const response = await contentService.fetchContentTypeLabels().fetch();
		setAvailableFormatFilters(response.contentTypeLabels);
	}, []);

	const fetchContent = useCallback(async () => {
		const response = await contentService
			.fetchContentList({
				...(joinedSelectedFormatIds ? { format: joinedSelectedFormatIds } : {}),
				...(debouncedSearchValue && { searchQuery: debouncedSearchValue }),
				...(selectedLength && { maxLengthMinutes: parseInt(selectedLength, 10) }),
			})
			.fetch();

		setItems(response.content);
		setAdditionalItems(response.additionalContent);
	}, [debouncedSearchValue, joinedSelectedFormatIds, selectedLength]);

	useEffect(() => {
		if (debouncedSearchValue) {
			searchParams.set('searchQuery', debouncedSearchValue);
		} else {
			searchParams.delete('searchQuery');
		}

		setSearchParams(searchParams, { replace: true });
	}, [debouncedSearchValue, searchParams, setSearchParams]);

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
			<Helmet>
				<title>Cobalt | On Your Time</title>
			</Helmet>

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

			<AsyncPage fetchData={fetchPersonalizationDetails}>
				<PersonalizeRecommendationsModal
					questions={questions}
					show={showPersonalizeModal}
					initialChoices={choices}
					onClose={(updatedChoices) => {
						setChoices(updatedChoices);
						fetchContent();
						navigate(
							{
								pathname: '/on-your-time',
								search: searchParams.toString(),
							},
							{
								replace: true,
								state: {
									personalize: false,
								},
							}
						);
						setShowPersonalizeModal(false);
					}}
				/>
			</AsyncPage>

			<AsyncPage fetchData={fetchFormatFilters}>
				<FilterFormat
					formats={availableFormatFilters}
					show={showFilterFormatModal}
					selectedFormatIds={selectedFormatIds}
					onHide={() => {
						setShowFilterFormatModal(false);
					}}
					onSave={(selectedIds) => {
						searchParams.delete('formatId');

						for (const formatId of selectedIds) {
							searchParams.append('formatId', formatId);
						}

						setSearchParams(searchParams);
						setShowFilterFormatModal(false);
					}}
				/>
			</AsyncPage>

			<FilterLength
				selectedLength={selectedLength}
				show={showFilterLengthModal}
				onHide={() => {
					setShowFilterLengthModal(false);
				}}
				onSave={(length) => {
					if (length) {
						searchParams.set('length', length);
					} else {
						searchParams.delete('length');
					}

					setSearchParams(searchParams);
					setShowFilterLengthModal(false);
				}}
			/>

			<HeroContainer className="mb-4 mb-lg-8">
				<h2 className="mb-0 text-center">On Your Time</h2>
			</HeroContainer>

			<Container>
				<AsyncPage fetchData={fetchCallsToAction}>
					{callsToAction.length > 0 && (
						<Row className="mb-4 mb-lg-8">
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
					)}
				</AsyncPage>

				<Row className="align-items-center">
					<Col lg={6} xl={5} className="mb-3 mb-lg-7">
						<InputHelper
							type="search"
							label="Find On Your Time Items"
							value={searchTerm}
							onChange={({ currentTarget }: React.ChangeEvent<HTMLInputElement>) => {
								setSearchTerm(currentTarget.value);
							}}
						/>
					</Col>
					<Col lg={6} xl={7} className="mb-4 mb-lg-7">
						<div className="text-start text-lg-end">
							<FilterPill
								active={hasFilters}
								onClick={() => {
									trackEvent(ContentAnalyticsEvent.clickFilterPill('Focus'));
									setShowPersonalizeModal(true);
								}}
							>
								Focus
							</FilterPill>
							<FilterPill
								active={selectedFormatIds.length > 0}
								onClick={() => {
									trackEvent(ContentAnalyticsEvent.clickFilterPill('Format'));
									setShowFilterFormatModal(true);
								}}
							>
								Format
							</FilterPill>
							<FilterPill
								active={!!selectedLength}
								onClick={() => {
									trackEvent(ContentAnalyticsEvent.clickFilterPill('Length'));
									setShowFilterLengthModal(true);
								}}
							>
								Length
							</FilterPill>
						</div>
					</Col>
				</Row>
			</Container>

			<AsyncPage fetchData={fetchContent}>
				{hasFilters && (
					<>
						<OnYourTimeSectionHeader className="mb-5">
							<p className="mb-0 fw-bold">Personalized Recommendations</p>
						</OnYourTimeSectionHeader>

						<Container>
							<Row>
								{items.length === 0 ? (
									<Col
										md={{ span: 10, offset: 1 }}
										lg={{ span: 8, offset: 2 }}
										xl={{ span: 6, offset: 3 }}
									>
										<p className="text-center">
											There are no recommendations that match your selections.
										</p>
									</Col>
								) : (
									items.map((item) => (
										<Col key={item.contentId} xs={6} md={4} lg={3}>
											<Link
												to={`/on-your-time/${item.contentId}`}
												className="d-block mb-3 text-decoration-none"
											>
												<OnYourTimeItem
													imageUrl={item.imageUrl}
													tag={item.newFlag ? 'NEW' : ''}
													title={item.title}
													author={item.author}
													type={item.contentTypeLabel}
													duration={item.duration}
												/>
											</Link>
										</Col>
									))
								)}
							</Row>
						</Container>
					</>
				)}

				{additionalItems.length > 0 && (
					<>
						{hasFilters && (
							<OnYourTimeSectionHeader className="my-5">
								<p className="mb-0 fw-bold">Recent and Popular</p>
							</OnYourTimeSectionHeader>
						)}

						<Container>
							<Row>
								{additionalItems.map((item) => (
									<Col key={item.contentId} xs={6} md={4} lg={3}>
										<Link
											to={`/on-your-time/${item.contentId}`}
											className="d-block mb-7 text-decoration-none"
										>
											<OnYourTimeItem
												imageUrl={item.imageUrl}
												tag={item.newFlag ? 'NEW' : ''}
												title={item.title}
												author={item.author}
												type={item.contentTypeLabel}
												duration={item.duration}
											/>
										</Link>
									</Col>
								))}
							</Row>
						</Container>
					</>
				)}
			</AsyncPage>
		</>
	);
};

export default OnYourTime;

function extractChoices(questions: PersonalizationQuestion[]) {
	return questions.reduce((sC, q) => {
		const nestedQuestionAnswers = q.answers.reduce((nested, answer) => {
			if (!answer.question) {
				return nested;
			}

			return { ...nested, [answer.question.questionId]: answer.question.selectedAnswers };
		}, {});

		return {
			...sC,
			...nestedQuestionAnswers,
			[q.questionId]: q.selectedAnswers,
		};
	}, {});
}
