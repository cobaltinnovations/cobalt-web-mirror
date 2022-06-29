import React, { FC, Dispatch, SetStateAction, useState, useCallback, useRef } from 'react';
import { Col, Container } from 'react-bootstrap';
import { ReactComponent as SearchIcon } from '@/assets/icons/icon-search.svg';
import { AsyncTypeahead, Menu, MenuItem } from 'react-bootstrap-typeahead';
import BackgroundImageContainer from '@/components/background-image-container';
import { useHistory } from 'react-router-dom';
import { providerService } from '@/lib/services';
import { SearchResult } from '@/contexts/booking-context';
import { Provider, Clinic } from '@/lib/models';
import { ReactComponent as ClearIcon } from '@/assets/icons/icon-search-close.svg';
import classNames from 'classnames';
import { getRandomPlaceholderImage } from '@/hooks/use-random-placeholder-image';
import { createUseThemedStyles } from '@/jss/theme';

const useSearchBarStyles = createUseThemedStyles((theme) => ({
	searchIcon: {
		left: 0,
		top: '50%',
		fill: theme.colors.dark,
		position: 'absolute',
		transform: 'translateY(-50%)',
	},
	clearIcon: {
		flexShrink: 0,
		opacity: 0.32,
		cursor: 'pointer',
		fill: theme.colors.dark,
	},
}));

const isClinicResult = (result: Provider | Clinic): result is Clinic => {
	return typeof (result as Clinic).clinicId === 'string';
};

const mapProviderToResult = (provider: Provider): SearchResult => ({
	id: provider.providerId,
	imageUrl: provider.imageUrl,
	type: 'provider',
	displayName: provider.name + (provider.license ? `, ${provider.license}` : ''),
	description: provider.supportRolesDescription,
});

const mapClinicToResult = (clinic: Clinic): SearchResult => ({
	id: clinic.clinicId,
	type: 'clinic',
	imageUrl: getRandomPlaceholderImage() as any,
	displayName: clinic.description,
});

// double:
interface HistoryLocationState {
	skipAssessment?: boolean;
	successBooking?: boolean;
	routedClinicIds?: string[];
	routedProviderId?: string;
}

interface AppointmentSearchBarProps {
	recentProviders: SearchResult[];
	selectedSearchResult: SearchResult[]; // selectedSearchResult
	setSelectedSearchResult: Dispatch<SetStateAction<SearchResult[]>>; // setSelectedSearchResult
	setProviderFilter: Dispatch<SetStateAction<string | undefined>>;
	setClinicsFilter: Dispatch<SetStateAction<string[]>>;
}

const AppointmentSearchBar: FC<AppointmentSearchBarProps> = (props) => {
	const classes = useSearchBarStyles();
	const history = useHistory<HistoryLocationState>();
	const [isSearchFocused, setIsSearchFocused] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
	const [isSearching, setIsSearching] = useState(false);
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const typeAheadRef = useRef<any>(null);

	const searchProviders = useCallback(async (query: string) => {
		setIsSearching(true);

		try {
			const response = await providerService.searchEntities(query).fetch();
			setSearchResults(
				[...response.providers, ...response.clinics].map((item) => {
					return isClinicResult(item) ? mapClinicToResult(item) : mapProviderToResult(item);
				})
			);
		} catch (e) {
			alert((e as any).message);
		}

		setIsSearching(false);
	}, []);

	function handleClearSearchButtonClick() {
		if (typeAheadRef && typeAheadRef.current) {
			typeAheadRef.current.clear();
			typeAheadRef.current.blur();
			setSearchQuery('');
			props.setSelectedSearchResult([]);
			props.setProviderFilter(undefined);
			props.setClinicsFilter([]);
			const params = new URLSearchParams(history.location.search);
			params.delete('providerId');
			params.delete('clinicId');
			history.push(`/connect-with-support?${params.toString()}`, history.location.state);
		}
	}

	return (
		<>
			<Container className={'p-0 border-bottom'}>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<div className="position-relative d-flex align-items-center">
						<SearchIcon className={classes.searchIcon} />
						<AsyncTypeahead
							placeholder="search for provider or entity"
							ref={typeAheadRef}
							id="search-providers"
							filterBy={[]}
							isLoading={isSearching}
							open={isSearchFocused && props.selectedSearchResult.length === 0}
							onSearch={searchProviders}
							onFocus={() => setIsSearchFocused(true)}
							onBlur={() => {
								if (props.selectedSearchResult.length === 0) {
									(typeAheadRef.current as any).clear();
									setSearchQuery('');
								}

								setIsSearchFocused(false);
							}}
							onInputChange={setSearchQuery}
							onChange={(selectedOptions) => {
								props.setSelectedSearchResult(selectedOptions as SearchResult[]);
								(typeAheadRef.current as any).blur();
							}}
							options={searchQuery ? searchResults : props.recentProviders}
							selected={props.selectedSearchResult}
							renderMenu={(options, menuProps) => {
								const results = options as SearchResult[];
								if (!searchQuery && props.recentProviders.length === 0) {
									return <></>;
								}

								return (
									<Menu {...menuProps}>
										<small
											className={classNames({
												'text-muted': true,
												'text-uppercase': true,
												'mb-3': results.length,
											})}
										>
											{searchQuery ? 'Matches' : 'Your recent appointments'}
										</small>
										{results.map((result, idx) => {
											return (
												<MenuItem key={result.id} option={result} position={idx}>
													<div className="d-flex align-items-center">
														<BackgroundImageContainer
															imageUrl={result.imageUrl}
															size={43}
														/>
														<div className="ms-3">
															<p className="mb-0">{result.displayName}</p>
															{result.description && <small>{result.description}</small>}
														</div>
													</div>
												</MenuItem>
											);
										})}
									</Menu>
								);
							}}
						/>
						{props.selectedSearchResult.length !== 0 && (
							<ClearIcon className={classes.clearIcon} onClick={handleClearSearchButtonClick} />
						)}
					</div>
				</Col>
			</Container>
		</>
	);
};

export default AppointmentSearchBar;
