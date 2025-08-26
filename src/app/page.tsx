import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/8bit/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-h-screen">
    <Navbar />
    <div className="h-screen flex text-center flex-col gap-8 items-center justify-center">
      <h1 className="text-2l md:text-4xl font-bold">PixelPillaiyar</h1>
      <h2 className="text-xl md:text-2xl">Divine wisdom, in pixel-perfect form</h2>
      <div className="flex flex-col items-center justify-center gap-8">
        <Button size="lg" asChild>
          <Link href="/talk">Talk Now</Link>
        </Button>
        {/* <Button size="sm" variant="ghost" asChild>
          <Link href="/about">About</Link>
        </Button> */}
      </div>
    </div>
    </div>
  );
}
