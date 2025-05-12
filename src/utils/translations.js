// src/utils/translations.js

// Словарь статусов
const statusMap = {
    PENDING:   'Ожидает подтверждения',
    APPROVED:  'Подтверждено',
    REJECTED:  'Отказано',
    CANCELLED: 'Отменено'
  }
  
  // Словарь ролей
  const roleMap = {
    landlord: 'Арендодатель',
    tenant:   'Арендатор',
    admin:    'Администратор'
  }
  
  /**
   * Переводит статус заявки
   * @param {string} status — код статуса из API
   * @returns {string} — русский текст
   */
  export function translateStatus(status) {
    return statusMap[status] || status
  }
  
  /**
   * Переводит роль пользователя
   * @param {string} role — код роли из токена/API
   * @returns {string}
   */
  export function translateRole(role) {
    return roleMap[role] || role
  }
  