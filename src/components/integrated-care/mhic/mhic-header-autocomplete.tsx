import { ReactComponent as SearchIcon } from '@/assets/icons/icon-search.svg';
import InputHelperSearch from '@/components/input-helper-search';
import useDebouncedState from '@/hooks/use-debounced-state';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { PatientOrderAutocompleteResult } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import classNames from 'classnames';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { AsyncTypeahead, Menu } from 'react-bootstrap-typeahead';
import MenuItem, { MenuItemProps } from 'react-bootstrap-typeahead/types/components/MenuItem';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const useStyles = createUseThemedStyles((theme) => ({
	searchInput: {
		width: 400,
	},
	viewAllSearch: {
		color: 'inherit',
		textDecoration: 'none',
		padding: '12px 20px',
		borderBottom: `1px solid ${theme.colors.border}`,
		'& svg': {
			fill: theme.colors.n500,
		},
		'&:hover': {
			color: 'inherit',
			backgroundColor: theme.colors.n50,
		},
	},
	autocompleteWrapper: {
		'& .rbt-aux': {
			display: 'none',
		},
		'& .rbt-menu.dropdown-menu': {
			// marginTop: 4,
			borderRadius: 4,
			maxHeight: 'none !important',

			'& .dropdown-header': {
				padding: '16px 20px 2px 20px',
				...theme.fonts.small,
				...theme.fonts.bodyBold,
			},
			'& .dropdown-item': {
				padding: '8px 20px',
				'&:hover': {
					backgroundColor: theme.colors.n50,
				},
				'&:active': {
					backgroundColor: theme.colors.p500,
					'& p': {
						color: `${theme.colors.n0} !important`,
					},
				},
			},
		},
	},
}));

interface MhicHeaderAutoCompleteProps {
	recentOrders?: PatientOrderAutocompleteResult[];
}

export const MhicHeaderAutoComplete = ({ recentOrders = [] }: MhicHeaderAutoCompleteProps) => {
	const handleError = useHandleError();
	const classes = useStyles();
	const typeAheadRef = useRef<any>(null);
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [searchParams, setSearchParams] = useSearchParams();
	const [isSearching, setIsSearching] = useState(false);
	const [searchResults, setSearchResults] = useState<PatientOrderAutocompleteResult[]>([]);

	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearchQuery] = useDebouncedState(searchQuery);
	const [displayedSearchCount, setDisplayedSearchCount] = useState(5);

	useEffect(() => {
		if (!debouncedSearchQuery) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		const request = integratedCareService.autocompletePatientOrders({ searchQuery: debouncedSearchQuery });
		request
			.fetch()
			.then((response) => {
				setSearchResults(response.patientOrderAutocompleteResults);
				setDisplayedSearchCount(5);
				setIsSearching(false);
			})
			.catch((e) => {
				handleError(e);
				setIsSearching(false);
			});

		return () => {
			request.abort();
		};
	}, [handleError, debouncedSearchQuery]);

	const resultOptions = useMemo(() => {
		return [
			...recentOrders.map((order) => {
				return {
					...order,
					isRecent: true,
					isSearchResult: false,
				};
			}),
			...searchResults.slice(0, displayedSearchCount).map((order) => {
				return {
					...order,
					isRecent: false,
					isSearchResult: true,
				};
			}),
		];
	}, [recentOrders, searchResults, displayedSearchCount]);

	return (
		<AsyncTypeahead
			ref={typeAheadRef}
			id="mhic-header-search"
			className={classNames('header-rbt', classes.autocompleteWrapper)}
			placeholder="Search"
			filterBy={() => true}
			labelKey="patientDisplayName"
			isLoading={true}
			onFocus={() => {
				setIsSearchFocused(true);
			}}
			onBlur={() => {
				setIsSearchFocused(false);
			}}
			open={recentOrders.length > 0 ? isSearchFocused : isSearchFocused && searchQuery.length > 0}
			delay={350}
			minLength={0}
			onInputChange={(inputValue) => {
				setSearchQuery(inputValue);
			}}
			onSearch={(inputValue) => {
				const params = new URLSearchParams(searchParams);
				params.delete('searchQuery');

				params.set('searchQuery', inputValue);

				setSearchParams(params, { replace: true });
			}}
			options={resultOptions}
			renderInput={({ inputRef, referenceElementRef, value, className, ...inputProps }, typeaheadState) => {
				return (
					<InputHelperSearch
						ref={(node) => {
							inputRef(node);
							referenceElementRef(node);
						}}
						className={classNames(classes.searchInput, className)}
						{...inputProps}
						value={value as string}
						onClear={() => {
							setSearchQuery('');
							typeaheadState.onClear();
						}}
					/>
				);
			}}
			newSelectionPrefix={null}
			renderMenu={(
				_,
				{ newSelectionPrefix, paginationText, renderMenuItemChildren, ...menuProps },
				typeaheadState
			) => {
				const hasMore = resultOptions.filter((o) => o.isSearchResult).length < searchResults.length;

				return (
					<Menu {...menuProps}>
						{searchQuery && (
							<Link
								to={{
									pathname: '/ic/mhic/orders/search',
									search: `?searchQuery=${searchQuery}`,
								}}
								onClick={() => {
									typeAheadRef.current.blur();
									typeAheadRef.current._handleClear();
								}}
								className={classNames('d-flex align-items-center', classes.viewAllSearch)}
							>
								<SearchIcon />
								<p className="ms-3 mb-0">
									View all results with <span className="fw-bold">{typeaheadState.text}</span>
								</p>
							</Link>
						)}

						{!searchQuery && (
							<>
								{recentOrders.length !== 0 && <Menu.Header>Recent</Menu.Header>}

								{resultOptions.map((item, index) => {
									const result = item as (typeof resultOptions)[number];
									if (!result.isRecent) {
										return null;
									}

									return (
										<PatientSearchResult
											openShelf
											key={index}
											option={result}
											position={index}
											onClick={() => {
												typeAheadRef.current.blur();
												typeAheadRef.current._handleClear();
											}}
										/>
									);
								})}
							</>
						)}

						{recentOrders.length !== 0 && searchResults.length > 0 && <Menu.Divider />}

						{searchResults.length !== 0 && (
							<Menu.Header>
								Patients {isSearching && <Spinner className="ms-2" animation="border" size="sm" />}
							</Menu.Header>
						)}

						{resultOptions.map((item, index) => {
							const result = item as (typeof resultOptions)[number];
							if (!result.isSearchResult) {
								return null;
							}

							return (
								<PatientSearchResult
									key={index}
									position={index}
									option={item as PatientOrderAutocompleteResult}
									onClick={() => {
										typeAheadRef.current.blur();
										typeAheadRef.current._handleClear();
									}}
								/>
							);
						})}

						{hasMore && (
							<Button
								size="sm"
								variant="link"
								className="text-decoration-none"
								onClick={() => {
									setDisplayedSearchCount(displayedSearchCount + 5);
								}}
							>
								Show More
							</Button>
						)}
					</Menu>
				);
			}}
		/>
	);
};

interface PatientSearchResultProps extends MenuItemProps {
	option: PatientOrderAutocompleteResult & { patientOrderId?: string };
	onClick: () => void;
	openShelf?: boolean;
}

const PatientSearchResult = ({ option, openShelf, onClick, ...itemProps }: PatientSearchResultProps) => {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const [searchParams] = useSearchParams();

	return (
		<MenuItem
			option={option}
			{...itemProps}
			className="d-flex justify-content-between"
			onClick={(e) => {
				onClick();

				if (openShelf && option.patientOrderId) {
					navigate({
						pathname: pathname + '/' + option.patientOrderId,
						search: '?' + searchParams.toString(),
					});
				} else {
					searchParams.set('patientMrn', option.patientMrn);
					navigate({
						pathname: '/ic/mhic/orders/search',
						search: '?' + searchParams.toString(),
					});
				}
			}}
		>
			<div>
				<p className="mb-0">{option.patientDisplayName}</p>
				<p className="mb-0 text-gray">{option.patientMrn}</p>
			</div>

			<div className="ml-auto">
				<p>{option.patientPhoneNumberDescription}</p>
			</div>
		</MenuItem>
	);
};
