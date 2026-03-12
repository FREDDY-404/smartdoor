import { redirect } from "next/navigation";
import { getOptionalSession } from "@/lib/auth";

export default async function HomePage() {
  const { supabase, user } = await getOptionalSession();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  redirect(profile?.role === "admin" ? "/dashboard" : "/login?error=unauthorized");
}
