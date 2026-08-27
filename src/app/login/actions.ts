"use server";

import { redirect } from "next/navigation";
import { SignInError, signIn, signOut } from "@/services/auth-service";

export async function signInAction(formData: FormData) {
  try {
    await signIn({
      email: String(formData.get("email") ?? ""),
      displayName: String(formData.get("displayName") ?? ""),
      sellerType: formData.get("sellerType") === "store" ? "store" : "private",
      storeName: String(formData.get("storeName") ?? ""),
    });
  } catch (error) {
    if (error instanceof SignInError) {
      redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  redirect("/");
}

export async function signOutAction() {
  await signOut();
  redirect("/login");
}
