import { SignUp } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      {/* Logo and Welcome */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
            D
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Deep Terminal
          </h1>
        </div>
        <p className="text-xl text-gray-600">
          Start analyzing markets today 🚀
        </p>
        <p className="text-gray-500 mt-1">
          Join thousands of smart investors
        </p>
      </div>

      {/* Clerk Sign Up Component */}
      <SignUp 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl",
          },
        }}
        redirectUrl="/onboarding"
        signInUrl="/sign-in"
      />

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-600">
        Already have an account?{' '}
        <a 
          href="/sign-in" 
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign in →
        </a>
      </p>
    </div>
  );
}
