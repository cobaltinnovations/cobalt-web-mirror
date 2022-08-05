import React, { FC, useState, useCallback, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import Fuse from 'fuse.js';

import { contentService, assessmentService, ContentListFormat, screeningService } from '@/lib/services';
import { Content, PersonalizationQuestion, PersonalizationChoice } from '@/lib/models';

import AsyncPage from '@/components/async-page';
import OnYourTimeItem from '@/components/on-your-time-item';
import PersonalizeRecommendationsModal from '@/components/personalize-recommendations-modal';
import DayContainer from '@/components/day-container';
import FilterPill from '@/components/filter-pill';
import FilterFormat from '@/components/filter-format';
import FilterLength from '@/components/filter-length';
import ActionSheet from '@/components/action-sheet';
import InputHelper from '@/components/input-helper';
import useAccount from '@/hooks/use-account';
import HeroContainer from '@/components/hero-container';

interface LocationState {
	skipAssessment?: boolean;
}

const OnYourTime: FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { subdomainInstitution } = useAccount();
	const [didInit, setDidInit] = useState(false);
	const [hasCompletedScreening, setHasCompletedScreening] = useState(false);

	const skipAssessment = !!(location.state as LocationState)?.skipAssessment;
	const [availableFormatFilters, setAvailableFormatFilters] = useState<ContentListFormat[]>([]);
	const [showFilterFormatModal, setShowFilterFormatModal] = useState(false);
	const [selectedFormatIds, setSelectedFormatIds] = useState<string[]>([]);

	const [showFilterLengthModal, setShowFilterLengthModal] = useState(false);
	const [selectedLength, setSelectedLength] = useState<string>('');

	const [showPersonalizeModal, setShowPersonalizeModal] = useState(
		(location?.state as { personalize: boolean })?.personalize ?? false
	);
	const [items, setItems] = useState<Content[]>([]);
	const [additionalItems, setAdditionalItems] = useState<Content[]>([]);
	const [searchTerm, setSearchTerm] = useState('');

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

	const fetchContent = useCallback(() => {
		return contentService
			.fetchContentList({
				format: selectedFormatIds.join(','),
				maxLengthMinutes: selectedLength,
			})
			.fetch()
			.then((response) => {
				setAvailableFormatFilters(response.formats);
				setItems(response.content);
				setAdditionalItems(response.additionalContent);
			});
	}, [selectedFormatIds, selectedLength]);

	const fetchData = useCallback(async () => {
		const requests = [fetchContent(), fetchFilters()];
		if (subdomainInstitution?.contentScreeningFlowId) {
			const fetchScreeningsRequest = screeningService.getScreeningSessionsByFlowId({
				screeningFlowId: subdomainInstitution.contentScreeningFlowId,
			});

			requests.push(
				fetchScreeningsRequest.fetch().then((r) => {
					setHasCompletedScreening(r.screeningSessions.some((session) => session.completed));
					setDidInit(true);
				})
			);
		}

		await Promise.all(requests);
	}, [fetchContent, fetchFilters, subdomainInstitution?.contentScreeningFlowId]);

	useEffect(() => {
		if (didInit && subdomainInstitution?.contentScreeningFlowId && !hasCompletedScreening && !skipAssessment) {
			navigate(`/screening-flows/${subdomainInstitution.contentScreeningFlowId}`, {
				replace: true,
			});
		}
	}, [didInit, hasCompletedScreening, navigate, skipAssessment, subdomainInstitution?.contentScreeningFlowId]);

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
					navigate('/on-your-time', {
						replace: true,
						state: {
							personalize: false,
						},
					});
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
					setSelectedFormatIds(selectedIds);
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
					setSelectedLength(length);
					setShowFilterLengthModal(false);
				}}
			/>

			<HeroContainer>
				<h2 className="mb-0 text-center">On Your Time</h2>
			</HeroContainer>

			<Container className="pt-5 mb-3">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<InputHelper
							type="search"
							label="Find On Your Time Items"
							value={searchTerm}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								setSearchTerm(event.target.value);
							}}
						/>
					</Col>
				</Row>
			</Container>

			<Container className="mb-3">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div className="text-center">
							<FilterPill
								active={hasFilters}
								onClick={() => {
									setShowPersonalizeModal(true);
								}}
							>
								Focus
							</FilterPill>
							<FilterPill
								active={selectedFormatIds.length > 0}
								onClick={() => {
									setShowFilterFormatModal(true);
								}}
							>
								Format
							</FilterPill>
							<FilterPill
								active={!!selectedLength}
								onClick={() => {
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
							<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
								{filteredList.length === 0 ? (
									<p className="text-center">
										There are no recommendations that match your selections.
									</p>
								) : (
									filteredList.map((item) => (
										<Link
											key={item.contentId}
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
									))
								)}
							</Col>{' '}
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
							<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
								{additionalFilteredList.map((item) => (
									<Link
										key={item.contentId}
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
								))}
							</Col>
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
