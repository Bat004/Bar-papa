import Image from "next/image";

/*export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}*/

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-300 text-zinc-950 font-sans">
      <header className="py-12 px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Le bar à papa
        </h1>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 max-w-4xl mx-auto">
        <section className="text-center mb-16">
          <p className="text-xl leading-relaxed">
            Bienvenue sur le bar à papa ! 
            Vous êtes invités à découvrir de nombreux spiritueux venant des
            quatre coins du monde, à passer votre commande ou à souscrire à l&apos;abonnement
            du bar à papa pour découvrir chaque mois un nouveau spiritueux, et de profiter de votre dégustation !
          </p>
        </section>

        <section className="w-full">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {["Europe", "Asie", "Afrique", "Amérique du Nord", "Amérique du Sud", "Océanie"].map((continent) => (
              <button
                key={continent}
                className="h-16 rounded-lg border border-zinc-800 bg-zinc-50 text-zinc-950 font-medium transition-all hover:bg-zinc-200"
              >
                {continent}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
