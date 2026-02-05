import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-slate-900 text-white p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold mb-4">חשמונאי יומי</h1>
        <p className="text-xl text-blue-200 mb-8">
          אפליקציית לימוד לחיילי חטיבת חשמונאים
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            כניסה למערכת
          </Link>

          <Link
            href="/daily"
            className="block w-full bg-transparent border border-blue-400 hover:bg-blue-800 text-blue-200 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            לימוד יומי
          </Link>
        </div>

        <div className="mt-12 text-sm text-blue-300">
          <p>משנה יומית • רמב״ם יומי • חסידות ומוסר</p>
        </div>
      </div>
    </div>
  );
}
