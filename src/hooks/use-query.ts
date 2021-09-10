import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

function useQuery(): URLSearchParams {
	const location = useLocation();

	return useMemo(() => {
		return new URLSearchParams(location.search);
	}, [location.search]);
}

export default useQuery;
