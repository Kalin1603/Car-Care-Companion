import { Car, ServiceRecord } from "../types";

export const dataService = {
  getCar: (username: string): Car => {
    const carJson = localStorage.getItem(`car_${username}`);
    return carJson ? JSON.parse(carJson) : { make: '', model: '', year: new Date().getFullYear(), mileage: 0, vin: '', imageUrl: null };
  },
  getServices: (username: string): ServiceRecord[] => {
    const servicesJson = localStorage.getItem(`services_${username}`);
    return servicesJson ? JSON.parse(servicesJson) : [];
  },
  saveData: (username: string, car: Car, services: ServiceRecord[]) => {
    localStorage.setItem(`car_${username}`, JSON.stringify(car));
    localStorage.setItem(`services_${username}`, JSON.stringify(services));
  }
};
