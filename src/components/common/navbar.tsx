import { ModeToggle } from "../mode-toggle";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between dark:bg-zinc-900 bg-zinc-100 rounded-lg p-4">
      <h1 className="text-2xl font-bold">Bus Ticket</h1>
      <ModeToggle />
    </header>
  );
}
