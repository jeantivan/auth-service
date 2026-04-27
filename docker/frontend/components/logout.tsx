"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Logout() {
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", {
				method: "POST" });
			router.push("/login");
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<Button
			onClick={handleLogout}
			className="w-full"
		>
			Cerrar sesión
		</Button>
	);
}
