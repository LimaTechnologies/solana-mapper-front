import Link from "next/link"

export default function Header() {
    return (
        <header className="bg-blue-600 text-white p-4">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">
                    Token Kings
                </Link>
                <div className="text-2xl font-semibold">
                    <Link href="/" className="mr-4 hover:underline">
                        Home
                    </Link>
                    <Link href="/train" className="hover:underline">
                        Train
                    </Link>
                </div>
            </nav>
        </header>
    )
}