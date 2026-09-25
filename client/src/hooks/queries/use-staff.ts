import { queryKeys, type StaffListFilters } from "@/lib/query-keys"
import { authService } from "@/services/auth.service"
import { userService } from "@/services/user.service"
import type { RegisterRequest } from "@/types/auth"
import type { UpdateUserRequest } from "@/types/user"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useStaffList(filters: StaffListFilters) {
  return useQuery({
    queryKey: queryKeys.staff.list(filters),
    queryFn: () =>
      userService.getAll({
        q: filters.search || undefined,
        roles: filters.roles.length > 0 ? filters.roles : undefined,
      }),
  })
}

function useInvalidateStaff() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.all })
}

export function useRegisterStaff() {
  const invalidateStaff = useInvalidateStaff()
  return useMutation({
    mutationFn: (request: RegisterRequest) => authService.register(request),
    onSuccess: invalidateStaff,
  })
}

export function useUpdateStaff() {
  const invalidateStaff = useInvalidateStaff()
  return useMutation({
    mutationFn: ({ staffId, request }: { staffId: number; request: UpdateUserRequest }) =>
      userService.update(staffId, request),
    onSuccess: invalidateStaff,
  })
}

export function useDeleteStaff() {
  const invalidateStaff = useInvalidateStaff()
  return useMutation({
    mutationFn: (staffId: number) => userService.remove(staffId),
    onSuccess: invalidateStaff,
  })
}
