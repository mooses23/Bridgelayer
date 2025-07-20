import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Common component class combinations
export const buttonVariants = {
  primary: "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-md transition-colors duration-200",
  success: "bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200",
  danger: "bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200",
  outline: "border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors duration-200",
}

export const cardVariants = {
  default: "bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300",
  bordered: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-300",
  elevated: "bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300",
}

export const inputVariants = {
  default: "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
  error: "w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white",
  success: "w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white",
}

export const statusVariants = {
  online: "flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg",
  offline: "flex items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg",
  warning: "flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg",
  info: "flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg",
}
