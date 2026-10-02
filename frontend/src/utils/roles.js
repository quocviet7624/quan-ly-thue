export const ROLE_LABELS = {
  customer: 'Người thuê',
  staff: 'Người cho thuê',
  admin: 'Quản trị viên',
}

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }))