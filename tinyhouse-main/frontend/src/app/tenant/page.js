import LoginForm from "../../components/LoginForm";

export default function TenantLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <LoginForm userType="Kiracı" />
    </div>
  );
}
