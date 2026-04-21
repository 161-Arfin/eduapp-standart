import Head from "next/head";
import Login from "@/views/containers/organisms/Auth/Login";

export default function Home() {
  return (
    <>
      <Head>
        <title>EduArsip | Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Login" />
      </Head>
      <Login />
    </>
  );
}
