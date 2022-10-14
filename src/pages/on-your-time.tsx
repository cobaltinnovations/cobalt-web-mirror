import React, { FC, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Fuse from 'fuse.js';

import { contentService, assessmentService, ContentListFormat, callToActionService } from '@/lib/services';
import {
	Content,
	PersonalizationQuestion,
	PersonalizationChoice,
	CALL_TO_ACTION_DISPLAY_AREA_ID,
	CallToActionModel,
} from '@/lib/models';
import AsyncPage from '@/components/async-page';
import OnYourTimeItem from '@/components/on-your-time-item';
import PersonalizeRecommendationsModal from '@/components/personalize-recommendations-modal';
import DayContainer from '@/components/day-container';
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

const OnYourTime: FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { trackEvent } = useAnalytics();
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedFormatIds = searchParams.getAll('formatId');
	const selectedLength = searchParams.get('length') ?? '';
	const searchTerm = searchParams.get('q') ?? '';
	const { institution } = useAccount();
	const { renderedCollectPhoneModal, didCheckScreeningSessions } = useScreeningFlow(
		institution?.contentScreeningFlowId
	);

	const [callsToAction, setCallsToAction] = useState<CallToActionModel[]>([]);
	const [availableFormatFilters, setAvailableFormatFilters] = useState<ContentListFormat[]>([]);
	const [showFilterFormatModal, setShowFilterFormatModal] = useState(false);
	const [showFilterLengthModal, setShowFilterLengthModal] = useState(false);
	const [showPersonalizeModal, setShowPersonalizeModal] = useState(
		(location?.state as { personalize: boolean })?.personalize ?? false
	);
	const [items, setItems] = useState<Content[]>([]);
	const [additionalItems, setAdditionalItems] = useState<Content[]>([]);

	const [questions, setQuestions] = useState<PersonalizationQuestion[]>([]);
	const [choices, setChoices] = useState<Record<string, PersonalizationChoice['selectedAnswers']>>({});

	const hasFilters = useMemo(() => {
		return Object.values(choices).some((answers) => answers.length > 0);
	}, [choices]);

	const fuse = useMemo(() => {
		return new Fuse(items, {
			threshold: 0.2,
			keys: ['title', 'description', 'author'],
		});
	}, [items]);

	const filteredList: Content[] = useMemo(() => {
		return searchTerm ? fuse.search(searchTerm).map((r) => r.item) : items;
	}, [fuse, items, searchTerm]);

	const additionalFuse = useMemo(() => {
		return new Fuse(additionalItems, {
			threshold: 0.2,
			keys: ['title', 'description', 'author'],
		});
	}, [additionalItems]);

	const additionalFilteredList: Content[] = useMemo(() => {
		return searchTerm ? additionalFuse.search(searchTerm).map((r) => r.item) : additionalItems;
	}, [additionalFuse, additionalItems, searchTerm]);

	const fetchCallsToAction = useCallback(async () => {
		const response = await callToActionService
			.getCallsToAction({ callToActionDisplayAreaId: CALL_TO_ACTION_DISPLAY_AREA_ID.CONTENT_LIST })
			.fetch();

		setCallsToAction(response.callsToAction);
	}, []);

	const fetchFilters = useCallback(() => {
		return assessmentService
			.getPersonalizationDetails()
			.fetch()
			.then((response) => {
				const selectedChoices = extractChoices(response.assessment.assessmentQuestions);

				setChoices(selectedChoices);
				setQuestions(response.assessment.assessmentQuestions);
			});
	}, []);

	const format = selectedFormatIds.join(',');
	const fetchContent = useCallback(() => {
		return contentService
			.fetchContentList({
				format,
				...(selectedLength && { maxLengthMinutes: parseInt(selectedLength, 10) }),
			})
			.fetch()
			.then((response) => {
				setAvailableFormatFilters(response.formats);
				setItems(response.content);
				setAdditionalItems(response.additionalContent);
			});
	}, [format, selectedLength]);

	const fetchData = useCallback(async () => {
		return Promise.all([fetchContent(), fetchFilters()]);
	}, [fetchContent, fetchFilters]);

	if (!didCheckScreeningSessions) {
		return (
			<>
				{renderedCollectPhoneModal}
				<Loader />
			</>
		);
	}

	return (
		<AsyncPage fetchData={fetchData}>
			<ActionSheet
				show={false}
				onShow={() => {
					navigate('/cms/on-your-time/create');
				}}
				onHide={() => {
					return;
				}}
			/>

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

			<FilterLength
				selectedLength={selectedLength}
				show={showFilterLengthModal}
				onHide={() => {
					setShowFilterLengthModal(false);
				}}
				onSave={(length) => {
					searchParams.set('length', length);

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
							label="Find On Your Time items"
							value={searchTerm}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								searchParams.set('q', event.target.value);
								setSearchParams(searchParams, { replace: true });
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

			{hasFilters && (
				<>
					<DayContainer className="mb-5">
						<p className="mb-0 fw-bold">Personalized Recommendations</p>
					</DayContainer>

					<Container>
						<Row>
							{filteredList.length === 0 ? (
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
								filteredList.map((item) => (
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

			{additionalFilteredList.length > 0 && (
				<>
					{hasFilters && (
						<DayContainer className="my-5">
							<p className="mb-0 fw-bold">Recent and Popular</p>
						</DayContainer>
					)}

					<Container>
						<Row>
							{additionalFilteredList.map((item) => (
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
