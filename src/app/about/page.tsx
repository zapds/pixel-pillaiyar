import Navbar from "@/components/Navbar";

export default function About() {
    return (
        <>
        <Navbar />
            <div className="container flex flex-col items-center gap-12 px-4 py-16 ">
                <div className="max-w-2xl text-lg text-muted-foreground">
                    <p>
                        Pixel Pillaiyar is an AI-powered assistant designed to help you with a variety of tasks. Whether you need help with coding, writing, or just want to have a conversation, Pixel Pillaiyar is here to assist you.
                    </p>
                    <p className="mt-4">
                        This project is built using Next.js, React, and the OpenAI API. The character animations are created using custom video loops to bring Pixel Pillaiyar to life.
                    </p>
                    <p className="mt-4">
                        If you have any questions or feedback, feel free to reach out!
                    </p>
                </div>
            </div>
        </>
    )
}