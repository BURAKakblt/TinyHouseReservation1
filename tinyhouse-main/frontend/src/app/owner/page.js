import LoginForm from "../../components/LoginForm";

export default function OwnerLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <LoginForm userType="İlan Sahibi" />
    </div>
  );
}
