import React, { FC } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { LetsGetStarted } from '@/pages/pic/assessment/lets-get-started';
import { PersonalInformation } from '@/pages/pic/assessment/personal-information';
import { LookingForDetail, LookingForHome } from '@/pages/pic/assessment/looking-for-diagnosis';
import { MilitaryNationalGuard } from '@/pages/pic/assessment/military-national-guard';
import { AssessmentForm } from '@/pages/pic/assessment/assessment-form';
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom';
import { getFormattedPatientObject, FormattedPatientObject, Disposition } from '@/pages/pic/utils';
import useAccount from '@/hooks/use-account';
import {
	useGetAssessmentByPatientId,
	useAssessmentResponses,
	useGetDisposition,
	useAcknowledgeCrisis,
} from '@/hooks/pic-hooks';
import { PicAssessment } from '@/pages/pic/utils';
import { IQuestionnaireResponse } from '@ahryman40k/ts-fhir-types/lib/R4';
import ContactLCSW from '@/pages/pic/contact-lcsw/contact-lcsw';
import { AxiosError } from 'axios';

const AssessmentWrapper = () => {
	const { picPatient } = useAccount();
	if (!picPatient) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}
	const patient = getFormattedPatientObject(picPatient);
	return <PatientAssessment patient={patient} />;
};

interface Props {
	patient: FormattedPatientObject;
}

const PatientAssessment: FC<Props> = ({ patient }) => {
	const { isLoading, isError, error, data: assessment } = useGetAssessmentByPatientId(patient.picPatientId);
	const { data: disposition, isLoading: dispositionLoading } = useGetDisposition();

	if (isLoading || dispositionLoading) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	if (isError) {
		// Deal with error
		const loadingError = error as AxiosError;
		console.error(error);
		if (loadingError.response?.status === 404) {
			return <Redirect to="/pic/home" />;
		}
		return <p>Error loading assesment.</p>;
	}

	if (!assessment || !disposition) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}

	return <Assessment patient={patient} assessment={assessment} disposition={disposition} />;
};

interface AssessmentProps {
	assessment: PicAssessment;
	patient: FormattedPatientObject;
	disposition: Disposition;
}

export const Assessment: FC<AssessmentProps> = ({ patient, assessment, disposition }) => {
	const { isLoading, isError, error, data: responses } = useAssessmentResponses(assessment.id);
	const { mutate: acknowledgeCrisis, isLoading: isAcknowledgingCrisis } = useAcknowledgeCrisis();
	const { path, url } = useRouteMatch();

	if (assessment.status === 'COMPLETED') {
		return <Redirect to="/pic/home" />;
	}

	if (isLoading) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}
	if (isError) {
		// Deal with error
		console.error(error);
		return <p>Error loading assessment</p>;
	}

	if (disposition?.outcome?.crisis && !disposition?.crisisAcknowledged) {
		return (
			<>
				<ContactLCSW inCrisis={true} />

				<Button
					type="button"
					className={'mx-auto mt-5 d-flex justify-content-center'}
					disabled={isAcknowledgingCrisis}
					onClick={() => {
						acknowledgeCrisis(disposition?.id);
					}}
				>
					Continue with assessment
				</Button>
			</>
		);
	}

	return (
		<Switch>
			<Route exact path={path}>
				<Redirect to={`${url}/getStarted`} />
			</Route>
			<Route path={`${path}/getStarted`}>
				<LetsGetStarted nextUrl={`${path}/personalInfo`} />
			</Route>
			<Route path={`${path}/personalInfo`}>
				<PersonalInformation nextUrl={`${path}/lookingFor/0`} patient={patient} assessmentId={assessment.id} />
			</Route>
			<Route path={`${path}/lookingFor/0`}>
				<LookingForHome
					previousUrl={`${path}/personalInfo`}
					nextUrl={`${path}/lookingFor/1`}
					assessmentId={assessment.id}
					responses={responses}
				/>
			</Route>
			<Route path={`${path}/lookingFor/1`}>
				<LookingForDetail
					previousUrl={`${path}/lookingFor/0`}
					nextUrl={`${path}/military`}
					assessmentId={assessment.id}
					responses={responses}
				/>
			</Route>
			<Route path={`${path}/military`}>
				<MilitaryNationalGuard
					previousUrl={`${path}/lookingFor/1`}
					nextUrl={`${path}/clinical/0`}
					assessmentId={assessment.id}
					responses={responses}
				/>
			</Route>
			<Route path={`${path}/clinical/:page`}>
				<AssessmentForm
					previousUrl={`${path}/military`}
					patientName={patient.displayName}
					assessmentId={assessment.id}
					responses={responses}
					finishedUrl="/pic/home"
				/>
			</Route>
			{/* <Route path={`${path}/goals`}>
			<SetGoals assessmentId={assessmentId} setNextComponent={setSelectedComponent} patientName={patient.displayName} />
		</Route> */}
		</Switch>
	);
};

interface MHICAssessmentProps {
	assessment: PicAssessment;
	patientName: string;
	disposition: Disposition;
}

export const MHICAssessment: FC<MHICAssessmentProps> = ({ patientName, assessment, disposition }) => {
	const { isLoading, isError, error, data: responses } = useAssessmentResponses(assessment.id);
	const { path, url } = useRouteMatch();

	const finishedUrl = `/pic/mhic/disposition/${disposition.id}`;

	if (assessment.status === 'COMPLETED') {
		return <Redirect to={finishedUrl} />;
	}

	if (isLoading) {
		return <Spinner animation="border" className={'d-flex mx-auto mt-20'} />;
	}
	if (isError) {
		// Deal with error
		console.error(error);
		return <p>Error loading assessment</p>;
	}

	// Don't show Crisis screen to MHICs filling assessment on behalf of patient
	// if (disposition?.outcome?.crisis) {
	// 	return <ContactLCSW inCrisis={true} />;
	// }

	return (
		<Switch>
			<Route exact path={path}>
				<Redirect to={`${url}/lookingFor/0`} />
			</Route>
			<Route path={`${path}/lookingFor/0`}>
				<LookingForHome
					previousUrl={finishedUrl}
					nextUrl={`${url}/lookingFor/1`}
					assessmentId={assessment.id}
					responses={responses}
				/>
			</Route>
			<Route path={`${path}/lookingFor/1`}>
				<LookingForDetail
					previousUrl={`${url}/lookingFor/0`}
					nextUrl={`${url}/military`}
					assessmentId={assessment.id}
					responses={responses}
				/>
			</Route>
			<Route path={`${path}/military`}>
				<MilitaryNationalGuard
					previousUrl={`${url}/lookingFor/1`}
					nextUrl={`${url}/clinical/0`}
					assessmentId={assessment.id}
					responses={responses}
				/>
			</Route>
			<Route path={`${path}/clinical/:page`}>
				<AssessmentForm
					previousUrl={`${url}/military`}
					patientName={patientName}
					assessmentId={assessment.id}
					responses={responses}
					finishedUrl={finishedUrl}
				/>
			</Route>
			{/* <Route path={`${path}/goals`}>
			<SetGoals assessmentId={assessmentId} setNextComponent={setSelectedComponent} patientName={patient.displayName} />
		</Route> */}
		</Switch>
	);
};

export default AssessmentWrapper;
