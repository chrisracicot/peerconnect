import { supabase } from "@lib/supabase";
import {
  fetchRequests,
  createRequest,
  getRequestById,
  updateRequest,
  deleteRequest,
  reactivateRequest,
} from "@lib/services/requestsService";
import type { NewRequest } from "@models/request";

const testUserEmail = "emuglc@gmail.com";
const testUserId = "f05e1522-42f2-4e87-b881-c0163af0ce7f";
const testCourseId = "CPRG 303";

let createdId: number;
let originalDate: string;

beforeAll(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testUserEmail,
    password: "password123",
  });

  if (error || !data.session) {
    throw new Error(`Failed to sign in test user: ${error?.message}`);
  }

  await supabase.auth.setSession(data.session);

  await supabase.from("course").upsert([{ course_id: testCourseId }]);
});

describe("requestsService.ts", () => {
  it("createRequest() inserts a new request", async () => {
    const newRequest: NewRequest = {
      user_id: testUserId,
      course_id: testCourseId,
      title: "Service Test Request",
      description: "Testing service layer insert",
      status: "pending",
      create_date: new Date().toISOString(),
    };

    const result = await createRequest(newRequest);
    expect(result).toBeDefined();
    expect(result.title).toBe(newRequest.title);
    createdId = result.request_id;
    originalDate = result.create_date;
  });

  it("fetchRequests() returns a list of requests", async () => {
    const result = await fetchRequests();
    expect(Array.isArray(result)).toBe(true);
    expect(result.some((r) => r.request_id === createdId)).toBe(true);
  });

  it("getRequestById() returns the correct request", async () => {
    const result = await getRequestById(createdId);
    expect(result).toBeDefined();
    expect(result?.request_id).toBe(createdId);
  });

  it("updateRequest() modifies the request title", async () => {
    const updated = await updateRequest(createdId, {
      title: "Updated Title",
    });
    expect(updated.title).toBe("Updated Title");
  });

  it("reactivateRequest() resets status and create_date", async () => {
    const reactivated = await reactivateRequest(createdId);
    expect(reactivated.status).toBe("pending");
    expect(new Date(reactivated.create_date).getTime()).toBeGreaterThan(
      new Date(originalDate).getTime()
    );
  });

  it("deleteRequest() removes the request", async () => {
    await deleteRequest(createdId);
    const check = await getRequestById(createdId);
    expect(check).toBeNull();
  });

  // clean up
  afterAll(async () => {
    if (createdId) {
      await supabase.from("request").delete().eq("request_id", createdId);
    }
  });
});
