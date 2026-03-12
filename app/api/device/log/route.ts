import { handleDeviceEventRequest } from "@/lib/device-events";

export async function POST(request: Request) {
  return handleDeviceEventRequest(request);
}
