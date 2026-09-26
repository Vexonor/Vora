import { queryKeys, type MenuListFilters } from "@/lib/query-keys"
import { menuService } from "@/services/menu.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useMenuList(filters: MenuListFilters) {
  return useQuery({
    queryKey: queryKeys.menus.list(filters),
    queryFn: () =>
      menuService.getAll({
        q: filters.search || undefined,
        statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
      }),
  })
}

export function useMenuDetail(menuId: number) {
  return useQuery({
    queryKey: queryKeys.menus.detail(menuId),
    queryFn: () => menuService.getById(menuId),
  })
}

function useInvalidateMenus() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.menus.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    ])
}

export function useCreateMenu() {
  const invalidateMenus = useInvalidateMenus()
  return useMutation({
    mutationFn: (formData: FormData) => menuService.create(formData),
    onSuccess: invalidateMenus,
  })
}

export function useUpdateMenu() {
  const invalidateMenus = useInvalidateMenus()
  return useMutation({
    mutationFn: ({ menuId, formData }: { menuId: number; formData: FormData }) => menuService.update(menuId, formData),
    onSuccess: invalidateMenus,
  })
}

export function useDeleteMenu() {
  const invalidateMenus = useInvalidateMenus()
  return useMutation({
    mutationFn: (menuId: number) => menuService.remove(menuId),
    onSuccess: invalidateMenus,
  })
}
