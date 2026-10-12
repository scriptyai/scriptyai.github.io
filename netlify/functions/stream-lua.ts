import { handler as apiHandler } from "./api";

export const handler = async (event: any, context: any) => {
  return apiHandler({ ...event, path: "/stream-lua" });
};
