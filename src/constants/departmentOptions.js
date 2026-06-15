/**
 * Centralized department options for use across the application.
 * This ensures consistency in department values across all forms and displays.
 * 
 * Used in:
 * - InviteUserModal (sending invitations)
 * - UpdateRoleModal (updating user department/role)
 * - EmployeeManagement (displaying and filtering users)
 * - Register page (displaying invited user's department)
 */

export const DEPARTMENT_OPTIONS = [
  { value: "Admin", label: "Admin" },
  { value: "Business Development", label: "Business Development" },
  { value: "Design", label: "Design" },
  { value: "Engineering", label: "Engineering" },
  { value: "Finance & Accounts", label: "Finance & Accounts" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Marketing", label: "Marketing" },
  { value: "Operations", label: "Operations" },
  { value: "Sales", label: "Sales" },
  { value: "Supply Chain", label: "Supply Chain" },
];

/**
 * Get department label by value
 * @param {string} value - The department value
 * @returns {string} - The department label or the value if not found
 */
export const getDepartmentLabel = (value) => {
  const department = DEPARTMENT_OPTIONS.find((dept) => dept.value === value);
  return department ? department.label : value;
};

/**
 * Get department values as a simple array
 * Useful for validation or simple select inputs
 */
export const DEPARTMENT_VALUES = DEPARTMENT_OPTIONS.map((dept) => dept.value);

export default DEPARTMENT_OPTIONS;
