import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const TestLogout = () => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        className="bg-destructive text-white hover:bg-destructive/80 shadow-md px-6 py-2 rounded-lg text-base font-semibold"
        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      >
        Log out (Test)
      </Button>
    </div>
  );
};

export default TestLogout;
