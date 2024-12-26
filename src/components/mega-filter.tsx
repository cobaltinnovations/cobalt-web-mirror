import React, { useCallback, useMemo, useState } from 'react';
import { Button, Collapse, Form, Modal } from 'react-bootstrap';
import classNames from 'classnames';

import { AddOrRemoveValueFromArray } from '@/lib/utils/form-utils';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-drop-down.svg';
import { ReactComponent as FilterIcon } from '@/assets/icons/filter.svg';
import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';

interface UseStylesProps {
	displaySingleColumn?: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	modal: {
		width: '90%',
		height: '100%',
		maxWidth: ({ displaySingleColumn }: UseStylesProps) => (displaySingleColumn ? 480 : 720),
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
	filterIconButton: {
		paddingLeft: 16,
	},
	noDownArrow: {
		paddingRight: 20,
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
	displaySingleColumn?: boolean;
	displayFooter?: boolean;
	displayCount?: boolean;
	displayFilterIcon?: boolean;
	displayDownArrow?: boolean;
	applyOnChange?: boolean;
	className?: string;
}

function MegaFilter({
	buttonTitle,
	modalTitle,
	value,
	onChange,
	allowCollapse = true,
	displaySingleColumn = false,
	displayFooter = true,
	displayCount = true,
	displayFilterIcon = false,
	displayDownArrow = true,
	applyOnChange,
	className,
}: MegaFilterProps) {
	const classes = useStyles({ displaySingleColumn });
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
									displaySingleColumn={displaySingleColumn}
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
						[classes.filterIconButton]: displayFilterIcon,
						[classes.noDownArrow]: !displayDownArrow,
					},
					className
				)}
				onClick={() => {
					setShow(true);
				}}
			>
				{displayFilterIcon && <FilterIcon className="me-2" width={20} height={20} />}
				<span>{buttonTitle}</span>
				{displayCount && activeLength > 0 && <span>&nbsp;&bull; {activeLength}</span>}
				{displayDownArrow && <ArrowDown className="ms-1" width={24} height={24} />}
			</button>
		</>
	);
}

interface UseMegaFilterCollapseStylesProps {
	displaySingleColumn?: boolean;
}

const useMegaFilterCollapseStyles = createUseThemedStyles((theme) => ({
	megaFilterCollapseButton: {
		border: 0,
		padding: 0,
		display: 'flex',
		marginBottom: 24,
		appearance: 'none',
		alignitems: 'center',
		color: theme.colors.n700,
		...theme.fonts.bodyBold,
		...theme.fonts.h5.default,
		backgroundColor: 'transparent',
		'&:hover': {
			color: theme.colors.p500,
		},
	},
	megaFilterCollapseInner: {
		paddingBottom: 24,
		columnCount: ({ displaySingleColumn }: UseMegaFilterCollapseStylesProps) => (displaySingleColumn ? 1 : 3),
		[mediaQueries.lg]: {
			columnCount: `1 !important`,
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
	displaySingleColumn,
}: {
	id: string;
	title: string;
	filterType: FILTER_TYPE;
	options: FilterOption[];
	allowCollapse: boolean;
	value: string[];
	onChange(value: string[]): void;
	displaySingleColumn: boolean;
}) => {
	const classes = useMegaFilterCollapseStyles({ displaySingleColumn });
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
					<DownChevron className="d-flex" style={{ transform: `scaleY(${show ? -1 : 1})` }} />
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

export const megaFilterValueAsSearchParams = (value: Filter[]) => {
	return value.reduce(
		(accumulator, currentvalue) => ({
			...accumulator,
			...(currentvalue.value.length > 0 ? { [currentvalue.id]: currentvalue.value } : {}),
		}),
		{}
	);
};

export default MegaFilter;
