import { redirect } from "next/navigation";

export default function NotFound() {
  redirect("/"); // przekierowanie na stronę główną
}
