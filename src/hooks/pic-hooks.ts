import { useQuery, useQueries, useQueryClient, useMutation } from 'react-query';
import { R4 } from '@ahryman40k/ts-fhir-types';
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import moment from 'moment';
import config from '@/lib/config';
import Cookies from 'js-cookie';
import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	Appointment,
	ScheduleDetail,
	Disposition,
	PatientObject,
	PicAssessment,
	UpdateTriageReview,
	UpdatedOutcome,
	UpdatedDemographics,
	UpdatedFlag,
	QuestionnaireResponse,
	Contact,
	CreatedContact,
	IsBusinessHours,
} from '@/pages/pic/utils';
import { useHistory } from 'react-router-dom';
import useSubdomain from '@/hooks/use-subdomain';
import { appointmentService } from '@/lib/services';
import { AppointmentModel } from '@/lib/models';

const host = window.location.hostname;
const axiosConfig: AxiosRequestConfig = { headers: { Authorization: `Bearer ${Cookies.get('piccobalt_patientcontext')}` }, withCredentials: true };

// MHIC only calls
const mhicHeaderConfig = {
	...axiosConfig,
	headers: { ...axiosConfig.headers, 'Content-Type': 'application/json' },
};
const subdomain = useSubdomain();

const getPatient = async () => {
	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/patient`, axiosConfig);
	return data;
};

const getPatients = async (query: string) => {
	if (!query) {
		return { patients: [] };
	}

	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/patients?query=${encodeURIComponent(query)}`, axiosConfig);
	return data;
};

const getDisposition = async () => {
	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/disposition`, axiosConfig);
	return data;
};

const getDispositions = async () => {
	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/dispositions`, mhicHeaderConfig);
	return data;
};

const getDispositionById = async (dispositionId: string) => {
	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition/${dispositionId}`, mhicHeaderConfig);
	return data;
};

const getAssessmentByDispositionId = async (dispositionId: string) => {
	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition/${dispositionId}/assessment`, mhicHeaderConfig);
	return data;
};

const getIsBusinessHours = async () => {
	const { data } = await axios.get<IsBusinessHours>(`${config.COBALT_WEB_PIC_API_BASE_URL}/system/is-business-hours`, axiosConfig);
	return data.isBusinessHours;
};

const getAssessmentByPatientId = async (patientId: string) => {
	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/patient/${patientId}/assessment`, axiosConfig);
	return data;
};

export const uploadOrder = ({ formData, onUploadProgress }: { formData: FormData; onUploadProgress: (e: ProgressEvent) => void }) => {
	const cancelSource = axios.CancelToken.source();

	const uploadPromise = axios.post(`${config.COBALT_WEB_PIC_API_BASE_URL}/order-upload`, formData, {
		...mhicHeaderConfig,
		headers: {
			...mhicHeaderConfig.headers,
			'Content-Type': 'multipart/form-data',
		},
		onUploadProgress,
		cancelToken: cancelSource.token,
	});

	return {
		uploadPromise,
		abort: () => {
			cancelSource.cancel();
		},
	};
};

const getPatientDispositionByCobaltId = async (cobaltAccountId: string) => {
	const { data } = await axios.get(
		`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition/mhic?cobaltAccountId=${encodeURIComponent(cobaltAccountId)}`,
		mhicHeaderConfig
	);
	return data;
};

const getAssessments = async () => {
	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/assessments`, axiosConfig);
	return data;
};

const getUpcomingAppointments = async () => {
	const { appointments } = await httpSingleton
		.orchestrateRequest<{ appointments: AppointmentModel[] }>({
			method: 'get',
			url: 'appointments?type=UPCOMING&responseFormat=DEFAULT',
		})
		.fetch();
	return appointments;
};

const getRecentAppointments = async () => {
	const { appointments } = await httpSingleton
		.orchestrateRequest<{ appointments: AppointmentModel[] }>({
			method: 'get',
			url: 'appointments?type=RECENT&responseFormat=DEFAULT',
		})
		.fetch();
	return appointments;
};

const getPicPatientById = async (id: string) => {
	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/patients/${id}`, mhicHeaderConfig);
	return data;
};

const getValidMhic = async () => {
	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/session/mhic`, mhicHeaderConfig);
	return data;
};

const getQuestionnaireResponsesByDispositionId = async (id: string) => {
	const { data } = await axios.get<QuestionnaireResponse[]>(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition/${id}/responses`, mhicHeaderConfig);
	return data;
};

const getContactsByDispositionId = async (id: string) => {
	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition/${id}/contact`, mhicHeaderConfig);
	return data;
};

export const postQuestionnaireResponse = async (assessmentId: string, questionnaireResponse: R4.IQuestionnaireResponse) => {
	const postConfig = { ...axiosConfig, headers: { ...axiosConfig.headers, 'Content-Type': 'application/json' } };
	const { data } = await axios.post(`${config.COBALT_WEB_PIC_API_BASE_URL}/assessment/${assessmentId}/responses`, questionnaireResponse, postConfig);
	return data;
};

export const useSubmitResponse = (assessmentId: string) => {
	const queryClient = useQueryClient();

	const postQuestionnaire = async (questionnaireResponse: R4.IQuestionnaireResponse) => {
		return postQuestionnaireResponse(assessmentId, questionnaireResponse);
	};

	return useMutation(postQuestionnaire, {
		onSuccess: async (data, variables, context) => {
			// This shouldn't be necessary, but for some reason multiple calls to invalidateQueries is breaking things;
			return queryClient.invalidateQueries({
				predicate: (q) => {
					return q.queryKey === 'disposition' || q.queryKey[0] === 'assessment';
				},
			});
		},
	});
};

export const useUpdateTriageReview = () => {
	const queryClient = useQueryClient();

	const postUpdatedTriageReview = async ({ dispositionId, body }: { dispositionId: string; body: UpdateTriageReview }) => {
		return updateTriageReview(dispositionId, body);
	};

	return useMutation(postUpdatedTriageReview, {
		onSettled: () => {
			queryClient.invalidateQueries('disposition');
		},
		onMutate: async ({ dispositionId, body }) => {
			await queryClient.cancelQueries('disposition');

			const previousValue = queryClient.getQueryData<Disposition[]>('disposition');

			if (previousValue) {
				queryClient.setQueryData<Disposition[]>(
					'disposition',
					previousValue.map((disp) => {
						if (disp.id === dispositionId) {
							return { ...disp, triageReview: body };
						}
						return disp;
					})
				);
			}

			return previousValue;
		},
	});
};

export const putCompleteAssessment = async (assessmentId: string) => {
	const postConfig = { ...axiosConfig, headers: { ...axiosConfig.headers, 'Content-Type': 'application/json' } };
	const { data } = await axios.put(`${config.COBALT_WEB_PIC_API_BASE_URL}/assessment/${assessmentId}/complete`, null, postConfig);
	return data;
};

export const useCompleteAssessment = () => {
	const queryClient = useQueryClient();

	const putComplete = async (assessmentId: string) => {
		return putCompleteAssessment(assessmentId);
	};

	return useMutation(putComplete, {
		onSuccess: (data, assessmentId, context) => {
			return queryClient.invalidateQueries(['assessment', assessmentId]);
		},
	});
};

const getAssessmentResponses = async (assessmentId: string) => {
	const { data } = await axios.get(`${config.COBALT_WEB_PIC_API_BASE_URL}/assessment/${assessmentId}/responses`, axiosConfig);
	return data;
};

const getAssessmentQuestionnaire = async (assessmentId: string) => {
	const { data } = await axios.get<R4.IQuestionnaire>(`${config.COBALT_WEB_PIC_API_BASE_URL}/assessment/${assessmentId}/questionnaire`, axiosConfig);
	return data;
};

export const useAssessmentResponses = (assessmentId: string) => {
	return useQuery(['assessment', assessmentId, 'responses'], () => getAssessmentResponses(assessmentId), { refetchOnWindowFocus: false });
};

export const useAssessmentQuestionnaire = (assessmentId: string) => {
	// Potentially set this to shorter than infinity, but this needs to be not stale for the form to render, so staleTime needs to exist
	return useQuery(['assessment', assessmentId, 'questionnaire'], () => getAssessmentQuestionnaire(assessmentId), {
		refetchOnWindowFocus: false,
	});
};

export const useGetPicPatient = (callback: (data: PatientObject) => void, errorHandler?: (error: AxiosError) => void) => {
	return useQuery('patient', getPatient, {
		onSuccess: (data) => callback(data),
		onError: (error: AxiosError) =>
			errorHandler
				? errorHandler(error)
				: (error: AxiosError) => {
						console.error(error);
				  },
		retry: 1,
	});
};

export const useGetPicPatients = (query: string, callback: (data: { patients: PatientObject[] }) => void) => {
	return useQuery(['patients', query], () => getPatients(query), { onSuccess: (data) => callback(data), retry: 1 });
};

export const useGetDisposition = () => {
	return useQuery<Disposition>('disposition', getDisposition);
};

export const putCrisisAcknowledged = async (dispositionId: string) => {
	const putConfig = { ...axiosConfig, headers: { ...axiosConfig.headers, 'Content-Type': 'application/json' } };
	const { data } = await axios.put(
		`${config.COBALT_WEB_PIC_API_BASE_URL}/disposition/${dispositionId}/crisis-acknowledged`,
		undefined, // no put body needed
		putConfig
	);
	return data;
};

export const useAcknowledgeCrisis = () => {
	const queryClient = useQueryClient();
	return useMutation(putCrisisAcknowledged, {
		onSuccess: () => {
			queryClient.invalidateQueries(['disposition']);
		},
	});
};

export const useGetIsBusinessHours = () => {
	return useQuery<boolean>('isBusinessHours', getIsBusinessHours, {
		retry: 1,
	});
};

export const useGetDispositions = () => {
	return useQuery('disposition', getDispositions);
};

const getAppointmentsByPatientId = async (patientCobaltAccountId: string) => {
	if (patientCobaltAccountId === null) {
		return [];
	}

	const apptsRequest = appointmentService.getAppointments({ accountId: patientCobaltAccountId, type: 'UPCOMING', responseFormat: 'DEFAULT' });
	const followupsRequest = appointmentService.getFollowups({ accountId: patientCobaltAccountId, filterBy: 'UPCOMING' });

	// TODO: get rid of the onCancel method here and use a mutate hook

	return Promise.all([apptsRequest.fetch(), followupsRequest.fetch()]).then(([apptsRes, followupsRes]) => {
		const appts: ScheduleDetail[] = apptsRes.appointments.map((a) => {
			const formattedDateTime = `${moment(a.startTime).format('MM/DD/YYYY - h:mma')} - ${moment(a.endTime).format('h:mma')}`;
			const formattedTableDate = moment(a.startTime).format('MM/DD');

			return {
				id: a.appointmentId,
				dateString: a.startTime,
				formattedDateTime,
				type: 'Appointment',
				reason: a.appointmentReason?.description ?? '',
				with: a.provider?.name ?? '',
				formattedTableDate,
				onCancel: appointmentService.cancelAppointment(a.appointmentId).fetch,
			};
		});

		const followups: ScheduleDetail[] = followupsRes.followups.map((f) => {
			const formattedDateTime = moment(f.followupDate).format('MM/DD/YYYY');
			const formattedTableDate = moment(f.followupDate).format('MM/DD');

			return {
				id: f.followupId,
				dateString: f.followupDate,
				formattedDateTime,
				type: 'Follow-up',
				reason: f.appointmentReason?.description ?? '',
				with: f.provider?.name ?? '',
				formattedTableDate,
				onCancel: appointmentService.cancelFollowup(f.followupId).fetch,
			};
		});

		const list = [...appts, ...followups].sort(function (a, b) {
			return a.dateString < b.dateString ? -1 : a.dateString > b.dateString ? 1 : 0;
		});

		return list;
	});
};

export const useGetAppointments = (patientIds: string[]) => {
	const queries = patientIds.map((id) => ({ queryKey: ['appointments', id], queryFn: () => getAppointmentsByPatientId(id) }));
	return useQueries(queries);
};

export const useGetPatientDispositionByCobaltId = (cobaltAccountId: string, callback: (data: Disposition) => void) => {
	return useQuery(['disposition', cobaltAccountId], () => getPatientDispositionByCobaltId(cobaltAccountId), {
		onSuccess: (data) => callback(data),
		retry: 1,
		enabled: !!cobaltAccountId,
	});
};

export const useGetAssessmentByPatientId = (patientId?: string) => {
	return useQuery<PicAssessment>(['assessment', patientId], () => getAssessmentByPatientId(patientId as string), {
		retry: 1,
		enabled: patientId !== undefined,
	});
};

export const useGetDispositionById = (dispositionId?: string) => {
	return useQuery(['disposition', dispositionId], () => getDispositionById(dispositionId as string), {
		retry: 1,
		enabled: dispositionId !== undefined,
	});
};

export const useGetAssessmentByDispositionId = (dispositionId?: string) => {
	return useQuery<PicAssessment>(['assessment', 'disposition', dispositionId], () => getAssessmentByDispositionId(dispositionId as string), {
		retry: 1,
		enabled: dispositionId !== undefined,
	});
};

export const useGetAssessments = (callback: (data: PicAssessment[]) => void) => {
	return useQuery('assessments', getAssessments, { onSuccess: (data) => callback(data), retry: 1 });
};

export const useGetUpcomingAppointments = () => {
	return useQuery('upcomingAppointments', getUpcomingAppointments, { retry: 1 });
};

export const useGetRecentAppointments = () => {
	return useQuery('recentAppointments', getRecentAppointments, { retry: 1 });
};

export const useGetQuestionnaireResponsesByDispositionId = (id: string) => {
	return useQuery(['dispositionresponses', id], () => getQuestionnaireResponsesByDispositionId(id), {
		enabled: !!id,
	});
};

export const useGetContactsByDispositionId = (id: string, callback: (data: Contact[]) => void) => {
	return useQuery(['dispositioncontacts', id], () => getContactsByDispositionId(id), { onSuccess: (data) => callback(data), retry: 1, enabled: !!id });
};

export const useGetValidMhic = (callback: (data: string) => void) => {
	const history = useHistory();

	return useQuery('validMhic', getValidMhic, {
		onSuccess: (data) => callback(data),
		onError: ({ response }) => {
			response.status === 401 && subdomain === 'pic' && history.push('/patient-sign-in');
		},
		retry: 1,
	});
};

export const useGetPicPatientById = (id: string, callback?: (data: PatientObject) => void) => {
	return useQuery<PatientObject>(['picpatient', id], () => getPicPatientById(id), {
		onSuccess: (data) => {
			if (callback) {
				callback(data);
			}
		},
		retry: 1,
		enabled: !!id,
	});
};

export const usePostMhicDispositionNote = () => {
	const queryClient = useQueryClient();
	return useMutation(
		'disposition-notes',
		async (note: { dispositionId: string; note: string }) => {
			const { data } = await axios.post(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition-notes`, note, mhicHeaderConfig);

			return data;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['disposition']);
			},
		}
	);
};

export const useDeleteMhicDispositionNote = () => {
	const queryClient = useQueryClient();
	return useMutation(
		'disposition-notes',
		async (dispositionNoteId: string) => {
			const { data } = await axios.delete(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition-notes/${dispositionNoteId}`, mhicHeaderConfig);

			return data;
		},
		{
			onSuccess: () => {
				queryClient.invalidateQueries(['disposition']);
			},
		}
	);
};

export const updateTriageReview = async (dispositionId: string, triage: UpdateTriageReview) => {
	const { data } = await axios.put(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition/${dispositionId}/triage-review`, triage, mhicHeaderConfig);
	return data;
};

export const putOutcome = async (outcome: UpdatedOutcome, id: string) => {
	// @ts-ignore
	const { isLoading, isError, data } = await axios.put(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition/${id}/outcome`, outcome, mhicHeaderConfig);
	return data;
};

export const putFlag = async (flag: UpdatedFlag, id: string) => {
	// @ts-ignore
	const { isLoading, isError, data } = await axios.put(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition/${id}/flag`, flag, mhicHeaderConfig);
	return data;
};

// MHIC call to update patients demographics
export const putUpdatePatientsDemographics = async (demographics: UpdatedDemographics, id: string) => {
	// @ts-ignore
	const { isLoading, isError, data } = await axios.put(`${config.COBALT_WEB_PIC_API_BASE_URL}/patient/${id}/demographics`, demographics, mhicHeaderConfig);
	return { isLoading, isError, data };
};

// patient call to update patient demographics
export const putUpdatePatientDemographics = async (demographics: UpdatedDemographics, id: string) => {
	// @ts-ignore
	const { isLoading, isError, data } = await axios.put(`${config.COBALT_WEB_PIC_API_BASE_URL}/patient/${id}/demographics`, demographics, axiosConfig);
	return { isLoading, isError, data };
};

export const postContact = async (contact: CreatedContact, id: string) => {
	const { data } = await axios.post(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition/${id}/contact`, contact, mhicHeaderConfig);
	return data;
};

export const postSpecialtyScheduling = async (postData: Disposition['specialtyCareScheduling'], dispositionId: string) => {
	const { data } = await axios.post(
		`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition/${dispositionId}/specialty-care-scheduling`,
		postData,
		mhicHeaderConfig
	);
	return data;
};

export const deleteSpecialtyScheduling = async (dispositionId: string) => {
	const { data } = await axios.delete(`${config.COBALT_WEB_PIC_API_BASE_URL}/mhic/disposition/${dispositionId}/specialty-care-scheduling`, mhicHeaderConfig);
	return data;
};
