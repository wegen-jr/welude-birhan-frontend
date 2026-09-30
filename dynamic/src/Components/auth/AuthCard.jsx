import { Link } from "react-router-dom";
export default function AuthCard({ title, subtitle,noAccount,signUp,haveAccount,signIn, children }) {
  return (
    <div className="min-h-screen bg-blue-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-blue-900 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-yellow-500 text-center mb-2 capitalize">
          {title}
        </h1>

        <p className="text-gray-300 text-center mb-8">
          {subtitle}
        </p>

        {children}
        <div className="flex gap-2 text-yellow-400">
          <p>{noAccount}</p>
          <p className="text-amber-100 hover:text-amber-300 hover:underline hover:text-underline-offset"><Link to='/signUp'>{signUp}</Link></p>
        </div>
        <div className="flex gap-2 text-yellow-400">
            <p>{haveAccount}</p>
            <p className="text-amber-100 hover:text-amber-300 hover:underline hover:text-underline-offset"><Link to='/'>{signIn}</Link></p>
        </div>
      </div>
    </div>
  );
}