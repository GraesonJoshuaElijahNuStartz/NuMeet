'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FloatingDraggableContainer,
  PatientConsultationDetails,
} from '@components/common';
import Layout from '@components/Layout';
import { getUser, setUser } from '@helpers';
import { useRefreshAcsToken } from 'apps/frontend/src/queries/acs.query';
import { User } from 'apps/frontend/src/types';
import dynamic from 'next/dynamic';
import { UserRoleEnum } from 'apps/frontend/src/enum';

export default function Call({
  params: {
    id: [callId, threadId, patientOrDoctorId, consultationId],
  },
}: {
  params: { id: string[] };
}) {
  const [currentUser, setCurrentUser] = useState<User>();
  const AzureVideoCallWithChat = dynamic(
    () => import('../../../../components/common/AzureVideoCallWithChat'),
    { ssr: false }
  );
  const { data: acsTokenResponse } = useRefreshAcsToken(
    currentUser?.acs?.acsToken ? '' : currentUser?.acs?.acsId || ''
  );

  useEffect(() => {
    if (!currentUser) {
      getUser().then((res: User) => {
        setCurrentUser(res);
      });
    }
    if (acsTokenResponse) {
      const { token } = acsTokenResponse;
      handleSetAcsToken(token);
    }
  }, [acsTokenResponse]);

  const handleSetAcsToken = async (token: string) => {
    const user: User = await getUser();
    const acs = {
      acsId: user.acs.acsId,
      acsToken: token,
    };
    const setUserData = { ...user, acs };
    setUser(setUserData);
    setCurrentUser(setUserData);
  };

  const getPatientAndDoctorId = useMemo(() => {
    if (currentUser?.user?.role) {
      const { user, profileId } = currentUser;
      const isPatient = UserRoleEnum.PATIENT === user?.role;
      const patientId = isPatient ? profileId : patientOrDoctorId;
      const doctorId = isPatient ? patientOrDoctorId : profileId;
      return { patientId, doctorId };
    }
    return {};
  }, [patientOrDoctorId, currentUser]);

  const getAcsId = useCallback((acsId: string) => {
    return {
      communicationUserId: acsId,
    };
  }, []);

  return (
    <Layout>
      <FloatingDraggableContainer
        isResizable={false}
        hideMaximizeButton={currentUser?.user?.role === UserRoleEnum.PATIENT}
        className="bg-white overflow-hidden"
      >
        {currentUser ? (
          <AzureVideoCallWithChat
            displayName={currentUser?.firstName || ''}
            locator={callId}
            token={currentUser?.acs?.acsToken || ''}
            userId={getAcsId(currentUser?.acs?.acsId || '')}
            threadId={threadId}
            getPatientAndDoctorId={getPatientAndDoctorId}
          />
        ) : null}
      </FloatingDraggableContainer>
      {currentUser?.user.role !== UserRoleEnum.PATIENT ? (
        <PatientConsultationDetails consultationId={consultationId || ''} />
      ) : null}
    </Layout>
  );
}
