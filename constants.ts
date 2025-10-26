
import { Role, LeaveStatus, type Employee, type LeaveRequest } from './types';

export const EMPLOYEES: Employee[] = [
  { id: 1, name: 'Tóth Ádám', totalLeaveDays: 25, role: Role.Manager },
  { id: 2, name: 'Kiss Judit', totalLeaveDays: 22, role: Role.Employee },
  { id: 3, name: 'Nagy Gábor', totalLeaveDays: 28, role: Role.Employee },
  { id: 4, name: 'Varga Éva', totalLeaveDays: 20, role: Role.Employee },
];

const today = new Date();
const getFutureDate = (days: number): string => {
    const future = new Date(today);
    future.setDate(today.getDate() + days);
    return future.toISOString().split('T')[0];
};

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
    { 
        id: '1', 
        employeeId: 2, 
        employeeName: 'Kiss Judit', 
        startDate: getFutureDate(10), 
        endDate: getFutureDate(14), 
        status: LeaveStatus.Approved,
        days: 5
    },
    { 
        id: '2', 
        employeeId: 3, 
        employeeName: 'Nagy Gábor', 
        startDate: getFutureDate(5), 
        endDate: getFutureDate(6), 
        status: LeaveStatus.Pending,
        days: 2
    },
    { 
        id: '3', 
        employeeId: 4, 
        employeeName: 'Varga Éva', 
        startDate: getFutureDate(20), 
        endDate: getFutureDate(21), 
        status: LeaveStatus.Rejected,
        days: 2
    },
];
