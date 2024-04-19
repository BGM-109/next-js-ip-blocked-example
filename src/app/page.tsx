import { headers } from "next/headers";

export default function Home() {
  const header = headers();
  const ip = (header.get("x-forwarded-for") ?? "127.0.0.1").split(",")[0];
  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Next js Middleware for ip blocked</h1>
      <p>Current Header IP: {ip}</p>
    </main>
  );
}
