import { useContext } from 'react';
import { AccountContext } from '@/contexts/account-context';

const useAccount = () => {
	const accountContext = useContext(AccountContext);
	return accountContext;
};

export default useAccount;
