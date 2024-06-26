import { ADMIN_HEADER_HEIGHT, AdminHeader } from '@/components/admin';
import Loader from '@/components/loader';
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export async function loader() {
	return null;
}

export const Component = () => {
	return (
		<>
			<AdminHeader />
			<div style={{ paddingTop: ADMIN_HEADER_HEIGHT }}>
				<Suspense fallback={<Loader />}>
					<Outlet />
				</Suspense>
			</div>
		</>
	);
};
