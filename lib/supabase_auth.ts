import supabase from "./db";

// get current user logged in, may need to change to getSession() in the future, or expand to middleware?
export async function getUser () {
  const { data } = await supabase.auth.getUser()
  return data;
  }


// sign up
export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    //TODO add name, id, etc. to user table with addData function from supabase_crud.ts
    if (error && error.message === "User already registered") {
      //TODO redirect to log in page with email pre-filled, move this to signup page?
    }
    else if (error) {
      console.error("Error signing up:", error.message);
    } else {
      console.log("User signed up:", data.user);
    }
    return error;
  }
  
  
// sign in
  export async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      console.error("Error signing in:", error.message);
    } else {
      console.log("User signed in:", data.user.id);
    }

    return error;
  }
  
  
// sign out
  export async function signOut() {
    const { error } = await supabase.auth.signOut();
  
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      console.log("User signed out");
    }
  }

//send reset password email then redirect to update password page
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    email,
    { redirectTo: 'https://example.com/update-password' } //TODO replace with your actual redirect URL
  )
  if (error) {
    console.error("Error sending reset password email:", error.message);
  } else {
    console.log("Reset password email sent:", data);
  }
}

//update user
export async function updateUser(email: string, password: string) {
  const { data, error } = await supabase.auth.updateUser({
    email,
    password,
  });

  if (error) {
    console.error("Error updating user:", error.message);
  } else {
    console.log("User updated:", data.user);
  }
  return error;
}