import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TokenProvider } from "@/contexts/TokenContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { Analytics } from "@vercel/analytics/react"
import Header from "@/components/Header";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	weight: "500"
});

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${inter.variable} antialiased bg-blue-950 text-white`}
			>
				<Analytics />
				<FilterProvider>
					<TokenProvider>
						<Header />
						<div className="w-full text-center">
							<h1 className="text-4xl font-bold py-12">{"[ TOKEN KINGS AI ]"}</h1>
							{children}
						</div>
					</TokenProvider>
				</FilterProvider>
			</body>
		</html>
	);
}
