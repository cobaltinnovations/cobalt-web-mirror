import { LoginDestinationIdRouteMap } from '@/contexts/account-context';
import useAccount from '@/hooks/use-account';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const IntegratedCareLandingPage = () => {
	return <Outlet />;
};

export const RedirectToIntegratedCareRole = () => {
	const { account } = useAccount();

	return <Navigate to={account ? LoginDestinationIdRouteMap[account.loginDestinationId] : '/'} replace />;
};
