'use client';

export async function authenticate(
  prevState: string | undefined,
   formData: FormData
  ) {
  try {
    const data = Object.fromEntries(formData.entries()); // converto formData in object
    return data; // Return data instead of calling signIn
  } catch (error) {
    return "Something went wrong";
  }
}
