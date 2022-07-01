import React, { FC, useState, useCallback, useMemo } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import Fuse from 'fuse.js';

import useHeaderTitle from '@/hooks/use-header-title';

import { contentService, assessmentService, ContentListFormat } from '@/lib/services';
import { Content, PersonalizationQuestion, PersonalizationChoice } from '@/lib/models';

import AsyncPage from '@/components/async-page';
import OnYourTimeItem from '@/components/on-your-time-item';
import PersonalizeRecommendationsModal from '@/components/personalize-recommendations-modal';
import DayContainer from '@/components/day-container';
import FilterPill from '@/components/filter-pill';
import FilterFormat from '@/components/filter-format';
import FilterLength from '@/components/filter-length';
import ActionSheet from '@/components/action-sheet';

const OnYourTime: FC = () => {
	useHeaderTitle('On Your Time');
	const history = useHistory();
	const location = useLocation<{ personalize: boolean }>();

	const [availableFormatFilters, setAvailableFormatFilters] = useState<ContentListFormat[]>([]);
	const [showFilterFormatModal, setShowFilterFormatModal] = useState(false);
	const [selectedFormatIds, setSelectedFormatIds] = useState<string[]>([]);

	const [showFilterLengthModal, setShowFilterLengthModal] = useState(false);
	const [selectedLength, setSelectedLength] = useState<string>('');

	const [showPersonalizeModal, setShowPersonalizeModal] = useState(location?.state?.personalize ?? false);
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
		await Promise.all([fetchContent(), fetchFilters()]);
	}, [fetchContent, fetchFilters]);

	return (
		<AsyncPage fetchData={fetchData}>
			<ActionSheet
				show={false}
				onShow={() => {
					history.push('/cms/on-your-time/create');
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
					history.replace('/on-your-time', { personalize: false });
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

			<Container className="pt-5 mb-3">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Form.Control
							type="search"
							placeholder="Find On Your Time Items"
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
