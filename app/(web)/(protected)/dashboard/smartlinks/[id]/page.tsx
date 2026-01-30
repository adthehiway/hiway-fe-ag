import { redirect } from "next/navigation";
import React from "react";

const page = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  redirect(`/dashboard/smartlinks/${id}/edit`);

  return <div>page</div>;
};

export default page;
