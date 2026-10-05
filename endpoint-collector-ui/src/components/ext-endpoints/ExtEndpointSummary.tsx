import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExtEndpointSummaryTemplate,
  ConfirmationDialog,
  TextTruncate,
  ProgressBar,
  ColumnMetadata,
  GenericActionMetadata,
  SpeedDialActionMetadata,
  PagingResult,
} from '@hvantran/ui-component-library';
import { PlayCircle, PauseCircle, Trash2, Eye, RefreshCw, PlusCircle } from 'lucide-react';
import {
  LocalStorageService,
  RestClient,
} from '../GenericConstants';
import {
  EndpointBackendClient,
  ExtEndpointOverview,
  ROOT_BREADCRUMB,
} from '../AppConstants';

const pageIndexStorageKey = 'endpoint-collector-summary-table-page-index';
const pageSizeStorageKey = 'endpoint-collector-summary-table-page-size';
const orderByStorageKey = 'endpoint-collector-summary-table-order';

export default function ExtEndpointSummary() {
  const navigate = useNavigate();
  const [processTracking, setCircleProcessOpen] = useState(false);
  const initialPagingResult: PagingResult = { totalElements: 0, content: [] };
  const [pagingResult, setPagingResult] = useState<PagingResult>(initialPagingResult);
  const [searchText, setSearchText] = useState('');
  const [pageIndex, setPageIndex] = useState(
    parseInt(LocalStorageService.getOrDefault(pageIndexStorageKey, 0), 10)
  );
  const [pageSize, setPageSize] = useState(
    parseInt(LocalStorageService.getOrDefault(pageSizeStorageKey, 10), 10)
  );
  const [orderBy, setOrderBy] = useState(
    LocalStorageService.getOrDefault(orderByStorageKey, '-createdAt')
  );

  const restClient = useMemo(() => new RestClient(setCircleProcessOpen), [setCircleProcessOpen]);
  const [deleteConfirmationDialogOpen, setDeleteConfirmationDialogOpen] = useState(false);
  const [confirmationDialogContent, setConfirmationDialogContent] = useState<React.ReactNode>(<p />);
  const [confirmationDialogTitle, setConfirmationDialogTitle] = useState('');
  const [confirmationDialogPositiveAction, setConfirmationDialogPositiveAction] = useState<() => void>(
    () => () => {}
  );

  const breadcrumbs = [
    { label: ROOT_BREADCRUMB, href: '#' },
    { label: 'Summary' },
  ];

  const loadData = () => {
    EndpointBackendClient.loadEndpointSummaryAsync(
      pageIndex,
      pageSize,
      orderBy,
      restClient,
      (extEndpointPagingResult: PagingResult) => setPagingResult(extEndpointPagingResult)
    );
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, orderBy, searchText, restClient]);

  const columns: ColumnMetadata[] = [
    {
      id: 'endpointId',
      label: 'Endpoint ID',
      isHidden: true,
      minWidth: 100,
      isKeyColumn: true,
    },
    {
      id: 'application',
      label: 'Application',
      minWidth: 100,
      isSortable: true,
    },
    {
      id: 'taskName',
      label: 'Task',
      minWidth: 50,
      format: (value: string) => <TextTruncate text={value || ''} maxTextLength={50} />,
      isSortable: true,
    },
    {
      id: 'targetURL',
      label: 'Target URL',
      minWidth: 100,
      align: 'left',
      format: (value: string) => <TextTruncate text={value || ''} maxTextLength={20} />,
      isSortable: true,
    },
    {
      id: 'state',
      label: 'State',
      minWidth: 20,
      align: 'left',
      isSortable: true,
    },
    {
      id: 'numberOfCompletedTasks',
      label: 'No tasks',
      minWidth: 100,
      align: 'left',
      isSortable: true,
    },
    {
      id: 'numberOfResponses',
      label: 'No responses',
      minWidth: 100,
      align: 'left',
      isSortable: true,
      format: (value: number) => (value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '0'),
    },
    {
      id: 'percentCompleted',
      label: 'Percent',
      minWidth: 100,
      align: 'left',
      isSortable: true,
      renderCell: (row: ExtEndpointOverview) => (
        <div className="w-24">
          <ProgressBar value={row.percentCompleted || 0} showPercentage={true} size="sm" />
        </div>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created at',
      minWidth: 100,
      align: 'left',
      isSortable: true,
      format: (value: string) => value || '',
    },
    {
      id: 'elapsedTime',
      label: 'Elapsed time',
      minWidth: 50,
      align: 'left',
      isSortable: true,
      format: (value: string) => value || '',
    },
    {
      id: 'actions',
      label: '',
      minWidth: 140,
      align: 'right',
      actions: [
        {
          actionIcon: <PlayCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
          visible: (row: ExtEndpointOverview) => row.state === 'PAUSED',
          actionLabel: 'Resume',
          actionName: 'resumeEndpoint',
          onClick: (row: ExtEndpointOverview) => async () => {
            await EndpointBackendClient.update(row.endpointId, { state: 'ACTIVE' }, restClient);
            loadData();
          },
        },
        {
          actionIcon: <PauseCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
          visible: (row: ExtEndpointOverview) => row.state === 'ACTIVE',
          actionLabel: 'Pause',
          actionName: 'pauseEndpoint',
          onClick: (row: ExtEndpointOverview) => async () => {
            await EndpointBackendClient.update(row.endpointId, { state: 'PAUSED' }, restClient);
            loadData();
          },
        },
        {
          actionIcon: <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
          actionLabel: 'Delete endpoint',
          actionName: 'deleteAction',
          onClick: (row: ExtEndpointOverview) => () => {
            setConfirmationDialogTitle('Delete Endpoint');
            setConfirmationDialogContent(
              <p>
                Are you sure you want to delete <b>{row.application}</b> endpoint?
              </p>
            );
            setConfirmationDialogPositiveAction(() => () => {
              EndpointBackendClient.deleteEndpointCollector(row.endpointId, restClient, () => {
                loadData();
              });
              setDeleteConfirmationDialogOpen(false);
            });
            setDeleteConfirmationDialogOpen(true);
          },
        },
        {
          actionIcon: <Eye className="w-4 h-4" />,
          actionLabel: 'Action details',
          actionName: 'gotoActionDetail',
          onClick: (row: ExtEndpointOverview) => () => {
            navigate(`/endpoints/${row.endpointId}`);
          },
        },
      ],
    },
  ];

  const floatingActions: SpeedDialActionMetadata[] = [
    {
      actionIcon: <PlusCircle className="w-5 h-5" />,
      actionName: 'create',
      actionLabel: 'New Endpoint',
      onClick: () => navigate('/endpoints/new'),
    },
  ];

  const headerActions: GenericActionMetadata[] = [
    {
      actionIcon: <RefreshCw className="w-4 h-4" />,
      actionLabel: 'Refresh endpoints',
      actionName: 'refreshAction',
      onClick: () => loadData(),
    },
  ];

  return (
    <>
      <ExtEndpointSummaryTemplate<ExtEndpointOverview>
        pageTitle="Endpoints"
        breadcrumbs={breadcrumbs}
        headerActions={headerActions}
        floatingActions={floatingActions}
        tableProps={{
          name: 'Endpoint Overview',
          columns,
          keyColumn: 'endpointId',
          loading: processTracking,
          pagingResult,
          pagingOptions: {
            pageIndex,
            pageSize,
            orderBy,
            searchText,
            rowsPerPageOptions: [5, 10, 20],
            onPageChange: (pIndex, pSize, pOrderBy, pSearch) => {
              setPageIndex(pIndex);
              setPageSize(pSize);
              setOrderBy(pOrderBy);
              setSearchText(pSearch);
              LocalStorageService.put(pageIndexStorageKey, pIndex);
              LocalStorageService.put(pageSizeStorageKey, pSize);
              LocalStorageService.put(orderByStorageKey, pOrderBy);
            },
          },
          onRowClickCallback: (row: ExtEndpointOverview) => navigate(`/endpoints/${row.endpointId}`),
        }}
      />
      <ConfirmationDialog
        open={deleteConfirmationDialogOpen}
        title={confirmationDialogTitle}
        content={confirmationDialogContent}
        positiveText="Yes"
        negativeText="No"
        negativeAction={() => setDeleteConfirmationDialogOpen(false)}
        positiveAction={confirmationDialogPositiveAction}
      />
    </>
  );
}