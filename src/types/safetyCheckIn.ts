export type DateCheckIn = {
  id: string;
  profileId: string;
  profileName: string;
  location: string;
  plannedAt: string;
  emergencyContact?: string;
  checkedInAt?: string;
  completedAt?: string;
};

export function isDateCheckInActive(checkIn: DateCheckIn | null): boolean {
  if (!checkIn || checkIn.completedAt) {
    return false;
  }
  const planned = new Date(checkIn.plannedAt).getTime();
  const windowStart = planned - 2 * 60 * 60 * 1000;
  const windowEnd = planned + 6 * 60 * 60 * 1000;
  const now = Date.now();
  return now >= windowStart && now <= windowEnd;
}
