import { supabase } from "@lib/supabase";

// assumed existing
const testUserId = "f05e1522-42f2-4e87-b881-c0163af0ce7f";
const assignedUserId = "5e01283b-cc0c-4a6e-9336-76c8171bb99d";
const testCourseId = "CPRG 303";

let createdRequestId: number;

describe("Supabase: Request Table CRUD", () => {
  beforeAll(async () => {
    const { data, error } = await supabase
      .from("course")
      .upsert([{ course_id: testCourseId }]);

    if (error) {
      console.warn("Failed to upsert test course:", error.message);
    }
  });

  it("creates a request", async () => {
    const { data, error } = await supabase
      .from("request")
      .insert({
        user_id: testUserId,
        course_id: testCourseId,
        title: "Test Request",
        description: "Test Description",
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.title).toBe("Test Request");
    createdRequestId = data.request_id;
  });

  it("reads the created request", async () => {
    const { data, error } = await supabase
      .from("request")
      .select("*")
      .eq("request_id", createdRequestId)
      .single();

    expect(error).toBeNull();
    expect(data?.title).toBe("Test Request");
  });

  it("updates the request title", async () => {
    const { error } = await supabase
      .from("request")
      .update({ title: "Updated Test Request" })
      .eq("request_id", createdRequestId);

    expect(error).toBeNull();
  });

  it("assigns the request to another user", async () => {
    const { error } = await supabase
      .from("request")
      .update({ assigned_to: assignedUserId })
      .eq("request_id", createdRequestId);

    expect(error).toBeNull();
  });

  it("deletes the request", async () => {
    const { error } = await supabase
      .from("request")
      .delete()
      .eq("request_id", createdRequestId);

    expect(error).toBeNull();
  });

  afterAll(async () => {
    await supabase.from("request").delete().eq("request_id", createdRequestId);
  });
});
