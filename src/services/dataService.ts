import { Car, ServiceRecord } from "../types";

const defaultTirePressure = { fl: 32, fr: 32, rl: 32, rr: 32 };
const defaultFluidLevels = { brake: 'OK', coolant: 'OK' };

export const dataService = {
  getCar: (username: string): Car => {
    const carJson = localStorage.getItem(`car_${username}`);
    const savedCar = carJson ? JSON.parse(carJson) : {};
    
    return {
      make: savedCar.make || '',
      model: savedCar.model || '',
      year: savedCar.year || new Date().getFullYear(),
      mileage: savedCar.mileage || 0,
      vin: savedCar.vin || '',
      imageUrl: savedCar.imageUrl || null,
      engineType: savedCar.engineType || '',
      transmission: savedCar.transmission || 'Automatic',
      exteriorColor: savedCar.exteriorColor || '#ffffff',
      tirePressure: savedCar.tirePressure || defaultTirePressure,
      fluidLevels: savedCar.fluidLevels || defaultFluidLevels,
    };
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