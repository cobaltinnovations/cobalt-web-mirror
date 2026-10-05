import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigation, useNavigationType, useSearchParams } from 'react-router-dom';
import useDebouncedAsyncFunction from './use-debounced-async-function';
import { withPageDirectorySearch } from '@/lib/utils/page-directory-utils';

export const usePageDirectorySearch = (directoryId: string) => {
	const location = useLocation();
	const navigation = useNavigation();
	const navigationType = useNavigationType();
	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = searchParams.get('searchQuery') ?? '';
	const [searchInput, setSearchInput] = useState(searchQuery);
	const inputRef = useRef(searchInput);
	const submittedQueryRef = useRef<string>();
	const setSearchParamsRef = useRef(setSearchParams);
	setSearchParamsRef.current = setSearchParams;
	const previousLocationRef = useRef({ directoryId, key: location.key });
	const updateSearch = useDebouncedAsyncFunction(async (query: string) => {
		submittedQueryRef.current = query.trim();
		setSearchParamsRef.current((previous) => withPageDirectorySearch(previous, query), { replace: true });
	}, 300);

	useEffect(
		() => () => {
			updateSearch.cancel();
			submittedQueryRef.current = undefined;
		},
		[directoryId, updateSearch]
	);

	useEffect(() => {
		const target = navigation.location;
		if (!target) return;
		const targetQuery = new URLSearchParams(target.search).get('searchQuery') ?? '';
		const isOwnSearch = target.pathname === location.pathname && targetQuery === submittedQueryRef.current;
		if (!isOwnSearch) {
			updateSearch.cancel();
			submittedQueryRef.current = undefined;
		}
	}, [navigation.location, location.pathname, updateSearch]);

	useEffect(() => {
		const previous = previousLocationRef.current;
		const directoryChanged = previous.directoryId !== directoryId;
		const locationChanged = previous.key !== location.key;
		if (!directoryChanged && !locationChanged) return;
		const isOwnSearch =
			!directoryChanged && navigationType === 'REPLACE' && submittedQueryRef.current === searchQuery;
		if (!isOwnSearch) {
			updateSearch.cancel();
			inputRef.current = searchQuery;
			setSearchInput(searchQuery);
		} else if (inputRef.current.trim() === searchQuery) {
			inputRef.current = searchQuery;
			setSearchInput(searchQuery);
		}
		submittedQueryRef.current = undefined;
		previousLocationRef.current = { directoryId, key: location.key };
	}, [directoryId, location.key, navigationType, searchQuery, updateSearch]);

	const changeSearch = useCallback(
		(query: string) => {
			inputRef.current = query;
			setSearchInput(query);
			updateSearch(query);
		},
		[updateSearch]
	);

	const clearSearch = useCallback(() => {
		updateSearch.cancel();
		inputRef.current = '';
		setSearchInput('');
		submittedQueryRef.current = '';
		setSearchParamsRef.current((previous) => withPageDirectorySearch(previous, ''), { replace: true });
	}, [updateSearch]);

	return { searchInput, changeSearch, clearSearch };
};
