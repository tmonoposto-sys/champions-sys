import { Driver } from '@/types/championship';

export const countDrivers = (drivers: Driver[]): number => {
  const uniqueNames = new Set(drivers.filter(driver => driver.name != "Cambio de equipo").filter(driver => driver.estado != "Expiloto").map(driver => driver.name))
  return uniqueNames.size
}