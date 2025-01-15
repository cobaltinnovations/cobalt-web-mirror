import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import classNames from 'classnames';
import { PageSectionModel } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme/create-use-themed-styles';
import InputHelper from '@/components/input-helper';
import NoData from '@/components/no-data';
import { RowSelectionForm } from '@/components/admin/pages/row-selection-form';

const PAGE_SECTION_SHELF_HEADER_HEIGHT = 57;
const PAGE_TRANSITION_DURATION_MS = 600;

const useStyles = createUseThemedStyles((theme) => ({
	page: {
		height: '100%',
		position: 'relative',
	},
	header: {
		display: 'flex',
		padding: '0 24px',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: PAGE_SECTION_SHELF_HEADER_HEIGHT,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	body: {
		padding: 24,
		overflowY: 'auto',
		height: `calc(100% - ${PAGE_SECTION_SHELF_HEADER_HEIGHT}px)`,
	},
	'@global': {
		'.right-to-left-enter, .right-to-left-enter-active, .right-to-left-exit, .right-to-left-exit-active, .left-to-right-enter, .left-to-right-enter-active, .left-to-right-exit, .left-to-right-exit-active':
			{
				top: 0,
				left: 0,
				right: 0,
				position: 'absolute',
			},
		'.right-to-left-enter': {
			opacity: 0,
			transform: 'translateX(100%)',
		},
		'.right-to-left-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.right-to-left-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.right-to-left-exit-active': {
			opacity: 0,
			transform: 'translateX(-100%)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.left-to-right-enter ': {
			opacity: 0,
			transform: 'translateX(-100%)',
		},
		'.left-to-right-enter-active': {
			opacity: 1,
			transform: 'translateX(0)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
		'.left-to-right-exit': {
			opacity: 1,
			transform: 'translateX(0)',
		},
		'.left-to-right-exit-active': {
			opacity: 0,
			transform: 'translateX(100%)',
			transition: `all ${PAGE_TRANSITION_DURATION_MS}ms cubic-bezier(.33,1,.33,1)`,
		},
	},
}));

interface SectionShelfProps {
	pageSection: PageSectionModel;
	onEdit(): void;
	onDelete(): void;
	onClose(): void;
}

enum PAGE_STATES {
	SECTION_SETTINGS = 'SECTION_SETTINGS',
	ADD_ROW = 'ADD_ROW',
	ROW_SETTINGS = 'ROW_SETTINGS',
}

export const PageSectionShelf = ({ pageSection, onEdit, onDelete, onClose }: SectionShelfProps) => {
	const classes = useStyles();
	const [pageState, setPageState] = useState(PAGE_STATES.SECTION_SETTINGS);
	const [isNext, setIsNext] = useState(true);

	useEffect(() => {
		setIsNext(false);
		setPageState(PAGE_STATES.SECTION_SETTINGS);
	}, [pageSection.pageSectionId]);

	return (
		<TransitionGroup
			component={null}
			childFactory={(child) =>
				React.cloneElement(child, {
					classNames: isNext ? 'right-to-left' : 'left-to-right',
					timeout: PAGE_TRANSITION_DURATION_MS,
				})
			}
		>
			<CSSTransition key={pageState} timeout={PAGE_TRANSITION_DURATION_MS}>
				<>
					{pageState === PAGE_STATES.SECTION_SETTINGS && (
						<div className={classes.page}>
							<div className={classes.header}>
								<div className="d-flex align-items-center">
									<h5 className="mb-0">{pageSection.name}</h5>
									<Button className="ms-2" onClick={onEdit}>
										Edit
									</Button>
								</div>
								<div className="d-flex align-items-center">
									<Button className="me-2" variant="danger" onClick={onDelete}>
										Delete
									</Button>
									<Button onClick={onClose}>Close</Button>
								</div>
							</div>
							<div className={classes.body}>
								<Form>
									<Form.Group>
										<Form.Label>Basics</Form.Label>
										<InputHelper className="mb-4" type="text" label="Headline" />
										<InputHelper className="mb-4" as="textarea" label="Description" />
									</Form.Group>
									<Form.Group className="mb-6">
										<Form.Label className="mb-2">Background color</Form.Label>
										<Form.Check
											type="radio"
											name="background-color"
											id="background-color--white"
											label="White"
										/>
										<Form.Check
											type="radio"
											name="background-color"
											id="background-color--neutral"
											label="Neutral"
										/>
									</Form.Group>
									<hr />
									<Form.Group className="py-6 d-flex align-items-center justify-content-between">
										<Form.Label className="mb-0">Rows</Form.Label>
										<Button
											type="button"
											size="sm"
											onClick={() => {
												setIsNext(true);
												setPageState(PAGE_STATES.ADD_ROW);
											}}
										>
											Add Row
										</Button>
									</Form.Group>
									<NoData
										title="No rows added"
										actions={[
											{
												variant: 'primary',
												title: 'Add row',
												onClick: () => {
													setIsNext(true);
													setPageState(PAGE_STATES.ADD_ROW);
												},
											},
										]}
									/>
								</Form>
							</div>
						</div>
					)}
					{pageState === PAGE_STATES.ADD_ROW && (
						<div className={classes.page}>
							<div className={classes.header}>
								<div className="d-flex align-items-center justify-start">
									<Button
										className="me-2"
										onClick={() => {
											setIsNext(false);
											setPageState(PAGE_STATES.SECTION_SETTINGS);
										}}
									>
										Back
									</Button>
									<h5 className="mb-0">Select row type to add</h5>
								</div>
							</div>
							<div className={classNames(classes.body, 'pt-0')}>
								<RowSelectionForm
									onSelection={() => {
										setIsNext(true);
										setPageState(PAGE_STATES.ROW_SETTINGS);
									}}
								/>
							</div>
						</div>
					)}
					{pageState === PAGE_STATES.ROW_SETTINGS && (
						<div className={classes.page}>
							<div className={classes.header}>
								<div className="w-100 d-flex align-items-center justify-content-between">
									<div className="d-flex align-items-center">
										<Button
											className="me-2"
											onClick={() => {
												setIsNext(false);
												setPageState(PAGE_STATES.SECTION_SETTINGS);
											}}
										>
											Back
										</Button>
										<h5 className="mb-0">Row settings</h5>
									</div>
									<Button
										variant="danger"
										onClick={() => {
											return;
										}}
									>
										Delete Row
									</Button>
								</div>
							</div>
							<div className={classes.body}>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nunc ipsum, egestas sit
									amet imperdiet a, euismod id risus. Curabitur in sapien mauris. Aliquam tincidunt mi
									varius mi semper varius. Maecenas elementum vulputate tortor sit amet imperdiet. Sed
									molestie mollis lectus, vel dictum tellus imperdiet nec. Class aptent taciti
									sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Morbi
									egestas non purus ac ultricies. Aliquam fermentum consectetur risus, quis accumsan
									purus pulvinar lacinia. Sed id lacus in magna laoreet posuere. Fusce sed ultricies
									mauris. Donec vel sagittis lorem. Vivamus pretium hendrerit erat nec porta.
								</p>
							</div>
						</div>
					)}
				</>
			</CSSTransition>
		</TransitionGroup>
	);
};
