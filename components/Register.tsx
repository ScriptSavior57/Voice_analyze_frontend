/**
 * Registration component for new users.
 */
import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../store/slices/authSlice";
import { RootState } from "../store";
import { UserPlus, Mail, Lock, User, AlertCircle, Check, X } from "lucide-react";

interface RegisterProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
  onClose?: () => void; // Optional: for public users to go back to demo
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onSuccess, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"student" | "qari">("student");

  // Password validation rules
  const passwordRules = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasMaxLength = password.length <= 72;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);

    return {
      minLength: hasMinLength,
      maxLength: hasMaxLength,
      uppercase: hasUppercase,
      lowercase: hasLowercase,
      number: hasNumber,
      special: hasSpecial,
    };
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        registerUser({
          email,
          password,
          full_name: fullName || undefined,
          role,
        })
      ).unwrap();
      onSuccess?.();
    } catch (err) {
      // Error is handled by Redux state
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          ← Back to Demo
        </button>
      )}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tarannum AI</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name (Optional)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            
            {/* Password Requirements */}
            <div className="mt-2 space-y-1.5">
              <div className={`flex items-center gap-2 text-xs ${passwordRules.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordRules.minLength ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordRules.maxLength ? 'text-green-600' : password.length > 72 ? 'text-red-600' : 'text-gray-500'}`}>
                {passwordRules.maxLength ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>Maximum 72 characters</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordRules.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordRules.uppercase ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>One uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordRules.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordRules.lowercase ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>One lowercase letter (a-z)</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordRules.number ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordRules.number ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>One number (0-9)</span>
              </div>
              <div className={`flex items-center gap-2 text-xs ${passwordRules.special ? 'text-green-600' : 'text-gray-500'}`}>
                {passwordRules.special ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                <span>One special character (!@#$%^&*()_+-=[]&#123;&#125;|;:,.{`<>`}?)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a
            </label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === "student"}
                  onChange={(e) => setRole(e.target.value as "student" | "qari")}
                  className="sr-only"
                />
                <div
                  className={`p-3 border-2 rounded-lg text-center ${
                    role === "student"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">Student</div>
                  <div className="text-xs text-gray-600 mt-1">Learn & Practice</div>
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="qari"
                  checked={role === "qari"}
                  onChange={(e) => setRole(e.target.value as "student" | "qari")}
                  className="sr-only"
                />
                <div
                  className={`p-3 border-2 rounded-lg text-center ${
                    role === "qari"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium">Qari / Teacher</div>
                  <div className="text-xs text-gray-600 mt-1">Teach & Guide</div>
                </div>
              </label>
            </div>
            {role === "qari" && (
              <p className="text-xs text-amber-600 mt-2">
                Note: Qari accounts require admin approval before activation.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
