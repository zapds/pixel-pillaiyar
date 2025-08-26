"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <Navbar />
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Motto */}
        <h1 className="text-4xl text-primary font-bold">
          Divine wisdom, in pixel-perfect form
        </h1>

        {/* Description */}
        <p className="text-lg text-accent leading-relaxed">
          PixelPillaiyar is an AI-powered chatbot inspired by Lord Ganesha that
          provides philosophical guidance through both text and voice
          interactions. The application features a retro pixel art aesthetic and
          supports real-time voice conversations with an animated avatar.
        </p>

        <Separator className="my-8" />

        {/* Authors */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="shadow-md rounded-2xl">
            <CardContent className="flex flex-col items-center p-6 space-y-3">
              <Avatar className="w-16 h-16">
                <AvatarImage src="" alt="Narendhar" />
                <AvatarFallback>NT</AvatarFallback>
              </Avatar>
              <p className="font-semibold">Narendhar T S (EC24B1053)</p>
              <Link
                href="https://instagram.com/n4rendhar"
                target="_blank"
                className="text-sm hover:underline"
              >
                @n4rendhar
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl">
            <CardContent className="flex flex-col items-center p-6 space-y-3">
              <Avatar className="w-16 h-16">
                <AvatarImage src="" alt="Vishwanth" />
                <AvatarFallback>V</AvatarFallback>
              </Avatar>
              <p className="font-semibold">Vishwanth (ME24B2012)</p>
              <Link
                href="https://instagram.com/vvvv_5215"
                target="_blank"
                className="text-sm hover:underline"
              >
                @vvvv_5215
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-2xl">
            <CardContent className="flex flex-col items-center p-6 space-y-3">
              <Avatar className="w-16 h-16">
                <AvatarImage src="" alt="Harshith" />
                <AvatarFallback>TH</AvatarFallback>
              </Avatar>
              <p className="font-semibold">Thotli Harshith (EC24B1077)</p>
              <Link
                href="https://instagram.com/t.harshith12"
                target="_blank"
                className="text-sm hover:underline"
              >
                @t.harshith12
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
