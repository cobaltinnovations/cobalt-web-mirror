import { useContext } from 'react';
import { FlagsContext } from '@/contexts/flags-context';

const useFlags = () => {
	const flagsContext = useContext(FlagsContext);

	return flagsContext;
};

export default useFlags;
