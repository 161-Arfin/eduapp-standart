import Head from "next/head";
import Login from "@/views/containers/organisms/Auth/Login";
import icon from "../../public/assets/images/company/only_logo_eduarsip_transparant.png";

export default function Home() {
  return (
    <>
      <Head>
        <title>EduArsip | Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Login" />
        <link rel="icon" href={icon.src} />
        <link rel="apple-touch-icon" href={icon.src} />
      </Head>
      <Login />
    </>
  );
}
