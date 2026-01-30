import { redirect } from "next/navigation";

const page = () => {
  return redirect("/auth/signin");
};

export default page;
