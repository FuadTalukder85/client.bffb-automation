# TanStack Query Migration Status

## ✅ Completed

### Phase 1: Infrastructure Setup
- [x] QueryClientProvider configured in `main.jsx`
- [x] ReactQueryDevtools added
- [x] `queryKeys.js` created with centralized key factory

### Phase 2: Service Layer Refactor
- [x] `recipeService.js` - AbortSignal support added
- [x] `bffProductCodeService.js` - AbortSignal support added
- [x] `categoryService.js` - AbortSignal support added

### Phase 3: Query Hooks Migration
All fetch hooks migrated to TanStack Query:
- [x] `useEmployees.js`
- [x] `useTeams.js`
- [x] `useInvitations.js`
- [x] `useRoles.js`
- [x] `usePermissions.js`
- [x] `useProjects.js` (includes `useProject` for single item)
- [x] `useRecipes.js`
- [x] `useCategories.js`
- [x] `useProjectTasks.js`
- [x] `useInternalTasks.js`
- [x] `useBFFProductCodes.js`
- [x] `useAccessHistory.js`
- [x] `useUserPermissions.js`
- [x] `useSubCategories.js`
- [x] `useSubSubCategories.js`
- [x] `useSearch.js`
- [x] `useModules.js` (NEW - for modules and submodules)
- [x] `useRole.js` (NEW - for single role and permissions)

### Phase 4: Mutation Hooks
All mutation hooks created in `hooks/mutations/`:
- [x] `useUserMutations.js` (includes `useUpdateUserRole`)
- [x] `useTeamMutations.js`
- [x] `useInvitationMutations.js`
- [x] `useRoleMutations.js` (includes `useCreateRoleWithPermissions`, `useUpdateRolePermissions`)
- [x] `useRecipeMutations.js`
- [x] `useCategoryMutations.js`
- [x] `useProjectMutations.js`
- [x] `useProjectTaskMutations.js` (includes `useCreateBulkProjectTasks`)
- [x] `useInternalTaskMutations.js` (includes `useCreateBulkInternalTasks`)
- [x] `useBFFProductCodeMutations.js`

### Phase 5: Component Migration
Components fully migrated:
- [x] `TeamFormation.jsx`
- [x] `CreateTeamModal.jsx`
- [x] `ArchiveUserModal.jsx`
- [x] `RestoreUserModal.jsx`
- [x] `UpdateRoleModal.jsx`
- [x] `EmployeeInvitations.jsx`
- [x] `InviteUserModal.jsx`
- [x] `AccessManagement.jsx`
- [x] `CreateRole.jsx`
- [x] `UpdateRole.jsx`
- [x] `ArchiveInternalTaskModal.jsx`
- [x] `RestoreInternalTaskModal.jsx`
- [x] `EditInternalTaskModal.jsx`
- [x] `CreateInternalTaskModal.jsx`
- [x] `CreateTaskModal.jsx` (project tasks)
- [x] `EditTaskModal.jsx` (project tasks)
- [x] `SingleProjectTask.jsx`

## 🔄 Remaining Work (27 direct API calls)

### Auth Features (can remain as-is - one-off operations)
- [ ] `features/auth/ForgotPassword.jsx` - `api.post("/auth/forgot-password")`
- [ ] `features/auth/ResetPassword.jsx` - `api.get`, `api.post`
- [ ] `features/auth/Register.jsx` - `api.get`, `api.post`
- [ ] `features/auth/Login.jsx` - `api.post`

### Team Management (complex team member operations)
- [ ] `features/team-management/team-formation/single-team-formation/SingleTeamFormation.jsx`
- [ ] `features/team-management/team-formation/components/ViewTeamModal.jsx`
- [ ] `features/team-management/team-formation/components/DesktopViewTeamModal.jsx`
- [ ] `features/team-management/team-formation/single-team-formation/components/AddMemberModal.jsx`
- [ ] `features/team-management/team-formation/single-team-formation/components/RestoreMemberModal.jsx`
- [ ] `features/team-management/team-formation/single-team-formation/components/ReplaceMemberModal.jsx`
- [ ] `features/team-management/team-formation/single-team-formation/components/DesktopReassignTasksModal.jsx`
- [ ] `features/team-management/team-formation/single-team-formation/components/DesktopRestoreMemberModal.jsx`
- [ ] `features/team-management/team-formation/single-team-formation/components/DesktopAddMemberModal.jsx`

### Other
- [ ] `components/ThemeToggle.jsx` - `api.post("/auth/me/toggle-theme")`

## Migration Pattern

### For Queries (GET requests in useEffect)
```jsx
// Before
useEffect(() => {
  const fetchData = async () => {
    const response = await api.get('/endpoint');
    setData(response.data);
  };
  fetchData();
}, [dependency]);

// After
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.entity.list(params),
  queryFn: ({ signal }) => api.get('/endpoint', { signal }),
  select: (response) => response.data.data
});
```

### For Mutations (POST/PUT/PATCH/DELETE)
```jsx
// Before
const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await api.post('/endpoint', data);
    refetch();
  } catch (err) {
    setError(err);
  } finally {
    setIsSubmitting(false);
  }
};

// After
import { useCreateEntity } from '@/hooks/mutations';

const { mutateAsync: createEntity, isPending } = useCreateEntity();

const handleSubmit = async () => {
  try {
    await createEntity(data);
    // Cache automatically invalidated - no refetch needed
  } catch (err) {
    // Error handling
  }
};
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/queryKeys.js` | Centralized query key factory |
| `src/hooks/mutations/index.js` | Export all mutation hooks |
| `src/hooks/useFetch.js` | **DEPRECATED** - Legacy hook, kept for backward compatibility |

## Notes

1. **Cache Invalidation**: All mutation hooks automatically invalidate relevant query caches on success
2. **Error Handling**: TanStack Query provides built-in error state via `error` and `isError`
3. **Loading States**: Use `isLoading` for initial load, `isFetching` for background refetches, `isPending` for mutations
4. **Stale Time**: Default 5 minutes - data won't refetch if accessed within this window
5. **Retry**: Default 1 retry on failure
