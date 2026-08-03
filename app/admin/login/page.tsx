import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "./login-form";

export const metadata = { title: "Admin · GoldWing" };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="fut-bg flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-6 py-16">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="card-frame rounded-lg p-px">
            <div className="card-inner flex h-9 w-9 items-center justify-center rounded-[7px]">
              <Image src="/goldwing-mark.svg" alt="" width={22} height={22} aria-hidden />
            </div>
          </div>
          <span className="font-display text-2xl font-bold tracking-wider text-broadcast">
            GOLDWING
          </span>
        </Link>

        <div className="card-frame">
          <div className="card-inner card-shine p-8">
            <span className="rarity-badge">Admin access</span>
            <h1 className="font-display mt-4 mb-1 text-3xl font-bold tracking-wide text-broadcast">
              CONTROL ROOM
            </h1>
            <p className="mb-6 text-sm text-muted">
              Enter your secret password to manage tournaments.
            </p>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
