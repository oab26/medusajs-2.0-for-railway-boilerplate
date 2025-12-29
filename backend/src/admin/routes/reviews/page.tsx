import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  Container,
  Heading,
  DataTable,
  createDataTableColumnHelper,
  useDataTable,
  DataTablePaginationState,
  StatusBadge,
  Badge,
  createDataTableCommandHelper,
  Toaster,
  toast,
  DataTableRowSelectionState,
} from "@medusajs/ui"
import { useNavigate, Link } from "react-router-dom"
import { ChatBubbleLeftRight, CheckCircleSolid, Photo } from "@medusajs/icons"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { sdk } from "../../lib/sdk"

export type ReviewImage = {
  id: string
  url: string
  file_id: string
  sort_order: number
}

export type Review = {
  id: string
  title?: string
  content: string
  rating: number
  status: "pending" | "approved" | "rejected"
  first_name: string
  last_name: string
  verified_purchase: boolean
  product_id: string
  customer_id?: string
  created_at: string
  updated_at: string
  product?: { id: string; title: string }
  images?: ReviewImage[]
}

type ReviewsResponse = {
  reviews: Review[]
  count: number
  offset: number
  limit: number
}

const columnHelper = createDataTableColumnHelper<Review>()

const columns = [
  columnHelper.select(),
  columnHelper.accessor("id", {
    header: "ID",
    cell: ({ getValue }) => getValue().slice(0, 8) + "...",
  }),
  columnHelper.accessor("images", {
    header: "Images",
    cell: ({ getValue }) => {
      const images = getValue()
      if (!images || images.length === 0) {
        return <span className="text-ui-fg-muted">-</span>
      }
      return (
        <div className="flex items-center gap-1">
          <Photo className="w-4 h-4 text-ui-fg-subtle" />
          <span>{images.length}</span>
        </div>
      )
    },
  }),
  columnHelper.accessor("rating", {
    header: "Rating",
    cell: ({ getValue }) => (
      <span className="text-yellow-500">
        {"★".repeat(getValue())}
        {"☆".repeat(5 - getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("title", {
    header: "Title",
    cell: ({ getValue }) => getValue() || <span className="text-ui-fg-muted">-</span>,
  }),
  columnHelper.accessor("verified_purchase", {
    header: "Verified",
    cell: ({ getValue }) =>
      getValue() ? (
        <Badge color="green" className="flex items-center gap-1">
          <CheckCircleSolid className="w-3 h-3" /> Verified
        </Badge>
      ) : (
        <span className="text-ui-fg-muted">-</span>
      ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue()
      const color =
        status === "approved" ? "green" : status === "rejected" ? "red" : "grey"
      return (
        <StatusBadge color={color}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </StatusBadge>
      )
    },
  }),
  columnHelper.accessor("product", {
    header: "Product",
    cell: ({ getValue }) => {
      const product = getValue()
      return product ? (
        <Link
          to={`/products/${product.id}`}
          className="text-ui-fg-interactive hover:underline"
        >
          {product.title}
        </Link>
      ) : (
        <span className="text-ui-fg-muted">-</span>
      )
    },
  }),
]

const ReviewsPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const limit = 15
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0,
  })
  const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>(
    {}
  )

  const offset = useMemo(() => {
    return pagination.pageIndex * limit
  }, [pagination])

  const { data, isLoading } = useQuery({
    queryFn: () =>
      sdk.client.fetch<ReviewsResponse>("/admin/reviews", {
        method: "GET",
        query: {
          limit,
          offset,
        },
      }),
    queryKey: ["reviews", "list", limit, offset],
  })

  const updateStatus = useMutation({
    mutationFn: (variables: { ids: string[]; status: string }) =>
      sdk.client.fetch("/admin/reviews/status", {
        method: "POST",
        body: variables,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] })
      setRowSelection({})
      toast.success("Review status updated")
    },
    onError: () => {
      toast.error("Failed to update review status")
    },
  })

  const reviews = data?.reviews || []

  const commandHelper = createDataTableCommandHelper()
  const commands = [
    commandHelper.command({
      label: "Approve",
      shortcut: "A",
      action: async () => {
        const ids = Object.keys(rowSelection)
        if (ids.length === 0) return
        await updateStatus.mutateAsync({ ids, status: "approved" })
      },
    }),
    commandHelper.command({
      label: "Reject",
      shortcut: "R",
      action: async () => {
        const ids = Object.keys(rowSelection)
        if (ids.length === 0) return
        await updateStatus.mutateAsync({ ids, status: "rejected" })
      },
    }),
  ]

  const table = useDataTable({
    columns,
    data: reviews,
    commands,
    getRowId: (review) => review.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    rowSelection: {
      state: rowSelection,
      onRowSelectionChange: setRowSelection,
    },
    onRowClick: (_event, row) => {
      navigate(`/reviews/${row.id}`)
    },
  })

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">Product Reviews</Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.CommandBar selectedLabel={(count) => `${count} selected`} />
        <DataTable.Pagination />
      </DataTable>
      <Toaster />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Reviews",
  icon: ChatBubbleLeftRight,
})

export default ReviewsPage
