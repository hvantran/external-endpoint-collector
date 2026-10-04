import React, { useState, useMemo, useEffect } from 'react';
import {
  EntitySummaryTemplate,
  TextTruncate,
  ColumnMetadata,
  GenericActionMetadata,
  PagingResult,
} from '@hvantran/ui-component-library';
import { RefreshCw } from 'lucide-react';
import { EndpointBackendClient } from '../AppConstants';
import { LocalStorageService, RestClient } from '../GenericConstants';

const pageIndexStorageKey = 'endpoint-responses-summary-table-page-index';
const pageSizeStorageKey = 'endpoint-responses-summary-table-page-size';
const orderByStorageKey = 'endpoint-responses-summary-table-order';

export default function ExtResponseSummary() {
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
    LocalStorageService.getOrDefault(orderByStorageKey, '-column1')
  );

  const restClient = useMemo(() => new RestClient(setCircleProcessOpen), [setCircleProcessOpen]);

  const breadcrumbs = [
    { label: 'Responses', href: '#' },
    { label: 'Summary' },
  ];

  const columns: ColumnMetadata[] = [
    {
      id: 'column1',
      label: 'Column 1',
      isSortable: true,
      minWidth: 100,
      isKeyColumn: true,
      renderCell: (row: any) => <TextTruncate text={row.column1 || ''} maxTextLength={50} />,
    },
    {
      id: 'column2',
      isSortable: true,
      label: 'Column 2',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column2 || ''} maxTextLength={50} />,
    },
    {
      id: 'column3',
      label: 'Column 3',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column3 || ''} maxTextLength={20} />,
    },
    {
      id: 'column4',
      label: 'Column 4',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column4 || ''} maxTextLength={50} />,
    },
    {
      id: 'column5',
      label: 'Column 5',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column5 || ''} maxTextLength={50} />,
    },
    {
      id: 'column6',
      label: 'Column 6',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column6 || ''} maxTextLength={50} />,
    },
    {
      id: 'column7',
      label: 'Column 7',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column7 || ''} maxTextLength={50} />,
    },
    {
      id: 'column8',
      label: 'Column 8',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column8 || ''} maxTextLength={50} />,
    },
    {
      id: 'column9',
      label: 'Column 9',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column9 || ''} maxTextLength={50} />,
    },
    {
      id: 'column10',
      label: 'Column 10',
      isSortable: true,
      align: 'left',
      minWidth: 100,
      renderCell: (row: any) => <TextTruncate text={row.column10 || ''} maxTextLength={50} />,
    },
  ];

  const loadData = () => {
    EndpointBackendClient.loadResponseSummaryAsync(
      pageIndex,
      pageSize,
      orderBy,
      searchText,
      restClient,
      (extEndpointPagingResult: PagingResult) => setPagingResult(extEndpointPagingResult)
    );
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize, orderBy, searchText, restClient]);

  const headerActions: GenericActionMetadata[] = [
    {
      actionIcon: <RefreshCw className="w-4 h-4" />,
      actionLabel: 'Refresh',
      actionName: 'refreshAction',
      onClick: () => loadData(),
    },
  ];

  return (
    <EntitySummaryTemplate
      pageTitle="Responses"
      breadcrumbs={breadcrumbs}
      headerActions={headerActions}
      tableProps={{
        name: 'Response Overview',
        columns,
        keyColumn: 'column1',
        visibleSearchbar: true,
        loading: processTracking,
        pagingResult,
        pagingOptions: {
          pageIndex,
          pageSize,
          orderBy,
          searchText,
          rowsPerPageOptions: [10, 50, 100, 500],
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
      }}
    />
  );
}