// @lib/supabase/courseService.ts
import { supabase } from "../supabase";

export const getCourses = async () => {
  const { data, error } = await supabase
    .from("Course")
    .select("course_id")
    .order("course_id", { ascending: true });

  if (error) throw error;
  return data;
};
