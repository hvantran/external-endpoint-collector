import React from 'react';
import { useParams } from 'react-router-dom';
import { ExtEndpointResponseDetailsTemplate } from '@hvantran/ui-component-library';
import { ROOT_BREADCRUMB } from '../AppConstants';

export default function ExtEndpointResponseDetails() {
  const { application, response } = useParams<{ application: string; response: string }>();

  const breadcrumbs = [
    { label: ROOT_BREADCRUMB, href: '/endpoints' },
    { label: application || 'Endpoint', href: `/endpoints/${application}` },
    { label: response || 'Response' },
  ];

  return (
    <ExtEndpointResponseDetailsTemplate
      pageTitle={`Response ${response || ''}`}
      breadcrumbs={breadcrumbs}
      properties={[]}
      onPropertyChange={() => {}}
    />
  );
}