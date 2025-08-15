// src/app/(auth)/verify/page.tsx
import VerifyForm from "./_components/VerifyForm";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <VerifyForm email={(params.email as string) ?? ""} />;
}
