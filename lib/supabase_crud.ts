import supabase from "./db";

// adds user data to student user table after user signs up
// using the automatically generated UID by the auth system as the primary key in the student user table
export async function addUser(userID: string, email: string, name: string, student_id: string) {
  const { data, error } = await supabase
    .from("students")
    .insert([{ UID: userID, email: email, student_name: name, student_id: student_id }]);

  if (error) {
    console.error("Error adding user:", error);
    return null;
  }

  return data;



}



