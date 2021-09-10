import { useContext } from 'react';
import { AlertContext } from '@/contexts/alert-context';

const useAlert = () => {
	const alertContext = useContext(AlertContext);
	return alertContext;
};

export default useAlert;
