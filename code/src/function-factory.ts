import { run as handle_registration } from './functions/handle_registration';
import on_work_creation from './functions/on_work_creation';

export const functionFactory = {
  // Add your functions here
  on_work_creation,
  handle_registration,
} as const;

export type FunctionFactoryType = keyof typeof functionFactory;
