import dynamic from 'next/dynamic';
import { useCallback } from 'react';

export default function Meet({
  params: {
    id: [callId, threadId, acsId, acsToken, displayName],
  },
}: {
  params: { id: string[] };
}) {
  const AzureVideoCallWithChat = dynamic(
    () => import('../../../../../components/common/AzureVideoCallWithChat'),
    { ssr: false }
  );

  const getAcsId = useCallback((acsId: string) => {
    return {
      communicationUserId: acsId,
    };
  }, []);

  return (
    <>
      <div className='h-screen' >
        <AzureVideoCallWithChat
          displayName={displayName || ''}
          locator={callId}
          token={acsToken || ''}
          userId={getAcsId(acsId || '')}
          threadId={threadId}
        />
      </div>
    </>
  );
}
