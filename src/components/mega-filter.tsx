import React, { useCallback, useState } from 'react';
import { Button, Collapse, Form, Modal } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-drop-down.svg';
import { AddOrRemoveValueFromArray } from '@/lib/utils/form-utils';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
	modal: {
		width: '90%',
		height: '100%',
		maxWidth: 720,
		margin: '0 auto',
		'& .modal-content': {
			maxHeight: '90vh',
		},
		'& .cobalt-modal__body': {
			padding: 24,
		},
		'& .cobalt-modal__footer': {
			padding: '12px 16px',
		},
		[mediaQueries.lg]: {
			maxWidth: '100%',
		},
	},
	button: {
		minHeight: 40,
		borderRadius: 500,
		appearance: 'none',
		alignItems: 'center',
		display: 'inline-flex',
		padding: '0 12px 0 20px',
		backgroundColor: 'transparent',
		border: `2px solid ${theme.colors.p500}`,
		'& span': {
			fontSize: '1.4rem',
			lineHeight: '2.0rem',
			whiteSpace: 'nowrap',
			...theme.fonts.bodyBold,
			color: theme.colors.p500,
		},
		'& svg': {
			color: theme.colors.p500,
		},
		'&:focus': {
			outline: 'none',
		},
		'&:hover': {
			backgroundColor: theme.colors.p500,
			'& span, & svg': {
				color: theme.colors.n0,
			},
		},
	},
	buttonActive: {
		padding: '0 20px',
		backgroundColor: theme.colors.p500,
		'& span, & svg': {
			color: theme.colors.n0,
		},
	},
}));

export enum FILTER_TYPE {
	CHECKBOX = 'CHECKBOX',
	RADIO = 'RADIO',
}

export interface Filter {
	id: string;
	filterType: FILTER_TYPE;
	title: string;
	value?: string | string[];
	options?: FilterOption[];
}

export interface FilterOption {
	value: string;
	title: string;
}

export interface MegaFilterProps {
	buttonTitle: string;
	modalTitle: string;
	value: Filter[];
	onChange(value: Filter[]): void;
	activeLength?: number;
	allowCollapse?: boolean;
	displayFooter?: boolean;
	className?: string;
}

function MegaFilter({
	buttonTitle,
	modalTitle,
	value,
	onChange,
	activeLength,
	allowCollapse = true,
	displayFooter = true,
	className,
}: MegaFilterProps) {
	const classes = useStyles();
	const [show, setShow] = useState(false);
	const [internalValue, setInternalValue] = useState<Filter[]>([]);

	const handleOnEnter = useCallback(() => {
		setInternalValue(value);
	}, [value]);

	return (
		<>
			<Modal
				show={show}
				dialogClassName={classes.modal}
				centered
				onHide={() => {
					setShow(false);
				}}
				onEnter={handleOnEnter}
			>
				<Modal.Header closeButton>
					<Modal.Title>{modalTitle}</Modal.Title>
				</Modal.Header>
				<Modal.Body className="pb-0">
					{internalValue.map((filter, filterIndex) => {
						const isLast = filterIndex === internalValue.length - 1;

						return (
							<React.Fragment key={filter.id}>
								<MegaFilterCollapse
									filter={filter}
									allowCollapse={allowCollapse}
									onChange={({ currentTarget }) => {
										setInternalValue((previousValue) =>
											previousValue.map((v) =>
												v.id === filter.id
													? {
															...v,
															value: Array.isArray(v.value)
																? AddOrRemoveValueFromArray(
																		currentTarget.value,
																		v.value
																  )
																: currentTarget.value,
													  }
													: v
											)
										);
									}}
								/>
								{!isLast && <hr className="mb-6" />}
							</React.Fragment>
						);
					})}
				</Modal.Body>
				{displayFooter && (
					<Modal.Footer className="text-right">
						{!!activeLength && (
							<Button
								size="sm"
								variant="outline-primary"
								onClick={() => {
									setShow(false);
									onChange(internalValue);
								}}
							>
								Clear
							</Button>
						)}

						<Button
							size="sm"
							className="ms-2"
							variant="primary"
							onClick={() => {
								setShow(false);
								onChange(internalValue);
							}}
						>
							Apply
						</Button>
					</Modal.Footer>
				)}
			</Modal>

			<button
				className={classNames(
					classes.button,
					{
						[classes.buttonActive]: activeLength,
					},
					className
				)}
				onClick={() => {
					setShow(true);
				}}
			>
				<span>{buttonTitle}</span>
				{activeLength && activeLength > 0 ? (
					<span>&nbsp;&bull; {activeLength}</span>
				) : (
					<ArrowDown className="ms-1" width={24} height={24} />
				)}
			</button>
		</>
	);
}

const useMegaFilterCollapseStyles = createUseThemedStyles((theme) => ({
	megaFilterCollapseButton: {
		border: 0,
		padding: 0,
		appearance: 'none',
		color: theme.colors.n700,
		backgroundColor: 'transparent',
		...theme.fonts.h5.default,
		...theme.fonts.bodyBold,
		marginBottom: 24,
	},
	megaFilterCollapseInner: {
		paddingBottom: 24,
		columnCount: 3,
		[mediaQueries.lg]: {
			columnCount: 1,
		},
	},
}));

const MegaFilterCollapse = ({
	filter,
	allowCollapse,
	onChange,
}: {
	filter: Filter;
	allowCollapse: boolean;
	onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}) => {
	const classes = useMegaFilterCollapseStyles();
	const [show, setShow] = useState(true);

	return (
		<>
			{allowCollapse && (
				<Button
					className={classes.megaFilterCollapseButton}
					bsPrefix="mega-filter-accordion-button"
					onClick={() => {
						setShow(!show);
					}}
				>
					{filter.title}
				</Button>
			)}
			<Collapse in={show}>
				<div>
					<div className={classes.megaFilterCollapseInner}>
						{(filter.options ?? []).map((option) => (
							<React.Fragment key={option.value}>
								{filter.filterType === FILTER_TYPE.CHECKBOX && (
									<Form.Check
										type="checkbox"
										name={`filter--${filter.id}`}
										id={`filter-option--${option.value}`}
										label={option.title}
										value={option.value}
										checked={
											Array.isArray(filter.value)
												? filter.value.includes(option.value)
												: filter.value === option.value
										}
										onChange={onChange}
									/>
								)}
								{filter.filterType === FILTER_TYPE.RADIO && (
									<Form.Check
										type="radio"
										name={`filter--${filter.id}`}
										id={`filter-option--${option.value}`}
										label={option.title}
										value={option.value}
										checked={
											Array.isArray(filter.value)
												? filter.value.includes(option.value)
												: filter.value === option.value
										}
										onChange={onChange}
									/>
								)}
							</React.Fragment>
						))}
					</div>
				</div>
			</Collapse>
		</>
	);
};

export default MegaFilter;
