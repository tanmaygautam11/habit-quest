"use client";
import AuthSessionProvider from "@/components/auth-session-provider";
import Header from "@/components/header";

const Home = () => {
  return (
    <AuthSessionProvider>
      <Header />
    </AuthSessionProvider>
  );
};

export default Home;