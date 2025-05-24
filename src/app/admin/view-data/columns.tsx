'use client';

import { ColumnDef } from '@tanstack/react-table';

export interface Submission {
  id?: string;
  studentName: string;
  studentId: string;
  month: string;
  status: 'submitted' | 'cancelled';
  createdAt: Date | string;
  updatedAt: Date | string;
  [key: string]: any; // For dynamic access to selection fields
}

// Helper function to create a boolean cell renderer
const booleanCell = (value: any) => {
  if (value === undefined || value === null) return '-';
  return value ? '✓' : '✗';
};

export const columns: ColumnDef<Submission>[] = [
  {
    accessorKey: 'studentName',
    header: 'Student Name',
  },
  {
    accessorKey: 'studentId',
    header: 'ID Number',
  },
  {
    accessorKey: 'Monday Night - Chicken Curry',
    header: 'Monday Chicken',
    cell: ({ row }) => booleanCell(row.getValue('Monday Night - Chicken Curry')),
  },
  {
    accessorKey: 'Wednesday Night - Chicken Curry',
    header: 'Wednesday Chicken',
    cell: ({ row }) => booleanCell(row.getValue('Wednesday Night - Chicken Curry')),
  },
  {
    accessorKey: 'Thursday Afternoon - Omelette',
    header: 'Thursday Omelette',
    cell: ({ row }) => booleanCell(row.getValue('Thursday Afternoon - Omelette')),
  },
  {
    accessorKey: 'Friday Night - Mushroom Curry',
    header: 'Friday Mushroom',
    cell: ({ row }) => booleanCell(row.getValue('Friday Night - Mushroom Curry')),
  },
  {
    accessorKey: 'Saturday Afternoon - Fish Fry',
    header: 'Saturday Fish',
    cell: ({ row }) => booleanCell(row.getValue('Saturday Afternoon - Fish Fry')),
  },
  {
    accessorKey: 'Sunday Morning - Bread Omelette',
    header: 'Sun Bread Omelette',
    cell: ({ row }) => booleanCell(row.getValue('Sunday Morning - Bread Omelette')),
  },
  {
    accessorKey: 'Sunday Afternoon - Chicken Curry',
    header: 'Sun Chicken',
    cell: ({ row }) => booleanCell(row.getValue('Sunday Afternoon - Chicken Curry')),
  },
  {
    accessorKey: 'M - Afternoon - Boiled Egg',
    header: 'Mon Boiled Egg',
    cell: ({ row }) => booleanCell(row.getValue('M - Afternoon - Boiled Egg')),
  },
  {
    accessorKey: 'T - Night - Boiled Egg',
    header: 'Tue Boiled Egg',
    cell: ({ row }) => booleanCell(row.getValue('T - Night - Boiled Egg')),
  },
  {
    accessorKey: 'S - Night - Boiled Egg',
    header: 'Sat Boiled Egg',
    cell: ({ row }) => booleanCell(row.getValue('S - Night - Boiled Egg')),
  },
  {
    accessorKey: 'createdAt',
    header: 'Submitted At',
    cell: ({ row }) => row.getValue('createdAt'),
  },
];
