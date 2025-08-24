import { Button } from "@/components/ui/8bit/button"
import Link from "next/link";

export default function Navbar() {
    return (
        <div className="flex flex-row items-center w-full h-16">
        <Button asChild variant="ghost" className="ml-4">
          <Link href="/">PixelPillaiyar</Link>
        </Button>
        <Button asChild size="sm" variant="ghost" className="ml-4">
          <Link href="/about">About</Link>
        </Button>
      </div>
    )
}