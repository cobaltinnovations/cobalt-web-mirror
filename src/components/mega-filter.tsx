import React, { useCallback, useMemo, useState } from 'react';
import { Button, Collapse, Form, Modal } from 'react-bootstrap';
import classNames from 'classnames';

import { AddOrRemoveValueFromArray } from '@/lib/utils/form-utils';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-drop-down.svg';

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
	value: string[];
	options: FilterOption[];
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
	allowCollapse?: boolean;
	displayFooter?: boolean;
	displayCount?: boolean;
	applyOnChange?: boolean;
	className?: string;
}

function MegaFilter({
	buttonTitle,
	modalTitle,
	value,
	onChange,
	allowCollapse = true,
	displayFooter = true,
	displayCount = true,
	applyOnChange,
	className,
}: MegaFilterProps) {
	const classes = useStyles();
	const [show, setShow] = useState(false);
	const [internalValue, setInternalValue] = useState<Filter[]>([]);
	const activeLength = useMemo(() => value.map((v) => v.value).flat().length, [value]);

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
									id={filter.id}
									title={filter.title}
									filterType={filter.filterType}
									options={filter.options}
									allowCollapse={allowCollapse}
									value={filter.value}
									onChange={(newValue) => {
										const internalValueClone = internalValue.map((v) =>
											v.id === filter.id ? { ...v, value: newValue } : v
										);

										if (applyOnChange) {
											setShow(false);
											onChange(internalValueClone);
										} else {
											setInternalValue(internalValueClone);
										}
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
									onChange(internalValue.map((v) => ({ ...v, value: [] })));
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
				{displayCount && activeLength > 0 && <span>&nbsp;&bull; {activeLength}</span>}
				<ArrowDown className="ms-1" width={24} height={24} />
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
	id,
	title,
	filterType,
	options,
	allowCollapse,
	value,
	onChange,
}: {
	id: string;
	title: string;
	filterType: FILTER_TYPE;
	options: FilterOption[];
	allowCollapse: boolean;
	value: string[];
	onChange(value: string[]): void;
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
					{title}
				</Button>
			)}
			<Collapse in={show}>
				<div>
					<div className={classes.megaFilterCollapseInner}>
						{options.map((option) => (
							<React.Fragment key={option.value}>
								{filterType === FILTER_TYPE.CHECKBOX && (
									<Form.Check
										type="checkbox"
										name={`filter--${id}`}
										id={`filter-option--${option.value}`}
										label={option.title}
										value={option.value}
										checked={value.includes(option.value)}
										onChange={({ currentTarget }) => {
											onChange(AddOrRemoveValueFromArray(currentTarget.value, value));
										}}
									/>
								)}
								{filterType === FILTER_TYPE.RADIO && (
									<Form.Check
										type="radio"
										name={`filter--${id}`}
										id={`filter-option--${option.value}`}
										label={option.title}
										value={option.value}
										checked={value.includes(option.value)}
										onChange={({ currentTarget }) => {
											onChange([currentTarget.value]);
										}}
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
