export const dynamic = "force-dynamic";

import QuillEditor from "@/components/quill-editor/quill-editor";
import { getFileDetails } from "@/lib/supabase/queries";
import { redirect } from "next/navigation";

const FilePage = async ({ params }: { params: { fileId: string } }) => {
  const { data, error } = await getFileDetails(params.fileId);
  console.log(error);

  if (error || !data.length) redirect("/dashboard/start");
  return (
    <div className="relative bg-muted/10 flex flex-col h-full flex-grow">
      <QuillEditor
        dirType="file"
        fileId={params.fileId}
        dirDetails={data[0] || {}}
      />
    </div>
  );
};

export default FilePage;
