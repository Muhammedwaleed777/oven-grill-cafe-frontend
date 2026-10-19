import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold mb-6 text-[#FF6B00]">
          Oven Grill Cafe
        </h1>
        <p className="text-xl text-gray-300 mb-10">
          Delicious food, delivered fresh. Manage your restaurant with ease.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-8 py-3 rounded-lg transition"
          >
            Login to Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}