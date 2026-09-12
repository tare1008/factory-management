import { redirect } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddUserForm } from "@/app/users/AddUserForm";
import { ResetPasswordForm } from "@/app/users/ResetPasswordForm";
import { updateUserRoleAction } from "@/app/users/actions";

export default async function UsersPage() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") {
    redirect("/");
  }

  const users = await prisma.user.findMany({ orderBy: { username: "asc" } });

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-brand-navy">Users</h1>

        <AddUserForm />

        <ul className="flex flex-col gap-3">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-col gap-2 mat-card p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-brand-navy">
                    {user.name} <span className="text-sm italic text-brand-violet">({user.username})</span>
                  </p>
                </div>
                {user.role === "OWNER" ? (
                  <span className="badge-info">
                    OWNER
                  </span>
                ) : (
                  <form action={updateUserRoleAction} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="mat-input px-2 py-1 text-sm"
                    >
                      <option value="STOREKEEPER">Storekeeper</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button type="submit" className="btn-ghost">
                      Update Role
                    </button>
                  </form>
                )}
              </div>
              {user.role !== "OWNER" && <ResetPasswordForm userId={user.id} />}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
