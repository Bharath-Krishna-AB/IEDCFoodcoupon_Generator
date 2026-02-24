// Mock data store — will be replaced with Supabase later

export interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  teamName: string;
  foodPreference: 'veg' | 'non-veg';
  couponCode: string;
  createdAt: string;
}

// In-memory store (resets on server restart)
const registrations: Registration[] = [];

export function saveRegistration(data: Omit<Registration, 'id' | 'createdAt'>): Registration {
  const registration: Registration = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  registrations.push(registration);
  return registration;
}

export function getRegistrations(): Registration[] {
  return [...registrations];
}

export function getRegistrationByCode(couponCode: string): Registration | undefined {
  return registrations.find((r) => r.couponCode === couponCode);
}
