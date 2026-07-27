import ResetPassword from "@/src/features/auth/ResetPassword/ResetPassword";

interface ResetPasswordPageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params;
  return <ResetPassword token={token} />;
}
