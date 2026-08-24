import { Suspense } from "react";
import { ReflectionsView } from "@/components/reflections/ReflectionsView";

function ReflectionsFallback() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="skeleton h-8 w-44" />
      <div className="skeleton h-9 w-full" />
      <div className="skeleton h-72 w-full" />
    </div>
  );
}

export default function ReflectionsPage() {
  return (
    <Suspense fallback={<ReflectionsFallback />}>
      <ReflectionsView />
    </Suspense>
  );
}
