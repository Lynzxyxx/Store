import AuthForm from "@/components/AuthForm";

export default function SignInPage() {
  return (
    <div className="py-14 animate-fadeIn">
      <AuthForm mode="signin" />
    </div>
  );
}
