import { useContext } from 'react';
import { PageBuilderContext } from '@/contexts/page-builder-context';

const usePageBuilderContext = () => {
	return useContext(PageBuilderContext);
};

export default usePageBuilderContext;
