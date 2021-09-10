import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Row } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { goals } from '@/assets/pic/formTemplates/goalsTemplates';

interface GoalsStackRankProps {
	selectedGoals: string[];
	setSelectedGoals(rankedGoals: string[]): void;
}

export const GoalsStackRank: FC<GoalsStackRankProps> = (props) => {
	const { t } = useTranslation();
	const { selectedGoals, setSelectedGoals } = props;

	// DRAG & DROP FUNCTION
	function handleOnDragEnd(result: any) {
		const items = Array.from(selectedGoals);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);
		setSelectedGoals(items);
	}

	return (
		<>
			<Row className={'mx-auto mt-5 w-80'}>
				<DragDropContext onDragEnd={handleOnDragEnd}>
					<Droppable droppableId="listOfGoals">
						{(provided) => (
							<div id="listOfGoals" {...provided.droppableProps} ref={provided.innerRef}>
								{selectedGoals.map((goal, goalIndex) => {
									if (goal === 'other') {
										return null;
									}
									return (
										<Draggable key={goal} draggableId={goal} index={goalIndex}>
											{(provided) => (
												<div
													style={{ height: '3.25', width: '100%' }}
													className={'mt-5'}
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
												>
													<h3 className={'float-left mt-2'} style={{ height: '2.25em', width: '2em' }}>
														{goalIndex + 1}
													</h3>
													<div
														className={'float-left text-left bg-white text-primary p-3 font-weight-bold'}
														style={{
															width: '16em',
															height: '3.25em',
															borderRadius: '1.25em',
															fontSize: '1.125em',
															fontFamily: 'Nunito Sans',
														}}
													>
														{t(`goalSetting.optionLabels.${goal}`)}
													</div>
													<div
														className={'bg-white text-secondary float-right rounded-circle text-center ml-1 p-1 mt-2'}
														style={{ height: '2em', width: '2em' }}
													>
														⬆
													</div>
													<div
														className={'bg-white text-secondary float-right rounded-circle text-center p-1 ml-1 mt-2'}
														style={{
															height: '2em',
															width: '2em',
															fontSize: '1em',
														}}
													>
														⬇
													</div>
													<div style={{ height: '3em' }} />
												</div>
											)}
										</Draggable>
									);
								})}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</Row>
		</>
	);
};
