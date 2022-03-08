import React, { FC, useState, useCallback, useEffect, useRef, useContext, useMemo } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Formik, FormikProps } from 'formik';
import InputMask from 'react-input-mask';
import Lottie from 'lottie-web';
import { Link, useHistory, Prompt, Redirect } from 'react-router-dom';
import { pick } from 'lodash';

import useHeaderTitle from '@/hooks/use-header-title';
import fonts from '@/jss/fonts';
import useAccount from '@/hooks/use-account';
import DatePicker from '@/components/date-picker';
import moment from 'moment';
import { EpicPatientData, googlePlacesService, accountService, CreateAppointmentData, appointmentService, EpicMatchStep } from '@/lib/services';
import { AccountModel } from '@/lib/models';
import HealthRecordsModal from '@/components/health-records-modal';
import MatchConfidence from '@/components/match-confidence';
import Breadcrumb from '@/components/breadcrumb';
import ProgressBar from '@/components/progress-bar';
import Select from '@/components/select';
import ehrSearchAnimation from '@/assets/lottie/ehr-search.json';
import { BookingContext } from '@/contexts/booking-context';
import { ReactComponent as ProfileIcon } from '@/assets/icons/profile.svg';
import useHandleError from '@/hooks/use-handle-error';

type StepProps = {
	onNext: (values: Partial<EpicPatientData>) => void;
	onPrev?: () => void;
	isSearching?: boolean;
	isBooking?: boolean;
	confidenceState?: ConfidenceState;
	numMatches?: number;
} & FormikProps<EpicPatientData>;

type ConfidenceState = {
	percent: number;
	description: string;
};

const NUM_STEPS = 3;

function getClearForm(account: AccountModel | undefined): EpicPatientData {
	return {
		firstName: '',
		lastName: '',
		middleInitial: '',
		dateOfBirth: '',
		address: {
			line1: '',
			line2: '',
			city: '',
			state: '',
			postalCode: '',
			country: 'USA',
		},
		nationalIdentifier: '',
		emailAddress: account?.emailAddress ?? '',
		phoneNumber: account?.phoneNumber ?? '',
	};
}

const EhrLookup: FC = () => {
	useHeaderTitle('assessment');

	const handleError = useHandleError();
	const history = useHistory();
	const [step, setStep] = useState(0);
	const [isSearching, setIsSearching] = useState(false);
	const [isBooking, setIsBooking] = useState(false);
	const [confidenceState, setConfidenceState] = useState<ConfidenceState>({
		percent: 0,
		description: 'undetermined',
	});

	const [healthRecordsModalIsOpen, setHealthRecordsModalIsOpen] = useState(true);

	const [numMatches, setNumMatches] = useState(0);

	const { account, setAccount } = useAccount();
	const [initialValues, setInitialValues] = useState<EpicPatientData>(getClearForm(account));
	const {
		selectedAppointmentTypeId,
		setSelectedDate,
		selectedProvider,
		setSelectedProvider,
		selectedTimeSlot,
		setSelectedTimeSlot,
		formattedAvailabilityDate,

		isEligible,
		setIsEligible,
		getExitBookingLocation,
	} = useContext(BookingContext);

	const previousStep = useCallback(() => {
		setStep(Math.max(step - 1, 0));
	}, [step]);

	const nextStep = useCallback(() => {
		setStep(Math.min(step + 1, NUM_STEPS));
	}, [step]);

	const exitUrl = useMemo(() => {
		return getExitBookingLocation(history.location.state);
	}, [getExitBookingLocation, history.location.state]);

	const searchRecords = useCallback(
		async (data: Partial<EpicPatientData>, matchStep: EpicMatchStep) => {
			if (!selectedProvider || !selectedTimeSlot || !selectedTimeSlot.epicDepartmentId) {
				return;
			}

			const request = accountService.epicMatch(matchStep, data, {
				providerId: selectedProvider.providerId,
				epicDepartmentId: selectedTimeSlot.epicDepartmentId,
				applyToCurrentAccount: false,
			});

			try {
				setIsSearching(true);
				window.scrollTo(0, 0);

				const response = await request.fetch();

				setIsSearching(false);
				setConfidenceState({
					percent: response.topMatchPercentage * 100,
					description: response.topMatchConfidenceDescription,
				});
				setNumMatches(response.matchCount);

				if (matchStep === 'STEP_3' && response.matchCount > 0) {
					setIsEligible(false);
				}
			} catch (error) {
				setIsSearching(false);
				throw error;
			}
		},
		[selectedProvider, selectedTimeSlot, setIsEligible]
	);

	const finishBooking = async (data: Partial<EpicPatientData>) => {
		if (isBooking || !selectedProvider || !selectedTimeSlot || !selectedTimeSlot.epicDepartmentId) {
			return;
		}

		const request = accountService.epicMatch('FINISH', data, {
			providerId: selectedProvider.providerId,
			epicDepartmentId: selectedTimeSlot.epicDepartmentId,
			applyToCurrentAccount: true,
		});

		try {
			const response = await request.fetch();
			setAccount(response.account);

			setIsBooking(true);
			const appointmentData: CreateAppointmentData = {
				providerId: selectedProvider.providerId,
				appointmentTypeId: selectedAppointmentTypeId,
				date: formattedAvailabilityDate,
				time: selectedTimeSlot.time,
			};

			const { appointment } = await appointmentService.createAppointment(appointmentData).fetch();

			setSelectedDate(undefined);
			setSelectedProvider(undefined);
			setSelectedTimeSlot(undefined);

			history.replace(`/my-calendar?appointmentId=${appointment.appointmentId}`, {
				successBooking: true,
				emailAddress: response.account.emailAddress,
			});
		} catch (e) {
			handleError(e);
		}

		setIsBooking(false);
	};

	if (!selectedProvider || !selectedTimeSlot) {
		return <Redirect to={exitUrl} />;
	}

	return (
		<>
			<HealthRecordsModal
				show={healthRecordsModalIsOpen}
				onHide={() => {
					setHealthRecordsModalIsOpen(false);
				}}
				onExitBooking={() => {
					if (window.confirm('Are you sure you want to exit booking?')) {
						history.replace(exitUrl);
					}
				}}
			/>

			<Breadcrumb
				breadcrumbs={[
					{
						to: '/',
						title: 'home',
					},
					{
						to: exitUrl,
						title: 'connect with support',
					},
					{
						to: '/#',
						title: 'appointment',
					},
				]}
			/>

			<ProgressBar current={step} max={NUM_STEPS + 1} />

			<Formik
				enableReinitialize
				initialValues={initialValues}
				onSubmit={(...args) => {
					// we never really "submit" the form
				}}
			>
				{(formikRenderProps) => {
					return (
						<Container className="pt-5">
							<Form>
								{step === 0 && (
									<>
										<Form.Label className="mb-8">find your health records </Form.Label>

										<FirstStep
											{...formikRenderProps}
											isSearching={isSearching}
											onNext={async (formValues: Partial<EpicPatientData>) => {
												try {
													await searchRecords(formValues, 'STEP_1');
													nextStep();
												} catch (error) {
													handleError(error);
												}
											}}
										/>
									</>
								)}

								{step === 1 && (
									<>
										<Form.Label>we need more information to find your record</Form.Label>

										<MatchConfidence {...confidenceState} className="mb-8" />

										<SecondStep
											{...formikRenderProps}
											isSearching={isSearching}
											onPrev={() => {
												previousStep();
											}}
											onNext={async (formValues: Partial<EpicPatientData>) => {
												try {
													await searchRecords(formValues, 'STEP_2');
													nextStep();
												} catch (error) {
													handleError(error);
												}
											}}
										/>
									</>
								)}

								{step === 2 && (
									<>
										<Form.Label>we've found a few possible matches, help us narrow it down</Form.Label>

										<MatchConfidence {...confidenceState} className="mb-8" />

										<ThirdStep
											{...formikRenderProps}
											isSearching={isSearching}
											onPrev={() => {
												previousStep();
											}}
											onNext={async (formValues: Partial<EpicPatientData>) => {
												try {
													await searchRecords(formValues, 'STEP_3');
													nextStep();
												} catch (error) {
													handleError(error);
												}
											}}
										/>
									</>
								)}

								{step === 3 && (
									<FourthStep
										{...formikRenderProps}
										confidenceState={confidenceState}
										numMatches={numMatches}
										isBooking={isBooking}
										onPrev={previousStep}
										onNext={finishBooking}
									/>
								)}
							</Form>

							<p className="text-center my-5">
								{isEligible && (
									<Prompt
										message={(location) => {
											if (location.pathname.startsWith('/connect-with-support')) {
												return 'Are you sure you want to exit booking?';
											}

											return true;
										}}
									/>
								)}
								<Link to={exitUrl}>exit booking</Link>
							</p>
						</Container>
					);
				}}
			</Formik>

			{__DEV__ && (
				<Container className="pt-5">
					<Row>
						{Object.entries<EpicPatientData[]>(require('../lib/utils/ehr-test-cases.json')).map(([scenario, data]) => {
							return (
								<Col key={scenario} className="my-4 d-flex flex-column" md={3}>
									<Form.Label style={{ ...fonts.xs }}>{scenario}</Form.Label>

									{data.map((testCase, idx) => (
										<Button key={idx} className="my-1" size="sm" onClick={() => setInitialValues(testCase)} style={{ ...fonts.xxs }}>
											{`${testCase.firstName} ${testCase.lastName}`}
										</Button>
									))}
								</Col>
							);
						})}
					</Row>
				</Container>
			)}
		</>
	);
};

export default EhrLookup;

function EhrLoading() {
	const animRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!animRef.current) {
			return;
		}

		Lottie.loadAnimation({
			container: animRef.current,
			renderer: 'svg',
			loop: true,
			autoplay: true,
			animationData: ehrSearchAnimation,
		});
	}, []);

	return (
		<Row className="my-4">
			<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
				<div className="p-6" style={{ minHeight: window.innerWidth }} ref={animRef}></div>

				<p className="text-center text-muted">searching . . .</p>
			</Col>
		</Row>
	);
}

function FirstStep({ values, handleChange, setFieldValue, onNext, isSearching }: StepProps) {
	// const canSubmit = values.firstName && values.lastName && values.dateOfBirth;

	const stepValues = pick(values, ['firstName', 'middleInitial', 'lastName', 'dateOfBirth']);

	if (isSearching) {
		return <EhrLoading />;
	}

	return (
		<>
			<Form.Group controlId="firstName">
				<Form.Label style={{ ...fonts.xs }}>First Name</Form.Label>
				<Form.Control required type="text" name="firstName" value={values.firstName} onChange={handleChange} />
			</Form.Group>

			<Form.Group controlId="middleInitial">
				<Form.Label style={{ ...fonts.xs }}>M.I.</Form.Label>
				<Form.Control type="text" name="middleInitial" value={values.middleInitial} onChange={handleChange} />
			</Form.Group>

			<Form.Group controlId="lastName">
				<Form.Label style={{ ...fonts.xs }}>Last Name</Form.Label>
				<Form.Control required type="text" name="lastName" value={values.lastName} onChange={handleChange} />
			</Form.Group>

			<Form.Group controlId="dateOfBirth">
				<Form.Label style={{ ...fonts.xs }}>Date of Birth</Form.Label>
				<DatePicker
					showYearDropdown
					showMonthDropdown
					dropdownMode="select"
					selected={values.dateOfBirth ? moment(values.dateOfBirth).toDate() : undefined}
					onChange={(date) => {
						setFieldValue('dateOfBirth', date ? moment(date).format('YYYY-MM-DD') : '');
					}}
				/>
			</Form.Group>

			<Form.Row>
				<Button
					className="ml-auto"
					type="button"
					onClick={async () => {
						if (!stepValues) {
							return;
						}

						onNext(stepValues);
					}}
				>
					search records
				</Button>
			</Form.Row>
		</>
	);
}

function SecondStep({ values, handleChange, setFieldValue, onNext, onPrev, isSearching }: StepProps) {
	const addressSearchInputRef = useRef<any>(null);
	const [searchQuery, setSearchQuery] = useState(values.address.line1);
	const [extractedAddress, setExtractedAddress] = useState(values.address);

	const canSubmit = !!values.phoneNumber;

	const stepValues = pick(values, ['firstName', 'lastName', 'dateOfBirth', 'phoneNumber', 'emailAddress', 'address']);

	const handleAddressInputChange = useCallback(
		(addressField: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setFieldValue('address', {
				...values.address,
				[addressField]: e.target.value,
			});
		},
		[setFieldValue, values.address]
	);

	useEffect(() => {
		googlePlacesService.loadScript().then(() => {
			if (!addressSearchInputRef.current) {
				return;
			}

			googlePlacesService.bindToInput(addressSearchInputRef.current, ({ formatted, extracted }) => {
				setSearchQuery(extracted.line1);
				setExtractedAddress(extracted);
			});
		});
	}, []);

	useEffect(() => {
		setFieldValue('address', extractedAddress);
	}, [extractedAddress, setFieldValue]);

	if (isSearching) {
		return <EhrLoading />;
	}

	return (
		<>
			<Form.Group controlId="phoneNumber">
				<Form.Label style={{ ...fonts.xs }}>Phone Number</Form.Label>
				<Form.Control required type="text" name="phoneNumber" value={values.phoneNumber} onChange={handleChange} />
			</Form.Group>

			<Form.Group controlId="emailAddress">
				<Form.Label style={{ ...fonts.xs }}>Email</Form.Label>
				<Form.Control type="text" name="emailAddress" value={values.emailAddress} onChange={handleChange} />
			</Form.Group>

			<Form.Group controlId="line1">
				<Form.Label style={{ ...fonts.xs }}>Address Line 1</Form.Label>
				<Form.Control
					ref={addressSearchInputRef}
					type="text"
					name="line1"
					value={searchQuery}
					placeholder="Search..."
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						const newVal = e.target.value;
						setSearchQuery(newVal);
						setFieldValue('address', {
							...values.address,
							line1: newVal,
						});
					}}
				/>
			</Form.Group>

			<Form.Group controlId="line2">
				<Form.Label style={{ ...fonts.xs }}>Address Line 2</Form.Label>
				<Form.Control type="text" name="line2" value={values.address.line2 || ''} onChange={handleAddressInputChange('line2')} />
			</Form.Group>

			<Form.Group controlId="city">
				<Form.Label style={{ ...fonts.xs }}>City</Form.Label>
				<Form.Control type="text" name="city" value={values.address.city} onChange={handleAddressInputChange('city')} />
			</Form.Group>

			<Form.Group controlId="state">
				<Form.Label style={{ ...fonts.xs }}>State</Form.Label>
				<Form.Control type="text" name="state" value={values.address.state} onChange={handleAddressInputChange('state')} />
			</Form.Group>

			<Form.Group controlId="postalCode">
				<Form.Label style={{ ...fonts.xs }}>Postal Code</Form.Label>
				<Form.Control type="text" value={values.address.postalCode} placeholder="ex. 19123" onChange={handleAddressInputChange('postalCode')} />
			</Form.Group>

			<Form.Row>
				<Button
					type="button"
					variant="outline-primary"
					onClick={async () => {
						onPrev && onPrev();
					}}
				>
					back
				</Button>

				<Button
					className="ml-auto"
					type="button"
					onClick={async () => {
						if (!canSubmit) {
							alert('Please enter fields');
							return;
						}

						if (!stepValues) {
							return;
						}

						onNext(stepValues);
					}}
				>
					search records
				</Button>
			</Form.Row>
		</>
	);
}

function ThirdStep({ values, handleChange, setFieldValue, onNext, onPrev, isSearching }: StepProps) {
	const canSubmit = true;

	const [lastFourSSN, setLastFourSSN] = useState(values.nationalIdentifier.substr(values.nationalIdentifier.length - 5));

	if (isSearching) {
		return <EhrLoading />;
	}

	return (
		<>
			<Form.Group controlId="nationalIdentifier">
				<Form.Label style={{ ...fonts.xs }}>SSN</Form.Label>
				<Form.Control
					as={InputMask}
					type="text"
					mask="XXX-XX-9999"
					maskChar="_"
					placeholder="XXX-XX-____"
					value={lastFourSSN}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
						const newLast4 = e.target.value;
						setLastFourSSN(newLast4);
						setFieldValue('nationalIdentifier', newLast4.replace('XXX-XX-', ''));
					}}
				/>
			</Form.Group>

			<Form.Group controlId="gender">
				<Form.Label style={{ ...fonts.xs }}>Gender</Form.Label>
				<Select
					value={values.gender || ''}
					onChange={(e) => {
						setFieldValue('gender', e.target.value);
					}}
				>
					<option value="">Select...</option>
					<option value="FEMALE">Female</option>
					<option value="MALE">Male</option>
				</Select>
			</Form.Group>

			<Form.Row>
				<Button
					type="button"
					variant="outline-primary"
					onClick={async () => {
						onPrev && onPrev();
					}}
				>
					back
				</Button>

				<Button
					className="ml-auto"
					type="button"
					onClick={async () => {
						if (!canSubmit) {
							alert('Please enter fields');
							return;
						}

						const stepValues = pick(values, [
							'phoneNumber',
							'emailAddress',
							'address',
							'firstName',
							'lastName',
							'dateOfBirth',
							'nationalIdentifier',
							'gender',
						]);

						if (!stepValues) {
							return;
						}

						onNext(stepValues);
					}}
				>
					search records
				</Button>
			</Form.Row>
		</>
	);
}

function FourthStep({ values, handleChange, confidenceState, onNext, onPrev, isBooking, numMatches }: StepProps) {
	return (
		<>
			{numMatches === 0 && (
				<>
					<Form.Label>we can't locate a record for you, so we'll create one</Form.Label>

					<RecordCard fullInfo confidenceState={confidenceState} data={values} showConfidence={false} />

					<Form.Group className="mt-4" controlId="nationalIdentifier">
						<Form.Label style={{ ...fonts.xs }}>Full social security number</Form.Label>
						<Form.Control
							type="text"
							name="nationalIdentifier"
							placeholder="000-00-0000"
							value={values.nationalIdentifier}
							onChange={handleChange}
						/>
					</Form.Group>
				</>
			)}

			{numMatches === 1 && (
				<>
					<Form.Label>we found your record</Form.Label>

					<RecordCard confidenceState={confidenceState} data={values} fullInfo={false} showConfidence />

					<p className="pt-3">If this record doesn't look right, please email cobaltplatform@xmog.com for help.</p>
				</>
			)}

			{typeof numMatches === 'number' && numMatches > 1 ? (
				<>
					<Form.Label>we'll call to confirm your booking</Form.Label>
					<p className="pt-3">
						We found multiple records that match your information. We'll forward your booking request to someone who will sort this out and call you
						once your booking is confirmed.
					</p>
				</>
			) : (
				<Form.Row>
					<Button
						variant="outline-primary"
						type="button"
						onClick={async () => {
							onPrev && onPrev();
						}}
					>
						back
					</Button>

					<Button
						disabled={isBooking}
						className="ml-auto"
						type="button"
						onClick={async () => {
							onNext(values);
						}}
					>
						finish booking
					</Button>
				</Form.Row>
			)}
		</>
	);
}

function RecordCard({
	confidenceState,
	data,
	fullInfo = false,
	showConfidence = false,
}: {
	confidenceState?: ConfidenceState;
	data: EpicPatientData;
	fullInfo?: boolean;
	showConfidence?: boolean;
}) {
	let fullName = data.firstName;
	if (data.middleInitial) {
		fullName += ' ' + data.middleInitial;
	}
	fullName += ' ' + data.lastName;
	return (
		<div className="d-flex bg-white p-3">
			<ProfileIcon className="mr-3" style={{ height: 80, width: 80 }} />

			<div className="d-flex flex-column flex-grow-1">
				<h4>{fullName}</h4>
				<p>born {moment(data.dateOfBirth).format('M/D/YY')}</p>
				{fullInfo && (
					<>
						<p>legal sex: {data.gender === 'MALE' ? 'male' : 'female'}</p>
						<p>{data.phoneNumber}</p>
						<p>{data.emailAddress}</p>
						<p>{data.address.line1}</p>
						{data.address.line2 && <p>{data.address.line2}</p>}
						<p>
							{data.address.city}, {data.address.state}
						</p>
					</>
				)}

				{showConfidence && confidenceState && (
					<>
						<hr />
						<MatchConfidence hideIcon {...confidenceState} className="mt-2" />
					</>
				)}
			</div>
		</div>
	);
}
