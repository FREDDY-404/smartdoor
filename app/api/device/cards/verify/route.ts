import { handleDeviceCardAccessRequest } from "@/lib/device-card-access";

export async function POST(request: Request) {
  return handleDeviceCardAccessRequest(request);
}
